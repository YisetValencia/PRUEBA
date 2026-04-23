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

/*
export interface PedidoRead {
  id_pedido: string;
  id_usuario: string;
  nombre: string;
  descripcion: string | null;
  estado: string | null;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
  id_usuario_creacion: string;
  id_usuario_edita: string | null;
}

export interface PedidoCreate {
  id_usuario: string;
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
  id_usuario_creacion: string;
}

export interface PedidoUpdate {
  id_usuario?: string;
  nombre?: string;
  descripcion?: string | null;
  estado?: string | null;
  id_usuario_edita: string;
}

export interface DetallePedidoRead {
  id_detalle_pedido: string;
  id_pedido: string;
  id_producto: string;
  nombre: string;
  descripcion: string | null;
  estado: string | null;
}

export interface DetallePedidoCreate {
  id_pedido: string;
  id_producto: string;
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
}

export interface DetallePedidoUpdate {
  id_pedido?: string;
  id_producto?: string;
  nombre?: string;
  descripcion?: string | null;
  estado?: string | null;
}

export interface PagoRead {
  id_pago: string;
  id_pedido: string;
  nombre: string;
  descripcion: string | null;
  estado: string | null;
  referencia: string;
  tipo_pago: string;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
  id_usuario_creacion: string;
  id_usuario_edita: string | null;
}

export interface PagoCreate {
  id_pedido: string;
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
  referencia: string;
  tipo_pago: string;
  id_usuario_creacion: string;
}

export interface PagoUpdate {
  id_pedido?: string;
  nombre?: string;
  descripcion?: string | null;
  estado?: string | null;
  referencia?: string;
  tipo_pago?: string;
  id_usuario_edita: string;
}*/
