import { JobOffer } from "./JobOffer";

export class JobApplication {
    id?: number;  // Optional since it's auto-generated
    jobOffer: JobOffer | undefined; // Uses the full JobOffer model
    userId: number | undefined;
    applicationDate?: Date;  // Optional, backend sets it
    status?: string;  // Optional, default is "Pending"
    fullName: string | undefined;
    email: string | undefined;
    coverLetter?: string;
    cvFile?: File | null; // Handle file upload
    matchPercentage!: number; // Add this field

  }
  