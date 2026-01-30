// PlanTratamientoTab.jsx
import React from "react";

const PlanTratamientoTab = ({ formData, handleChange }) => {
  const safeValue = (v) => (v === null || v === undefined ? "" : v);

  return (
    <>
      {/* ===================== PLAN DE TRATAMIENTO ===================== */}
      <div className="form-section fade-in-right">
        <h3 className="section-title">Plan de Tratamiento</h3>

        <div className="form-group">
          <label>Procedimiento propuesto: *</label>
          <textarea
            className="treatment-textarea"
            rows="3"
            value={safeValue(formData.procedimiento_propuesto)}
            onChange={(e) =>
              handleChange("procedimiento_propuesto", e.target.value)
            }
            placeholder="Ej: Lipoabdominoplastia, Rinoplastia, Botox, Relleno de labios..."
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Técnica a utilizar:</label>
            <input
              type="text"
              value={safeValue(formData.tecnica_utilizar)}
              onChange={(e) => handleChange("tecnica_utilizar", e.target.value)}
              placeholder="Ej: Técnica X, plano submuscular, microcánula..."
            />
          </div>

          <div className="form-group">
            <label>Número de sesiones:</label>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={safeValue(formData.numero_sesiones || 1)}
              onChange={(e) =>
                handleChange("numero_sesiones", parseInt(e.target.value || "1", 10))
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>Productos / dispositivos a usar:</label>
          <textarea
            rows="2"
            value={safeValue(formData.productos_usar)}
            onChange={(e) => handleChange("productos_usar", e.target.value)}
            placeholder="Ej: toxina botulínica, ácido hialurónico, hilos, láser, etc."
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Precio estimado (S/):</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={safeValue(formData.precio_estimado)}
              onChange={(e) => handleChange("precio_estimado", e.target.value)}
              placeholder="Ej: 3500"
            />
          </div>

          <div className="form-group">
            <label>Próxima cita:</label>
            <input
              type="date"
              value={safeValue(formData.proxima_cita)}
              onChange={(e) => handleChange("proxima_cita", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ===================== INDICACIONES ===================== */}
      <div className="form-section fade-in-right">
        <h3 className="section-title">Indicaciones</h3>

        <div className="form-group">
          <label>Indicaciones Pre-procedimiento:</label>
          <textarea
            rows="4"
            value={safeValue(formData.indicaciones_pre)}
            onChange={(e) => handleChange("indicaciones_pre", e.target.value)}
            placeholder="Ayuno, suspensión de medicamentos, exámenes previos, cuidados preoperatorios..."
          />
        </div>

        <div className="form-group">
          <label>Indicaciones Post-procedimiento:</label>
          <textarea
            rows="4"
            value={safeValue(formData.indicaciones_post)}
            onChange={(e) => handleChange("indicaciones_post", e.target.value)}
            placeholder="Cuidados, medicación, controles, reposo, signos de alarma..."
          />
        </div>
      </div>
    </>
  );
};

export default PlanTratamientoTab;
