from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import (
    CodingQuestion, QuizQuestion, Submission,
    QuizAttempt, UserProgress, Achievement, UserAchievement
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if User.objects.filter(username__iexact=data['username']).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        UserProgress.objects.create(user=user)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check your username and password.")
        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive.")

        data['user'] = user
        return data


class UserProgressSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)

    class Meta:
        model = UserProgress
        fields = [
            'id', 'username', 'date_joined', 'bio', 'favorite_language',
            'total_points', 'challenges_solved', 'quizzes_completed',
            'current_streak', 'updated_at'
        ]


class CodingQuestionListSerializer(serializers.ModelSerializer):
    is_solved = serializers.SerializerMethodField()

    class Meta:
        model = CodingQuestion
        fields = [
            'id', 'title', 'slug', 'category', 'difficulty',
            'points', 'created_at', 'is_solved'
        ]

    def get_is_solved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Submission.objects.filter(user=request.user, question=obj, status='passed').exists()
        return False


class CodingQuestionDetailSerializer(serializers.ModelSerializer):
    is_solved = serializers.SerializerMethodField()
    public_test_cases = serializers.SerializerMethodField()
    has_attempted = serializers.SerializerMethodField()

    class Meta:
        model = CodingQuestion
        fields = [
            'id', 'title', 'slug', 'category', 'difficulty',
            'description', 'constraints', 'sample_input', 'sample_output',
            'starter_code', 'points', 'created_at', 'is_solved',
            'has_attempted', 'public_test_cases'
        ]

    def get_is_solved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Submission.objects.filter(user=request.user, question=obj, status='passed').exists()
        return False

    def get_has_attempted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Submission.objects.filter(user=request.user, question=obj).exists()
        return False

    def get_public_test_cases(self, obj):
        if not obj.test_cases:
            return []
        # Return test cases that are not marked as hidden
        return [
            {
                "input": tc.get("input", ""),
                "expected_output": tc.get("expected_output", ""),
                "description": tc.get("description", f"Test {idx + 1}")
            }
            for idx, tc in enumerate(obj.test_cases)
            if not tc.get("is_hidden", False)
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    question_title = serializers.CharField(source='question.title', read_only=True)
    question_category = serializers.CharField(source='question.category', read_only=True)
    question_difficulty = serializers.CharField(source='question.difficulty', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'question', 'question_title', 'question_category',
            'question_difficulty', 'code', 'status', 'test_results',
            'points_awarded', 'submitted_at'
        ]
        read_only_fields = ['id', 'status', 'test_results', 'points_awarded', 'submitted_at']


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = [
            'id', 'category', 'difficulty', 'question_text',
            'option_a', 'option_b', 'option_c', 'option_d', 'points'
        ]


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'category', 'total_questions', 'correct_answers',
            'score_percentage', 'points_awarded', 'answers_summary',
            'completed_at'
        ]
        read_only_fields = ['id', 'completed_at']


class AchievementSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    unlocked_at = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ['id', 'code', 'title', 'description', 'icon', 'badge_color', 'points_reward', 'is_unlocked', 'unlocked_at']

    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserAchievement.objects.filter(user=request.user, achievement=obj).exists()
        return False

    def get_unlocked_at(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            ua = UserAchievement.objects.filter(user=request.user, achievement=obj).first()
            return ua.unlocked_at if ua else None
        return None


class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    rank = serializers.IntegerField(default=0)

    class Meta:
        model = UserProgress
        fields = [
            'rank', 'username', 'favorite_language',
            'total_points', 'challenges_solved', 'quizzes_completed'
        ]
