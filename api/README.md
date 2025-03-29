
# Password Analysis API

This is a Flask-based backend for the Password Palooza application that provides password analysis functionality.

## Setup Instructions

1. Make sure you have Python 3.8+ installed

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. (Optional) Download the RockYou passwords dataset:
   - You can find it at various security research repositories
   - Save it as `rockyou.txt` in the same directory as `app.py`
   - If the file is not available, the application will still work but won't detect compromised passwords

4. Run the server:
   ```
   python app.py
   ```

The server will run on http://localhost:5000 by default.

## API Endpoints

- **POST /analyze** - Analyze a password
  - Request body: `{ "password": "your-password-here" }`
  - Returns detailed analysis including entropy, crack times, and suggestions

## Note

This API uses PyTorch and Hugging Face Transformers to generate password vulnerability explanations.
