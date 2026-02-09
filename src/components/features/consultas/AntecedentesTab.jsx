// src/components/features/consultas/AntecedentesTab.jsx
import React from 'react';
import { AlertCircle, Heart } from 'lucide-react';

const AntecedentesTab = ({ formData, handleChange, handleCheckboxChange, p, readOnly = false }) => {
    return (
        <fieldset disabled={readOnly} style={{ border: 'none', padding: 0 }}>
            {/* ANTECEDENTES CLÍNICOS */}
            <div className="form-section fade-in-right">
                <h3 className="section-title">Antecedentes Clínicos</h3>
                <div className="checkbox-grid-4">
                    {['diabetes', 'hipertension_arterial', 'cancer', 'artritis'].map((item) => (
                        <label className="checkbox-card" key={item}>
                            <input
                                type="checkbox"
                                checked={formData[item]}
                                onChange={() => handleCheckboxChange(item)}
                            />
                            <span style={{ textTransform: 'capitalize' }}>{item.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
                <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>Otros Antecedentes:</label>
                    <textarea
                        rows="2"
                        value={formData.otros_antecedentes || ''}
                        onChange={(e) => handleChange('otros_antecedentes', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Tratamiento Actual:</label>
                    <textarea
                        rows="2"
                        value={formData.tratamiento_actual || ''}
                        onChange={(e) => handleChange('tratamiento_actual', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Intervenciones Quirúrgicas:</label>
                    <textarea
                        rows="2"
                        value={formData.intervenciones_quirurgicas || ''}
                        onChange={(e) => handleChange('intervenciones_quirurgicas', e.target.value)}
                    />
                </div>
            </div>

            {/* ENFERMEDADES INFECTOCONTAGIOSAS */}
            <div className="form-section fade-in-right">
                <h3 className="section-title">Enfermedades Infectocontagiosas</h3>
                <div className="checkbox-grid-3">
                    {['infecciones_urinarias', 'pulmones', 'infec_gastrointestinal', 'enf_transmision_sexual', 'hepatitis', 'hiv'].map((item) => (
                        <label className="checkbox-card" key={item}>
                            <input
                                type="checkbox"
                                checked={formData[item]}
                                onChange={() => handleCheckboxChange(item)}
                            />
                            <span style={{ textTransform: 'capitalize' }}>{item.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* ALERGIAS (CRÍTICO) */}
            <div className="form-section fade-in-right" style={{ border: '2px solid #EF4444' }}>
                <h3 className="section-title" style={{ borderColor: '#EF4444' }}>
                    <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
                    Alergias (CRÍTICO)
                </h3>
                <div className="checkbox-grid-2">
                    <div>
                        <label className="checkbox-inline">
                            <input type="checkbox" checked={formData.medicamentos_alergia} onChange={() => handleCheckboxChange('medicamentos_alergia')} />
                            <span>Medicamentos</span>
                        </label>
                        {formData.medicamentos_alergia && (
                            <input type="text" value={formData.medicamentos_alergia_detalle || ''} onChange={(e) => handleChange('medicamentos_alergia_detalle', e.target.value)} placeholder="¿Cuáles?" />
                        )}
                    </div>
                </div>
            </div>

            {/* HÁBITOS NOCIVOS */}
            <div className="form-section fade-in-right">
                <h3 className="section-title">Hábitos Nocivos</h3>
                <div className="checkbox-grid-3">
                    {['tabaco', 'alcohol', 'farmacos'].map((item) => (
                        <label className="checkbox-card" key={item}>
                            <input type="checkbox" checked={formData[item]} onChange={() => handleCheckboxChange(item)} />
                            <span style={{ textTransform: 'capitalize' }}>{item}</span>
                        </label>
                    ))}
                </div>
            </div>
        </fieldset>
    );
};

export default AntecedentesTab;