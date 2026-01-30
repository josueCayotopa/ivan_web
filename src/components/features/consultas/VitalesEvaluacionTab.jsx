import React, { useEffect } from "react"; // ✅ CORRECCIÓN 1: Importar useEffect

const VitalesEvaluacionTab = ({ formData, handleChange }) => {
  // Helper para evitar valores raros
  const safeValue = (v) => (v === null || v === undefined ? "" : v);

  // ==================== AUTO-CALCULAR IMC ====================
  useEffect(() => {
    const peso = parseFloat(formData.peso);
    let talla = parseFloat(formData.talla);

    if (peso > 0 && talla > 0) {
        // Lógica inteligente: Si escribe en CM (ej: 170), convertir a Metros
        if (talla > 3) {
            talla = talla / 100; 
        }

        // FÓRMULA: Peso / (Talla * Talla)
        const imcCalculado = peso / (talla * talla);

        // ✅ CORRECCIÓN 2: Usar handleChange en lugar de setFormData
        // Solo actualizamos si el valor calculado es diferente al actual para evitar bucles
        const imcString = imcCalculado.toFixed(2);
        if (formData.imc !== imcString) {
            handleChange('imc', imcString);
        }
    } else {
        // Limpiar si no hay datos y el IMC no está vacío ya
        if (formData.imc !== '') {
            handleChange('imc', '');
        }
    }
  }, [formData.peso, formData.talla]); // Dependencias: Solo cuando cambie peso o talla

  return (
    <>
      {/* ===================== VITALES ===================== */}
      <div className="form-section fade-in-right">
        <h3 className="section-title">Vitales</h3>

        <div className="vital-signs-grid">
          {/* Presión arterial */}
          <div className="vital-card orange-border">
            <label>Presión Arterial</label>
            <div className="pa-inputs">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="SYS"
                value={safeValue(formData.presion_arterial_sistolica)}
                onChange={(e) =>
                  handleChange("presion_arterial_sistolica", e.target.value)
                }
              />
              <span style={{ fontWeight: 800, color: "#6B7280" }}>/</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="DIA"
                value={safeValue(formData.presion_arterial_diastolica)}
                onChange={(e) =>
                  handleChange("presion_arterial_diastolica", e.target.value)
                }
              />
            </div>
          </div>

          {/* Frecuencia cardiaca */}
          <div className="vital-card">
            <label>Frecuencia Cardíaca</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="lpm"
              value={safeValue(formData.frecuencia_cardiaca)}
              onChange={(e) => handleChange("frecuencia_cardiaca", e.target.value)}
            />
          </div>

          {/* Peso */}
          <div className="vital-card">
            <label>Peso</label>
            <input
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              placeholder="kg"
              value={safeValue(formData.peso)}
              onChange={(e) => handleChange("peso", e.target.value)}
            />
          </div>

          {/* Talla */}
          <div className="vital-card">
            <label>Talla</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="m"
              value={safeValue(formData.talla)}
              onChange={(e) => handleChange("talla", e.target.value)}
            />
          </div>

          {/* IMC (auto-calculado) */}
          <div className="vital-card imc-card">
            <label>IMC</label>
            <div className="imc-value">{safeValue(formData.imc) || "--"}</div>
          </div>
        </div>
      </div>

      {/* ===================== EVALUACIÓN ESTÉTICA ===================== */}
      <div className="form-section fade-in-right">
        <h3 className="section-title">Evaluación Estética</h3>

        <div className="form-group">
          <label>Evaluación de zona a tratar:</label>
          <textarea
            className="treatment-textarea"
            rows="5"
            value={safeValue(formData.evaluacion_zona)}
            onChange={(e) => handleChange("evaluacion_zona", e.target.value)}
            placeholder="Describa hallazgos clínicos: calidad de piel, flacidez, adiposidad, simetrías, cicatrices, riesgos locales..."
          />
        </div>
      </div>
    </>
  );
};

export default VitalesEvaluacionTab;