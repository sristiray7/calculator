import sympy as sp
import numpy as np
import math
import re
import cmath

from sympy.parsing.sympy_parser import parse_expr
# -------------------------------------------------------------------------
# HELPER PARSING UTILITY (Implied Multiplication & Pre-processing)
# -------------------------------------------------------------------------
def parse_and_evaluate_expression(expression_str):
    """
    Cleans up custom calculator operator strings, parses postfix factorials, 
    and returns a mathematically correct answer.
    """
    try:
        # 1. Sanitize standard display text symbols to Python operations
        clean_str = expression_str.replace(" ", "")
        clean_str = clean_str.replace('÷', '/').replace('×', '*')
        
        # 2. FIX: Replace power caret '^' with Python's exponent operator '**'
        clean_str = clean_str.replace('^', '**')
        
        # 3. Regex to match postfix factorials like "5!" or "12!"
        def replace_factorial(match):
            num = match.group(1)
            return f"math.factorial({num})"
        
        clean_str = re.sub(r'([0-9]+)!', replace_factorial, clean_str)

        # 4. FIX: Add math binding shortcuts directly to allowed execution dictionary 
        # This allows functions like sqrt() to evaluate successfully without 'math.' prefixing
        allowed_names = {
            "math": math, 
            "abs": abs, 
            "round": round,
            "sqrt": math.sqrt,
            "log": math.log10,
            "ln": math.log,
            "sin": math.sin,
            "cos": math.cos,
            "tan": math.tan
        }
        
        result = eval(clean_str, {"__builtins__": None}, allowed_names)
        
        # Return cleanly truncated integer/float results
        if isinstance(result, float) and result.is_integer():
            return str(int(result))
        return str(result)
        
    except Exception as e:
        return "Syntax ERROR"

# -------------------------------------------------------------------------
# MODE 1: COMP MODE (Arithmetic, Trigonometry, Logic)
# -------------------------------------------------------------------------
def run_comp_mode(expression_str, angle_unit="DEG"):
    """
    Evaluates raw base calculation strings and processes engineering trig tokens.
    """
    try:
        processed_str = expression_str.replace(" ", "")
        
        # 1. Map specialized display sequences into pure alphanumeric functions
        processed_str = processed_str.replace("log(", "math.log10(")
        processed_str = processed_str.replace("ln(", "math.log(")
        
        # Handle degree to radian normalization adjustments dynamically for trig functions
        if angle_unit == "DEG":
            processed_str = re.sub(r'sin\(([^)]+)\)', r'math.sin(math.radians(\1))', processed_str)
            processed_str = re.sub(r'cos\(([^)]+)\)', r'math.cos(math.radians(\1))', processed_str)
            processed_str = re.sub(r'tan\(([^)]+)\)', r'math.tan(math.radians(\1))', processed_str)
        else:
            processed_str = processed_str.replace("sin(", "math.sin(")
            processed_str = processed_str.replace("cos(", "math.cos(")
            processed_str = processed_str.replace("tan(", "math.tan(")
                
        # Send clean math string to the evaluation pipeline
        return parse_and_evaluate_expression(processed_str)
    except Exception:
        return "Math ERROR"
import cmath  # Ensure this is imported at the very top of engines.py
# -------------------------------------------------------------------------
# MODE 2: CMPLX MODE (Complex Number Calculations)
def run_cmplx_mode(expression, output_format="RECT"):
    try:
        # Convert user-friendly imaginary notation
        expr_clean = expression.replace("i", "I")

        # Convert 3I -> 3*I
        expr_clean = re.sub(r'(\d+)I', r'\1*I', expr_clean)

        # Convert power operator
        expr_clean = expr_clean.replace("^", "**")

        parsed_expr = parse_expr(
            expr_clean,
            local_dict={"I": sp.I}
        )

        simplified = sp.simplify(parsed_expr)

        complex_num = complex(simplified.evalf())

        real_part = complex_num.real
        imag_part = complex_num.imag

        if output_format == "POLAR":
            r = abs(complex_num)
            theta = math.atan2(imag_part, real_part)

            return f"{round(r,5)} ∠ {round(theta,5)} rad"

        # Pure Real
        if abs(imag_part) < 1e-10:
            if float(real_part).is_integer():
                return str(int(real_part))
            return str(round(real_part, 10))

        # Pure Imaginary
        if abs(real_part) < 1e-10:
            sign = "-" if imag_part < 0 else ""
            return f"{sign}{round(abs(imag_part),5)}i"

        r_str = str(round(real_part, 5))
        i_str = str(round(abs(imag_part), 5))

        if imag_part >= 0:
            return f"{r_str} + {i_str}i"
        else:
            return f"{r_str} - {i_str}i"

    except Exception as e:
        return f"Cmplx ERROR: {str(e)}"
#--------------------------------------------------------------------------
def run_base_n_mode(expression_str, current_base):
    try:
        base_map = {
            "DEC": 10,
            "HEX": 16,
            "BIN": 2,
            "OCT": 8
        }

        radix = base_map.get(current_base.upper(), 10)

        expr = expression_str.upper().replace(" ", "")

        # Convert all numbers in expression to decimal
        def convert_match(match):
            return str(int(match.group(0), radix))

        if radix == 16:
            pattern = r'[0-9A-F]+'
        elif radix == 10:
            pattern = r'[0-9]+'
        elif radix == 8:
            pattern = r'[0-7]+'
        else:  # BIN
            pattern = r'[0-1]+'

        decimal_expr = re.sub(pattern, convert_match, expr)

        result = eval(decimal_expr, {"__builtins__": None}, {})

        if isinstance(result, float) and result.is_integer():
            result = int(result)

        return str(result)

    except Exception as e:
        return f"Base ERROR: {str(e)}"
    
# -------------------------------------------------------------------------
# MODE 4: EQN MODE (Equation Solvers)
# -------------------------------------------------------------------------
def run_eqn_mode(config_type, coefficients):
    """
    Solves basic algebraic polynomials using symbolic calculations.
    """
    try:
        if config_type == "DEGREE_2":
            a, b, c = coefficients
            if a == 0:
                return "Math ERROR (a cannot be 0)"
                
            discriminant = b**2 - 4*a*c
            # Quadratic execution routes
            if discriminant >= 0:
                r1 = (-b + math.sqrt(discriminant)) / (2*a)
                r2 = (-b - math.sqrt(discriminant)) / (2*a)
                return f"x1={round(r1,4)}, x2={round(r2,4)}"
            else:
                real_part = -b / (2*a)
                imag_part = math.sqrt(abs(discriminant)) / (2*a)
                return f"x1={round(real_part,4)}+{round(imag_part,4)}i, x2={round(real_part,4)}-{round(imag_part,4)}i"
        return "Unknown EQN Type"
    except Exception:
        return "Eqn ERROR"

# -------------------------------------------------------------------------
# MODE 5: MATRIX MODE (Linear Algebra Brain Architecture)
# -------------------------------------------------------------------------
def run_matrix_mode(matrix_a_raw, matrix_b_raw, operation):
    """
    Central brain for Matrix operations. Scalable to 2x2, 3x3, and higher.
    """
    try:
        # NumPy automatically calculates dimensions cleanly
        mat_a = np.array(matrix_a_raw, dtype=float)
        operation = operation.upper()

        if operation == "DET":
            det_val = np.linalg.det(mat_a)
            return str(round(det_val, 5))
            
        elif operation == "INV":
            if np.linalg.det(mat_a) == 0:
                return "Math ERROR (Singular Matrix)"
            inv_matrix = np.linalg.inv(mat_a)
            return str(np.round(inv_matrix, 5).tolist())
            
        elif operation in ["MULTIPLY", "MUL"]:
            if not matrix_b_raw or len(matrix_b_raw) == 0:
                return "SYN ERROR: Missing Matrix B"
            
            mat_b = np.array(matrix_b_raw, dtype=float)
            
            # Use high-performance matrix dot product
            result_matrix = mat_a @ mat_b
            return str(np.round(result_matrix, 5).tolist())
            
        elif operation == "TRANSPOSE":
            return str(mat_a.T.tolist())
            
        return "Unknown Matrix Action"
        
    except Exception as e:
        return f"Matrix ERROR: {str(e)}"
# -------------------------------------------------------------------------
# MODE 6: VECTOR MODE (3D Coordinate Cross/Dot Products)
# -------------------------------------------------------------------------
def run_vector_mode(vector_a_raw, vector_b_raw, operation):
    try:
        v_a = sp.Matrix(vector_a_raw)
        v_b = sp.Matrix(vector_b_raw)
        if operation == "DOT":
            return str(v_a.dot(v_b))
        elif operation == "CROSS":
            cross_product = v_a.cross(v_b)
            return str(cross_product.tolist())
        return "Unknown Vector Action"
    except Exception as e:
        return f"Vector ERROR: {str(e)}"
    
