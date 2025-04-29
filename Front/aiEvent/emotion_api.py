from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from transformers import pipeline
import os
import json
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
import io

app = Flask(__name__)
CORS(app)

classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")

LOG_FILE = 'emotion_log.json'

# ✅ Route : Analyse d’une émotion à partir d’un message
@app.route('/analyze-emotion', methods=['POST'])
def analyze_emotion():
    data = request.get_json()
    text = data.get('message', '').strip()
    user = data.get('user', 'anonymous')

    if not text:
        return jsonify({'error': 'Empty message'}), 400

    result = classifier(text)
    if isinstance(result, list) and isinstance(result[0], dict):
        emotion = result[0]['label']
        score = result[0]['score']

        log_entry = {
            'user': user,
            'message': text,
            'emotion': emotion,
            'score': score,
            'timestamp': datetime.now().isoformat()
        }

        # ✅ Enregistrement ligne par ligne (robuste)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(log_entry) + '\n')

        print(f"✅ Émotion enregistrée : {emotion} ({score:.2f}) pour {user}")
        return jsonify({'emotion': emotion, 'score': score})
    else:
        return jsonify({'error': 'Unexpected model output', 'result': str(result)}), 500

# ✅ Fonction utilitaire : lire le fichier JSONL
def read_logs():
    if not os.path.exists(LOG_FILE):
        return []
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f if line.strip()]

@app.route('/emotion-graph')
def emotion_graph():
    logs = read_logs()
    if not logs:
        return "No data", 404

    df = pd.DataFrame(logs)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    score_map = {
        "joy": 5, "neutral": 3, "anger": 1,
        "sadness": 2, "fear": 1, "surprise": 4, "disgust": 1
    }
    df["score"] = df["emotion"].map(score_map)

    plt.figure(figsize=(10, 4))
    plt.plot(df["timestamp"], df["score"], marker='o', linestyle='-', color='orange')
    plt.title("Évolution des émotions pendant l’appel")
    plt.ylabel("Score émotionnel (1 à 5)")
    plt.xlabel("Temps")
    plt.xticks(rotation=30)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    return send_file(buf, mimetype='image/png')

@app.route('/mood-graph/<user>')
def mood_graph(user):
    logs = [log for log in read_logs() if log.get('user') == user]
    if not logs:
        return jsonify([])

    score_map = {
        "joy": 5, "surprise": 4, "neutral": 3,
        "sadness": 2, "anger": 1, "fear": 1, "disgust": 1
    }

    result = [
        {
            "timestamp": entry['timestamp'],
            "score": score_map.get(entry['emotion'], 0)
        }
        for entry in logs
    ]
    return jsonify(result)

@app.route('/emotion-distribution/<user>')
def emotion_distribution(user):
    logs = [log for log in read_logs() if log.get('user') == user]
    if not logs:
        return jsonify({})

    df = pd.DataFrame(logs)
    counts = df['emotion'].value_counts().to_dict()
    return jsonify(counts)

@app.route('/emotion-timeline/<user>')
def emotion_timeline(user):
    logs = [log for log in read_logs() if log.get('user') == user]
    if not logs:
        return jsonify([])

    return jsonify([
        {"timestamp": entry["timestamp"], "emotion": entry["emotion"]}
        for entry in logs
    ])

# ✅ Démarrer l’API
if __name__ == '__main__':
    print("✅ API d’analyse des émotions démarrée sur http://127.0.0.1:5001")
    app.run(debug=True, port=5001)
