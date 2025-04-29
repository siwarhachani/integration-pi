from transformers import pipeline

print("⏳ Téléchargement du modèle 'bhadresh-savani/distilbert-base-uncased-emotion'...")
classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")
print("✅ Modèle téléchargé avec succès.")
