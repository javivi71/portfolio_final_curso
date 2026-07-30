import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { EditarProyectoPage } from '../editar-proyecto/editar-proyecto.page';
import { addIcons } from 'ionicons';
import { logOutOutline, addCircle, createOutline, trashOutline } from 'ionicons/icons';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss'],
  standalone: true,
  imports: [CommonModule,IonHeader,IonContent,IonIcon,IonButton,IonCard,IonButtons,IonCardContent,IonCardHeader,IonCardTitle,IonToolbar,IonIcon,IonTitle]
})
export class ProyectosPage {

  constructor(
    public supabase: SupabaseService,
    private modalCtrl: ModalController,
  ) {
    addIcons({ logOutOutline, addCircle, createOutline, trashOutline });
  }

  async logout() {
    this.supabase.logout();
  }

  async abrirModal(proyecto: any = null) {
    const modal = await this.modalCtrl.create({
      component: EditarProyectoPage,
      componentProps: { proyecto }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      await this.supabase.cargarProyectos();
    }
  }

  async borrar(id: number) {
    if(!confirm('¿Seguro que quieres borrar este proyecto?')) return;
    try { 
      await this.supabase.borrarProyecto(id); 
    } catch (e: any) { 
      alert(e.message); 
    }
  }
}