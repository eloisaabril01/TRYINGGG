from flask import Flask, render_template, request, jsonify
import nltk
from nltk.tokenize import word_tokenize
import random

# Download required NLTK data
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

app = Flask(__name__)

def analyze_text_complexity(text):
    return 0.1

def humanize(text):
    text = text.replace("i would", "i think")
    
    casual_starters = [
        "i think", "from what i understand",
        "in my opinion", "i believe",
        "basically", "so"
    ]
    
    fillers = [
        "kind of", "pretty much",
        "like", "actually"
    ]
    
    sentences = text.split(". ")
    humanized = []
    
    for sentence in sentences:
        if not sentence.strip():
            continue
        sentence = sentence.strip()
        
        # Add starter only to some sentences (50% chance)
        if random.random() < 0.5 and not any(sentence.lower().startswith(starter) for starter in casual_starters):
            sentence = random.choice(casual_starters) + ", " + sentence
        
        # Rarely add filler words (20% chance)
        if random.random() < 0.2:
            words = sentence.split()
            insert_pos = random.randint(2, len(words))
            words.insert(insert_pos, random.choice(fillers))
            sentence = " ".join(words)
            
        humanized.append(sentence)

    return " ".join(humanized)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/humanize', methods=['POST'])
def humanize_text():
    data = request.json
    text = data.get('text', '')

    humanized_text = humanize(text)
    score = analyze_text_complexity(text)

    return jsonify({
        'humanized_text': humanized_text,
        'score': score,
        'original_words': len(text.split()),
        'humanized_words': len(humanized_text.split())
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    st