from django.contrib import admin
from .models import (
    CodingQuestion, QuizQuestion, Submission,
    QuizAttempt, UserProgress, Achievement, UserAchievement
)


@admin.register(CodingQuestion)
class CodingQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'difficulty', 'points', 'created_at')
    list_filter = ('category', 'difficulty')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Overview', {
            'fields': ('title', 'slug', 'category', 'difficulty', 'points')
        }),
        ('Problem Content', {
            'fields': ('description', 'constraints', 'sample_input', 'sample_output')
        }),
        ('Code & Solution', {
            'fields': ('starter_code', 'solution_code', 'explanation', 'test_cases')
        }),
    )


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'difficulty', 'question_text_short', 'correct_option', 'points')
    list_filter = ('category', 'difficulty')
    search_fields = ('question_text', 'explanation')

    def question_text_short(self, obj):
        return obj.question_text[:60] + '...' if len(obj.question_text) > 60 else obj.question_text
    question_text_short.short_description = 'Question'


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'question', 'status', 'points_awarded', 'submitted_at')
    list_filter = ('status', 'question__category', 'submitted_at')
    search_fields = ('user__username', 'question__title')
    readonly_fields = ('submitted_at',)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'score_display', 'points_awarded', 'completed_at')
    list_filter = ('category', 'completed_at')
    search_fields = ('user__username', 'category')
    readonly_fields = ('completed_at',)

    def score_display(self, obj):
        return f"{obj.correct_answers}/{obj.total_questions} ({obj.score_percentage:.1f}%)"
    score_display.short_description = 'Score'


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_points', 'challenges_solved', 'quizzes_completed', 'favorite_language', 'updated_at')
    search_fields = ('user__username', 'bio')
    list_filter = ('favorite_language',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'points_reward', 'badge_color')
    search_fields = ('title', 'code', 'description')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at')
    list_filter = ('achievement', 'unlocked_at')
    search_fields = ('user__username', 'achievement__title')
