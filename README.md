# Password Strength Analyzer

## Overview
The Password Strength Analyzer is a security-focused web application that evaluates password strength, provides security analysis, and generates strong passwords. The system incorporates machine learning models, entropy calculations, and dictionary-based analysis to assess and enhance password security.

## Features
1. **GPT-2 Passphrase Generator** – Generates passphrases using GPT-2 for improved memorability and security.
2. **GPT-2 Themed Passwords** – Creates passwords based on user-defined themes while ensuring strength and uniqueness.
3. **DNA-Based Password Generation** – Converts user-inputted text into a WAV file, hashes it, and generates a strong password.
4. **Password Strength Analysis** – Uses CodeBERT, zxcvbn, and entropy calculations to evaluate password security.
5. **Cracking Time Estimation** – Estimates password cracking time using various attack scenarios.
6. **Compromised Password Detection** – Checks passwords against the RockYou dataset for known breaches.
7. **Entropy Calculation** – Measures password randomness to assess its security.
8. **Security Recommendations** – Provides suggestions to improve password strength based on identified weaknesses.
9. **Alternative Password Suggestions** – Generates multiple strong password alternatives for users.
10. **Hybrid Passwords** – Combines multiple password generation techniques for enhanced security.

## Architecture
The application follows a modular architecture incorporating:
- **Frontend**: React.js (or another framework if applicable)
- **Backend**: Python with Flask
- **Machine Learning Models**: CodeBERT, GPT-2
- **Security Libraries**: zxcvbn for password analysis
- **Dataset**: RockYou dataset for breach detection

A detailed architecture diagram should be included in the repository, preferably generated using PlantUML.

## Installation
### Prerequisites
- Python 3.8+
- Flask
- NumPy
- SciPy
- Transformers (Hugging Face)
- zxcvbn

### Setup Instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/password-strength-analyzer.git
   cd password-strength-analyzer
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the application:
   ```sh
   python app.py
   ```

## API Endpoints
### 1. Analyze Password
- **Endpoint**: `/analyze`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "password": "example_password"
  }
  ```
- **Response**:
  ```json
  {
    "entropy": 75.3,
    "crackTimes": {"Fast GPU": "10 years"},
    "strengthText": "Strong",
    "suggestions": ["Use more special characters"]
  }
  ```

### 2. Generate DNA-Based Password
- **Endpoint**: `/generate-dna-password`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "answers": ["first pet", "birth city"],
    "passwordType": "hybrid"
  }
  ```
- **Response**:
  ```json
  {
    "password": "XyZ-!A9bR",
    "entropy": 85.2,
    "crackTimes": {"Supercomputer": "100 years"},
    "strength": "Very Strong"
  }
  ```

## Future Enhancements
- Implement more advanced adversarial password testing.
- Extend dataset integration for compromised password checks.
- Introduce additional ML models for adaptive password security.

## License
This project is licensed under the MIT License.
