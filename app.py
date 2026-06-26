from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import webbrowser
from threading import Timer
import engines

# Configure Flask with strict path definitions for serving structural UI assets
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)


# -------------------------------------------------------------------------
# UI ROUTE (Serves Frontend Shell Layout)
# -------------------------------------------------------------------------
@app.route('/', methods=['GET'])
def home():
    """
    Serves your core calculator index.html file when loading up the base server.
    """
    return render_template('index.html')

# -------------------------------------------------------------------------
# CENTRAL CALCULATOR API GATEWAY ROUTER
# -------------------------------------------------------------------------
@app.route('/api/991ms/calculate', methods=['POST'])
def central_calculator_router():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data package received."}), 400
        
        mode = data.get('mode', 'COMP').upper()
        
        if mode == "COMP":
            expression = data.get('expression', '')
            if isinstance(expression, str):
                expression = expression.lower().strip()
                
            angle_unit = data.get('angle_unit', 'DEG').upper()
            result = engines.run_comp_mode(expression, angle_unit=angle_unit)
            
        elif mode == "CMPLX":
            expression = data.get('expression', '')
            if isinstance(expression, str):
                expression = expression.lower().strip()
            result = engines.run_cmplx_mode(expression)
            
        elif mode == "BASE_N":
            expression = data.get('expression', '')
            if isinstance(expression, str):
                expression = expression.strip()
            target_base = data.get('base', 'DEC').upper()
            result = engines.run_base_n_mode(expression, target_base)
            
        elif mode == "EQN":
            config_type = data.get('config_type', 'DEGREE_2')
            input_data = data.get('coefficients', [])
            result = engines.run_eqn_mode(config_type, input_data)
            
        elif mode == "MATRIX":
            matrix_a = data.get('matrix_a', [])
            matrix_b = data.get('matrix_b', [])
            operation = data.get('operation', '').upper()
            result = engines.run_matrix_mode(matrix_a, matrix_b, operation)
            
        elif mode == "VECTOR":
            vector_a = data.get('vector_a', [])
            vector_b = data.get('vector_b', [])
            operation = data.get('operation', '').upper()
            result = engines.run_vector_mode(vector_a, vector_b, operation)

        
        else:
            return jsonify({"success": False, "error": f"Unknown mode: {mode}"}), 400

        return jsonify({
            "success": True,
            "mode": mode,
            "result": result
        })

    except Exception as err:
        return jsonify({"success": False, "error": str(err)}), 500

# -------------------------------------------------------------------------
# APPLICATION ENTRY CONTROL
# -------------------------------------------------------------------------
if __name__ == '__main__':
    # Starts a safe 1.5-second background thread clock delay before executing open_browser()
    # This prevents your browser from opening before the Flask web port is fully initialized.
    Timer(1.5, open_browser).start()
    
    # Fire up the engine server gateway
    app.run(host='127.0.0.1', port=5000, debug=True, use_reloader=False) 