// src/app/componnents/front_office/event/virtual-meeting/virtual-meeting.component.ts
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Peer from 'peerjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EmotionDashboardComponent } from '../emotion-dashboard/emotion-dashboard.component';

@Component({
  standalone: true,
  selector: 'app-virtual-meeting',
  templateUrl: './virtual-meeting.component.html',
  styleUrls: ['./virtual-meeting.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, EmotionDashboardComponent]
})
export class VirtualMeetingComponent implements OnInit {
  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  peer: any;
  currentCall: any;
  dataConnection: any;

  eventId: string = '';
  isHost: boolean = false;
  hasJoined: boolean = false;

  chatInput: string = '';
  messages: { sender: string; text: string }[] = [];
  isChatReady = false;
  stream: MediaStream | null = null;
  translationHistory: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isHost = location.pathname.startsWith('/admin-meeting');
    this.initPeer();
  }

  initPeer(): void {
    this.peer = this.isHost ? new Peer(this.eventId) : new Peer();

    this.peer.on('open', (id: string) => {
      console.log(`✅ PeerJS ready (${this.isHost ? 'Host' : 'Guest'}) ID: ${id}`);
    });

    this.peer.on('call', (call: any) => {
      if (!this.isHost) {
        this.prepareStream().then(() => this.answerCall(call));
      } else {
        this.answerCall(call);
      }
    });

    this.peer.on('connection', (conn: any) => {
      this.dataConnection = conn;
      this.setupChatConnection();
    });
  }

  joinMeeting(): void {
    this.hasJoined = true;
    this.prepareStream().then(() => {
      if (this.isHost) {
        console.log('🟢 Host ready');
      } else {
        const call = this.peer.call(this.eventId, this.stream!);
        this.currentCall = call;
        call.on('stream', (remoteStream: MediaStream) => this.setRemoteStream(remoteStream));
        this.dataConnection = this.peer.connect(this.eventId);
        this.setupChatConnection();
      }
    });
  }

  async prepareStream(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideoRef.nativeElement.srcObject = this.stream;
    this.localVideoRef.nativeElement.onloadedmetadata = () => {
      this.localVideoRef.nativeElement.play().catch(err => console.warn('play error:', err));
    };
    if (this.isHost) this.startLiveTranslation();
  }

  answerCall(call: any): void {
    call.answer(this.stream!);
    call.on('stream', (remoteStream: MediaStream) => this.setRemoteStream(remoteStream));
    this.currentCall = call;
    this.cdr.detectChanges();
  }

  setRemoteStream(stream: MediaStream): void {
    if (!this.remoteVideoRef || !this.remoteVideoRef.nativeElement) return;

    this.remoteVideoRef.nativeElement.srcObject = stream;
    this.remoteVideoRef.nativeElement.onloadedmetadata = () => {
      this.remoteVideoRef.nativeElement.play().catch(err => console.warn('play error:', err));
    };
  }

  setupChatConnection(): void {
    if (!this.dataConnection) return;

    this.dataConnection.on('open', () => {
      this.isChatReady = true;
      this.cdr.detectChanges();
    });

    this.dataConnection.on('data', (data: any) => {
      this.messages.push({ sender: 'Remote', text: data });

      if (this.isHost) {
        this.http.post<any>('http://localhost:5001/analyze-emotion', {
          message: data,
          user: 'admin'
        }).subscribe({
          next: (res) => {
            const emotion = res.emotion;
            this.messages.push({ sender: 'AI', text: `Emotion: ${emotion}` });
            this.cdr.detectChanges();
          },
          error: () => console.warn('Emotion analysis failed')
        });
      }

      this.cdr.detectChanges();
    });

    this.dataConnection.on('close', () => {
      this.messages.push({ sender: 'Remote', text: '[Peer left the call]' });
      this.isChatReady = false;
      this.cdr.detectChanges();
    });
  }

  sendMessage(): void {
    if (!this.chatInput.trim() || !this.isChatReady || !this.dataConnection?.open) return;
    this.dataConnection.send(this.chatInput);
    this.messages.push({ sender: 'Me', text: this.chatInput });
    this.chatInput = '';
    this.cdr.detectChanges();
  }

  endCall(): void {
    if (this.currentCall) this.currentCall.close();
    if (this.dataConnection?.open) this.dataConnection.close();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.localVideoRef.nativeElement.srcObject = null;
    this.remoteVideoRef.nativeElement.srcObject = null;
    this.stream = null;
    this.hasJoined = false;
    this.isChatReady = false;
    this.cdr.detectChanges();
  }

  startLiveTranslation(): void {
    let recorder: MediaRecorder;
    let audioChunks: BlobPart[] = [];

    try {
      recorder = new MediaRecorder(this.stream!);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'speech.webm');

        this.http.post<any>('http://localhost:5002/translate', formData, {
          headers: { 'Accept': 'application/json' }
        }).subscribe({
          next: (res) => {
            const txt = res.translation?.trim();
            if (txt) this.translationHistory.push(`${new Date().toLocaleTimeString()} — ${txt}`);
            this.cdr.detectChanges();
          },
          error: () => console.warn('⚠️ Whisper translation failed')
        });

        audioChunks = [];
      };

      recorder.start();

      setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setTimeout(() => recorder.start(), 100);
        }
      }, 8000);
    } catch (err) {
      console.error('🎙️ MediaRecorder failed to start:', err);
    }
  }

  generateSRT(): string {
    return this.translationHistory.map((line, i) => {
      const start = new Date().toISOString().substr(11, 8);
      const end = new Date(new Date().getTime() + 2000).toISOString().substr(11, 8);
      return `${i + 1}\n${start} --> ${end}\n${line}\n`;
    }).join('\n\n');
  }

  downloadSRT(): void {
    const blob = new Blob([this.generateSRT()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  testTranslation(): void {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
  
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
  
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'speech.webm');
  
        this.http.post('http://localhost:5002/translate', formData).subscribe({
          next: (res) => console.log('📜 Traduction reçue :', res),
          error: (err) => console.error('❌ Erreur traduction :', err)
        });
      };
  
      recorder.start();
      setTimeout(() => recorder.stop(), 4000); // ⏱️ Enregistre 4 secondes
    }).catch((err) => {
      console.error('❌ Micro non autorisé :', err);
    });
  }
  
}
