from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

CATEGORY_CHOICES = [
    ('python', 'Python'),
    ('sql', 'SQL'),
    ('html', 'HTML'),
    ('css', 'CSS'),
    ('javascript', 'JavaScript'),
]

DIFFICULTY_CHOICES = [
    ('beginner', 'Beginner'),
    ('intermediate', 'Intermediate'),
    ('advanced', 'Advanced'),
]


class CodingQuestion(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    description = models.TextField(help_text="Detailed problem statement and instructions")
    constraints = models.TextField(blank=True, default='', help_text="Constraints like input ranges")
    sample_input = models.TextField(blank=True, default='')
    sample_output = models.TextField(blank=True, default='')
    starter_code = models.TextField(blank=True, default='', help_text="Initial starter template code for user")
    solution_code = models.TextField(blank=True, default='', help_text="Reference solution code")
    explanation = models.TextField(blank=True, default='', help_text="Detailed explanation of the solution")
    points = models.IntegerField(default=20)
    # test_cases: [{"input": "...", "expected_output": "...", "description": "...", "is_hidden": false}]
    test_cases = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.category.upper()}] {self.title} ({self.difficulty})"


class QuizQuestion(models.Model):
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    question_text = models.TextField()
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    correct_option = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    explanation = models.TextField(help_text="Explanation shown after answering")
    points = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"[{self.category.upper()}] {self.question_text[:50]}..."


class Submission(models.Model):
    STATUS_CHOICES = [
        ('passed', 'Passed'),
        ('failed', 'Failed'),
        ('error', 'Error'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    question = models.ForeignKey(CodingQuestion, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='failed')
    test_results = models.JSONField(default=list, blank=True)
    points_awarded = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.username} - {self.question.title} ({self.status}) at {self.submitted_at.strftime('%Y-%m-%d %H:%M')}"


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    category = models.CharField(max_length=50)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    score_percentage = models.FloatField(default=0.0)
    points_awarded = models.IntegerField(default=0)
    # answers_summary: [{"question_id": 1, "question_text": "...", "selected": "A", "correct": "B", "is_correct": false, "explanation": "..."}]
    answers_summary = models.JSONField(default=list, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.category} Quiz: {self.correct_answers}/{self.total_questions} ({self.score_percentage:.1f}%)"


class UserProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    bio = models.CharField(max_length=255, blank=True, default='Passionate learner solving coding challenges on CodeQuest.')
    favorite_language = models.CharField(max_length=50, blank=True, default='Python')
    total_points = models.IntegerField(default=0)
    challenges_solved = models.IntegerField(default=0)
    quizzes_completed = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Progress: {self.user.username} ({self.total_points} pts)"


class Achievement(models.Model):
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='award')
    badge_color = models.CharField(max_length=20, default='#6366f1')
    points_reward = models.IntegerField(default=15)

    def __str__(self):
        return f"{self.title} ({self.code})"


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.user.username} unlocked {self.achievement.title}"
