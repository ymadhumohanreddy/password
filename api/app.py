
from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import random
import string
import hashlib

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
    
    entropy = calculate_entropy(password)
    crack_times = estimate_crack_time(entropy)
    hardened = harden_password(password)
    suggestions = [generate_strong_password() for _ in range(3)]
    
    # Check if password exists in RockYou dataset
    compromised = check_rockyou(password)

    return jsonify({
        'entropy': entropy,
        'crackTimes': crack_times,
        'hardened': hardened,
        'suggestions': suggestions,
        'compromised': compromised
    })

# Generate a password based on user answers
def generate_dna_password(favorite_character, childhood_pet, dream_destination):
    # Extract parts from each answer, making sure they're not empty
    char_part = favorite_character[:3] if favorite_character else random.choice(string.ascii_lowercase) * 3
    pet_part = childhood_pet[-3:] if len(childhood_pet) >= 3 else childhood_pet + random.choice(string.ascii_lowercase) * (3 - len(childhood_pet))
    destination_part = dream_destination[:2] if dream_destination else random.choice(string.ascii_lowercase) * 2
    
    # Combine parts and add required character types for strength
    base = char_part + pet_part + destination_part
    base += random.choice(string.ascii_uppercase)  # Adding a capital letter
    base += random.choice(string.digits)  # Adding a number
    base += random.choice(string.punctuation)  # Adding a special character
    
    # Shuffle to make it less predictable
    password_list = list(base)
    random.shuffle(password_list)
    result = ''.join(password_list)
    
    # Calculate entropy of the generated password
    entropy = calculate_entropy(result)
    crack_times = estimate_crack_time(entropy)
    
    return {
        'password': result,
        'entropy': entropy,
        'crackTimes': crack_times
    }

@app.route('/generate-dna-password', methods=['POST'])
def generate_dna_password_endpoint():
    data = request.get_json()
    favorite_character = data.get('favoriteCharacter', '')
    childhood_pet = data.get('childhoodPet', '')
    dream_destination = data.get('dreamDestination', '')
    
    if not all([favorite_character, childhood_pet, dream_destination]):
        return jsonify({'error': 'All three answers are required'}), 400
    
    result = generate_dna_password(favorite_character, childhood_pet, dream_destination)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)