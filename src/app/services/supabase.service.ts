import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  
  private supabaseUrl = 'https://syqwdmrvwfjhsvnzpdgm.supabase.co'; 
  private supabaseKey = 'sb_publishable_8j8yWHA0wxBX7I_6Fx8sEQ_CwTN8pQt';

  private supabase: SupabaseClient;
  public usuarioLogueado: any = null;
  public esAdmin: boolean = false;

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.recuperarSesion();
  }

  // --- FUNCIÓN DE ENCRIPTACIÓN NATIVA (Web Crypto API) ---
  // No usa sha.js, no usa crypto-js. Es puro navegador. No da errores.
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

    if (error) {
        throw new Error('Credenciales incorrectas'); 
    }
     else {
        console.log('Conectado a supabase');
      };
    
    this.usuarioLogueado = data;
    this.esAdmin = data.rol === 'admin';
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
      
    if (error) throw new Error('El email ya está registrado o hay un error');
    return data;
  }

  // --- LOGOUT ---
  logout() {
    this.usuarioLogueado = null;
    this.esAdmin = false;
    localStorage.removeItem('usuarioLogueado');
    window.location.reload();
  }

  // --- RECUPERAR SESIÓN ---
  async recuperarSesion() {
    const stored = localStorage.getItem('usuarioLogueado');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.usuarioLogueado = parsed;
      this.esAdmin = parsed.rol === 'admin';
    }
  }

  guardarSesionLocal() {
    if (this.usuarioLogueado) {
      localStorage.setItem('usuarioLogueado', JSON.stringify(this.usuarioLogueado));
    }
  }

  // --- CRUD DE PROYECTOS ---
  async obtenerProyectos() {
    const { data, error } = await this.supabase.from('proyectos').select('*').order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async insertarProyecto(datos: any) {
    if (!this.esAdmin) throw new Error('No tienes permisos');
    const { data, error } = await this.supabase.from('proyectos').insert([datos]).select();
    if (error) throw error;
    return data;
  }

  async actualizarProyecto(id: number, datos: any) {
    if (!this.esAdmin) throw new Error('No tienes permisos');
    const { error } = await this.supabase.from('proyectos').update(datos).eq('id', id);
    if (error) throw error;
  }

  async borrarProyecto(id: number) {
    if (!this.esAdmin) throw new Error('No tienes permisos');
    const { error } = await this.supabase.from('proyectos').delete().eq('id', id);
    if (error) throw error;
  }
}