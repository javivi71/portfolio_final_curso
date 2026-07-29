import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  public usuarioLogueado: any = null;
  public esAdmin: boolean = false;

  constructor(private router: Router) {
    this.recuperarSesion();
  }

  // --- REGISTRO (Guarda en localStorage) ---
  registro(email: string, password: string): boolean {
    // 1. Validamos si ya existe el email
    const usuarios = this.obtenerUsuarios();
    if (usuarios.find(u => u.email === email)) {
      alert('Este email ya está registrado.');
      return false;
    }

    // 2. Creamos el usuario. ¡Todos empiezan como 'usuario'!
    const nuevoUsuario = {
      id: Date.now().toString(),
      email: email,
      password: password, // Guardamos la pass porque no estamos usando un servidor externo
      rol: 'usuario'
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('Usuario registrado correctamente. Ahora inicia sesión.');
    return true;
  }

  // --- LOGIN ---
  login(email: string, password: string): boolean {
    const usuarios = this.obtenerUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (!usuario) {
      alert('Credenciales incorrectas');
      return false;
    }

    // Guardamos la sesión
    this.usuarioLogueado = usuario;
    this.esAdmin = usuario.rol === 'admin';
    localStorage.setItem('sesionActual', JSON.stringify({ email: usuario.email, rol: usuario.rol }));
    
    return true;
  }

  // --- LOGOUT ---
  logout() {
    this.usuarioLogueado = null;
    this.esAdmin = false;
    localStorage.removeItem('sesionActual');
    window.location.reload(); // Reinicia la app y lleva al login
  }

  // --- OBTENER LISTA DE USUARIOS ---
  obtenerUsuarios(): any[] {
    const data = localStorage.getItem('usuarios');
    return data ? JSON.parse(data) : [];
  }

  // --- RECUPERAR SESIÓN AL RECARGAR ---
  recuperarSesion() {
    const sesion = localStorage.getItem('sesionActual');
    if (sesion) {
      const parsed = JSON.parse(sesion);
      this.usuarioLogueado = parsed;
      this.esAdmin = parsed.rol === 'admin';
    }
  }

  // --- CRUD DE PROYECTOS (Usando localStorage) ---
  obtenerProyectos() {
    const data = localStorage.getItem('proyectos');
    return data ? JSON.parse(data) : [];
  }

  insertarProyecto(datos: any) {
    if (!this.esAdmin) throw new Error('No tienes permisos de administrador');
    const proyectos = this.obtenerProyectos();
    const nuevo = { id: Date.now(), ...datos };
    proyectos.unshift(nuevo); // Lo ponemos al principio
    localStorage.setItem('proyectos', JSON.stringify(proyectos));
    return nuevo;
  }

  actualizarProyecto(id: number, datos: any) {
    if (!this.esAdmin) throw new Error('No tienes permisos de administrador');
    let proyectos = this.obtenerProyectos();
    const index = proyectos.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      proyectos[index] = { ...proyectos[index], ...datos };
      localStorage.setItem('proyectos', JSON.stringify(proyectos));
    }
  }

  borrarProyecto(id: number) {
    if (!this.esAdmin) throw new Error('No tienes permisos de administrador');
    let proyectos = this.obtenerProyectos();
    proyectos = proyectos.filter((p: any) => p.id !== id);
    localStorage.setItem('proyectos', JSON.stringify(proyectos));
  }
}