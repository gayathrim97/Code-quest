from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Count, Q, Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    CodingQuestion, QuizQuestion, Submission,
    QuizAttempt, UserProgress, Achievement, UserAchievement
)
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserProgressSerializer, CodingQuestionListSerializer,
    CodingQuestionDetailSerializer, SubmissionSerializer,
    QuizQuestionSerializer, QuizAttemptSerializer,
    AchievementSerializer, LeaderboardSerializer
)
from .evaluator import evaluate_submission


def check_and_unlock_achievements(user):
    newly_unlocked = []
    progress, _ = UserProgress.objects.get_or_create(user=user)

    def award(code):
        try:
            ach = Achievement.objects.get(code=code)
            ua, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
            if created:
                progress.total_points += ach.points_reward
                progress.save()
                newly_unlocked.append({
                    "code": ach.code,
                    "title": ach.title,
                    "description": ach.description,
                    "icon": ach.icon,
                    "points_reward": ach.points_reward
                })
        except Achievement.DoesNotExist:
            pass

    # 1. First challenge solved
    solved_count = Submission.objects.filter(user=user, status='passed').values('question').distinct().count()
    if solved_count >= 1:
        award('first_challenge')
    if solved_count >= 5:
        award('five_challenges')

    # 2. Quizzes completed
    quiz_count = QuizAttempt.objects.filter(user=user).count()
    if quiz_count >= 1:
        award('first_quiz')
    if QuizAttempt.objects.filter(user=user, score_percentage=100.0).exists():
        award('quiz_ace')

    # 3. Polyglot (solved in at least 3 different categories)
    categories_solved = Submission.objects.filter(
        user=user, status='passed'
    ).values_list('question__category', flat=True).distinct().count()
    if categories_solved >= 3:
        award('polyglot')

    # 4. Points milestones
    if progress.total_points >= 100:
        award('centurion')
    if progress.total_points >= 250:
        award('master_coder')

    return newly_unlocked


# --- AUTHENTICATION VIEWS ---

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            progress, _ = UserProgress.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data,
                "message": "Registration successful! Welcome to CodeQuest."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            UserProgress.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data,
                "message": "Login successful. Welcome back!"
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        progress, _ = UserProgress.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "progress": UserProgressSerializer(progress).data
        })


class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        progress, _ = UserProgress.objects.get_or_create(user=user)
        
        bio = request.data.get('bio')
        favorite_language = request.data.get('favorite_language')
        email = request.data.get('email')

        if bio is not None:
            progress.bio = bio
        if favorite_language is not None:
            progress.favorite_language = favorite_language
        progress.save()

        if email is not None:
            user.email = email
            user.save()

        return Response({
            "user": UserSerializer(user).data,
            "progress": UserProgressSerializer(progress).data,
            "message": "Profile updated successfully."
        })


# --- CODING CHALLENGES VIEWS ---

class CodingQuestionListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category')
        difficulty = request.query_params.get('difficulty')
        search = request.query_params.get('search')

        questions = CodingQuestion.objects.all()

        if category and category.lower() != 'all':
            questions = questions.filter(category=category.lower())
        if difficulty and difficulty.lower() != 'all':
            questions = questions.filter(difficulty=difficulty.lower())
        if search:
            questions = questions.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        serializer = CodingQuestionListSerializer(
            questions, many=True, context={'request': request}
        )
        return Response(serializer.data)


class CodingQuestionDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk_or_slug):
        if pk_or_slug.isdigit():
            question = get_object_or_404(CodingQuestion, pk=int(pk_or_slug))
        else:
            question = get_object_or_404(CodingQuestion, slug=pk_or_slug)

        serializer = CodingQuestionDetailSerializer(
            question, context={'request': request}
        )
        return Response(serializer.data)


class SubmitChallengeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk_or_slug):
        if pk_or_slug.isdigit():
            question = get_object_or_404(CodingQuestion, pk=int(pk_or_slug))
        else:
            question = get_object_or_404(CodingQuestion, slug=pk_or_slug)

        code = request.data.get('code', '')
        if not code.strip():
            return Response(
                {"error": "Code cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Run safe evaluation
        passed, test_results = evaluate_submission(
            question.category, code, question.test_cases
        )

        status_result = 'passed' if passed else 'failed'
        points_awarded = 0

        # Check if user previously passed this question
        already_passed = Submission.objects.filter(
            user=request.user, question=question, status='passed'
        ).exists()

        progress, _ = UserProgress.objects.get_or_create(user=request.user)

        if passed and not already_passed:
            points_awarded = question.points
            progress.total_points += points_awarded
            progress.challenges_solved += 1
            progress.save()

        # Save submission
        submission = Submission.objects.create(
            user=request.user,
            question=question,
            code=code,
            status=status_result,
            test_results=test_results,
            points_awarded=points_awarded
        )

        # Check for achievements
        new_achievements = check_and_unlock_achievements(request.user)

        return Response({
            "id": submission.id,
            "status": status_result,
            "passed": passed,
            "points_awarded": points_awarded,
            "already_passed": already_passed,
            "test_results": test_results,
            "total_points": progress.total_points,
            "new_achievements": new_achievements,
            "message": "Challenge solved! Points awarded." if passed and not already_passed else (
                "All test cases passed! (Already solved previously)" if passed else "Some test cases failed. Keep trying!"
            )
        })


class ChallengeSubmissionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk_or_slug):
        if pk_or_slug.isdigit():
            question = get_object_or_404(CodingQuestion, pk=int(pk_or_slug))
        else:
            question = get_object_or_404(CodingQuestion, slug=pk_or_slug)

        submissions = Submission.objects.filter(
            user=request.user, question=question
        ).order_by('-submitted_at')[:10]

        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class ChallengeExplanationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk_or_slug):
        if pk_or_slug.isdigit():
            question = get_object_or_404(CodingQuestion, pk=int(pk_or_slug))
        else:
            question = get_object_or_404(CodingQuestion, slug=pk_or_slug)

        return Response({
            "explanation": question.explanation or "No explanation available yet for this challenge.",
            "solution_code": question.solution_code or "# Reference solution not provided."
        })


# --- QUIZ SYSTEM VIEWS ---

class QuizCategoriesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories_data = []
        for cat_key, cat_name in [
            ('python', 'Python'),
            ('sql', 'SQL'),
            ('html', 'HTML'),
            ('css', 'CSS'),
            ('javascript', 'JavaScript')
        ]:
            count = QuizQuestion.objects.filter(category=cat_key).count()
            categories_data.append({
                "key": cat_key,
                "name": cat_name,
                "question_count": count
            })
        return Response(categories_data)


class QuizQuestionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category', 'python')
        limit = int(request.query_params.get('limit', 10))

        questions = QuizQuestion.objects.filter(category=category.lower())
        if not questions.exists() and category.lower() != 'all':
            questions = QuizQuestion.objects.all()

        questions = questions.order_by('?')[:limit]
        serializer = QuizQuestionSerializer(questions, many=True)
        return Response(serializer.data)


class SubmitQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        category = request.data.get('category', 'General')
        answers = request.data.get('answers', {})

        if not answers:
            return Response({"error": "No answers provided."}, status=status.HTTP_400_BAD_REQUEST)

        total_questions = len(answers)
        correct_count = 0
        answers_summary = []
        points_awarded = 0

        for q_id_str, selected_opt in answers.items():
            try:
                question = QuizQuestion.objects.get(id=int(q_id_str))
                is_correct = (selected_opt.strip().upper() == question.correct_option.strip().upper())
                if is_correct:
                    correct_count += 1
                    points_awarded += question.points

                answers_summary.append({
                    "question_id": question.id,
                    "question_text": question.question_text,
                    "selected": selected_opt.upper(),
                    "correct": question.correct_option.upper(),
                    "is_correct": is_correct,
                    "explanation": question.explanation
                })
            except (QuizQuestion.DoesNotExist, ValueError):
                continue

        score_percentage = round((correct_count / total_questions * 100), 1) if total_questions > 0 else 0.0

        attempt = QuizAttempt.objects.create(
            user=request.user,
            category=category,
            total_questions=total_questions,
            correct_answers=correct_count,
            score_percentage=score_percentage,
            points_awarded=points_awarded,
            answers_summary=answers_summary
        )

        progress, _ = UserProgress.objects.get_or_create(user=request.user)
        progress.total_points += points_awarded
        progress.quizzes_completed += 1
        progress.save()

        new_achievements = check_and_unlock_achievements(request.user)

        return Response({
            "attempt_id": attempt.id,
            "category": category,
            "total_questions": total_questions,
            "correct_answers": correct_count,
            "score_percentage": score_percentage,
            "points_awarded": points_awarded,
            "answers_summary": answers_summary,
            "new_achievements": new_achievements,
            "total_points": progress.total_points
        })


class QuizAttemptsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user).order_by('-completed_at')[:20]
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)


# --- DASHBOARD & PROGRESS VIEWS ---

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        progress, _ = UserProgress.objects.get_or_create(user=user)

        # Submissions stats
        user_submissions = Submission.objects.filter(user=user)
        total_attempted = user_submissions.values('question').distinct().count()
        passed_submissions = user_submissions.filter(status='passed')
        solved_count = passed_submissions.values('question').distinct().count()

        total_submission_count = user_submissions.count()
        passed_count = user_submissions.filter(status='passed').count()
        accuracy_pct = round((passed_count / total_submission_count * 100), 1) if total_submission_count > 0 else 0.0

        # Category solved breakdown
        categories = ['python', 'sql', 'html', 'css', 'javascript']
        category_stats = {}
        for cat in categories:
            total_cat = CodingQuestion.objects.filter(category=cat).count()
            solved_cat = passed_submissions.filter(question__category=cat).values('question').distinct().count()
            category_stats[cat] = {
                "total": total_cat,
                "solved": solved_cat,
                "percentage": round((solved_cat / total_cat * 100), 1) if total_cat > 0 else 0.0
            }

        # Recent activities (combine coding submissions and quiz attempts)
        recent_submissions = user_submissions.select_related('question').order_by('-submitted_at')[:5]
        recent_quizzes = QuizAttempt.objects.filter(user=user).order_by('-completed_at')[:5]

        activities = []
        for s in recent_submissions:
            activities.append({
                "type": "challenge",
                "title": f"Solved '{s.question.title}'" if s.status == 'passed' else f"Attempted '{s.question.title}'",
                "category": s.question.category,
                "status": s.status,
                "points": s.points_awarded,
                "timestamp": s.submitted_at
            })
        for q in recent_quizzes:
            activities.append({
                "type": "quiz",
                "title": f"Completed {q.category} Quiz ({q.correct_answers}/{q.total_questions})",
                "category": q.category,
                "status": "passed" if q.score_percentage >= 70 else "completed",
                "points": q.points_awarded,
                "timestamp": q.completed_at
            })

        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:8]

        # Recent achievements
        user_achievements = UserAchievement.objects.filter(user=user).select_related('achievement').order_by('-unlocked_at')[:4]
        achievements_data = [
            {
                "code": ua.achievement.code,
                "title": ua.achievement.title,
                "description": ua.achievement.description,
                "icon": ua.achievement.icon,
                "badge_color": ua.achievement.badge_color,
                "unlocked_at": ua.unlocked_at
            }
            for ua in user_achievements
        ]

        return Response({
            "user": UserSerializer(user).data,
            "progress": UserProgressSerializer(progress).data,
            "stats": {
                "total_points": progress.total_points,
                "questions_attempted": total_attempted,
                "challenges_solved": solved_count,
                "total_submissions": total_submission_count,
                "accuracy_percentage": accuracy_pct,
                "quizzes_completed": progress.quizzes_completed,
            },
            "category_stats": category_stats,
            "recent_activity": activities,
            "recent_achievements": achievements_data
        })


class ProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        progress, _ = UserProgress.objects.get_or_create(user=user)

        user_submissions = Submission.objects.filter(user=user)
        passed_subs = user_submissions.filter(status='passed')

        # Category mastery
        categories = ['python', 'sql', 'html', 'css', 'javascript']
        category_progress = []
        for cat in categories:
            total = CodingQuestion.objects.filter(category=cat).count()
            solved = passed_subs.filter(question__category=cat).values('question').distinct().count()
            category_progress.append({
                "category": cat.upper(),
                "key": cat,
                "total": total,
                "solved": solved,
                "pct": round((solved / total * 100), 1) if total > 0 else 0.0
            })

        # History list
        recent_submissions = SubmissionSerializer(
            user_submissions.order_by('-submitted_at')[:15], many=True
        ).data

        recent_quizzes = QuizAttemptSerializer(
            QuizAttempt.objects.filter(user=user).order_by('-completed_at')[:10], many=True
        ).data

        # All achievements with unlock state
        all_achievements = Achievement.objects.all()
        achievements_data = AchievementSerializer(
            all_achievements, many=True, context={'request': request}
        ).data

        return Response({
            "progress": UserProgressSerializer(progress).data,
            "categories": category_progress,
            "recent_submissions": recent_submissions,
            "recent_quizzes": recent_quizzes,
            "achievements": achievements_data
        })


# --- LEADERBOARD VIEW ---

class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        progress_records = UserProgress.objects.select_related('user').order_by(
            '-total_points', '-challenges_solved', '-quizzes_completed'
        )[:50]

        leaderboard_data = []
        current_user_rank = None

        for idx, item in enumerate(progress_records):
            rank = idx + 1
            if request.user.is_authenticated and item.user == request.user:
                current_user_rank = rank

            leaderboard_data.append({
                "rank": rank,
                "username": item.user.username,
                "total_points": item.total_points,
                "challenges_solved": item.challenges_solved,
                "quizzes_completed": item.quizzes_completed,
                "favorite_language": item.favorite_language or 'Python',
                "is_current_user": (request.user.is_authenticated and item.user == request.user)
            })

        return Response({
            "leaderboard": leaderboard_data,
            "current_user_rank": current_user_rank
        })


# --- ACHIEVEMENTS LIST VIEW ---

class AchievementsListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        achievements = Achievement.objects.all()
        serializer = AchievementSerializer(
            achievements, many=True, context={'request': request}
        )
        return Response(serializer.data)
