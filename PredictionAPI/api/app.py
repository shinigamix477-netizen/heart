import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# --- Directory Configuration ---
# Resolve the absolute path of the current file's directory
BASE_PATH = os.path.dirname(os.path.abspath(__file__))

def get_full_path(file_name):
    return os.path.join(BASE_PATH, file_name)

# --- Model and Asset Loading ---
try:
    # Loading serialized model, scaler, and label encoders
    encoders = joblib.load(get_full_path('../model/label_encoders.pkl'))
    model = joblib.load(get_full_path('../model/heart_disease_best_model.pkl'))
    scaler = joblib.load(get_full_path('../model/scaler.pkl'))

    # Optimized threshold determined during training to maintain ~91% Recall
    OPTIMIZED_THRESHOLD = 0.45

    print(f"✅ Production assets loaded successfully from: {BASE_PATH}")
except Exception as e:
    print(f"❌ Critical Error: Failed to load production assets. Details: {e}")

@app.route('/')
def index():
    """Service health check endpoint."""
    return "Heart Disease Prediction API Service is Active."

# Define the exact feature order the model was trained on
FEATURE_ORDER = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalch', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    Expects a JSON object containing patient features.
    """
    try:
        # 1. Parse incoming JSON request
        request_data = request.get_json()
        if not request_data:
            return jsonify({"status": "error", "message": "No input data provided"}), 400

        # 2. Construct DataFrame from input data
        input_df = pd.DataFrame([request_data])
        input_df = input_df[FEATURE_ORDER]  #enforce correct column order here

        # 3. Categorical Encoding
        # Transform string labels to numerical values using stored LabelEncoders
        for col, le in encoders.items():
            if col in input_df.columns:
                try:
                    input_df[col] = le.transform(input_df[col].astype(str))
                except Exception:
                    # Fallback to default class if an unseen label is encountered
                    input_df[col] = le.transform([le.classes_[0]])[0]

        # 4. Feature Scaling
        # Normalize numerical features using the pre-fitted StandardScaler
        scaled_features = scaler.transform(input_df)

        # 5. Model Inference
        # Obtain probability of the positive class (Heart Disease)
        probability = model.predict_proba(scaled_features)[:, 1][0]

        # Apply the optimized threshold for final classification
        prediction = 1 if probability >= OPTIMIZED_THRESHOLD else 0

        # 6. Response Construction
        return jsonify({
            "status": "success",
            "prediction": int(prediction),
            "diagnosis": "Potential Heart Disease Risk Detected" if prediction == 1 else "Healthy",
            "riskProbability": f"{round(probability * 100, 2)}%",
            "model_metadata": {
                "target_recall": "91%",
                "operating_threshold": OPTIMIZED_THRESHOLD
            }
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Initialize the Flask development server on port 5000
    app.run(debug=True, port=5000)