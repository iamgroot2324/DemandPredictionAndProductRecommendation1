# app.py
# Flask REST API — serves Linear Regression + Recommendation Engine
# With error handling, validation, and model persistence


from flask import Flask, request, jsonify
from datetime import datetime
import os
import pickle
import traceback
from data_prep import load_and_prepare, normalize, denormalize
from linear_regression import train, predict, mean_squared_error, train_test_split
from recommender import (
    build_user_item_matrix, collaborative_recommend,
    build_product_features, content_based_recommend
)
from linear_regression import (train, predict, mean_squared_error,
                                train_test_split, mean_absolute_error,
                                r_squared)

app = Flask(__name__)
MODELS_DIR = "models"
MODEL_PATH = os.path.join(MODELS_DIR, "regression_model.pkl")
RECOMMENDER_PATH = os.path.join(MODELS_DIR, "recommender_data.pkl")

# ── Global Variables ────────────────────────────────────────────────────────

M, B = None, None
X_MIN, X_MAX, Y_MIN, Y_MAX = None, None, None, None
matrix, customers, product_keys, c_idx, p_idx = None, None, None, None, None
p_vectors, p_details = None, None
df = None
model_trained_at = None
TEST_MSE, TEST_MAE, TEST_R2 = None, None, None
x_test, y_test = None, None

# ── Model Persistence Functions ────────────────────────────────────────────

def save_models():
    """Save trained models to disk."""
    try:
        if not os.path.exists(MODELS_DIR):
            os.makedirs(MODELS_DIR)
        
        regression_data = {
            'M': M, 'B': B,
            'X_MIN': X_MIN, 'X_MAX': X_MAX,
            'Y_MIN': Y_MIN, 'Y_MAX': Y_MAX,
            'TEST_MSE': TEST_MSE, 'TEST_MAE': TEST_MAE, 'TEST_R2': TEST_R2,
            'x_test': x_test, 'y_test': y_test
        }
        
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(regression_data, f)
        print(f"✓ Regression model saved: {MODEL_PATH}")
        
        recommender_data = {
            'matrix': matrix, 'customers': customers, 'product_keys': product_keys,
            'c_idx': c_idx, 'p_idx': p_idx, 'p_vectors': p_vectors, 'p_details': p_details
        }
        
        with open(RECOMMENDER_PATH, 'wb') as f:
            pickle.dump(recommender_data, f)
        print(f"✓ Recommender model saved: {RECOMMENDER_PATH}")
        
    except Exception as e:
        print(f"✗ Error saving models: {e}")

def load_models():
    """Load previously saved models from disk."""
    global M, B, X_MIN, X_MAX, Y_MIN, Y_MAX
    global TEST_MSE, TEST_MAE, TEST_R2, x_test, y_test
    global matrix, customers, product_keys, c_idx, p_idx, p_vectors, p_details
    
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                data = pickle.load(f)
                M = data['M']
                B = data['B']
                X_MIN = data['X_MIN']
                X_MAX = data['X_MAX']
                Y_MIN = data['Y_MIN']
                Y_MAX = data['Y_MAX']
                TEST_MSE = data['TEST_MSE']
                TEST_MAE = data['TEST_MAE']
                TEST_R2 = data['TEST_R2']
                x_test = data['x_test']
                y_test = data['y_test']
            print(f"✓ Regression model loaded from cache: {MODEL_PATH}")
            return True
    except Exception as e:
        print(f"✗ Error loading regression model: {e}")
    
    return False

def load_recommender_models():
    """Load recommender models from disk."""
    global matrix, customers, product_keys, c_idx, p_idx, p_vectors, p_details
    
    try:
        if os.path.exists(RECOMMENDER_PATH):
            with open(RECOMMENDER_PATH, 'rb') as f:
                data = pickle.load(f)
                matrix = data['matrix']
                customers = data['customers']
                product_keys = data['product_keys']
                c_idx = data['c_idx']
                p_idx = data['p_idx']
                p_vectors = data['p_vectors']
                p_details = data['p_details']
            print(f"✓ Recommender model loaded from cache: {RECOMMENDER_PATH}")
            return True
    except Exception as e:
        print(f"✗ Error loading recommender model: {e}")
    
    return False

# ── Model Initialization ───────────────────────────────────────────────────

def train_models():
    """Train or load models on startup."""
    global M, B, X_MIN, X_MAX, Y_MIN, Y_MAX
    global TEST_MSE, TEST_MAE, TEST_R2, x_test, y_test
    global matrix, customers, product_keys, c_idx, p_idx, p_vectors, p_details
    global df, model_trained_at
    
    print("🔄 Initializing models...")
    
    # Try to load cached models first
    regression_cached = load_models()
    recommender_cached = load_recommender_models()
    
    if regression_cached and recommender_cached:
        print(f"✓ All models loaded from cache!")
        model_trained_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return
    
    print("📊 Training models from scratch...")
    
    # Load data
    try:
        df = load_and_prepare()
    except Exception as e:
        print(f"✗ Error loading data: {e}")
        raise
    
    # Train Linear Regression
    try:
        prices   = df["Price"].tolist()
        qty_sold = df["Quantity Sold"].tolist()
        
        x_norm, X_MIN, X_MAX = normalize(prices)
        y_norm, Y_MIN, Y_MAX = normalize(qty_sold)
        
        x_train, y_train, x_test, y_test = train_test_split(x_norm, y_norm)
        M, B = train(x_train, y_train, learning_rate=0.1, epochs=2000)
        
        test_preds = [predict(x, M, B) for x in x_test]
        TEST_MSE   = mean_squared_error(y_test, test_preds)
        TEST_MAE   = mean_absolute_error(y_test, test_preds)
        TEST_R2    = r_squared(y_test, test_preds)
        
        print(f"✓ Demand model trained. MSE: {TEST_MSE:.6f}, MAE: {TEST_MAE:.6f}, R²: {TEST_R2:.6f}")
    except Exception as e:
        print(f"✗ Error training regression model: {e}")
        raise
    
    # Build Recommendation Engine
    try:
        matrix, customers, product_keys, c_idx, p_idx = build_user_item_matrix(df)
        p_vectors, p_details = build_product_features(df)
        print(f"✓ Recommender ready. {len(customers)} customers, {len(product_keys)} products")
    except Exception as e:
        print(f"✗ Error building recommender: {e}")
        raise
    
    # Save models
    save_models()
    model_trained_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"✓ Model initialization complete!\n")

# ── Error Handler ───────────────────────────────────────────────────────────

@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": str(e.description)}), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    print(f"Internal error: {traceback.format_exc()}")
    return jsonify({"error": "Internal server error"}), 500



@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "trained_at": model_trained_at,
        "routes": {
            "GET  /":                  "health check",
            "GET  /model/info":        "model details",
            "POST /predict":           "predict demand for one price",
            "POST /predict/batch":     "predict for multiple prices",
            "POST /recommend/user":    "collaborative filtering",
            "POST /recommend/product": "content-based filtering",
            "GET  /customers":         "all customer names",
            "GET  /products":          "all product codes"
        }
    })


@app.route("/model/info", methods=["GET"])
def model_info():
    if M is None:
        return jsonify({"error": "Models not loaded"}), 503
    
    return jsonify({
        "algorithm":   "Linear Regression + Gradient Descent (from scratch)",
        "trained_on":  len(x_test),
        "tested_on":   len(y_test),
        "features":    ["Price"],
        "target":      "Quantity Sold",
        "slope_m":     round(M, 6),
        "intercept_b": round(B, 6),
        "test_mse":    round(TEST_MSE, 6),
        "test_mae":    round(TEST_MAE, 6),
        "r_squared":   round(TEST_R2,  6),
        "price_range": {"min": round(X_MIN, 2), "max": round(X_MAX, 2)},
        "qty_range":   {"min": round(Y_MIN, 2), "max": round(Y_MAX, 2)},
        "trained_at":  model_trained_at,
        "cached":      os.path.exists(MODEL_PATH)
    })

@app.route("/predict", methods=["POST"])
def predict_demand():
    """
    Predict demand (quantity) for a given price.
    Request: {"price": 500}
    Response: {"price": 500, "predicted_quantity": 5.5, "model_mse": 0.123456}
    """
    if M is None:
        return jsonify({"error": "Models not loaded"}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        
        if "price" not in data:
            return jsonify({"error": "Missing required field: 'price'"}), 400

        # Validate price
        try:
            price = float(data["price"])
        except (ValueError, TypeError):
            return jsonify({"error": "Price must be a number"}), 400
        
        if price < 0:
            return jsonify({"error": "Price cannot be negative"}), 400
        
        if price > 100000:
            return jsonify({"error": "Price is unrealistically high (>100000)"}), 400

        # Predict
        price_norm = (price - X_MIN) / (X_MAX - X_MIN) if (X_MAX - X_MIN) != 0 else 0
        qty_norm   = predict(price_norm, M, B)
        qty_real   = denormalize(qty_norm, Y_MIN, Y_MAX)
        qty_real   = max(1.0, min(10.0, qty_real))

        return jsonify({
            "price":              price,
            "predicted_quantity": round(qty_real, 2),
            "model_mse":          round(TEST_MSE, 6)
        }), 200
    
    except Exception as e:
        print(f"Error in /predict: {traceback.format_exc()}")
        return jsonify({"error": "Prediction failed"}), 500


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    """
    Predict demand for multiple prices.
    Request: {"prices": [500, 1000, 1500]}
    Response: {"predictions": [{"price": 500, "predicted_quantity": 5.5}, ...]}
    """
    if M is None:
        return jsonify({"error": "Models not loaded"}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        
        if "prices" not in data:
            return jsonify({"error": "Missing required field: 'prices'"}), 400
        
        prices = data["prices"]
        if not isinstance(prices, list):
            return jsonify({"error": "'prices' must be a list"}), 400
        
        if len(prices) == 0:
            return jsonify({"error": "'prices' list cannot be empty"}), 400
        
        if len(prices) > 1000:
            return jsonify({"error": "Maximum 1000 prices per request"}), 400

        results = []
        for price in prices:
            try:
                price = float(price)
                if price < 0 or price > 100000:
                    results.append({
                        "price": price,
                        "error": "Price out of range"
                    })
                    continue
                
                price_norm = (price - X_MIN) / (X_MAX - X_MIN) if (X_MAX - X_MIN) != 0 else 0
                qty_norm   = predict(price_norm, M, B)
                qty_real   = denormalize(qty_norm, Y_MIN, Y_MAX)
                qty_real   = max(1.0, min(10.0, qty_real))
                
                results.append({
                    "price":              price,
                    "predicted_quantity": round(qty_real, 2)
                })
            except (ValueError, TypeError):
                results.append({
                    "price": price,
                    "error": "Invalid price format"
                })

        return jsonify({"predictions": results, "count": len(results)}), 200
    
    except Exception as e:
        print(f"Error in /predict/batch: {traceback.format_exc()}")
        return jsonify({"error": "Batch prediction failed"}), 500


# ════════════════════════════════════════════════════════════════════════════
#  RECOMMENDATION ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.route("/recommend/user", methods=["POST"])
def recommend_for_user():
    """
    Get recommendations for a customer using collaborative filtering.
    Request: {"customer_name": "Customer_0"}
    Response: {"customer": "Customer_0", "recommendations": [...]}
    """
    if matrix is None:
        return jsonify({"error": "Recommender not loaded"}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        
        if "customer_name" not in data:
            return jsonify({"error": "Missing required field: 'customer_name'"}), 400

        customer_name = str(data["customer_name"]).strip()
        if not customer_name:
            return jsonify({"error": "Customer name cannot be empty"}), 400

        recs = collaborative_recommend(
            customer_name, df,
            matrix, customers, product_keys, c_idx, p_idx
        )

        if not recs:
            return jsonify({
                "error": f"Customer '{customer_name}' not found or no recommendations available",
                "available_customers": len(customers)
            }), 404

        return jsonify({
            "customer":        customer_name,
            "algorithm":       "Collaborative Filtering (cosine similarity)",
            "recommendations": recs,
            "count":           len(recs)
        }), 200
    
    except Exception as e:
        print(f"Error in /recommend/user: {traceback.format_exc()}")
        return jsonify({"error": "Recommendation failed"}), 500


@app.route("/recommend/product", methods=["POST"])
def recommend_similar_products():
    """
    Get similar products using content-based filtering.
    Request: {"product_code": "Product_101"}
    Response: {"product_code": "Product_101", "similar_products": [...]}
    """
    if p_vectors is None:
        return jsonify({"error": "Recommender not loaded"}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        
        if "product_code" not in data:
            return jsonify({"error": "Missing required field: 'product_code'"}), 400

        product_code = str(data["product_code"]).strip()
        if not product_code:
            return jsonify({"error": "Product code cannot be empty"}), 400

        similar = content_based_recommend(
            product_code, p_vectors, p_details
        )

        if not similar:
            return jsonify({
                "error": f"Product '{product_code}' not found",
                "available_products": len(p_vectors)
            }), 404

        return jsonify({
            "product_code":     product_code,
            "algorithm":        "Content-Based Filtering (cosine similarity)",
            "similar_products": similar,
            "count":            len(similar)
        }), 200
    
    except Exception as e:
        print(f"Error in /recommend/product: {traceback.format_exc()}")
        return jsonify({"error": "Recommendation failed"}), 500


@app.route("/customers", methods=["GET"])
def list_customers():
    """List all available customers."""
    if customers is None:
        return jsonify({"error": "Recommender not loaded"}), 503
    
    return jsonify({
        "total":     len(customers),
        "customers": customers
    }), 200


@app.route("/products", methods=["GET"])
def list_products():
    """List all available products."""
    if p_vectors is None:
        return jsonify({"error": "Recommender not loaded"}), 503
    
    codes = list(p_vectors.keys())
    return jsonify({
        "total":    len(codes),
        "products": codes
    }), 200

@app.route("/recommend/by-name", methods=["POST"])
def recommend_by_name():
    """
    Search for a product by name and get similar products.
    Request: {"product_name": "Apple Laptop"}
    Response: {"matched_product": {...}, "similar_products": [...]}
    """
    if p_vectors is None:
        return jsonify({"error": "Recommender not loaded"}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        
        if "product_name" not in data:
            return jsonify({"error": "Missing required field: 'product_name'"}), 400

        search = str(data["product_name"]).lower().strip()
        if not search:
            return jsonify({"error": "Product name cannot be empty"}), 400

        # Search through product details for a match
        matched_code = None
        matched_info = None

        for code, details in p_details.items():
            full_name = f"{details['brand']} {details['product']}".lower()
            if search in full_name or full_name in search:
                matched_code = code
                matched_info = details
                break

        if not matched_code:
            return jsonify({
                "error": f"No product found matching '{data['product_name']}'",
                "tip":   "Try names like 'Apple Laptop' or 'Samsung Mobile Phone'",
                "available_products": len(p_details)
            }), 404

        similar = content_based_recommend(matched_code, p_vectors, p_details)

        if not similar:
            return jsonify({"error": "No similar products found"}), 404

        return jsonify({
            "searched_for":    data["product_name"],
            "matched_product": {
                "product_code": matched_code,
                "brand":        matched_info["brand"],
                "product":      matched_info["product"],
                "price":        matched_info["price"],
                "ram":          matched_info["ram"]
            },
            "algorithm":        "Content-Based Filtering (cosine similarity)",
            "similar_products": similar,
            "count":            len(similar)
        }), 200
    
    except Exception as e:
        print(f"Error in /recommend/by-name: {traceback.format_exc()}")
        return jsonify({"error": "Search failed"}), 500

# ── Start server ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        train_models()
        print(f"🚀 Flask server starting on http://localhost:5000\n")
        app.run(debug=False, port=5000, threaded=True)
    except Exception as e:
        print(f"✗ Failed to start server: {e}")
        traceback.print_exc()
        exit(1)