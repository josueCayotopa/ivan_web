// src/layout/Sidebar.jsx - CONFIGURACIÓN DE ROLES ACTUALIZADA
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    Calendar,
    UserCog,
    Stethoscope,
    ClipboardList
} from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, user, onLinkClick }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    // Obtener rol del usuario
    const userRole = user?.rolName || user?.roles?.[0]?.name || 'Invitado';
    
    // Normalizar rol para comparación (eliminar acentos y convertir a mayúsculas)
    const normalizeRole = (role) => {
        return role
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .trim();
    };
    
    const roleNormalized = normalizeRole(userRole);

    // Función para verificar si el usuario tiene permiso
    const hasRole = (allowedRoles) => {
        return allowedRoles.some(role => normalizeRole(role) === roleNormalized);
    };

    // ==================== CONFIGURACIÓN DEL MENÚ ====================
    const menuItems = [
        // INICIO - Todos los roles
        {
            path: '/dashboard',
            label: 'Inicio',
            icon: <Home size={22} />,
            roles: ['Atención al cliente', 'Doctor', 'admin', 'Administrador']
        },

        // SECCIÓN GESTIÓN
        {
            section: 'GESTIÓN',
            roles: ['Atención al cliente', 'Doctor', 'admin', 'Administrador']
        },

        // PACIENTES
        {
            path: '/dashboard/pacientes',
            label: 'Pacientes',
            icon: <Users size={22} />,
            roles: ['Atención al cliente', 'Doctor', 'admin', 'Administrador']
        },

        // ATENCIONES (Citas)
        {
            path: '/dashboard/atenciones',
            label: 'Atenciones',
            icon: <Calendar size={22} />,
            roles: ['Atención al cliente', 'Doctor', 'admin', 'Administrador']
        },

        // CONSULTA MÉDICA (Solo Doctor, Admin, Administrador)
        {
            path: '/dashboard/consultation',
            label: 'Consulta Médica',
            icon: <ClipboardList size={22} />,
            roles: ['Doctor', 'admin', 'Administrador']
        },

        // MÉDICOS (NO para Doctor)
        {
            path: '/dashboard/medicos',
            label: 'Médicos',
            icon: <Stethoscope size={22} />,
            roles: ['Atención al cliente', 'admin', 'Administrador']
        },

        // SECCIÓN ADMINISTRACIÓN (Solo Administrador)
        {
            section: 'ADMINISTRACIÓN',
            roles: ['Administrador']
        },

        // USUARIOS (Solo Administrador)
        {
            path: '/dashboard/users',
            label: 'Usuarios',
            icon: <UserCog size={22} />,
            roles: ['Administrador']
        }
    ];

    // Filtrar items por rol
    const filteredMenuItems = menuItems.filter(item => {
        if (!item.roles) return true;
        return hasRole(item.roles);
    });

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <img src={logo} alt="Logo Clínica" className="sidebar-logo" />
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {filteredMenuItems.map((item, index) => {
                        if (item.section) {
                            return (
                                <li key={`section-${index}`} className="section-title">
                                    {item.section}
                                </li>
                            );
                        }
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={isActive(item.path) ? 'active' : ''}
                                    onClick={onLinkClick}
                                >
                                    <span className="icon">{item.icon}</span>
                                    <span className="label">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-role">
                    {userRole}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;