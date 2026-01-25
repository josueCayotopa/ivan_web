// src/services/pacienteService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getPatients = async (page = 1, search = '', limit = 15, filters = {}) => {
  try {
    const response = await fetch(`${API_URL}/pacientes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        page,
        search,
        per_page: limit,
        ...filters
      })
    });

    const data = await response.json();

    return {
      success: data.success,
      data: data.data?.data || [],
      total: data.data?.total || 0
    };
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    throw error;
  }
};

export const searchByDocument = async (documento) => {
  try {
    const response = await fetch(`${API_URL}/pacientes/por-documento`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documento: documento })
    });

    const data = await response.json();

    return {
      success: data.success,
      data: data.data
    };
  } catch (error) {
    console.error('Error buscando paciente:', error);
    throw error;
  }
};

export const getPaciente = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pacientes/show`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id })
    });

    const data = await response.json();

    return {
      success: data.success,
      data: data.data
    };
  } catch (error) {
    console.error('Error obteniendo paciente:', error);
    throw error;
  }
};

export const createPaciente = async (pacienteData) => {
  try {
    const response = await fetch(`${API_URL}/pacientes/store`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pacienteData)
    });

    const data = await response.json();

    return {
      success: data.success,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error creando paciente:', error);
    throw error;
  }
};

export const updatePaciente = async (pacienteData) => {
  try {
    const response = await fetch(`${API_URL}/pacientes/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pacienteData)
    });

    const data = await response.json();

    return {
      success: data.success,
      message: data.message
    };
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    throw error;
  }
};

export const deletePaciente = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pacientes/destroy`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id })
    });

    const data = await response.json();

    return {
      success: data.success,
      message: data.message
    };
  } catch (error) {
    console.error('Error eliminando paciente:', error);
    throw error;
  }
};

export const searchPacientes = async (searchTerm) => {
  try {
    const response = await fetch(`${API_URL}/pacientes/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ search: searchTerm })
    });

    const data = await response.json();

    return {
      success: data.success,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error buscando pacientes:', error);
    throw error;
  }
};

export const getHistorial = async (pacienteId) => {
  try {
    const response = await fetch(`${API_URL}/pacientes/historial`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: pacienteId })
    });

    const data = await response.json();

    return {
      success: data.success,
      data: data.data
    };
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw error;
  }
};

const pacienteService = {
  getPatients,
  searchByDocument,
  getPaciente,
  createPaciente,
  createPatient: createPaciente,
  updatePaciente,
  updatePatient: updatePaciente,
  deletePaciente,
  deletePatient: deletePaciente,
  searchPacientes,
  getHistorial
};

export default pacienteService;