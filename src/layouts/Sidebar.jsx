// src/layout/Sidebar.jsx (MEJORADO)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    Calendar,
    UserCog,
    Stethoscope,
    ClipboardList,
    FileText
} from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, user, onLinkClick }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    // Obtener rol del usuario
    const userRole = user?.rolName || user?.roles?.[0]?.name || 'Invitado';
    const role = userRole.toUpperCase();

    // Configuración del menú
    const menuItems = [
        {
            path: '/dashboard',
            label: 'Inicio',
            icon: <Home size={22} />,
            // AGREGADO 'DOCTOR' AQUÍ:
            roles: ['ADMINISTRADOR', 'ADMIN', 'DOCTOR', 'MÉDICO', 'MEDICO', 'ATENCIÓN', 'ATENCION', 'ATENCIÓN AL CLIENTE', 'ATENCION AL CLIENTE', 'RECEPCIONISTA']
        },

        {
            section: 'GESTIÓN',
            // AGREGADO 'DOCTOR' AQUÍ:
            roles: ['ADMINISTRADOR', 'ADMIN', 'DOCTOR', 'MÉDICO', 'MEDICO', 'ATENCIÓN', 'ATENCION', 'ATENCIÓN AL CLIENTE', 'ATENCION AL CLIENTE', 'RECEPCIONISTA']
        },

        {
            path: '/dashboard/patients',
            label: 'Pacientes',
            icon: <Users size={22} />,
            // AGREGADO 'DOCTOR' AQUÍ (Si quieres que vean pacientes):
            roles: ['ADMINISTRADOR', 'ADMIN', 'DOCTOR', 'MÉDICO', 'ATENCIÓN', 'ATENCION', 'ATENCIÓN AL CLIENTE', 'RECEPCIONISTA']
        },

        {
            path: '/dashboard/atenciones',  // <--- Ruta en plural
            label: 'Atenciones',
            icon: <Calendar size={22} />,
            // Asegúrate de incluir todos los roles que deben verlo
            roles: ['ADMINISTRADOR', 'ADMIN', 'DOCTOR', 'MÉDICO', 'MEDICO', 'ATENCIÓN', 'ATENCION', 'ATENCIÓN AL CLIENTE', 'RECEPCIONISTA']
        },

        {
            path: '/dashboard/consultation',
            label: 'Consulta Médica',
            icon: <ClipboardList size={22} />,
            // ¡CRÍTICO! AGREGADO 'DOCTOR' AQUÍ:
            roles: ['ADMINISTRADOR', 'ADMIN', 'DOCTOR', 'MÉDICO', 'MEDICO']
        },

        {
            path: '/dashboard/medicos',
            label: 'Médicos',
            icon: <Stethoscope size={22} />,
            // Aquí el Doctor NO suele entrar, pero si quieres que se vea a sí mismo:
            roles: ['ADMINISTRADOR', 'ADMIN', 'ATENCIÓN', 'ATENCION', 'ATENCIÓN AL CLIENTE']
        },

        {
            section: 'ADMINISTRACIÓN',
            roles: ['ADMINISTRADOR', 'ADMIN']
        },

        {
            path: '/dashboard/users',
            label: 'Usuarios',
            icon: <UserCog size={22} />,
            roles: ['ADMINISTRADOR', 'ADMIN']
        },
    ];

    // Filtrar items por rol
    const filteredMenuItems = menuItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.some(r => r.toUpperCase() === role || role === 'ADMINISTRADOR' || role === 'ADMIN');
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