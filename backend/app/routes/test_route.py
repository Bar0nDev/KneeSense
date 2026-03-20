from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from datetime import datetime

test_bp = Blueprint('test', __name__)

@test_bp.route('/HiKneeSense', methods=['GET', 'POST'])
@cross_origin() # Enable CORS for this route
def test_connection():
    """
    KneeSense Connection Check
    ---
    tags:
      - Connection Testing
    parameters:
      - name: body
        in: body
        required: false
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Hello KneeSense from FE."
    responses:
      200:
        description: Connection successful!
        schema:
          properties:
            status:
              type: string
            message:
              type: string
            received:
              type: object
            server_time:
              type: string
      500:
        description: Internal Server Error!
        schema:
            properties:
            status:
                type: string
            error:
                type: string
    """
    try: 
        # GET Request
        if request.method == 'GET':
            return jsonify({
                "status": "success",
                "message": "Hello KneeSense. Connection successful: CORS Allowed!",
                "method": "GET",
                "server_time": datetime.now().isoformat()
            }), 200

        # POST Request
        data = request.get_json(silent=True) or {}
        return jsonify({
            "status": "success",
            "message": "BE is listening. Handshake successful!",
            "received": data,
            "method": "POST",
            "server_time": datetime.now().isoformat()
        }), 200
    
    except Exception as e:

        print(f"Error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "The backend encountered an issue.",
            "error_details": str(e),
            "server_time": datetime.now().isoformat()
        }), 500