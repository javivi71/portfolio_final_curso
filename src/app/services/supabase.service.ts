import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  
  private supabaseUrl = 'https://syqwdmrvwfjhsvnzpdgm.supabase.co'; 
  private supabaseKey = 'sb_publishable_8j8yWHA0wxBX7I_6Fx8sEQ_CwTN8pQt';

  private supabase: SupabaseClient;
  public usuarioLogueado: any = null;
  public esAdmin: boolean = false;
  public proyectos: any[] = [];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.recuperarSesion();
  }

  // --- ENCRIPTACIÓN ---
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // --- LOGIN ---
  async login(email: string, password: string) {
    const hashedPassword = await this.hashPassword(password);
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('password', hashedPassword)
      .single();
    if (error) throw new Error('Credenciales incorrectas');
    this.usuarioLogueado = data;
    this.esAdmin = data.rol === 'admin';
    localStorage.setItem('usuarioLogueado', JSON.stringify(data));
    await this.cargarProyectos();
    return data;
  }

  // --- REGISTRO ---
  async registro(email: string, password: string) {
    const hashedPassword = await this.hashPassword(password);
    const { data, error } = await this.supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword, rol: 'usuario' }])
      .select()
      .single();
    if (error) throw new Error('El email ya está registrado');
    return data;
  }

  // --- LOGOUT (Sin recargar la página) ---
  logout() {
    this.usuarioLogueado = null;
    this.esAdmin = false;
    this.proyectos = [];
    localStorage.removeItem('usuarioLogueado');
    // Navegamos directamente al login sin importar el entorno
    this.router.navigate(['/login']);
  }

  // --- RECUPERAR SESIÓN ---
  async recuperarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('usuarioLogueado');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.usuarioLogueado = parsed;
        this.esAdmin = parsed.rol === 'admin';
        await this.cargarProyectos();
      }
    }
  }

  // --- CRUD DE PROYECTOS ---
  async cargarProyectos() {
    const { data, error } = await this.supabase.from('proyectos').select('*').order('id', { ascending: false });
    if (!error) this.proyectos = data || [];
  }

  async insertarProyecto(datos: any) {
    if (!this.esAdmin) throw new Error('No tienes permisos');
    await this.supabase.from('proyectos').insert([datos]);
    await this.cargarProyectos();
  }

  async actualizarProyecto(id: number, datos: any) {
    if (!this.esAdmin) throw new Error('No tienes permisos');
    await this.supabase.from('proyectos').update(datos).eq('id', id);
    await this.cargarProyectos();
  }

  async borrarProyecto(id: number) {
    if (!this.esAdmin) throw new Error('No tienes permisos');
    await this.supabase.from('proyectos').delete().eq('id', id);
    await this.cargarProyectos();
  }

  // --- SUBIR IMAGEN A SUPABASE STORAGE ---
  async subirImagen(file: File): Promise<string> {
    const nombreArchivo = `${Date.now()}_${file.name}`;
    const { error } = await this.supabase.storage
      .from('proyectos')
      .upload(nombreArchivo, file);
    if (error) throw new Error('Error al subir imagen: ' + error.message);
    const { data: urlData } = this.supabase.storage
      .from('proyectos')
      .getPublicUrl(nombreArchivo);
    return urlData.publicUrl;
  }
}