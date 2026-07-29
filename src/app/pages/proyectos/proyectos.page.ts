import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { EditarProyectoPage } from '../editar-proyecto/editar-proyecto.page';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline, addCircle, createOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProyectosPage {

  constructor(
    public supabase: SupabaseService,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    addIcons({ logOutOutline, addCircle, createOutline, trashOutline });
  }

  async logout() {
    this.supabase.logout(); // El servicio ya sabe qué hacer según el entorno
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