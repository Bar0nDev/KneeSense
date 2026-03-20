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
    """
    # GET Request
    if request.method == 'GET':
        return jsonify({
            "status": "success",
            "message": "Hello Consumer. If you see this msg means CORS Allowed!",
            "method": "GET",
            "server_time": datetime.now().isoformat()
        }), 200

    # POST Request
    data = request.get_json(silent=True) or {}
    
    # Debug print to verify incoming data from FE
    print(f"\n--- NEW FRONTEND REQUEST ---")
    print(f"Content: {data}")
    print(f"----------------------------\n")

    return jsonify({
        "status": "success",
        "message": "BE is listening. Handshake successful!",
        "received": data,
        "method": "POST",
        "server_time": datetime.now().isoformat()
    }), 200