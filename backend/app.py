import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient  # Use PyMongo for MongoDB

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allows frontend requests (for development use only)

# Define the model file path and verify it exists
model_path = os.path.join("Medical-Cost-Predictor", "blended_model.pkl")
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at: {model_path}")

# Load the models and blend ratios
rf_model, xgb_model, blend_ratio_rf, blend_ratio_xgb = joblib.load(model_path)

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()  # Load .env variables

MONGO_URI = os.getenv("MONGO_URI")  # This now uses your Atlas URI
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["ProjectMED"]
collection = db["username"]

# Check connection
try:
    client.server_info()
    print("✅ MongoDB Connected to Atlas")
except Exception as err:
    print("❌ Connection Failed:", err)


@app.route('/predict', methods=['GET', 'POST'])
@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'GET':
        return jsonify({
            "message": "Prediction endpoint is active! Send a POST request with JSON input to get predictions."
        }), 200

    if not request.is_json:
        return jsonify({"error": "415 Unsupported Media Type: Expected 'application/json'"}), 415

    data = request.get_json()
    if "features" not in data:
        return jsonify({"error": "Missing 'features' key in request JSON"}), 400

    try:
        features = np.array(data["features"]).reshape(1, -1)
        prediction_rf = rf_model.predict(features)[0]
        prediction_xgb = xgb_model.predict(features)[0]
        blended_pred = prediction_rf * blend_ratio_rf + prediction_xgb * blend_ratio_xgb
        predicted_cost = round(blended_pred, 2)

        prediction_data = {
            "features": data["features"],
            "predicted_cost": predicted_cost
        }
        collection.insert_one(prediction_data)

        return jsonify({"predicted_cost": predicted_cost}), 200

    except Exception as err:
        import traceback
        print("❌ Prediction error:", traceback.format_exc())
        return jsonify({"error": str(err)}), 400



@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not email or not password or not name:
        return jsonify({"success": False, "message": "Missing name, email or password"}), 400

    if collection.find_one({"email": email}):
        return jsonify({"success": False, "message": "User already exists"}), 409

    collection.insert_one({
        "name": name,
        "email": email,
        "password": password
    })

    return jsonify({"success": True, "message": "User registered successfully!"}), 200


@app.route('/login', methods=['POST'])
def login():
    """Handles user authentication."""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Check credentials in MongoDB
    user = collection.find_one({"email": email, "password": password})
    if user:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "name": user.get("name")  # 🔥 Send back the user's name
        }), 200
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401


# Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)  # No SSL context
