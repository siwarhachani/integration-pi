from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import subprocess
import whisper
import traceback
import torchaudio

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'temp_audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

FFMPEG_DIR = r"C:\ffmpeg\bin"
if FFMPEG_DIR not in os.environ["PATH"]:
    os.environ["PATH"] += os.pathsep + FFMPEG_DIR

print("💪 Chargement du modèle Whisper...")
model = whisper.load_model("base")

@app.route('/translate', methods=['POST'])
def translate():
    webm_path = wav_path = ""
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'Aucun fichier audio reçu'}), 400

        ext = file.filename.split('.')[-1]
        uid = uuid.uuid4().hex
        webm_path = os.path.join(UPLOAD_FOLDER, f"{uid}.{ext}")
        wav_path = os.path.join(UPLOAD_FOLDER, f"{uid}.wav")

        file.save(webm_path)
        print(f"📁 Fichier reçu : {webm_path}")

        # Convertir en .wav
        cmd = f'ffmpeg -i "{webm_path}" -ar 16000 -ac 1 "{wav_path}" -y'
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        print("🛠️ FFmpeg log:", result.stderr.decode())

        if not os.path.exists(wav_path) or os.path.getsize(wav_path) == 0:
            return jsonify({'error': 'Fichier converti vide'}), 400

        # Vérification audio
        waveform, sample_rate = torchaudio.load(wav_path)
        duration = waveform.shape[1] / sample_rate
        print(f"🔍 Audio chargé: {waveform.shape}, durée: {duration:.2f} sec")

        if waveform.numel() == 0 or duration < 0.5:
            return jsonify({'error': 'Fichier audio trop court ou vide'}), 400

        # Vérification du mel spectrogram (empêche erreur "reshape tensor of 0 elements")
        mel = whisper.log_mel_spectrogram(whisper.load_audio(wav_path)).to(model.device)
        print(f"📈 Mel spectrogram shape: {mel.shape}")
        if mel.shape[-1] == 0:
            return jsonify({'error': 'Fichier audio inexploitable (silence ou bruit)'}), 400

        # Transcription
        print(f"🎧 Transcription en cours : {wav_path}")
        result = model.transcribe(wav_path, task="translate")
        transcription = result.get("text", "").strip()

        if not transcription:
            return jsonify({'error': 'Transcription vide'}), 400

        print(f"📜 Traduction : {transcription}")
        return jsonify({'translation': transcription})

    except Exception as e:
        print("❌ Erreur pendant la transcription")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

    finally:
        try:
            if webm_path and os.path.exists(webm_path):
                os.remove(webm_path)
            if wav_path and os.path.exists(wav_path):
                os.remove(wav_path)
        except Exception as cleanup_err:
            print(f"⚠️ Erreur de nettoyage : {cleanup_err}")

if __name__ == '__main__':
    print("🚀 API Whisper prête sur http://localhost:5002/translate")
    app.run(port=5002, debug=True)
