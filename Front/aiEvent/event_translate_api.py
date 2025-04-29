from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
import traceback
import sentencepiece  # Assure qu'il est bien installé
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)
CORS(app)

# 📌 Modèles selon la langue cible
model_map = {
    "fr": "Helsinki-NLP/opus-mt-en-fr",
    "ar": "Helsinki-NLP/opus-mt-en-ar",
    "de": "Helsinki-NLP/opus-mt-en-de",
    "es": "Helsinki-NLP/opus-mt-en-es",
    "en": "Helsinki-NLP/opus-mt-en-en"  # Pour test ou fallback
}

# 📦 Cache des traducteurs chargés
loaded_translators = {}

@app.route("/translate-event", methods=["POST"])
def translate_event():
    try:
        data = request.get_json()
        title = data.get("title", "")
        description = data.get("description", "")
        lang = data.get("lang", "fr")

        # 🔎 Validation
        if not title and not description:
            return jsonify({"error": "Empty title and description"}), 400
        if lang not in model_map:
            return jsonify({"error": f"Unsupported language: {lang}"}), 400

        # 🔄 Chargement du modèle (si pas encore fait)
        if lang not in loaded_translators:
            print(f"🔁 Loading translator for: {lang}")
            model_name = model_map[lang]
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            loaded_translators[lang] = pipeline(
                "translation",
                model=model,
                tokenizer=tokenizer,
                device=-1,          # Force l'utilisation CPU
                framework="pt"      # PyTorch uniquement
            )

        translator = loaded_translators[lang]

        # ✍️ Traduction
        translated_title = translator(title)[0]["translation_text"]
        translated_description = translator(description)[0]["translation_text"]

        return jsonify({
            "title": translated_title,
            "description": translated_description
        })

    except Exception as e:
        print("❌ Error during translation:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting translation API on port 5005...")
    app.run(port=5005, debug=True)
