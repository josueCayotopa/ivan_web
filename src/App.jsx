// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes'; // <--- Importamos tus rutas avanzadas
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* En lugar de escribir <Routes> aquí, llamamos al componente que ya las tiene */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;