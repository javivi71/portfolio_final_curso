import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
// 🔴 Importamos la librería de compresión de imágenes
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-editar-proyecto',
  templateUrl: './editar-proyecto.page.html',
  styleUrls: ['./editar-proyecto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditarProyectoPage implements OnInit {
  
  @Input() proyecto: any = { titulo: '', descripcion: '', imagen_url: '' };
  datosFormulario: any = {};
  
  // 🟢 Variable para mostrar la previsualización de la foto
  previsualizacionImagen: string | null = null;
  imagenSeleccionada: File | null = null;

  constructor(private modalCtrl: ModalController, private supabase: SupabaseService) {}

  ngOnInit() {
    this.datosFormulario = this.proyecto ? { ...this.proyecto } : { titulo: '', descripcion: '', imagen_url: '' };
    // Si ya tiene imagen, la mostramos en la previsualización
    if (this.datosFormulario.imagen_url) {
      this.previsualizacionImagen = this.datosFormulario.imagen_url;
    }
  }

  // 🟢 EVENTO AL SELECCIONAR UN ARCHIVO
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Opciones de compresión (para que no pese demasiado en la BD)
      const options = {
        maxSizeMB: 1,            // Tamaño máximo 1MB
        maxWidthOrHeight: 800,   // Reducir a 800px de ancho/alto
        useWebWorker: true
      };
      
      // Comprimimos la imagen
      const compressedFile = await imageCompression(file, options);
      this.imagenSeleccionada = compressedFile;

      // Creamos una URL local para previsualizar la imagen al instante
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacionImagen = e.target.result; // Esto es Base64
        this.datosFormulario.imagen_url = e.target.result; // Lo guardamos en el formulario
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error al comprimir la imagen:', error);
      alert('Error al procesar la imagen');
    }
  }

  // 🟢 BORRAR LA IMAGEN SELECCIONADA (Opcional)
  borrarImagen() {
    this.previsualizacionImagen = null;
    this.imagenSeleccionada = null;
    this.datosFormulario.imagen_url = null;
  }

  async guardar() {
    if (!this.datosFormulario.titulo || this.datosFormulario.titulo.trim() === '') {
      alert('El título del proyecto es obligatorio.');
      return;
    }

    try {
      if (this.datosFormulario.id) {
        await this.supabase.actualizarProyecto(this.datosFormulario.id, this.datosFormulario);
      } else {
        await this.supabase.insertarProyecto(this.datosFormulario);
      }
      this.modalCtrl.dismiss(true);
    } catch (e: any) { alert(e.message); }
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
  }
}