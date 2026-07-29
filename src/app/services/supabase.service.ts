import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  
  // 🟢 LEE LAS VARIABLES DE ENTORNO. ESTO FUNCIONA EN LOCAL, VERCEL Y ANDROID
  private supabaseUrl = environment.supabaseUrl;
  private supabaseKey = environment.supabaseKey;

  private supabase: SupabaseClient;
  public usuarioLogueado: any = null;
  public esAdmin: boolean = false;
  public proyectos: any[] = [];

  constructor(private router: Router) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.recuperarSesion();
  }

  // --- ENCRIPTACIÓN NATIVA ---
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

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

  logout() {
    this.usuarioLogueado = null;
    this.esAdmin = false;
    this.proyectos = [];
    localStorage.removeItem('usuarioLogueado');
    this.router.navigate(['/login']);
  }

  async recuperarSesion() {
    const stored = localStorage.getItem('usuarioLogueado');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.usuarioLogueado = parsed;
      this.esAdmin = parsed.rol === 'admin';
      await this.cargarProyectos();
    }
  }

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