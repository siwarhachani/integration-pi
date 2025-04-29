from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from collections import defaultdict
import datetime

app = Flask(__name__)
CORS(app)

# 🔗 Correct Spring Boot API URL (port 9090)
SPRING_BOOT_EVENTS_API = "http://localhost:9090/api/events"

@app.route('/api/events/heatmap', methods=['GET'])
def get_heatmap():
    try:
        response = requests.get(SPRING_BOOT_EVENTS_API)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch events"}), 500

        events = response.json()

        # Create heatmap: {category: {day: count}}
        heatmap = defaultdict(lambda: {
            "Monday": 0, "Tuesday": 0, "Wednesday": 0,
            "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0
        })

        for event in events:
            try:
                category = event.get("category", {}).get("name", "Unknown")
                start_date = datetime.datetime.strptime(event['startDate'], "%Y-%m-%d").date()
                day_of_week = start_date.strftime("%A")
                heatmap[category][day_of_week] += 1
            except Exception as e:
                print(f"⚠️ Skipped event due to error: {e}")

        return jsonify(heatmap)

    except Exception as e:
        print("❌ Error in /api/events/heatmap:", str(e))
        return jsonify({"error": "Internal server error"}), 500


@app.route('/ai-weekly-advice', methods=['POST'])
def ai_weekly_advice():
    data = request.get_json()
    heatmap = data.get("heatmap", {})

    suggestions = []
    max_threshold = 3  # Considered overloaded if >= 3 events

    # 🔴 1. Overloaded days
    for category, days in heatmap.items():
        for day, count in days.items():
            if count >= max_threshold:
                alt_days = [d for d, c in days.items() if c == 0]
                alt_day = alt_days[0] if alt_days else "another day"
                suggestions.append(
                    f"• {day} is overloaded with {category.lower()} events. Consider moving one to {alt_day}."
                )

    # 🟡 2. Empty days
    for category, days in heatmap.items():
        if sum(days.values()) >= 2:
            for day, count in days.items():
                if count == 0:
                    suggestions.append(
                        f"• No {category.lower()} events are scheduled on {day}. Adding one could improve balance."
                    )

    # 🟢 3. Dominant category
    totals = {cat: sum(days.values()) for cat, days in heatmap.items()}
    dominant = max(totals, key=totals.get) if totals else None
    if dominant and totals[dominant] > 5:
        suggestions.append(
            f"• The {dominant.lower()} category is highly dominant this week. Consider diversifying event types."
        )

    if not suggestions:
        suggestions.append("• 👍 The weekly event distribution looks balanced!")

    return jsonify({"suggestion": "\n".join(suggestions)})


if __name__ == '__main__':
    print("🚀 Flask Smart Planner API running at http://localhost:5007")
    app.run(debug=True, port=5007)
