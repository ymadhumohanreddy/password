from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import random
import string
import hashlib
import numpy as np
from scipy.io.wavfile import write
import os
import time
import json

# Add these new imports for the enhanced password analyzer
try:
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer, GPT2LMHeadModel, GPT2Tokenizer
    import zxcvbn
    ENHANCED_MODE = True
except ImportError:
    print("Warning: Enhanced password analysis libraries not found. Using basic analysis mode.")
    ENHANCED_MODE = False

app = Flask(__name__)
CORS(app)

# Load RockYou dataset into a set for fast lookup
def load_rockyou():
    try:
        with open('rockyou.txt', 'r', encoding='latin-1') as f:
            return set(line.strip() for line in f)
    except FileNotFoundError:
        print("Warning: rockyou.txt file not found. Using empty set for compromised passwords.")
        return set()

ROCKYOU_SET = load_rockyou()

def check_rockyou(password):
    return password in ROCKYOU_SET

# Load CodeBERT model and tokenizer if enhanced mode is available
if ENHANCED_MODE:
    try:
        model_name = "DunnBC22/codebert-base-Password_Strength_Classifier"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        model.eval()
        
        # Load GPT-2 model for security analysis
        gpt2_model_name = "gpt2"  # Using the smallest GPT-2 model
        gpt2_tokenizer = GPT2Tokenizer.from_pretrained(gpt2_model_name)
        gpt2_model = GPT2LMHeadModel.from_pretrained(gpt2_model_name)
        gpt2_model.eval()
        
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")
        ENHANCED_MODE = False

# Generate security analysis using GPT-2
def generate_security_analysis(password):
    if not ENHANCED_MODE:
        return ["Enable enhanced mode for detailed security analysis"]
    
    # Define password patterns for analysis
    patterns = {
        "sequential": any(str(i) + str(i+1) in password for i in range(0, 9)),
        "repeated": any(c * 3 in password for c in password),
        "common_words": any(word in password.lower() for word in ["password", "admin", "user", "login", "welcome"]),
        "mixed_case": any(c.isupper() for c in password) and any(c.islower() for c in password),
        "digits": any(c.isdigit() for c in password),
        "special": any(c in string.punctuation for c in password),
    }
    
    # Generate prompt for GPT-2
    prompt = "Password security analysis:\n"
    
    # Use zxcvbn for initial analysis
    zxcvbn_result = zxcvbn.zxcvbn(password)
    
    # Construct detailed analysis
    analysis = []
    
    # Add basic feedback from zxcvbn
    if zxcvbn_result["feedback"]["warning"]:
        analysis.append(zxcvbn_result["feedback"]["warning"])
    
    # Generate specific feedback based on patterns
    if patterns["sequential"]:
        analysis.append("Your password contains sequential numbers, which are easy to guess.")
    
    if patterns["repeated"]:
        analysis.append("Your password contains repeated characters, which weaken security.")
    
    if patterns["common_words"]:
        analysis.append("Your password contains common words that appear in dictionaries used by hackers.")
    
    if not patterns["mixed_case"]:
        analysis.append("Using both upper and lowercase letters would strengthen your password.")
    
    if not patterns["digits"]:
        analysis.append("Adding numbers would improve your password's strength.")
    
    if not patterns["special"]:
        analysis.append("Special characters (!@#$%^&*) would significantly enhance your password security.")
    
    # Length-based advice
    if len(password) < 8:
        analysis.append("Your password is too short. Use at least 8 characters for better security.")
    elif len(password) < 12:
        analysis.append("Consider using a longer password (12+ characters) for improved security.")
    
    # Add entropy-based feedback
    entropy = zxcvbn_result["guesses_log10"] * 3.32  # Convert to bits
    if entropy < 40:
        analysis.append(f"Your password has low entropy ({entropy:.2f} bits), making it vulnerable to brute force attacks.")
    elif entropy < 60:
        analysis.append(f"Your password has moderate entropy ({entropy:.2f} bits). Adding complexity would improve security.")
    
    # Return the analysis points
    return analysis

# Enhanced password analysis using CodeBERT and zxcvbn
def enhanced_analyze_password(password):
    # Analyze with zxcvbn
    zxcvbn_result = zxcvbn.zxcvbn(password)
    
    # Get CodeBERT prediction
    inputs = tokenizer(password, padding="max_length", max_length=128, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(predictions, dim=-1).item()
    
    # Map predicted class to strength labels (assuming 5 classes)
    strength_labels = ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"]
    predicted_strength = strength_labels[predicted_class]
    
    # Extract crack times from zxcvbn
    crack_times = {
        "Online (10/s)": zxcvbn_result["crack_times_display"]["online_throttling_100_per_hour"],
        "Offline (10k/s)": zxcvbn_result["crack_times_display"]["offline_slow_hashing_1e4_per_second"],
        "Fast GPU (1 trillion/sec)": zxcvbn_result["crack_times_display"]["offline_fast_hashing_1e10_per_second"]
    }
    
    # Extract suggestions
    suggestions = zxcvbn_result.get("feedback", {}).get("suggestions", [])
    warning = zxcvbn_result.get("feedback", {}).get("warning")
    if warning:
        suggestions.insert(0, warning)
    
    # Generate strong alternatives (maintaining backward compatibility)
    hardened = password + "!A9" + password[:3][::-1]
    
    # Calculate entropy for backward compatibility
    entropy_score = zxcvbn_result["score"] * 25
    entropy = entropy_score if entropy_score > 0 else calculate_entropy(password)
    
    # Generate security analysis
    security_analysis = generate_security_analysis(password)
    
    return {
        "entropy": entropy,
        "crackTimes": crack_times,
        "score": zxcvbn_result["score"],
        "strengthText": predicted_strength,
        "suggestions": suggestions,
        "hardened": hardened,
        "zxcvbn_result": zxcvbn_result,
        "security_analysis": security_analysis
    }

# Assumed password cracking speeds
CRACKING_SPEED = {
    "Online (1k guesses/sec)": 1e3,
    "Fast GPU (1 trillion guesses/sec)": 1e12,
    "Supercomputer (100 trillion/sec)": 1e14
}

# Calculate entropy based on character pool
def calculate_entropy(password):
    lowercase = any(c.islower() for c in password)
    uppercase = any(c.isupper() for c in password)
    digits = any(c.isdigit() for c in password)
    special = any(c in string.punctuation for c in password)

    pool_size = 0
    if lowercase: pool_size += 26
    if uppercase: pool_size += 26
    if digits: pool_size += 10
    if special: pool_size += len(string.punctuation)

    entropy = len(password) * math.log2(pool_size) if pool_size else 0
    return round(entropy, 2)

# Estimate time-to-crack using hashing algorithms
def estimate_crack_time(entropy):
    estimates = {}
    for attack, speed in CRACKING_SPEED.items():
        crack_seconds = 2**entropy / speed
        estimates[attack] = (
            f"{crack_seconds:.2f} sec" if crack_seconds < 60 else
            f"{crack_seconds/60:.2f} min" if crack_seconds < 3600 else
            f"{crack_seconds/3600:.2f} hr" if crack_seconds < 86400 else
            f"{crack_seconds/86400:.2f} days" if crack_seconds < 2592000 else
            f"{crack_seconds/2592000:.2f} months" if crack_seconds < 31536000 else
            f"{crack_seconds/31536000:.2f} years"
        )
    return estimates

# Suggests stronger password variations
def harden_password(password):
    special_chars = string.punctuation
    new_password = (
        password[:3] +
        random.choice(string.ascii_uppercase) +
        random.choice(string.digits) +
        random.choice(special_chars) +
        password[3:]
    )
    password_list = list(new_password)
    random.shuffle(password_list)
    return ''.join(password_list)

# Generate a completely random strong password
def generate_strong_password(length=16):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for _ in range(length))

@app.route('/analyze', methods=['POST'])
def analyze_password():
    data = request.get_json()
    password = data.get('password', '')
    
    if not password:
        return jsonify({'error': 'Password cannot be empty'}), 400
    
    # Check if password exists in RockYou dataset
    compromised = check_rockyou(password)
    
    # Use enhanced analysis if available
    if ENHANCED_MODE:
        try:
            result = enhanced_analyze_password(password)
            result['compromised'] = compromised
            return jsonify(result)
        except Exception as e:
            print(f"Enhanced analysis failed, falling back to basic: {e}")
            # Fall back to basic analysis
            pass
    
    # Basic analysis (original implementation)
    entropy = calculate_entropy(password)
    crack_times = estimate_crack_time(entropy)
    hardened = harden_password(password)
    suggestions = [generate_strong_password() for _ in range(3)]
    
    return jsonify({
        'entropy': entropy,
        'crackTimes': crack_times,
        'hardened': hardened,
        'suggestions': suggestions,
        'compromised': compromised,
        'security_analysis': ["Basic analysis mode active. Enable enhanced mode for detailed security analysis."]
    })

# Convert user input to audio waveform and byte stream
def generate_waveform_from_text(text):
    # Basic waveform properties
    duration = 0.5  # 0.5 seconds per character
    sample_rate = 44100  # CD-quality audio

    # Convert text to frequencies and amplitudes
    frequencies = [ord(char) * 10 for char in text]  # Map ASCII values to frequency
    time_points = np.linspace(0, duration, int(sample_rate * duration))

    # Create waveform based on characters
    waveform = np.zeros_like(time_points)
    for freq in frequencies:
        waveform += np.sin(2 * np.pi * freq * time_points)

    # Normalize waveform
    waveform = waveform * (32767 / np.max(np.abs(waveform)))

    # Generate a unique filename with timestamp
    temp_filename = f"temp_audio_{int(time.time())}.wav"
    write(temp_filename, sample_rate, waveform.astype(np.int16))

    # Read file in binary mode
    with open(temp_filename, "rb") as audio_file:
        byte_stream = audio_file.read()
    
    # Clean up temp file
    os.remove(temp_filename)

    return byte_stream

# Create a standard password (memorable)
def generate_standard_password(answers):
    # Extract initials of each answer and capitalize
    initials = "".join([answer[0].upper() for answer in answers if answer])

    # Add a random symbol between initials
    symbol = random.choice("!@#$%^&*")

    # Take first 3 characters from the longest answer for variation
    longest_answer = max(answers, key=len) if answers else ""
    partial_word = longest_answer[:3].capitalize() if longest_answer else ""

    # Generate a random 3-digit number
    random_number = str(random.randint(100, 999))

    # Shuffle parts for extra randomness
    components = [initials, symbol, partial_word, random_number]
    random.shuffle(components)

    # Join the components to create a memorable password
    password = "".join(components)
    
    return password

# Create password from audio byte stream (advanced)
def generate_advanced_password(byte_stream):
    # Hash the byte stream
    hashed_audio = hashlib.sha256(byte_stream).hexdigest()

    # Extract a secure substring from the hash
    password_from_audio = hashed_audio[:16]
    
    return password_from_audio

# Create a hybrid password combining both approaches
def generate_hybrid_password(standard_password, advanced_password):
    # Take half of each password type and combine
    hybrid = standard_password[:len(standard_password)//2] + "-" + advanced_password[:8]
    return hybrid

# Generate DNA password based on answers and password type
def generate_dna_password(answers, password_type="hybrid"):
    # Generate audio byte stream from concatenated answers
    combined_text = "".join(answers)
    byte_stream = generate_waveform_from_text(combined_text)

    # Generate standard (memorable) password
    standard_password = generate_standard_password(answers)
    
    # Generate advanced (secure) password from audio hash
    advanced_password = generate_advanced_password(byte_stream)
    
    # Select the appropriate password based on type
    if password_type == "standard":
        final_password = standard_password
        strength = "moderate"
        entropy = calculate_entropy(final_password)
    elif password_type == "advanced":
        final_password = advanced_password
        strength = "very-strong"
        entropy = calculate_entropy(final_password)
    else:  # hybrid (default)
        final_password = generate_hybrid_password(standard_password, advanced_password)
        strength = "strong"
        entropy = calculate_entropy(final_password)
    
    # Calculate crack times
    crack_times = estimate_crack_time(entropy)
    
    # Determine strength category
    if entropy < 40:
        strength = "weak"
    elif entropy < 60:
        strength = "moderate"
    elif entropy < 80:
        strength = "strong"
    else:
        strength = "very-strong"
    
    return {
        'password': final_password,
        'entropy': entropy,
        'crackTimes': crack_times,
        'type': password_type,
        'strength': strength,
        'audioAvailable': False  # Audio download not implemented yet
    }

@app.route('/generate-dna-password', methods=['POST'])
def generate_dna_password_endpoint():
    data = request.get_json()
    answers = data.get('answers', [])
    password_type = data.get('passwordType', 'hybrid')
    
    if not all(answers):
        return jsonify({'error': 'All answers are required'}), 400
    
    try:
        result = generate_dna_password(answers, password_type)
        return jsonify(result)
    except Exception as e:
        print(f"Error generating DNA password: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)