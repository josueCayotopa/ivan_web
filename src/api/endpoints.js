// src/api/endpoints.js
// Endpoints centralizados de la API

export const AUTH = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
};

export const USERS = {
  LIST: '/users',
  CREATE: '/users/create',
  DETAIL: '/users/detail',
  UPDATE: '/users/update',
  DELETE: (id) => `/users/${id}`,
  CHANGE_STATUS: '/users/change-status',
  CHANGE_PASSWORD: '/users/change-password',
  STATS: '/users/stats/general',
};

export const ROLES = {
  LIST: '/roles',
  CREATE: '/roles',
  SHOW: (id) => `/roles/${id}`,
  UPDATE: (id) => `/roles/${id}`,
  DELETE: (id) => `/roles/${id}`,
  ACTIVOS: '/roles/activos',
  TOGGLE_STATUS: (id) => `/roles/${id}/toggle-status`,
  STATS: '/roles/stats/general',
  USERS_BY_ROLE: (id) => `/roles/${id}/users`,
};

export const ESPECIALIDADES = {
  LIST: '/especialidades',
  CREATE: '/especialidades/store',
  SHOW: '/especialidades/show',
  UPDATE: '/especialidades/update',
  DELETE: '/especialidades/destroy',
  ACTIVAS: '/especialidades/activas',
  SEARCH: '/especialidades/search',
  TOGGLE_STATUS: '/especialidades/toggle-status',
  STATS: '/especialidades/stats',
};

export const MEDICOS = {
  LIST: '/medicos',
  CREATE: '/medicos/store',
  SHOW: (id) => `/medicos/${id}`,
  UPDATE: (id) => `/medicos/${id}`,
  DELETE: (id) => `/medicos/${id}`,
  ACTIVOS: '/medicos/activos/list',
  SEARCH: '/medicos/search/query',
  TOGGLE_STATUS: (id) => `/medicos/${id}/toggle-status`,
  STATS: '/medicos/stats/general',
  POR_ESPECIALIDAD: (id) => `/medicos/especialidad/${id}/list`,
  CHANGE_PASSWORD: (id) => `/medicos/${id}/change-password`,
};

export const PACIENTES = {
  LIST: '/pacientes',
  CREATE: '/pacientes/store',
  SHOW: '/pacientes/show',
  UPDATE: '/pacientes/update',
  DELETE: '/pacientes/destroy',
  ACTIVOS: '/pacientes/activos',
  SEARCH: '/pacientes/search',
  TOGGLE_STATUS: '/pacientes/toggle-status',
  STATS: '/pacientes/stats',
  POR_DOCUMENTO: '/pacientes/por-documento',
  POR_HISTORIA: '/pacientes/por-historia',
  HISTORIAL: '/pacientes/historial',
};

export const ATENCIONES = {
  LIST: '/atenciones',
  CREATE: '/atenciones/store',
  SHOW: '/atenciones/show',
  UPDATE: '/atenciones/update',
  DELETE: '/atenciones/destroy',
  HOY: '/atenciones/hoy',
  SEARCH: '/atenciones/search',
  CAMBIAR_ESTADO: '/atenciones/cambiar-estado',
  REGISTRAR_SALIDA: '/atenciones/registrar-salida',
  STATS: '/atenciones/stats',
  POR_PACIENTE: '/atenciones/por-paciente',
  POR_MEDICO: '/atenciones/por-medico',
  AGENDA: '/atenciones/agenda',
};

export const CONSULTAS_EXTERNAS = {
  LIST: '/consultas-externas',
  CREATE: '/consultas-externas',
  SHOW: (id) => `/consultas-externas/${id}`,
  UPDATE: (id) => `/consultas-externas/${id}`,
  DELETE: (id) => `/consultas-externas/${id}`,
  BY_ATENCION: (id) => `/consultas-externas/atencion/${id}`,
  COMPLETAR: (id) => `/consultas-externas/${id}/completar`,
  BORRADOR: (id) => `/consultas-externas/${id}/borrador`,
  RESUMEN: (id) => `/consultas-externas/${id}/resumen`,
  STATS: '/consultas-externas/stats/general',
  HISTORIAL: (pacienteId) => `/consultas-externas/paciente/${pacienteId}/historial`,
  BUSCAR_DIAGNOSTICO: '/consultas-externas/search/diagnostico',
};

export const UTILS = {
  MEDICOS_POR_ESPECIALIDAD: '/utils/medicos-por-especialidad',
  CREAR_HORARIO_FECHA: '/utils/crear-horario-fecha',
  CREAR_HORARIO_RECURRENTE: '/utils/crear-horario-recurrente',
  HORARIOS_MEDICO: '/utils/horarios-medico',
  CITAS_DISPONIBLES: '/utils/citas-disponibles',
  TIPOS_ATENCION: '/utils/tipos-atencion',
  TIPOS_COBERTURA: '/utils/tipos-cobertura',
  ESTADOS_ATENCION: '/utils/estados-atencion',
  ESPECIALIDADES: '/utils/especialidades',
  GENERAR_NUMERO_HISTORIA: '/utils/generar-numero-historia',
  GENERAR_NUMERO_ATENCION: '/utils/generar-numero-atencion',
};

export const ARCHIVOS = {
  UPLOAD: '/archivos/upload',
  BY_CONSULTA: (consultaId) => `/archivos/consulta/${consultaId}`,
  DELETE: (id) => `/archivos/${id}`,
};