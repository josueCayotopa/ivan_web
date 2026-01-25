// src/services/authService.js
import axiosInstance from '../api/axios';
import { AUTH } from '../api/endpoints';

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await axiosInstance.post(AUTH.LOGIN, { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registro
  async register(userData) {
    try {
      const response = await axiosInstance.post(AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      const response = await axiosInstance.post(AUTH.LOGOUT);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario autenticado
  async me() {
    try {
      const response = await axiosInstance.get(AUTH.ME);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refrescar token
  async refreshToken() {
    try {
      const response = await axiosInstance.post(AUTH.REFRESH);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar perfil
  async updateProfile(userData) {
    try {
      const response = await axiosInstance.put(AUTH.PROFILE, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axiosInstance.post(AUTH.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};