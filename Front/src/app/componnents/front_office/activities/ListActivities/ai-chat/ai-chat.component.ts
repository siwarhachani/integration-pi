import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { GeminiApiService } from 'src/app/services/ai/gemini-api.service';
import { FooterComponent } from '../../../template/footer/footer.component';
import { HeaderComponent } from '../../../template/header/header.component';

interface ChatMessage {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
   standalone: true,
    imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
      HeaderComponent,
      FooterComponent,
      NgChartsModule,
      ReactiveFormsModule
    ],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss']
})
export class AiChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private messagesContainer!: ElementRef;

  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  isTyping = false;

  constructor(
    private fb: FormBuilder,
    private geminiApiService: GeminiApiService
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Ajouter un message de bienvenue
    this.addMessage('Hello! I am your AI assistant specialized in sports activities and healthy lifestyle. How can I help you today?', 'ai');
    
    // Démonstration de l'API Gemini au démarrage avec une question pertinente sur les activités sportives
    this.demonstrateGeminiApi();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private addMessage(content: string, sender: 'user' | 'ai'): void {
    this.messages.push({
      content,
      sender,
      timestamp: new Date()
    });
  }

  onSubmit(): void {
    if (this.chatForm.valid) {
      const userMessage = this.chatForm.get('message')?.value.trim();
      
      // Ajouter le message de l'utilisateur
      this.addMessage(userMessage, 'user');
      
      // Réinitialiser le formulaire
      this.chatForm.reset();
      
      // Indiquer que l'IA est en train de répondre
      this.isTyping = true;
      
      // Appeler l'API Gemini via le service
      this.geminiApiService.generateContent(userMessage).subscribe({
        next: (response) => {
          this.addMessage(response, 'ai');
        },
        error: (error) => {
          console.error('Erreur lors de la génération de la réponse:', error);
          this.addMessage('Sorry, an error occurred. Please try again.', 'ai');
        },
        complete: () => {
          this.isTyping = false;
        }
      });
    }
  }

  // Démonstration de l'API Gemini au démarrage du chat
  private demonstrateGeminiApi(): void {
    this.isTyping = true;
    
    setTimeout(() => {
      const prompt = `
        You are an assistant who specialises in sports management and healthy lifestyle.
Provide a brief explanation (maximum 3 sentences) about the importance of regular physical activity and how it contributes to a healthy lifestyle.
Also gives practical advice for beginners.
      `;
      
      this.geminiApiService.generateContent(prompt).subscribe({
        next: (response) => {
          this.addMessage(response, 'ai');
        },
        error: (error) => {
          console.error('Erreur lors de la démonstration:', error);
          this.addMessage("Regular physical activity is key to maintaining good health, improving your mood, and reducing the risk of chronic diseases. Our app helps you plan, track and analyze your sports performance to achieve your goals more effectively. For beginners, start with 20 minutes of moderate activity three times a week and gradually increase the intensity and duration.", 'ai');
        },
        complete: () => {
          this.isTyping = false;
        }
      });
    }, 1500);
  }

  closeChat(): void {
    const modalElement = document.getElementById('aiChatModal');
    if (modalElement) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }
} 