export interface User {
    id?: number;            // Optional if not set during creation
  
    username: string;
    password: string;
    email: string;
  
    weight: number;         // In kg (assumed)
    height: number;         // In cm (assumed)
    age: number;
    gender: string;         // e.g., 'male', 'female', 'other'
    activityLevel: string;  // e.g., 'low', 'moderate', 'high'
  }
  