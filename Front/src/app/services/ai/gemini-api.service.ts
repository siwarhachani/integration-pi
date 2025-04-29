import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ActivityService } from '../activities/Activity.service';
import { ExerciseSuggestion } from 'src/app/models/activities/exercise-suggestion.model';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private apiKey = environment.geminiApiKey;

  constructor(private http: HttpClient, private activity : ActivityService) {}

  generateContent(prompt: string): Observable<string> {
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    
    const contextualizedPrompt = `
      [Instructions: You are an assistant who specialises in sports activities, fitness and health.
You should always answer in the context of sports management, wellness, and healthy lifestyle.
Your answers should be informative, encouraging, and suitable for all levels of physical activity.
Keep it concise and to the point in your explanations.
If the issue is not related to sports or health, try to bring it back to that context.]
      
      ${prompt}
    `;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: contextualizedPrompt
            }
          ]
        }
      ]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, requestBody, { headers }).pipe(
      map((response: any) => {
        if (response && response.candidates && response.candidates.length > 0) {
          return response.candidates[0].content.parts[0].text || "Je n'ai pas de réponse à cette question concernant les activités sportives.";
        }
        return "Sorry, I couldn't generate a response on this sports topic.";
      }),
      catchError(error => {
        console.error('Erreur API Gemini:', error);
        return of(this.getFallbackResponse());
      })
    );
  }

  private getFallbackResponse(): string {
    const responses = ["Regular physical activity is essential to maintain good health and prevent many diseases. I'm here to guide you on your fitness journey.",
"To achieve your fitness goals, it's important to combine a balanced diet with an exercise program that is tailored to your level. How can I help you with your routine?",
"Tracking your sports activities regularly allows you to measure your progress and stay motivated. Our application supports you in this process.",
"A good recovery is as important as the training itself. Don't forget to include rest days in your activity schedule."
];
      
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateExerciseRoutine(goal: string, level: string, timeMinutes: number): Observable<ExerciseSuggestion> {
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    
    return this.activity.getAllActivityTypes().pipe(
      switchMap((activityTypes: any[]) => {
        const filteredActivities = this.filterActivitiesByLevel(activityTypes, level);
        const selectedActivities = this.selectActivitiesForDuration(filteredActivities, timeMinutes);
        
        const prompt = `
          [Instructions: You are an assistant specialized in fitness and health. 
          Create a personalized exercise routine based on the user's goal, level, and available time.
          
          Format your response as a JSON object with EXACTLY this structure:
          {
            "warmup": ["Exercise 1 - duration - brief instructions", "Exercise 2 - duration - brief instructions"],
            "workout": ["Exercise 1 - duration - brief instructions", "Exercise 2 - duration - brief instructions"],
            "cooldown": ["Exercise 1 - duration - brief instructions", "Exercise 2 - duration - brief instructions"],
            "advice": "General advice for this routine"
          }
          
          Each item in the arrays should be a single string with the exercise name, duration, and brief instructions.
          
          User request: Goal: ${goal}, Level: ${level}, Time available: ${timeMinutes} minutes.
          Available activities: ${selectedActivities.join(', ')}]
          
          Return ONLY the JSON object with no additional text or explanations.
        `;
        
        const requestBody = {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        };
        
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        
        return this.http.post(url, requestBody, { headers }).pipe(
          map((response: any) => {
            console.log('Raw API response:', response);
            
            if (response && response.candidates && response.candidates.length > 0) {
              const textResponse = response.candidates[0].content.parts[0].text;
              console.log('Text response:', textResponse);
              
              try {
                // Extract JSON from response (in case there's any extra text)
                const jsonMatch = textResponse.match(/{[\s\S]*}/);
                if (jsonMatch) {
                  const jsonResponse = JSON.parse(jsonMatch[0]);
                  return jsonResponse as ExerciseSuggestion;
                }
                throw new Error('No valid JSON found in response');
              } catch (e) {
                console.error('Failed to parse JSON response:', e);
                return this.getFallbackRoutine();
              }
            }
            return this.getFallbackRoutine();
          }),
          catchError(error => {
            console.error('Error generating exercise routine:', error);
            return of(this.getFallbackRoutine());
          })
        );
      })
    );
  }

  // Filtrer les activités en fonction du niveau de l'utilisateur (débutant, intermédiaire, avancé)
  private filterActivitiesByLevel(activityTypes: any[], level: string): any[] {
    return activityTypes.filter(activity => activity.level === level);
  }

  // Sélectionner les activités en fonction du temps disponible (en minutes)
  private selectActivitiesForDuration(activities: any[], timeMinutes: number): string[] {
    let selectedActivities: string[] = [];
    let totalDuration = 0;

    // Sélectionner des activités jusqu'à ce que la durée totale atteigne le temps disponible
    for (let activity of activities) {
      if (totalDuration + activity.duration <= timeMinutes) {
        selectedActivities.push(activity.name);
        totalDuration += activity.duration;
      }
    }

    return selectedActivities;
  }

  // Routine de secours en cas d'erreur
  private getFallbackRoutine(): ExerciseSuggestion {
    return {
      warmup: [
        "Light jogging - 3 minutes - Jog in place at a comfortable pace",
        "Dynamic stretching - 2 minutes - Arm circles, leg swings, hip rotations"
      ],
      workout: [
        "Push-ups - 5 minutes - 3 sets of 10 reps with 30s rest",
        "Squats - 5 minutes - 3 sets of 15 reps with 30s rest",
        "Planks - 5 minutes - 3 sets of 30 seconds with 30s rest"
      ],
      cooldown: [
        "Static stretching - 5 minutes - Hold each stretch for 30 seconds"
      ],
      advice: "Remember to stay hydrated and listen to your body. If an exercise causes pain, stop immediately."
    };
  }
}