from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from myapp.models import (
    CodingQuestion, QuizQuestion, Achievement, UserProgress, UserAchievement
)


class Command(BaseCommand):
    help = 'Seeds initial coding questions, quiz questions, achievements, and leaderboard demo users.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting CodeQuest data seeding...")

        # 1. Achievements
        achievements_data = [
            {
                "code": "first_challenge",
                "title": "First Step",
                "description": "Solved your very first coding challenge on CodeQuest.",
                "icon": "award",
                "badge_color": "#10b981",
                "points_reward": 15
            },
            {
                "code": "five_challenges",
                "title": "Problem Solver",
                "description": "Successfully solved 5 different coding challenges.",
                "icon": "zap",
                "badge_color": "#6366f1",
                "points_reward": 30
            },
            {
                "code": "first_quiz",
                "title": "Knowledge Seeker",
                "description": "Completed your first category quiz attempt.",
                "icon": "book-open",
                "badge_color": "#3b82f6",
                "points_reward": 15
            },
            {
                "code": "quiz_ace",
                "title": "Quiz Ace",
                "description": "Scored a perfect 100% on any category quiz.",
                "icon": "star",
                "badge_color": "#f59e0b",
                "points_reward": 25
            },
            {
                "code": "polyglot",
                "title": "Polyglot Coder",
                "description": "Solved challenges across 3 or more different programming categories.",
                "icon": "code",
                "badge_color": "#8b5cf6",
                "points_reward": 35
            },
            {
                "code": "centurion",
                "title": "Century Club",
                "description": "Accumulated over 100 total quest points.",
                "icon": "shield",
                "badge_color": "#ec4899",
                "points_reward": 50
            },
            {
                "code": "master_coder",
                "title": "Grandmaster",
                "description": "Reached a grand milestone of 250+ quest points.",
                "icon": "crown",
                "badge_color": "#eab308",
                "points_reward": 100
            }
        ]

        for ach in achievements_data:
            Achievement.objects.update_or_create(
                code=ach["code"],
                defaults=ach
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(achievements_data)} achievements."))

        # 2. Coding Questions
        challenges_data = [
            # PYTHON CHALLENGES
            {
                "title": "Reverse a String",
                "slug": "reverse-a-string",
                "category": "python",
                "difficulty": "beginner",
                "points": 20,
                "description": "Write a function `reverse_string(s)` that takes a string `s` and returns it reversed.\n\n### Example:\nInput: `'hello'`\nOutput: `'olleh'`\n\n### Instructions:\nYou can use slicing or iterative techniques. Return the reversed string.",
                "constraints": "1 <= len(s) <= 10^4. String contains printable ASCII characters.",
                "sample_input": "'hello'",
                "sample_output": "'olleh'",
                "starter_code": "def reverse_string(s):\n    # Write your solution here\n    pass\n",
                "solution_code": "def reverse_string(s):\n    return s[::-1]\n",
                "explanation": "In Python, string slicing `s[::-1]` creates a reversed copy of the string by stepping backwards by -1. Alternatively, `''.join(reversed(s))` also achieves the same result efficiently in O(n) time.",
                "test_cases": [
                    {
                        "description": "Basic word reversal",
                        "function_name": "reverse_string",
                        "input": "'hello'",
                        "expected_output": "olleh",
                        "is_hidden": False
                    },
                    {
                        "description": "Mixed case reversal",
                        "function_name": "reverse_string",
                        "input": "'CodeQuest'",
                        "expected_output": "tseuQedoC",
                        "is_hidden": False
                    },
                    {
                        "description": "Palindrome word",
                        "function_name": "reverse_string",
                        "input": "'racecar'",
                        "expected_output": "racecar",
                        "is_hidden": True
                    }
                ]
            },
            {
                "title": "Check Palindrome String",
                "slug": "check-palindrome-string",
                "category": "python",
                "difficulty": "beginner",
                "points": 20,
                "description": "Write a function `is_palindrome(s)` that returns `True` if a given string `s` is a palindrome (reads same forwards and backward), otherwise `False`.\n\nComparison should be case-insensitive.",
                "constraints": "1 <= len(s) <= 10^5",
                "sample_input": "'Madam'",
                "sample_output": "True",
                "starter_code": "def is_palindrome(s):\n    # Return True if s is palindrome, else False\n    pass\n",
                "solution_code": "def is_palindrome(s):\n    clean = s.lower()\n    return clean == clean[::-1]\n",
                "explanation": "Convert the string to lowercase first using `s.lower()`. Then compare the lowered string with its reverse `clean[::-1]`.",
                "test_cases": [
                    {
                        "description": "Classic palindrome",
                        "function_name": "is_palindrome",
                        "input": "'racecar'",
                        "expected_output": "True",
                        "is_hidden": False
                    },
                    {
                        "description": "Non-palindrome string",
                        "function_name": "is_palindrome",
                        "input": "'hello'",
                        "expected_output": "False",
                        "is_hidden": False
                    },
                    {
                        "description": "Case-insensitive palindrome",
                        "function_name": "is_palindrome",
                        "input": "'Madam'",
                        "expected_output": "True",
                        "is_hidden": True
                    }
                ]
            },
            {
                "title": "Two Sum Problem",
                "slug": "two-sum-problem",
                "category": "python",
                "difficulty": "intermediate",
                "points": 30,
                "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. Return the indices as a list `[idx1, idx2]` sorted ascending.",
                "constraints": "2 <= len(nums) <= 10^4, -10^9 <= nums[i] <= 10^9",
                "sample_input": "[2, 7, 11, 15], 9",
                "sample_output": "[0, 1]",
                "starter_code": "def two_sum(nums, target):\n    # Return [i, j] indices\n    pass\n",
                "solution_code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n",
                "explanation": "Using a hash table (dictionary) allows finding complement values in O(1) time. As we iterate through `nums`, we check if `target - num` already exists in `seen`. This yields an optimal O(n) time complexity and O(n) space.",
                "test_cases": [
                    {
                        "description": "Standard two sum",
                        "function_name": "two_sum",
                        "input": "[2, 7, 11, 15], 9",
                        "expected_output": "[0, 1]",
                        "is_hidden": False
                    },
                    {
                        "description": "Target with elements at middle and end",
                        "function_name": "two_sum",
                        "input": "[3, 2, 4], 6",
                        "expected_output": "[1, 2]",
                        "is_hidden": False
                    },
                    {
                        "description": "Duplicate values",
                        "function_name": "two_sum",
                        "input": "[3, 3], 6",
                        "expected_output": "[0, 1]",
                        "is_hidden": True
                    }
                ]
            },
            {
                "title": "Maximum Subarray Sum",
                "slug": "maximum-subarray-sum",
                "category": "python",
                "difficulty": "advanced",
                "points": 40,
                "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum (Kadane's Algorithm).\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
                "constraints": "1 <= len(nums) <= 10^5, -10^4 <= nums[i] <= 10^4",
                "sample_input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
                "sample_output": "6",
                "starter_code": "def max_sub_array(nums):\n    # Return the maximum subarray sum\n    pass\n",
                "solution_code": "def max_sub_array(nums):\n    max_so_far = nums[0]\n    current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far\n",
                "explanation": "Kadane's algorithm maintains `current_max` and `max_so_far`. At each element `x`, we decide whether to add `x` to the existing subarray or start a new subarray at `x`. This solves the problem in O(n) time and O(1) space.",
                "test_cases": [
                    {
                        "description": "Mixed positive and negative values",
                        "function_name": "max_sub_array",
                        "input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
                        "expected_output": "6",
                        "is_hidden": False
                    },
                    {
                        "description": "Single element array",
                        "function_name": "max_sub_array",
                        "input": "[1]",
                        "expected_output": "1",
                        "is_hidden": False
                    },
                    {
                        "description": "All negative values",
                        "function_name": "max_sub_array",
                        "input": "[-5, -1, -8, -3]",
                        "expected_output": "-1",
                        "is_hidden": True
                    }
                ]
            },

            # SQL CHALLENGES
            {
                "title": "Select High Earning Employees",
                "slug": "select-high-earning-employees",
                "category": "sql",
                "difficulty": "beginner",
                "points": 20,
                "description": "Write a SQL query to fetch `name`, `department`, and `salary` from the `employees` table where `salary` is strictly greater than `50000`. Order the results alphabetically by `name` ascending.",
                "constraints": "Table name: employees. Columns: id, name, department, salary.",
                "sample_input": "employees table",
                "sample_output": "name, department, salary",
                "starter_code": "-- Write your SQL query below\nSELECT \nFROM employees\n",
                "solution_code": "SELECT name, department, salary FROM employees WHERE salary > 50000 ORDER BY name ASC;",
                "explanation": "The `WHERE` clause filters rows with `salary > 50000`. `ORDER BY name ASC` sorts results alphabetically.",
                "test_cases": [
                    {
                        "description": "Query syntax and keyword checks",
                        "required_keywords": ["SELECT", "FROM", "WHERE", "ORDER BY"],
                        "forbidden_keywords": ["DROP", "DELETE", "UPDATE"],
                        "expected_output": "salary\\s*>\\s*50000",
                        "is_hidden": False
                    }
                ]
            },
            {
                "title": "Department Average Salary",
                "slug": "department-average-salary",
                "category": "sql",
                "difficulty": "intermediate",
                "points": 30,
                "description": "Write a SQL query to find departments where the average employee salary is greater than `60000`. Return `department` and the average salary as `avg_salary`, ordered by `avg_salary` descending.",
                "constraints": "Use GROUP BY and HAVING clauses.",
                "sample_input": "employees table",
                "sample_output": "department, avg_salary",
                "starter_code": "-- Group by department and filter average salary\nSELECT \nFROM employees\n",
                "solution_code": "SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department HAVING AVG(salary) > 60000 ORDER BY avg_salary DESC;",
                "explanation": "Aggregate filtering must be performed in the `HAVING` clause rather than `WHERE` because it evaluates grouped rows after `GROUP BY department`.",
                "test_cases": [
                    {
                        "description": "Aggregate and Group By validation",
                        "required_keywords": ["SELECT", "GROUP BY", "HAVING", "AVG"],
                        "expected_output": "AVG\\s*\\(\\s*salary\\s*\\)",
                        "is_hidden": False
                    }
                ]
            },
            {
                "title": "Customer Order Counts with JOIN",
                "slug": "customer-order-counts-with-join",
                "category": "sql",
                "difficulty": "advanced",
                "points": 40,
                "description": "Write a SQL query joining `customers` (aliased as `c`) and `orders` (aliased as `o`) on `c.id = o.customer_id`. Return `c.name` and the count of their total orders as `order_count`. Group by `c.id` and `c.name`, and order by `order_count` descending.",
                "constraints": "Use JOIN, GROUP BY, and COUNT.",
                "sample_input": "customers and orders tables",
                "sample_output": "name, order_count",
                "starter_code": "-- Join customers and orders\nSELECT \nFROM customers c\n",
                "solution_code": "SELECT c.name, COUNT(o.id) AS order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name ORDER BY order_count DESC;",
                "explanation": "Joining tables on key relationships allows aggregating related order records per customer using `COUNT()` and `GROUP BY`.",
                "test_cases": [
                    {
                        "description": "Join and count validation",
                        "required_keywords": ["SELECT", "JOIN", "ON", "GROUP BY", "COUNT"],
                        "expected_output": "COUNT\\s*\\(",
                        "is_hidden": False
                    }
                ]
            },

            # HTML CHALLENGES
            {
                "title": "Semantic Navigation Bar",
                "slug": "semantic-navigation-bar",
                "category": "html",
                "difficulty": "beginner",
                "points": 20,
                "description": "Create an accessible HTML5 semantic navigation bar. It must include a `<nav>` container, an unordered list `<ul>`, at least three `<li>` items, and `<a>` links inside each item pointing to `#home`, `#challenges`, and `#leaderboard`.",
                "constraints": "Use proper semantic tags.",
                "sample_input": "N/A",
                "sample_output": "<nav>...</nav>",
                "starter_code": "<!-- Build your accessible navigation bar below -->\n<nav>\n  \n</nav>\n",
                "solution_code": "<nav>\n  <ul>\n    <li><a href=\"#home\">Home</a></li>\n    <li><a href=\"#challenges\">Challenges</a></li>\n    <li><a href=\"#leaderboard\">Leaderboard</a></li>\n  </ul>\n</nav>",
                "explanation": "Semantic HTML tags like `<nav>`, `<ul>`, and `<li>` provide assistive technologies and screen readers with structural context for navigation landmarks.",
                "test_cases": [
                    {
                        "description": "Contains <nav> tag",
                        "required_tag": "nav",
                        "is_hidden": False
                    },
                    {
                        "description": "Contains <ul> list structure",
                        "required_tag": "ul",
                        "is_hidden": False
                    },
                    {
                        "description": "Contains navigation links",
                        "pattern": "<a\\s+href=[\"']#(home|challenges|leaderboard)[\"']",
                        "is_hidden": False
                    }
                ]
            },
            {
                "title": "Accessible User Registration Form",
                "slug": "accessible-user-registration-form",
                "category": "html",
                "difficulty": "intermediate",
                "points": 30,
                "description": "Write a semantic HTML form element `<form>` containing:\n1. An email input with `type=\"email\"` and a corresponding `<label>`\n2. A password input with `type=\"password\"` and a corresponding `<label>`\n3. A submit button `<button type=\"submit\">`",
                "constraints": "Ensure all inputs have id or name and matching labels.",
                "sample_input": "N/A",
                "sample_output": "<form>...</form>",
                "starter_code": "<!-- Create your accessible form below -->\n<form>\n  \n</form>\n",
                "solution_code": "<form>\n  <div>\n    <label for=\"email\">Email</label>\n    <input type=\"email\" id=\"email\" name=\"email\" required />\n  </div>\n  <div>\n    <label for=\"pwd\">Password</label>\n    <input type=\"password\" id=\"pwd\" name=\"password\" required />\n  </div>\n  <button type=\"submit\">Register</button>\n</form>",
                "explanation": "Accessible forms associate inputs with `<label>` tags via the `for` attribute referencing the input's `id`. Proper input types ensure appropriate virtual keyboards and browser validation.",
                "test_cases": [
                    {
                        "description": "Contains form element",
                        "required_tag": "form",
                        "is_hidden": False
                    },
                    {
                        "description": "Email input field with label",
                        "pattern": "type=[\"']email[\"']",
                        "is_hidden": False
                    },
                    {
                        "description": "Password input field",
                        "pattern": "type=[\"']password[\"']",
                        "is_hidden": False
                    },
                    {
                        "description": "Submit button",
                        "pattern": "<button\\s+type=[\"']submit[\"']",
                        "is_hidden": True
                    }
                ]
            },

            # CSS CHALLENGES
            {
                "title": "Center an Element with Flexbox",
                "slug": "center-an-element-with-flexbox",
                "category": "css",
                "difficulty": "beginner",
                "points": 20,
                "description": "Write CSS rules for a class `.hero-center` that centers all child elements both horizontally and vertically using CSS Flexbox. Set the container's height to `100vh`.",
                "constraints": "Use display: flex, justify-content: center, align-items: center.",
                "sample_input": ".hero-center",
                "sample_output": "Centered layout",
                "starter_code": ".hero-center {\n  /* Add flex centering properties here */\n}\n",
                "solution_code": ".hero-center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}",
                "explanation": "Flexbox centering is achieved by setting `display: flex;`, `justify-content: center;` (main axis centering), and `align-items: center;` (cross axis centering).",
                "test_cases": [
                    {
                        "description": "Flexbox display set",
                        "selector": ".hero-center",
                        "property": "display",
                        "expected_output": "flex",
                        "is_hidden": False
                    },
                    {
                        "description": "Horizontal centering",
                        "selector": ".hero-center",
                        "property": "justify-content",
                        "expected_output": "center",
                        "is_hidden": False
                    },
                    {
                        "description": "Vertical alignment",
                        "selector": ".hero-center",
                        "property": "align-items",
                        "expected_output": "center",
                        "is_hidden": False
                    }
                ]
            },
            {
                "title": "Responsive CSS Grid Gallery",
                "slug": "responsive-css-grid-gallery",
                "category": "css",
                "difficulty": "intermediate",
                "points": 30,
                "description": "Style a `.card-grid` layout using CSS Grid. It should have `display: grid`, a `gap` of `20px` (or `1.5rem`), and responsive columns using `repeat(auto-fit, minmax(280px, 1fr))`.",
                "constraints": "Use grid layout with repeat and minmax.",
                "sample_input": ".card-grid",
                "sample_output": "Responsive columns",
                "starter_code": ".card-grid {\n  /* Create responsive grid columns */\n}\n",
                "solution_code": ".card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 20px;\n}",
                "explanation": "`repeat(auto-fit, minmax(280px, 1fr))` creates a fully responsive column layout without requiring media queries. The browser automatically reflows cards as the viewport width changes.",
                "test_cases": [
                    {
                        "description": "Grid display property",
                        "selector": ".card-grid",
                        "property": "display",
                        "expected_output": "grid",
                        "is_hidden": False
                    },
                    {
                        "description": "Auto-fit columns with minmax",
                        "selector": ".card-grid",
                        "property": "grid-template-columns",
                        "expected_output": "repeat",
                        "is_hidden": False
                    }
                ]
            },

            # JAVASCRIPT CHALLENGES
            {
                "title": "Sum Array Elements with Reduce",
                "slug": "sum-array-elements-with-reduce",
                "category": "javascript",
                "difficulty": "beginner",
                "points": 20,
                "description": "Write a JavaScript function `sumArray(numbers)` that takes an array of numbers and returns their total sum using the `reduce` array method.",
                "constraints": "Return 0 for empty array.",
                "sample_input": "[1, 2, 3, 4, 5]",
                "sample_output": "15",
                "starter_code": "function sumArray(numbers) {\n  // Use reduce to compute sum\n  \n}\n",
                "solution_code": "function sumArray(numbers) {\n  return numbers.reduce((acc, curr) => acc + curr, 0);\n}",
                "explanation": "`Array.prototype.reduce()` iterates through an array accumulating a single return value. Passing `0` as the second parameter provides an initial accumulator.",
                "test_cases": [
                    {
                        "description": "Defines sumArray function",
                        "function_name": "sumArray",
                        "is_hidden": False
                    },
                    {
                        "description": "Uses reduce method",
                        "pattern": "\\.reduce\\s*\\(",
                        "is_hidden": False
                    }
                ]
            },
            {
                "title": "Debounce Implementation",
                "slug": "debounce-implementation",
                "category": "javascript",
                "difficulty": "advanced",
                "points": 40,
                "description": "Implement a `debounce(fn, delay)` higher-order function in JavaScript. It should return a debounced version of `fn` that postpones its execution until after `delay` milliseconds have elapsed since the last time it was invoked.",
                "constraints": "Use setTimeout and clearTimeout.",
                "sample_input": "debounce(searchFunc, 300)",
                "sample_output": "Debounced wrapper function",
                "starter_code": "function debounce(fn, delay) {\n  // Return debounced function\n  \n}\n",
                "solution_code": "function debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}",
                "explanation": "Debouncing prevents multiple rapid function executions (like window resizing or input keystrokes) by resetting a `setTimeout` timer with `clearTimeout` on each trigger.",
                "test_cases": [
                    {
                        "description": "Defines debounce function",
                        "function_name": "debounce",
                        "is_hidden": False
                    },
                    {
                        "description": "Uses setTimeout and clearTimeout",
                        "pattern": "setTimeout",
                        "is_hidden": False
                    },
                    {
                        "description": "Clears previous timer",
                        "pattern": "clearTimeout",
                        "is_hidden": False
                    }
                ]
            }
        ]

        for c_data in challenges_data:
            CodingQuestion.objects.update_or_create(
                slug=c_data["slug"],
                defaults=c_data
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(challenges_data)} coding challenges across 5 languages."))

        # 3. Quiz Questions across all categories
        quiz_data = [
            # Python
            {
                "category": "python",
                "difficulty": "beginner",
                "question_text": "What is the output of `type([])` in Python?",
                "option_a": "<class 'array'>",
                "option_b": "<class 'list'>",
                "option_c": "<class 'tuple'>",
                "option_d": "<class 'set'>",
                "correct_option": "B",
                "explanation": "In Python, square brackets `[]` define a mutable sequence of type `list`.",
                "points": 10
            },
            {
                "category": "python",
                "difficulty": "beginner",
                "question_text": "Which built-in function returns the number of items in an iterable in Python?",
                "option_a": "count()",
                "option_b": "size()",
                "option_c": "len()",
                "option_d": "length()",
                "correct_option": "C",
                "explanation": "`len()` is the standard Python built-in function to query the length of sequences and collections.",
                "points": 10
            },
            {
                "category": "python",
                "difficulty": "intermediate",
                "question_text": "What keyword is used in Python to create an anonymous inline function?",
                "option_a": "def",
                "option_b": "inline",
                "option_c": "lambda",
                "option_d": "func",
                "correct_option": "C",
                "explanation": "The `lambda` keyword defines anonymous single-expression functions in Python, e.g., `lambda x: x * 2`.",
                "points": 10
            },
            {
                "category": "python",
                "difficulty": "intermediate",
                "question_text": "What does a generator function in Python use to return values incrementally without terminating?",
                "option_a": "return",
                "option_b": "yield",
                "option_c": "emit",
                "option_d": "next",
                "correct_option": "B",
                "explanation": "The `yield` statement suspends function execution and yields an intermediate value to the caller, resuming state on subsequent iterations.",
                "points": 10
            },

            # SQL
            {
                "category": "sql",
                "difficulty": "beginner",
                "question_text": "Which SQL clause is used to eliminate duplicate rows from the query output?",
                "option_a": "UNIQUE",
                "option_b": "DISTINCT",
                "option_c": "DIFFERENT",
                "option_d": "FILTER",
                "correct_option": "B",
                "explanation": "`SELECT DISTINCT` filters duplicate rows so that each returned tuple is unique.",
                "points": 10
            },
            {
                "category": "sql",
                "difficulty": "intermediate",
                "question_text": "What is the difference between WHERE and HAVING in SQL?",
                "option_a": "WHERE filters before grouping; HAVING filters aggregated groups after GROUP BY.",
                "option_b": "HAVING filters before grouping; WHERE filters aggregated groups.",
                "option_c": "They are completely interchangeable aliases.",
                "option_d": "HAVING only works with string columns.",
                "correct_option": "A",
                "explanation": "`WHERE` operates on individual records before group reduction. `HAVING` filters group-level aggregates after `GROUP BY`.",
                "points": 10
            },
            {
                "category": "sql",
                "difficulty": "intermediate",
                "question_text": "Which JOIN returns all rows from the left table and matched records from the right table?",
                "option_a": "INNER JOIN",
                "option_b": "RIGHT JOIN",
                "option_c": "LEFT JOIN",
                "option_d": "FULL OUTER JOIN",
                "correct_option": "C",
                "explanation": "A `LEFT JOIN` (or `LEFT OUTER JOIN`) preserves all records from the left table and populates NULL for non-matching right table columns.",
                "points": 10
            },

            # HTML
            {
                "category": "html",
                "difficulty": "beginner",
                "question_text": "Which HTML5 semantic element is most appropriate for a self-contained, syndicable piece of content such as a blog post?",
                "option_a": "<section>",
                "option_b": "<article>",
                "option_c": "<aside>",
                "option_d": "<div>",
                "correct_option": "B",
                "explanation": "The `<article>` element represents independent, distributable content such as forum posts, news stories, or blog entries.",
                "points": 10
            },
            {
                "category": "html",
                "difficulty": "beginner",
                "question_text": "Which attribute on an `<img>` tag is crucial for screen readers and search engines to understand image context?",
                "option_a": "src",
                "option_b": "alt",
                "option_c": "title",
                "option_d": "role",
                "correct_option": "B",
                "explanation": "The `alt` attribute provides alternative textual representation for images for accessibility and web crawlers.",
                "points": 10
            },
            {
                "category": "html",
                "difficulty": "intermediate",
                "question_text": "Which attribute on an `<input>` element provides a temporary hint to the user before they enter a value?",
                "option_a": "value",
                "option_b": "placeholder",
                "option_c": "name",
                "option_d": "hint",
                "correct_option": "B",
                "explanation": "`placeholder` renders grayed-out sample text inside the input field that disappears upon user typing.",
                "points": 10
            },

            # CSS
            {
                "category": "css",
                "difficulty": "beginner",
                "question_text": "In the standard CSS box model, which layer sits immediately outside the content area?",
                "option_a": "Border",
                "option_b": "Margin",
                "option_c": "Padding",
                "option_d": "Outline",
                "correct_option": "C",
                "explanation": "The order of the CSS box model from inside out is: Content -> Padding -> Border -> Margin.",
                "points": 10
            },
            {
                "category": "css",
                "difficulty": "intermediate",
                "question_text": "What does `box-sizing: border-box;` accomplish?",
                "option_a": "Excludes padding and border from the element's total width and height.",
                "option_b": "Includes padding and border within the element's total declared width and height.",
                "option_c": "Removes borders entirely from the layout.",
                "option_d": "Renders borders in 3D perspective.",
                "correct_option": "B",
                "explanation": "`border-box` ensures `width` and `height` properties define the total size including padding and border, preventing unexpected expansion.",
                "points": 10
            },
            {
                "category": "css",
                "difficulty": "intermediate",
                "question_text": "Which CSS property specifies how flex items are aligned along the main axis?",
                "option_a": "align-items",
                "option_b": "align-content",
                "option_c": "justify-content",
                "option_d": "place-items",
                "correct_option": "C",
                "explanation": "`justify-content` controls alignment along the main axis (horizontal by default), while `align-items` controls cross-axis alignment.",
                "points": 10
            },

            # JavaScript
            {
                "category": "javascript",
                "difficulty": "beginner",
                "question_text": "What is the difference between `==` and `===` in JavaScript?",
                "option_a": "`==` checks value with type coercion; `===` checks both value and type without coercion.",
                "option_b": "`===` converts types automatically before comparison.",
                "option_c": "They are completely identical in ES6.",
                "option_d": "`===` only works for primitive numbers.",
                "correct_option": "A",
                "explanation": "`==` allows loose equality with implicit type conversion, while `===` performs strict equality checking both value and datatype.",
                "points": 10
            },
            {
                "category": "javascript",
                "difficulty": "intermediate",
                "question_text": "What will `typeof NaN` evaluate to in JavaScript?",
                "option_a": "'undefined'",
                "option_b": "'nan'",
                "option_c": "'number'",
                "option_d": "'object'",
                "correct_option": "C",
                "explanation": "Despite standing for 'Not a Number', IEEE 754 floating-point specification defines NaN as a numeric representation; hence `typeof NaN === 'number'`.",
                "points": 10
            },
            {
                "category": "javascript",
                "difficulty": "intermediate",
                "question_text": "Which array method creates a new array with elements that pass a provided testing callback function?",
                "option_a": "map()",
                "option_b": "filter()",
                "option_c": "find()",
                "option_d": "reduce()",
                "correct_option": "B",
                "explanation": "`filter()` iterates through each element and keeps only elements for which the callback returns a truthy value.",
                "points": 10
            }
        ]

        for q_data in quiz_data:
            QuizQuestion.objects.update_or_create(
                category=q_data["category"],
                question_text=q_data["question_text"],
                defaults=q_data
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(quiz_data)} quiz questions."))

        # 4. Demo leaderboard users (not login accounts)
        users_to_seed = [
            {
                "username": "alex_coder",
                "email": "alex@codequest.dev",
                "bio": "Full-stack engineer passionate about algorithms and clean code.",
                "fav": "Python",
                "points": 240,
                "solved": 8,
                "quizzes": 5
            },
            {
                "username": "sarah_dev",
                "email": "sarah@codequest.dev",
                "bio": "Frontend wizard crafting responsive and accessible web apps.",
                "fav": "JavaScript",
                "points": 190,
                "solved": 6,
                "quizzes": 4
            },
            {
                "username": "chen_data",
                "email": "chen@codequest.dev",
                "bio": "SQL enthusiast and data engineer building high-throughput pipelines.",
                "fav": "SQL",
                "points": 150,
                "solved": 5,
                "quizzes": 3
            },
            {
                "username": "elena_craft",
                "email": "elena@codequest.dev",
                "bio": "CSS artist loving grid, animations, and dark mode UI.",
                "fav": "CSS",
                "points": 110,
                "solved": 4,
                "quizzes": 2
            }
        ]

        for u in users_to_seed:
            user, created = User.objects.get_or_create(
                username=u["username"],
                defaults={"email": u["email"]}
            )
            if created:
                user.set_unusable_password()
                user.save()

            progress, _ = UserProgress.objects.get_or_create(user=user)
            progress.bio = u["bio"]
            progress.favorite_language = u["fav"]
            progress.total_points = u["points"]
            progress.challenges_solved = u["solved"]
            progress.quizzes_completed = u["quizzes"]
            progress.save()

        self.stdout.write(self.style.SUCCESS("CodeQuest data seeding completed successfully!"))
