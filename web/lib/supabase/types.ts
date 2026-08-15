export type Rol = "admin" | "familiar" | "abuela";
export type EstadoCita = "pendiente" | "completada" | "cancelada" | "por_agendar";
export type TipoExamen = "laboratorio" | "examen" | "procedimiento";
export type EstadoExamen = "pendiente" | "en_proceso" | "listo";
export type EstadoEntrega = "pendiente" | "reclamada";

export interface MiembroFamilia {
  id: string;
  user_id: string | null;
  nombre: string;
  email: string | null;
  fecha_nacimiento: string | null;
  emoji: string;
  rol: Rol;
  activo: boolean;
  tipo_sangre: string | null;
  peso: number | null;
  altura: number | null;
  alergias: string | null;
  condiciones: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cita {
  id: string;
  paciente_id: string;
  acompanante_id: string | null;
  nombre: string | null;
  especialidad: string;
  medico: string | null;
  lugar: string | null;
  fecha_hora: string | null;
  notas_pre: string | null;
  notas_post: string | null;
  estado: EstadoCita;
  recordatorio_enviado: boolean;
  audio_url: string | null;
  audio_post_url: string | null;
  lugar_detalle: string | null;
  archivo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  paciente?: MiembroFamilia;
  acompanante?: MiembroFamilia;
}

export interface EntregaMedicamento {
  id: string;
  medicamento_id: string;
  numero_entrega: number;
  fecha_programada: string | null;
  fecha_reclamada: string | null;
  estado: EstadoEntrega;
  created_at: string;
}

export interface Medicamento {
  id: string;
  paciente_id: string;
  nombre: string;
  dosis: string | null;
  frecuencia: string | null;
  horas_toma: string[] | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  total_entregas: number;
  activo: boolean;
  notas: string | null;
  archivo_url: string | null;
  created_at: string;
  updated_at: string;
  paciente?: MiembroFamilia;
  entregas_medicamento?: EntregaMedicamento[];
}

export interface Examen {
  id: string;
  paciente_id: string;
  acompanante_id: string | null;
  tipo: TipoExamen;
  nombre: string;
  especialidad: string | null;
  fecha_solicitud: string | null;
  hora: string | null;
  fecha_resultado: string | null;
  lugar: string | null;
  resultado: string | null;
  estado: EstadoExamen;
  notas: string | null;
  archivo_orden_url: string | null;
  archivo_resultado_url: string | null;
  fecha_realizacion: string | null;
  recordatorio_resultado_enviado: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  paciente?: MiembroFamilia;
  acompanante?: MiembroFamilia;
}

export type EstadoAutorizacion = "sin_gestionar" | "en_tramite" | "autorizada";
export type TipoAutorizacion = "cita" | "examen" | "laboratorio" | "procedimiento";

export interface AutorizacionEPS {
  id: string;
  paciente_id: string;
  descripcion: string;
  tipo: TipoAutorizacion;
  fecha_orden: string;
  estado: EstadoAutorizacion;
  vigencia_dias: number;
  fecha_envio_eps: string | null;
  numero_autorizacion: string | null;
  fecha_autorizacion: string | null;
  notas: string | null;
  cita_id: string | null;
  examen_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  paciente?: MiembroFamilia;
  cita?: Pick<Cita, "id" | "especialidad" | "fecha_hora"> | null;
  examen?: Pick<Examen, "id" | "nombre" | "tipo"> | null;
}
