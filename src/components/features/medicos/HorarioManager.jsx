import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import horarioService from '../../../services/horarioService'; // Ajusta la ruta si es necesario
// Asegúrate de importar el CSS. Si lo borraste de dashboard, crea uno nuevo aquí o usa estilos en línea
import './HorarioManager.css'; 

const HorarioManager = ({ medico, onClose }) => {
    const [activeTab, setActiveTab] = useState('recurrente'); // 'recurrente' | 'fecha'
    const [loading, setLoading] = useState(false);
    const [horarios, setHorarios] = useState([]);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        dia_semana: 1,
        fecha: '',
        hora_inicio: '08:00',
        hora_fin: '13:00',
        duracion_cita: 20,
        consultorio: ''
    });

    const diasSemana = [
        { id: 1, nombre: 'Lunes' }, { id: 2, nombre: 'Martes' }, { id: 3, nombre: 'Miércoles' },
        { id: 4, nombre: 'Jueves' }, { id: 5, nombre: 'Viernes' }, { id: 6, nombre: 'Sábado' }, { id: 7, nombre: 'Domingo' }
    ];

    // Cargar horarios al abrir
    useEffect(() => {
        if (medico?.id) {
            loadHorarios();
        }
    }, [medico]);

    const loadHorarios = async () => {
        try {
            const res = await horarioService.getHorariosMedico(medico.id);
            if (res.data) setHorarios(res.data);
        } catch (error) {
            console.error("Error cargando lista", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validación simple
        if (!medico || !medico.id) {
            Swal.fire('Error', 'No se ha identificado al médico.', 'error');
            setLoading(false);
            return;
        }

        try {
            // Preparamos los datos base
            const datosEnviar = {
                ...formData,
                medico_id: medico.id // AQUÍ ESTÁ LA CLAVE DEL ARREGLO
            };

            let response;
            if (activeTab === 'recurrente') {
                response = await horarioService.crearHorarioRecurrente(datosEnviar);
            } else {
                if (!formData.fecha) {
                    throw new Error("La fecha es obligatoria");
                }
                response = await horarioService.crearHorarioFecha(datosEnviar);
            }

            // Verificamos la respuesta del backend (Laravel)
            if (response.status === 200 || response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Horario Guardado',
                    text: 'El horario se ha registrado correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                loadHorarios(); // Recargar la lista de abajo
            } else {
                // Manejo de errores de validación de Laravel (422)
                const errorMsg = response.message || 'Error desconocido';
                const detalles = response.errors ? Object.values(response.errors).flat().join(', ') : '';
                Swal.fire('Atención', `${errorMsg}: ${detalles}`, 'warning');
            }

        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.message || 'Hubo un error al conectar con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content horario-modal-content">
                <div className="modal-header">
                    <div>
                        <h3>Gestionar Horarios</h3>
                        <p className="text-muted">Dr. {medico?.nombres} {medico?.apellidos}</p>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Tabs de Navegación */}
                <div className="horario-tabs">
                    <button 
                        type="button"
                        className={`horario-tab ${activeTab === 'recurrente' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recurrente')}
                    >
                        <RefreshCw size={16} /> Semanal (Recurrente)
                    </button>
                    <button 
                        type="button"
                        className={`horario-tab ${activeTab === 'fecha' ? 'active' : ''}`}
                        onClick={() => setActiveTab('fecha')}
                    >
                        <Calendar size={16} /> Fecha Específica
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="horario-form">
                    <div className="form-grid-2">
                        {activeTab === 'recurrente' ? (
                            <div className="form-group">
                                <label>Día de la Semana</label>
                                <select name="dia_semana" value={formData.dia_semana} onChange={handleChange}>
                                    {diasSemana.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Fecha</label>
                                <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label>Consultorio (Opcional)</label>
                            <input name="consultorio" value={formData.consultorio} onChange={handleChange} placeholder="Ej. 204" />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Hora Inicio</label>
                            <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Hora Fin</label>
                            <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duración Cita (min)</label>
                        <select name="duracion_cita" value={formData.duracion_cita} onChange={handleChange}>
                            <option value="15">15 minutos</option>
                            <option value="20">20 minutos</option>
                            <option value="30">30 minutos</option>
                            <option value="45">45 minutos</option>
                            <option value="60">60 minutos</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-save btn-block" disabled={loading}>
                        {loading ? 'Guardando...' : 'Agregar Horario'}
                    </button>
                </form>

                {/* Lista de Horarios Existentes */}
                <div className="horarios-list-section">
                    <h4>Horarios Asignados</h4>
                    <div className="horarios-list">
                        {horarios.length === 0 ? (
                            <p className="text-muted text-center">No hay horarios registrados.</p>
                        ) : (
                            horarios.map((h, index) => (
                                <div key={index} className="horario-card">
                                    <div className="horario-icon">
                                        {h.tipo === 'recurrente' ? <RefreshCw size={18} /> : <Calendar size={18} />}
                                    </div>
                                    <div className="horario-info">
                                        <strong>
                                            {h.tipo === 'recurrente' 
                                                ? diasSemana.find(d => d.id === parseInt(h.dia_semana))?.nombre 
                                                : h.fecha}
                                        </strong>
                                        <span>{h.hora_inicio?.substring(0,5)} - {h.hora_fin?.substring(0,5)}</span>
                                        <small className="text-muted">
                                            {h.duracion_cita} min • {h.consultorio || 'Sin consultorio'}
                                        </small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HorarioManager;