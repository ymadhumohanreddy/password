
from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import random
import string
import hashlib
import torch
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Load a pretrained GenAI model for explanations
genai_explainer = pipeline("text-generation", model="gpt2")

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

# AI-powered password analysis with reasoning
def analyze_password_strength(password):
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    prompt = f"Analyze why the password '{password}' is weak and how an attacker can crack it."
    explanation = genai_explainer(prompt, max_length=100, num_return_sequences=1)[0]['generated_text']
    return explanation

@app.route('/analyze', methods=['POST'])
def analyze_password():
    data = request.get_json()
    password = data.get('password', '')
    
    if not password:
        return jsonify({'error': 'Password cannot be empty'}), 400
    
    entropy = calculate_entropy(password)
    crack_times = estimate_crack_time(entropy)
    hardened = harden_password(password)
    suggestions = [generate_strong_password() for _ in range(3)]
    explanation = analyze_password_strength(password)

    # Check if password exists in RockYou dataset
    compromised = check_rockyou(password)

    return jsonify({
        'entropy': entropy,
        'crackTimes': crack_times,
        'hardened': hardened,
        'suggestions': suggestions,
        'explanation': explanation,
        'compromised': compromised
    })

if __name__ == '__main__':
    app.run(debug=True)
