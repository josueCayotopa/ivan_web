import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Atenciones from '../page/dashboard/Atenciones.jsx';
// Auth Pages
import Login from '../page/auth/login.jsx';
import Register from '../page/auth/register.jsx';

// Dashboard Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Dashboard Pages
import Dashboard from '../page/dashboard/Dashboard.jsx';
import Users from '../page/dashboard/Users.jsx';
import Medicos from '../page/dashboard/Medicos.jsx';
import Pacientes from '../page/dashboard/Pacientes.jsx';
import Consultas from '../page/dashboard/Consultas.jsx';
import HistoriaClinica from '../page/dashboard/HistoriaClinica'; // Asegúrate de importar TU archivo // Descomentar cuando exista

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz redirige a dashboard (o login si no está auth) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rutas privadas */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="medicos" element={<Medicos />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="atenciones" element={<Atenciones />} />
        <Route path="consultation" element={<Consultas />} />
      </Route>

      {/* Ruta 404 - Redirigir a login o dashboard */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; // <--- ¡ESTA LÍNEA ES LA QUE FALTABA!