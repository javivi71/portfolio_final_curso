import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { IonButton,  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar } 
       from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule,IonCard,IonCardContent,IonCardTitle,IonItem,IonContent,IonLabel,IonCardHeader,IonInput,IonButton,IonToolbar,IonTitle,
            IonHeader,FormsModule,IonButton
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private supabase: SupabaseService, private router: Router) {}

  async login() {
    if(!this.email || !this.password) return alert('Rellena todos los campos');
    try {
      await this.supabase.login(this.email, this.password);
      this.router.navigate(['/proyectos']);
    } catch (e: any) { alert('Error: ' + e.message); }
  }

  async registro() {
    if(!this.email || !this.password) return alert('Rellena todos los campos');
    try {
      await this.supabase.registro(this.email, this.password);
      alert('Usuario registrado. Inicia sesión (cambia rol a admin en Supabase)');
    } catch (e: any) { alert('Error: ' + e.message); }
  }
}