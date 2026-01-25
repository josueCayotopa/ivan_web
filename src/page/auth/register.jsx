// src/page/auth/register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './login.css'; // Reutiliza estilos del login
import logo from '../../assets/logo.png';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.password_confirmation) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        // Validar longitud mínima de contraseña
        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setLoading(false);
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
            
            // Preparar datos para enviar
            const dataToSend = {
                name: formData.name,
                email: formData.email,
                username: formData.username || null,
                phone: formData.phone || null,
                password: formData.password,
                language: 'es',
                timezone: 'America/Lima',
                status: 1,
                notifications_enabled: true,
                marketing_consent: false
            };

            console.log('Enviando datos:', dataToSend); // DEBUG

            const response = await fetch(`${API_URL}/users/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data); // DEBUG

            // Tu backend devuelve status en data.status
            if (data.status === 200) {
                // Registro exitoso
                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                navigate('/login');
            } else if (data.status === 422) {
                // Errores de validación
                const errors = data.errors;
                let errorMessage = data.message || 'Error de validación';
                
                if (errors) {
                    // Extraer el primer error
                    const firstError = Object.values(errors)[0];
                    if (Array.isArray(firstError)) {
                        errorMessage = firstError[0];
                    }
                }
                
                setError(errorMessage);
            } else {
                // Otros errores
                setError(data.message || 'Error al registrar usuario');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: '500px' }}>
                <div className="logo-section">
                    <img src={logo} alt="Dr. Ivan Pareja" className="login-logo" />
                    <h2 className="login-subtitle">Crear Cuenta</h2>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="name">Nombre Completo *</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Juan Pérez"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico *</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="nombre@ejemplo.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Usuario (opcional)</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="juanperez"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Teléfono (opcional)</label>
                        <input
                            type="tel"
                            id="phone"
                            placeholder="+51 999 999 999"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña *</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirmar Contraseña *</label>
                        <input
                            type="password"
                            id="password_confirmation"
                            placeholder="Repite tu contraseña"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            minLength={8}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={`btn-login ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>

                    <div className="register-link">
                        <span>¿Ya tienes cuenta?</span>
                        <Link to="/login">Inicia Sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;