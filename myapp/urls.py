from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, CurrentUserView, UpdateProfileView,
    CodingQuestionListView, CodingQuestionDetailView, SubmitChallengeView,
    ChallengeSubmissionsView, ChallengeExplanationView,
    QuizCategoriesView, QuizQuestionsView, SubmitQuizView, QuizAttemptsView,
    DashboardView, ProgressView, LeaderboardView, AchievementsListView
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='api-register'),
    path('auth/login/', LoginView.as_view(), name='api-login'),
    path('auth/logout/', LogoutView.as_view(), name='api-logout'),
    path('auth/me/', CurrentUserView.as_view(), name='api-me'),
    path('auth/profile/', UpdateProfileView.as_view(), name='api-profile'),

    # Challenges
    path('challenges/', CodingQuestionListView.as_view(), name='api-challenges-list'),
    path('challenges/<str:pk_or_slug>/', CodingQuestionDetailView.as_view(), name='api-challenge-detail'),
    path('challenges/<str:pk_or_slug>/submit/', SubmitChallengeView.as_view(), name='api-challenge-submit'),
    path('challenges/<str:pk_or_slug>/submissions/', ChallengeSubmissionsView.as_view(), name='api-challenge-submissions'),
    path('challenges/<str:pk_or_slug>/explanation/', ChallengeExplanationView.as_view(), name='api-challenge-explanation'),

    # Quizzes
    path('quizzes/categories/', QuizCategoriesView.as_view(), name='api-quiz-categories'),
    path('quizzes/questions/', QuizQuestionsView.as_view(), name='api-quiz-questions'),
    path('quizzes/submit/', SubmitQuizView.as_view(), name='api-quiz-submit'),
    path('quizzes/attempts/', QuizAttemptsView.as_view(), name='api-quiz-attempts'),

    # User & Platform Analytics
    path('dashboard/', DashboardView.as_view(), name='api-dashboard'),
    path('progress/', ProgressView.as_view(), name='api-progress'),
    path('leaderboard/', LeaderboardView.as_view(), name='api-leaderboard'),
    path('achievements/', AchievementsListView.as_view(), name='api-achievements'),
]
