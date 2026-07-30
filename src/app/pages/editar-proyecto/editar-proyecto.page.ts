
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';  // <-- OBLIGATORIO
import { FormsModule, NgForm } from '@angular/forms';   // <-- Para [(ngModel)]
import {
  IonButton,
  IonButtons,      
  IonContent,
  IonHeader,       
  IonIcon,         
  IonInput,       
  IonItem,        
  IonLabel,        
  IonRadio,       
  IonRadioGroup,   
  IonTextarea,     
  IonTitle,        
  IonToolbar,       
  ModalController
} from '@ionic/angular/standalone';
import { cloudUploadOutline, imageOutline, linkOutline, trashOutline } from 'ionicons/icons';
import { SupabaseService } from 'src/app/services/supabase.service';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-editar-proyecto',
  templateUrl: './editar-proyecto.page.html',
  styleUrls: ['./editar-proyecto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,  
    FormsModule,    
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonTextarea,
    IonTitle,
    IonToolbar
  
  ]
})
export class EditarProyectoPage implements OnInit {
  
  @Input() 
  proyecto: any = { titulo: '', descripcion: '', imagen_url: '' };
  datosFormulario: any = {};
  
  // 🟢 DECLARAMOS LAS VARIABLES QUE USA EL HTML
  modoImagen: 'url' | 'file' = 'url';
  previsualizacion: string | null = null;
  archivoSeleccionado: File | null = null;
  subiendo: boolean = false;

  constructor(private modalCtrl: ModalController, private supabase: SupabaseService) {
    // 🟢 REGISTRAMOS LOS ICONOS AQUÍ
    addIcons({ imageOutline, trashOutline, linkOutline, cloudUploadOutline });
  }

  ngOnInit() {
    this.datosFormulario = this.proyecto ? { ...this.proyecto } : { titulo: '', descripcion: '', imagen_url: '' };
    this.previsualizacion = this.datosFormulario.imagen_url || null;
    
    // Si ya tiene una imagen, detectamos si es URL o archivo subido
    if (this.previsualizacion && this.previsualizacion.startsWith('http')) {
      this.modoImagen = 'url';
    } else if (this.previsualizacion && this.previsualizacion.startsWith('data:')) {
      this.modoImagen = 'file';
    }
  }

  // 🟢 Cuando se selecciona un archivo local
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.archivoSeleccionado = file;
    // Previsualización local (Base64)
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previsualizacion = e.target.result;
      this.datosFormulario.imagen_url = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // 🟢 Cuando se escribe una URL manual
  onUrlChange() {
    this.previsualizacion = this.datosFormulario.imagen_url;
    this.archivoSeleccionado = null;
  }

  borrarImagen() {
    this.previsualizacion = null;
    this.archivoSeleccionado = null;
    this.datosFormulario.imagen_url = null;
    this.modoImagen = 'url';
  }

  async guardar() {
    if (!this.datosFormulario.titulo?.trim()) {
      alert('El título del proyecto es obligatorio.');
      return;
    }
    this.subiendo = true;

    try {
      // Lógica de guardado según el modo elegido
      if (this.modoImagen === 'file' && this.archivoSeleccionado) {
        const publicUrl = await this.supabase.subirImagen(this.archivoSeleccionado);
        this.datosFormulario.imagen_url = publicUrl;
      }

      if (this.datosFormulario.id) {
        await this.supabase.actualizarProyecto(this.datosFormulario.id, this.datosFormulario);
      } else {
        await this.supabase.insertarProyecto(this.datosFormulario);
      }
      this.modalCtrl.dismiss(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      this.subiendo = false;
    }
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
  }
}