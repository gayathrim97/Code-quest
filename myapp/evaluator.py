import ast
import re
import sys
import io

SAFE_BUILTINS = {
    'abs': abs,
    'all': all,
    'any': any,
    'bin': bin,
    'bool': bool,
    'chr': chr,
    'dict': dict,
    'divmod': divmod,
    'enumerate': enumerate,
    'filter': filter,
    'float': float,
    'format': format,
    'hex': hex,
    'int': int,
    'isinstance': isinstance,
    'len': len,
    'list': list,
    'map': map,
    'max': max,
    'min': min,
    'oct': oct,
    'ord': ord,
    'pow': pow,
    'print': print,
    'range': range,
    'reversed': reversed,
    'round': round,
    'set': set,
    'slice': slice,
    'sorted': sorted,
    'str': str,
    'sum': sum,
    'tuple': tuple,
    'zip': zip,
}

DISALLOWED_IMPORTS = {'os', 'sys', 'subprocess', 'shutil', 'socket', 'http', 'urllib', 'requests', 'pathlib', 'builtins'}


def check_ast_safety(tree):
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names = [alias.name.split('.')[0] for alias in node.names] if isinstance(node, ast.Import) else [node.module.split('.')[0] if node.module else '']
            for name in names:
                if name in DISALLOWED_IMPORTS:
                    return False, f"Importing '{name}' is not allowed for security reasons."
        elif isinstance(node, ast.Name) and node.id in ('eval', 'exec', 'compile', '__import__', 'open'):
            return False, f"Using '{node.id}' is not allowed for security reasons."
    return True, ""


def evaluate_python_code(code, test_cases):
    test_results = []
    
    # 1. Check syntax with AST
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, [{
            "name": "Syntax Validation",
            "passed": False,
            "expected": "Valid Python code",
            "actual": f"SyntaxError at line {e.lineno}: {e.msg}",
            "message": f"Syntax error at line {e.lineno}: {e.msg}"
        }]
    except Exception as e:
        return False, [{
            "name": "Syntax Validation",
            "passed": False,
            "expected": "Valid Python code",
            "actual": str(e),
            "message": f"Parsing error: {str(e)}"
        }]

    # 2. Safety AST check
    is_safe, error_msg = check_ast_safety(tree)
    if not is_safe:
        return False, [{
            "name": "Security Check",
            "passed": False,
            "expected": "Safe code without restricted modules",
            "actual": error_msg,
            "message": error_msg
        }]

    # 3. Execute in safe sandbox
    safe_globals = {"__builtins__": SAFE_BUILTINS}
    local_env = {}

    try:
        # Execute the user's code definition
        exec(code, safe_globals, local_env)
    except Exception as e:
        return False, [{
            "name": "Execution Check",
            "passed": False,
            "expected": "Code executes without runtime exceptions",
            "actual": f"{type(e).__name__}: {str(e)}",
            "message": f"Runtime error: {str(e)}"
        }]

    # If no test cases are specified, passing syntax & safe run is considered pass
    if not test_cases:
        return True, [{
            "name": "Code Execution",
            "passed": True,
            "expected": "No errors",
            "actual": "Executed successfully",
            "message": "Code executed with zero errors."
        }]

    all_passed = True

    for idx, tc in enumerate(test_cases):
        tc_name = tc.get("description") or f"Test Case #{idx + 1}"
        expected_raw = str(tc.get("expected_output", "")).strip()
        tc_input = tc.get("input", "")
        fn_name = tc.get("function_name", "")

        try:
            # Check if testing a specific function call
            if fn_name and fn_name in local_env and callable(local_env[fn_name]):
                fn = local_env[fn_name]
                # Evaluate input safely
                if tc_input:
                    try:
                        args = eval(f"({tc_input},)", {"__builtins__": SAFE_BUILTINS})
                        result = fn(*args)
                    except Exception:
                        result = fn(tc_input)
                else:
                    result = fn()

                actual_str = str(result).strip()
                passed = (actual_str == expected_raw) or (str(result) == expected_raw)
            else:
                # If no function name specified or script style, evaluate output or stdout
                # Capture standard output
                stdout_capture = io.StringIO()
                old_stdout = sys.stdout
                sys.stdout = stdout_capture
                try:
                    exec(code, safe_globals, local_env)
                finally:
                    sys.stdout = old_stdout
                actual_str = stdout_capture.getvalue().strip()
                passed = (actual_str == expected_raw) or (expected_raw in actual_str)

            if not passed:
                all_passed = False

            test_results.append({
                "name": tc_name,
                "passed": passed,
                "expected": expected_raw,
                "actual": actual_str if not tc.get("is_hidden", False) else "[Hidden Output]",
                "message": "Passed" if passed else f"Expected '{expected_raw}', got '{actual_str}'"
            })
        except Exception as e:
            all_passed = False
            test_results.append({
                "name": tc_name,
                "passed": False,
                "expected": expected_raw,
                "actual": f"Error: {type(e).__name__}",
                "message": f"Failed with error: {str(e)}"
            })

    return all_passed, test_results


def evaluate_sql_code(code, test_cases):
    normalized = " ".join(code.strip().upper().split())
    test_results = []
    all_passed = True

    if not code.strip():
        return False, [{"name": "Syntax Check", "passed": False, "expected": "SQL Query", "actual": "Empty", "message": "Query cannot be empty"}]

    for idx, tc in enumerate(test_cases):
        tc_name = tc.get("description") or f"Test Case #{idx + 1}"
        expected = tc.get("expected_output", "").strip()
        required_keywords = tc.get("required_keywords", [])
        forbidden_keywords = tc.get("forbidden_keywords", [])

        passed = True
        reason = "Passed"

        # Check required keywords or patterns
        for kw in required_keywords:
            if kw.upper() not in normalized:
                passed = False
                reason = f"Missing required keyword or clause: '{kw}'"
                break

        if passed:
            for kw in forbidden_keywords:
                if kw.upper() in normalized:
                    passed = False
                    reason = f"Query contains disallowed clause: '{kw}'"
                    break

        if passed and expected:
            # If expected query pattern or exact regex match provided
            if not re.search(expected, code, re.IGNORECASE):
                passed = False
                reason = "Query did not match the expected SQL criteria"

        if not passed:
            all_passed = False

        test_results.append({
            "name": tc_name,
            "passed": passed,
            "expected": expected or "Valid SQL matching criteria",
            "actual": "Matched" if passed else "Criteria not met",
            "message": reason
        })

    return all_passed, test_results


def evaluate_html_code(code, test_cases):
    test_results = []
    all_passed = True

    if not code.strip():
        return False, [{"name": "Validation", "passed": False, "expected": "HTML markup", "actual": "Empty", "message": "HTML cannot be empty"}]

    for idx, tc in enumerate(test_cases):
        tc_name = tc.get("description") or f"Test Case #{idx + 1}"
        pattern = tc.get("pattern") or tc.get("expected_output", "")
        required_tag = tc.get("required_tag", "")

        passed = True
        reason = "Passed"

        if required_tag:
            tag_regex = rf"<{required_tag}\b[^>]*>.*?</{required_tag}>|<{required_tag}\b[^>]*\/?>"
            if not re.search(tag_regex, code, re.IGNORECASE | re.DOTALL):
                passed = False
                reason = f"Missing required HTML element: <{required_tag}>"

        if passed and pattern:
            if not re.search(pattern, code, re.IGNORECASE | re.DOTALL):
                passed = False
                reason = f"Missing expected pattern: {pattern}"

        if not passed:
            all_passed = False

        test_results.append({
            "name": tc_name,
            "passed": passed,
            "expected": pattern or f"<{required_tag}> element",
            "actual": "Found" if passed else "Not found",
            "message": reason
        })

    return all_passed, test_results


def evaluate_css_code(code, test_cases):
    test_results = []
    all_passed = True
    normalized = " ".join(code.replace("\n", " ").split())

    if not code.strip():
        return False, [{"name": "Validation", "passed": False, "expected": "CSS rules", "actual": "Empty", "message": "CSS cannot be empty"}]

    for idx, tc in enumerate(test_cases):
        tc_name = tc.get("description") or f"Test Case #{idx + 1}"
        selector = tc.get("selector", "")
        property_name = tc.get("property", "")
        expected_value = tc.get("expected_output", "")

        passed = True
        reason = "Passed"

        if selector and not re.search(rf"{re.escape(selector)}\s*\{{[^\}}]*\}}", code, re.IGNORECASE):
            passed = False
            reason = f"Selector '{selector}' not found or rule not closed"

        if passed and property_name:
            prop_regex = rf"{re.escape(property_name)}\s*:\s*([^;}}]+)"
            match = re.search(prop_regex, code, re.IGNORECASE)
            if not match:
                passed = False
                reason = f"Missing CSS property '{property_name}'"
            elif expected_value and expected_value.lower() not in match.group(1).lower():
                passed = False
                reason = f"Expected '{property_name}: {expected_value}', got '{match.group(1).strip()}'"

        if not passed:
            all_passed = False

        test_results.append({
            "name": tc_name,
            "passed": passed,
            "expected": f"{property_name}: {expected_value}" if property_name else selector,
            "actual": "Matched" if passed else "Not matched",
            "message": reason
        })

    return all_passed, test_results


def evaluate_js_code(code, test_cases):
    test_results = []
    all_passed = True

    if not code.strip():
        return False, [{"name": "Validation", "passed": False, "expected": "JavaScript code", "actual": "Empty", "message": "Code cannot be empty"}]

    # Check for basic JS syntax / structure
    if code.count("{") != code.count("}") or code.count("(") != code.count(")"):
        return False, [{
            "name": "Syntax Check",
            "passed": False,
            "expected": "Balanced braces and parentheses",
            "actual": "Unbalanced syntax",
            "message": "Syntax check failed: unbalanced braces or parentheses"
        }]

    for idx, tc in enumerate(test_cases):
        tc_name = tc.get("description") or f"Test Case #{idx + 1}"
        expected = tc.get("expected_output", "").strip()
        pattern = tc.get("pattern", "")
        fn_name = tc.get("function_name", "")

        passed = True
        reason = "Passed"

        if fn_name:
            fn_pattern = rf"(function\s+{re.escape(fn_name)}|const\s+{re.escape(fn_name)}\s*=|let\s+{re.escape(fn_name)}\s*=)"
            if not re.search(fn_pattern, code):
                passed = False
                reason = f"Function '{fn_name}' was not defined"

        if passed and pattern:
            if not re.search(pattern, code, re.IGNORECASE):
                passed = False
                reason = f"Expected logic pattern '{pattern}' not found"

        if not passed:
            all_passed = False

        test_results.append({
            "name": tc_name,
            "passed": passed,
            "expected": expected or pattern or f"Function {fn_name}",
            "actual": "Passed" if passed else "Pattern not satisfied",
            "message": reason
        })

    return all_passed, test_results


def evaluate_submission(language, code, test_cases):
    lang = language.lower()
    if lang == 'python':
        return evaluate_python_code(code, test_cases)
    elif lang == 'sql':
        return evaluate_sql_code(code, test_cases)
    elif lang == 'html':
        return evaluate_html_code(code, test_cases)
    elif lang == 'css':
        return evaluate_css_code(code, test_cases)
    elif lang in ('javascript', 'js'):
        return evaluate_js_code(code, test_cases)
    else:
        return evaluate_python_code(code, test_cases)
