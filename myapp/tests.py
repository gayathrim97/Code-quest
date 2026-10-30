from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from myapp.models import CodingQuestion, QuizQuestion, UserProgress, Achievement


class CodeQuestAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testcoder',
            email='test@codequest.dev',
            password='testpassword123'
        )
        self.progress = UserProgress.objects.create(user=self.user)

        self.achievement = Achievement.objects.create(
            code='first_challenge',
            title='First Step',
            description='Solved your first challenge.',
            points_reward=15
        )

        self.python_challenge = CodingQuestion.objects.create(
            title='Reverse a String',
            slug='reverse-a-string',
            category='python',
            difficulty='beginner',
            points=20,
            description='Reverse the string',
            starter_code='def reverse_string(s):\n    pass\n',
            test_cases=[
                {
                    "description": "Test 1",
                    "function_name": "reverse_string",
                    "input": "'hello'",
                    "expected_output": "olleh",
                    "is_hidden": False
                }
            ]
        )

        self.quiz_question = QuizQuestion.objects.create(
            category='python',
            difficulty='beginner',
            question_text='What is type([]) in Python?',
            option_a='array',
            option_b='list',
            option_c='dict',
            option_d='tuple',
            correct_option='B',
            explanation='Square brackets denote a list.',
            points=10
        )

    def test_registration(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@codequest.dev',
            'password': 'password123',
            'confirm_password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')

    def test_login(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testcoder',
            'password': 'testpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_challenges_list(self):
        response = self.client.get('/api/challenges/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_challenge_submission_evaluation(self):
        login_res = self.client.post('/api/auth/login/', {
            'username': 'testcoder',
            'password': 'testpassword123'
        })
        token = login_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

        # Submit working code
        correct_code = "def reverse_string(s):\n    return s[::-1]\n"
        response = self.client.post(
            f'/api/challenges/{self.python_challenge.id}/submit/',
            {'code': correct_code}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['passed'])
        self.assertEqual(response.data['points_awarded'], 20)

    def test_quiz_submission(self):
        login_res = self.client.post('/api/auth/login/', {
            'username': 'testcoder',
            'password': 'testpassword123'
        })
        token = login_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

        response = self.client.post('/api/quizzes/submit/', {
            'category': 'python',
            'answers': {
                str(self.quiz_question.id): 'B'
            }
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['correct_answers'], 1)
        self.assertEqual(response.data['score_percentage'], 100.0)

    def test_leaderboard(self):
        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('leaderboard', response.data)
