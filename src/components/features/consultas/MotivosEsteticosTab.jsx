// MotivosEsteticosTab.jsx
import React from "react";
// 👇 AGREGA ESTA LÍNEA OBLIGATORIAMENTE
import { User, FileText, Scissors } from 'lucide-react'; 

const MotivosEsteticosTab = ({ formData, handleChange }) => {
  // Toggle genérico para checkbox usando handleChange (si lo necesitas en el futuro)
  const toggle = (field) => handleChange(field, !formData[field]);

  return (
    <div className="form-section fade-in-right">
      <h3 className="section-title">Motivos Estéticos</h3>

      {/* ===== Campos generales ===== */}
      <div className="form-grid-2">
        <div className="form-group">
          <label>Zona(s) a tratar:</label>
          <input
            type="text"
            value={formData.motivos_zonas || ""}
            onChange={(e) => handleChange("motivos_zonas", e.target.value)}
            placeholder="Ej: Rostro, abdomen, glúteos, mamas..."
          />
        </div>
        <div className="form-group">
          <label>Tratamientos previos:</label>
          <textarea
            rows="2"
            value={formData.motivos_tratamientos_previos || ""}
            onChange={(e) => handleChange("motivos_tratamientos_previos", e.target.value)}
            placeholder="Ej: Botox, rellenos, peeling, láser, cirugía previa..."
          />
        </div>
      </div>

      <div className="form-group">
        <label>Expectativa del paciente (muy importante):</label>
        <textarea
          rows="3"
          value={formData.expectativa_paciente || ""}
          onChange={(e) => handleChange("expectativa_paciente", e.target.value)}
          placeholder="¿Qué resultado espera? ¿Qué sería un 'éxito' para el paciente?"
        />
      </div>

      <div className="divider-dashed" style={{ margin: '20px 0', borderTop: '1px dashed #e5e7eb' }} />
      
      <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#6B7280' }}>
        Describa los motivos de consulta por zona:
      </p>

      {/* SECCIÓN FACIAL */}
      <div className="form-group">
        <h5 style={{ margin: "0 0 8px", color: "#374151", fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="#FFC107" /> Facial
        </h5>
        <textarea
          className="treatment-textarea"
          name="motivo_facial"
          value={formData.motivo_facial || ''}
          onChange={(e) => handleChange('motivo_facial', e.target.value)}
          rows="3"
          placeholder="Especifique: Arrugas, Rejuvenecimiento, Ojeras, Labios, Ptosis, Lifting, Manchas, Rellenos..."
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      <hr className="divider-dashed" style={{ margin: '20px 0', border: 0, borderTop: '1px dashed #e5e7eb' }} />

      {/* SECCIÓN CORPORAL */}
      <div className="form-group">
        <h5 style={{ margin: "0 0 8px", color: "#374151", fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#FFC107" /> Corporal
        </h5>
        <textarea
          className="treatment-textarea"
          name="motivo_corporal"
          value={formData.motivo_corporal || ''}
          onChange={(e) => handleChange('motivo_corporal', e.target.value)}
          rows="3"
          placeholder="Especifique: Modelado, Flacidez, Liposucción, Glúteos, Mamas, Abdominoplastia..."
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      <hr className="divider-dashed" style={{ margin: '20px 0', border: 0, borderTop: '1px dashed #e5e7eb' }} />

      {/* SECCIÓN CAPILAR */}
      <div className="form-group">
        <h5 style={{ margin: "0 0 8px", color: "#374151", fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scissors size={18} color="#FFC107" /> Capilar
        </h5>
        <textarea
          className="treatment-textarea"
          name="motivo_capilar"
          value={formData.motivo_capilar || ''}
          onChange={(e) => handleChange('motivo_capilar', e.target.value)}
          rows="3"
          placeholder="Especifique tratamiento capilar..."
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      {/* Otros */}
      <div className="form-group" style={{ marginTop: 16 }}>
        <label>Otros motivos:</label>
        <textarea
          rows="2"
          value={formData.otros_motivos || ""}
          onChange={(e) => handleChange("otros_motivos", e.target.value)}
          placeholder="Especifique..."
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>
    </div>
  );
};

export default MotivosEsteticosTab;