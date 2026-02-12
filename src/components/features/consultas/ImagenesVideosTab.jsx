import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Upload, Eye, Trash2, Image as ImageIcon, Video } from "lucide-react";
import archivoService from "../../../services/archivoService";
// Categorías que COINCIDEN con tu base de datos (Migration)
const CATEGORIAS = {
  FOTO_ANTES: "Foto Paciente",        // Antes enviabas "Foto Antes" (Error BD)
  FOTO_DESPUES: "Foto Procedimiento", // Antes enviabas "Foto Después" (Error BD)
  VIDEO: "Video Cirugía",             // Antes enviabas "Video"
  DOCUMENTO: "Documento Identidad",   // O "Informe Médico" según prefieras
};
const ImagenesVideosTab = ({
  consultaId,     // ID de la consulta actual (para subir nuevos)
  pacienteId,     // ✅ ID del paciente (para ver el historial completo)
  tipoEntidad = "ConsultaExterna",
  buildUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS.FOTO_ANTES);
  const inputRef = useRef(null);

  // Permitimos subir solo si hay consulta guardada, PERO permitimos VER si hay pacienteId
  const canUpload = Boolean(consultaId);

  const getUrl = (a) => {
    if (buildUrl) return buildUrl(a);
    // Ajuste para local: Si viene solo el path, agregarle la base si es necesario
    return a.url || a.ruta_publica || a.path || "";
  };

  const esImagen = (a) => {
    const mime = (a.mime_type || a.mime || "").toLowerCase();
    const ext = (a.extension || "").toLowerCase();
    return mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(ext);
  };

  const esVideo = (a) => {
    const mime = (a.mime_type || a.mime || "").toLowerCase();
    const ext = (a.extension || "").toLowerCase();
    return mime.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext);
  };

  const acceptByCategoria = (cat) => {
    if (cat === CATEGORIAS.VIDEO) return "video/*";
    if (cat === CATEGORIAS.DOCUMENTO) return ".pdf,.doc,.docx";
    return "image/*";
  };

  // ✅ CARGAR HISTORIAL COMPLETO
  const cargarArchivos = async () => {
    if (!pacienteId) return; // Necesitamos el paciente para cargar el historial
    setLoading(true);
    try {
      // MODIFICACIÓN CLAVE: Pedimos archivos DEL PACIENTE, no solo de la consulta.
      // Asegúrate de tener este método en tu service o usa el endpoint adecuado.
      // Ejemplo: GET /api/pacientes/{id}/galeria
      const res = await archivoService.getGaleriaPaciente(pacienteId);

      const payload = res?.data;
      const lista = Array.isArray(payload) ? payload : (payload?.data || []);
      setArchivos(lista);
    } catch (e) {
      console.error("❌ Error cargando galería:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, [pacienteId, consultaId]); // Recargamos si cambia el paciente o se guarda la consulta

  const archivosFiltrados = useMemo(() => {
    return archivos.filter((a) => (a.categoria || "") === categoriaActiva);
  }, [archivos, categoriaActiva]);

  const abrirSelector = () => {
    if (!canUpload) {
      Swal.fire({
        icon: "warning",
        title: "Guarda primero",
        text: "Para subir fotos nuevas, guarda la consulta actual primero.",
        confirmButtonColor: "#FFC107",
      });
      return;
    }
    inputRef.current?.click();
  };

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setLoading(true);
    try {
      for (const file of files) {
        // AL SUBIR: Vinculamos a la CONSULTA ACTUAL (para saber cuándo se tomó)
        await archivoService.subirArchivo({
          adjuntable_type: tipoEntidad,
          adjuntable_id: consultaId,
          paciente_id: pacienteId, // Opcional: Si tu backend lo pide para vincular rápido
          categoria: categoriaActiva,
          file,
        });
      }
      await cargarArchivos(); // Recargamos para ver lo nuevo
      Swal.fire({ icon: "success", title: "Subido", timer: 1000, showConfirmButton: false });
    } catch (e) {
      console.error("Error subiendo:", e);
      Swal.fire("Error", "No se pudo subir el archivo", "error");
    } finally {
      setLoading(false);
    }
  };

  // ... (funciones verArchivo y eliminarArchivo se mantienen igual) ...
  const verArchivo = (a) => {
    const url = getUrl(a);
    
    if (esImagen(a)) {
      Swal.fire({
        title: 'Visualizador de Imagen',
        imageUrl: url,
        imageAlt: 'Foto del paciente',
        width: 800,
        showCloseButton: true,
        showConfirmButton: false,
        // Agregamos el botón de eliminar en el footer del modal
        footer: `
          <button id="btn-eliminar-modal" class="swal2-confirm swal2-styled" style="background-color: #d33;">
            <i class="lucide-trash"></i> Eliminar esta imagen
          </button>
        `,
        didOpen: () => {
          // Vinculamos el clic del botón del modal con la función eliminarArchivo
          const btnEliminar = document.getElementById('btn-eliminar-modal');
          if (btnEliminar) {
            btnEliminar.onclick = () => {
              // Cerramos el modal actual y llamamos a la función de eliminar
              Swal.close();
              eliminarArchivo(a);
            };
          }
        }
      });
    } else {
      window.open(url, '_blank');
    }
  };

const eliminarArchivo = async (a) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await archivoService.eliminarArchivo(a.id);
        Swal.fire("Eliminado", "El archivo ha sido borrado.", "success");
        await cargarArchivos(); // Recarga el historial completo
      } catch (e) {
        console.error("Error al eliminar:", e);
        Swal.fire("Error", "No se pudo eliminar el archivo.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="form-section fade-in-right">
      <h3 className="section-title">Historial Multimedia del Paciente</h3>

      <div className="form-grid-3" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label>Categoría:</label>
          <select value={categoriaActiva} onChange={(e) => setCategoriaActiva(e.target.value)}>
            <option value={CATEGORIAS.FOTO_ANTES}>📸 Foto Antes</option>
            <option value={CATEGORIAS.FOTO_DESPUES}>📸 Foto Después</option>
            <option value={CATEGORIAS.VIDEO}>🎥 Video</option>
            <option value={CATEGORIAS.DOCUMENTO}>📄 Documento</option>
          </select>
        </div>

        <div className="form-group">
          <label>Acción:</label>
          <button type="button" className="btn-upload" onClick={abrirSelector} disabled={loading} style={{ width: "fit-content" }}>
            <Upload size={18} /> {loading ? "Procesando..." : "Subir Nuevo"}
          </button>
          <input ref={inputRef} type="file" multiple accept={acceptByCategoria(categoriaActiva)} style={{ display: "none" }} onChange={onFilesSelected} />
        </div>
      </div>

      {!archivosFiltrados.length ? (
        <div className="empty-gallery">No hay archivos históricos en esta categoría.</div>
      ) : (
        <div className="gallery-grid">
          {archivosFiltrados.map((a) => {
            const url = getUrl(a);
            // Calculamos fecha para mostrar de cuándo es la foto
            const fechaFoto = a.created_at ? new Date(a.created_at).toLocaleDateString("es-PE") : "Sin fecha";

            return (
              <div key={a.id} className="gallery-item">
                {esImagen(a) ? <img src={url} alt="Foto" /> : <div className="video-thumbnail"><Video size={28} /></div>}

                <div className="gallery-overlay">
                  <button type="button" className="btn-icon-gallery" onClick={() => verArchivo(a)}><Eye size={18} /></button>
                  {/* Solo permitir borrar si es de la consulta actual o si eres admin (opcional) */}
                  <button type="button" className="btn-icon-gallery delete" onClick={() => eliminarArchivo(a)}><Trash2 size={18} /></button>
                </div>

                {/* Mostramos la FECHA de la foto para diferenciar el historial */}
                <div className="gallery-date">{fechaFoto}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImagenesVideosTab;