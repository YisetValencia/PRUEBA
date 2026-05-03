/** Contratos alineados con `src/api/*.py` del backend FastAPI. */

export interface UsuarioRead {
  id_usuario: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  tipo_usuario: string;
  nombre_usuario: string;
  clave: string;
  fecha_creacion: string;
  fecha_edicion: string;
}

export interface UsuarioCreate {
 
  nombre: string;
  apellidos: string;
  telefono: string;
  tipo_usuario: string;
  nombre_usuario: string;
  clave: string;
}

export interface UsuarioUpdate {
  
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  tipo_usuario?: string;
  nombre_usuario?: string;
  clave?: string;
}

export interface ServiciosAdicionalesRead {
  id_servicio: string;
  nombre_servicio: string;
  precio: number;
  descripcion: string;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
  id_usuario_crea: string;
  id_usuario_edita: string | null;
}

export interface ServiciosAdicionalesCreate {
  nombre_servicio: string;
  precio: number;
  descripcion: string;
  id_usuario_crea: string;
}

export interface ServiciosAdicionalesUpdate {
  nombre_servicio?: string;
  precio?: number;
  descripcion?: string;
  id_usuario_edita: string;
}

export interface TipoHabitacionRead {
  id_tipo: string;
  nombre_tipo: string;
  descripcion: string;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
  id_usuario_crea: string;
  id_usuario_edita: string | null;
}

export interface TipoHabitacionCreate {
  nombre_tipo: string;
  descripcion: string;
  id_usuario_crea: string;

}

export interface TipoHabitacionUpdate {
  nombre_tipo?: string;
  descripcion?: string;
  id_usuario_edita: string;
}


export interface HabitacionRead {
  id_habitacion: string;
  numero: number;
  id_tipo: string;
  tipo: string;
  precio: number;
  disponible: boolean;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
  id_usuario_creacion: string;
  id_usuario_edita: string | null;
}

export interface HabitacionCreate {
  numero: number;
  id_tipo: string;
  tipo: string;
  precio: number;
  disponible: boolean;
  id_usuario_crea: string;
}

export interface HabitacionUpdate {
  numero: number;
  id_tipo: string;
  tipo: string;
  precio: number;
  disponible: boolean;
  id_usuario_edita: string;
}

export interface ReservaServiciosRead {
  id_reserva:   string;
  id_servicio:  string;  // el backend usa id_servicio (singular)
  cantidad:     number;
}
 
export interface ReservaServiciosCreate {
  id_reserva:  string;
  id_servicio: string;
  cantidad:    number;
  // sin id_usuario_crea — el router no lo requiere
}
 
export interface ReservaServiciosUpdate {
  cantidad: number;
  // solo se actualiza la cantidad — id_reserva e id_servicio van en la URL
}
 

export interface ReservaRead {
  id_reserva: string;
  id_usuario: string;
  id_habitacion: string;
  fecha_entrada: string;
  fecha_salida: string;
  numero_de_personas: number;
}

export interface ReservaCreate {
  id_usuario: string;
  id_habitacion: string;
  fecha_entrada: string;
  fecha_salida: string;
  numero_de_personas: number;
  id_usuario_crea: string;
}

export interface ReservaUpdate {
  id_usuario: string;
  id_habitacion: string;
  fecha_entrada: string;
  fecha_salida: string;
  numero_de_personas: number;
  id_usuario_edita: string;
}
