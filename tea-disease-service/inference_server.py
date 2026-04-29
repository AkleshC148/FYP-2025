from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import io
from PIL import Image
from torchvision import models, transforms

app = Flask(__name__)
CORS(app) # Crucial for allowing your Next.js API to make cross-origin calls

# 1. Load the Model (Same architecture as your NIT Silchar training)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.efficientnet_b3(weights=None)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = torch.nn.Linear(num_ftrs, 7)
model.load_state_dict(torch.load('balanced_tea_model.pth', map_location=device))
model.to(device)
model.eval()

# 2. Categories matching your exact folder structure
categories = [
    '1. Tea algal leaf spot', '2. Brown Blight', '3. Gray Blight', 
    '4. Helopeltis', '5. Red spider', '6. Green mirid bug', '7. Healthy leaf'
]

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    # 3. Read and Preprocess Image
    file = request.files['image'].read()
    img = Image.open(io.BytesIO(file)).convert('RGB')
    
    preprocess = transforms.Compose([
        transforms.Resize((300, 300)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    img_t = preprocess(img).unsqueeze(0).to(device)

    # 4. Perform Inference
    with torch.no_grad():
        outputs = model(img_t)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        confidence, index = torch.max(probabilities, 0)
        
    return jsonify({
        "disease": categories[index],
        "confidence": f"{confidence.item()*100:.2f}%",
        "status": "success"
    })

if __name__ == '__main__':
    # Running on 5001 to avoid port 3000 (Next.js)
    app.run(host='0.0.0.0', port=5001)