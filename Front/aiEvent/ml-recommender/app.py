from flask import Flask, jsonify
import pandas as pd
import requests
from math import radians, sin, cos, sqrt, atan2
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# ✅ Updated Spring Boot API base URLs (correct port: 9090)
spring_boot_api_events = 'http://localhost:9090/api/events'
spring_boot_api_participations = 'http://localhost:9090/api/participations/user/'

# ✅ Geocoding cache to reduce API calls
geo_cache = {}

def get_coordinates(place_name):
    if not place_name:
        return None

    # Add country context for better accuracy
    query = f"{place_name.strip()}, Tunisia".lower()

    if query in geo_cache:
        return geo_cache[query]

    try:
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={query}"
        headers = {"User-Agent": "SmartPlanner/1.0"}
        response = requests.get(url, headers=headers)
        time.sleep(1)  # Respect Nominatim rate limits
        data = response.json()
        if data:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            geo_cache[query] = (lat, lon)
            return lat, lon
        else:
            print(f"⚠️ Location not found: {query}")
            return None
    except Exception as e:
        print(f"❌ Geocoding error for {query}:", e)
        return None

def haversine(city1, city2):
    coord1 = get_coordinates(city1)
    coord2 = get_coordinates(city2)
    if not coord1 or not coord2:
        return float('inf')

    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371  # Earth radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

@app.route('/recommendations/<int:user_id>')
def recommend(user_id):
    try:
        # ✅ Step 1: Get participation history
        participation_response = requests.get(spring_boot_api_participations + str(user_id))
        if participation_response.status_code != 200:
            return jsonify([]), 200
        participations = participation_response.json()

        if not participations:
            return jsonify([]), 200

        participated_event_ids = [p['eventId'] for p in participations]
        user_location = participations[0].get('userLocation') or 'Sousse'

        # ✅ Step 2: Determine user preferences
        df_part = pd.DataFrame(participations)
        preferred_category = df_part['categoryId'].mode().iloc[0]
        preferred_type = df_part['isVirtual'].mode().iloc[0]

        # ✅ Step 3: Get all events and filter
        all_events = requests.get(spring_boot_api_events).json()
        events = [e for e in all_events if e['eventId'] not in participated_event_ids]

        recommendations = []
        for event in events:
            location = event.get('location', '')
            distance = haversine(user_location, location) if location else float('inf')

            score = 0
            if distance != float('inf'):
                score += max(0, 100 - distance)  # Distance score
            if event['category']['id'] == preferred_category:
                score += 50  # Match category
            if event['isVirtual'] == preferred_type:
                score += 30  # Match type

            recommendations.append({
                'event_id': event['eventId'],
                'title': event['title'],
                'description': event['description'],
                'location': location,
                'category': event['category']['name'],
                'distance_km': round(distance, 2) if distance != float('inf') else None,
                'score': score
            })

        # ✅ Step 4: Sort and return top 5
        sorted_recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)[:5]
        return jsonify(sorted_recommendations), 200

    except Exception as e:
        print(f"❌ Error in /recommendations/{user_id}:", str(e))
        return jsonify([]), 200

if __name__ == '__main__':
    print("🚀 Flask Recommendation API running on http://localhost:5000")
    app.run(debug=True, port=5000)
