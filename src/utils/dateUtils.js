export const getFechaLocal = () => {
    const fecha = new Date();
    const offset = fecha.getTimezoneOffset(); // En minutos (Lima es 300)
    
    // Restamos el offset para ajustar a la hora real local antes de convertir a ISO
    const fechaLocal = new Date(fecha.getTime() - (offset * 60000));
    
    return fechaLocal.toISOString().split('T')[0];
};

export const getHoraLocal = () => {
    const fecha = new Date();
    // Obtener HH:mm en formato 24h
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
};