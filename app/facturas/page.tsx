"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

interface GuardarResponse { exito?: boolean; status?: string; }

const WEB_APP_URL = "/api/facturas";

export default function FacturasPage() {
  const router = useRouter();

  // --- ESTADOS DEL FORMULARIO DE FACTURACIÓN ---
  const [provincia, setProvincia] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [peso, setPeso] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [mostrarResumen, setMostrarResumen] = useState<boolean>(false);

  // --- ESTADOS DE TEXTO DINÁMICO ---
  const [nombreResumen, setNombreResumen] = useState<string>("");
  const [totalResumen, setTotalResumen] = useState<string>("");
  const [mensajeError, setMensajeError] = useState<string>("");
  const [mensajeExito, setMensajeExito] = useState<string>("");

  // Evita que se dispare un segundo navigator.share() mientras el anterior sigue en curso
  const compartiendoRef = useRef(false);

  async function cerrarSesion(): Promise<void> {
    try { await fetch("/api/logout", { method: "POST" }); } catch (e) { }
    router.push("/login");
    router.refresh();
  }

  // --- LÓGICA DEL FACTURADOR ---
  function calcularTotal(valor: string): void {
    setPeso(valor);
    const pesoNumero = parseFloat(valor);
    if (isNaN(pesoNumero)) { setTotal(""); return; }
    const resultado = pesoNumero * 14 * 500;
    setTotal(resultado.toLocaleString("es-CR"));
  }

  async function guardarFactura(): Promise<GuardarResponse> {
    const datos = { provincia, nombre, peso, total };
    const respuesta = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(datos),
    });
    return (await respuesta.json()) as GuardarResponse;
  }

  function ocultarError(): void { setMensajeError(""); }
  function ocultarExito(): void { setMensajeExito(""); }

  async function generarFactura(): Promise<void> {
    ocultarError();
    ocultarExito();
    if (!nombre.trim()) { setMensajeError("Debe ingresar un nombre."); return; }
    if (!peso) { setMensajeError("Debe ingresar un peso."); return; }
    if (parseFloat(peso) <= 0) { setMensajeError("El peso debe ser mayor que cero."); return; }
    try {
      await guardarFactura();
      setMensajeExito("Factura guardada correctamente.");
      setNombreResumen(capitalizarNombre(nombre));
      setTotalResumen(`₡${total}`);
      setMostrarResumen(true);
    } catch (err) {
      setMensajeError("Error de red al guardar la factura.");
    }
  }

  function limpiarCampos(): void {
    setProvincia("");
    setNombre("");
    setPeso("");
    setTotal("");
    setMostrarResumen(false);
    ocultarError();
    ocultarExito();
  }

  function capitalizarNombre(texto: string): string {
    return texto
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }

  async function descargarPNG(): Promise<void> {
    const factura = document.getElementById("resumenFactura");
    if (!factura) return;
    const canvas = await html2canvas(factura, { scale: 2 });
    const enlace = document.createElement("a");
    enlace.download = `factura-${nombre ? nombre.toLowerCase().replace(/\s+/g, "-") : "biin"}.png`;
    enlace.href = canvas.toDataURL("image/png");
    enlace.click();
  }

  async function compartirImagen(): Promise<void> {
    if (compartiendoRef.current) return; // ya hay un share en curso, ignorar el clic
    compartiendoRef.current = true;

    const factura = document.getElementById("resumenFactura");
    if (!factura) {
      compartiendoRef.current = false;
      return;
    }

    const canvas = await html2canvas(factura, { scale: 2 });

    canvas.toBlob(async function (blob) {
      if (!blob) {
        alert("No se pudo generar la imagen");
        compartiendoRef.current = false;
        return;
      }

      const archivo = new File(
        [blob],
        `factura-${nombre ? nombre.toLowerCase().replace(/\s+/g, "-") : "biin"}.png`,
        { type: "image/png" }
      );

      const nav = navigator as Navigator & {
        canShare?: (data?: { files?: File[] }) => boolean;
        share?: (data?: { files?: File[] }) => Promise<void>;
      };

      if (nav.canShare && nav.canShare({ files: [archivo] })) {
        try {
          await nav.share!({ files: [archivo] });
        } catch (error) {
          console.log("Compartir cancelado o falló:", error);
        }
      } else {
        alert("Tu dispositivo o navegador no admite compartir imágenes directamente.");
      }

      compartiendoRef.current = false;
    }, "image/png");
  }

  return (
    <div style={{ backgroundColor: "#031129", color: "#FFFFFF", minHeight: "100vh", padding: "2rem 1rem" }}>
      <main style={{ maxWidth: "500px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img src="/logo.png" alt="BI-IN Logistics Logo" style={{ maxWidth: "180px", height: "auto", display: "block", margin: "0 auto" }} />
        </div>

        <div id="appContainer">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button id="btnLogout" type="button" onClick={cerrarSesion} style={{ padding: "0.5rem 1rem", backgroundColor: "transparent", color: "#F58220", border: "1px solid #F58220", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              Cerrar Sesión
            </button>
          </div>

          {mensajeError && <div id="mensajeError" style={{ backgroundColor: "#742A2A", color: "#FED7D7", padding: "0.75rem", borderRadius: "5px", marginBottom: "1rem" }}>{mensajeError}</div>}
          {mensajeExito && <div id="mensajeExito" style={{ backgroundColor: "#22543D", color: "#C6F6D5", padding: "0.75rem", borderRadius: "5px", marginBottom: "1rem" }}>{mensajeExito}</div>}

          <div style={{ backgroundColor: "#071B3B", padding: "1.5rem", borderRadius: "10px", marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="provincia" style={{ display: "block", marginBottom: "0.4rem" }}>Provincia</label>
              <input id="provincia" type="text" value={provincia} onChange={(e) => setProvincia(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "5px", border: "1px solid #1E3A6D", backgroundColor: "#031129", color: "#FFFFFF" }} />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="nombre" style={{ display: "block", marginBottom: "0.4rem" }}>Nombre del Cliente</label>
              <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "5px", border: "1px solid #1E3A6D", backgroundColor: "#031129", color: "#FFFFFF" }} />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="peso" style={{ display: "block", marginBottom: "0.4rem" }}>Peso (kg)</label>
              <input id="peso" type="number" value={peso} onChange={(e) => calcularTotal(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "5px", border: "1px solid #1E3A6D", backgroundColor: "#031129", color: "#FFFFFF" }} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="total" style={{ display: "block", marginBottom: "0.4rem" }}>Total a Pagar</label>
              <input id="total" type="text" value={total ? `₡${total}` : ""} readOnly style={{ width: "100%", padding: "0.6rem", borderRadius: "5px", border: "1px solid #1E3A6D", backgroundColor: "#0A244D", color: "#F58220", fontWeight: "bold" }} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button id="btnGenerar" type="button" onClick={generarFactura} style={{ flex: 1, padding: "0.75rem", backgroundColor: "#F58220", color: "#FFFFFF", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                Generar Factura
              </button>
              <button id="btnLimpiar" type="button" onClick={limpiarCampos} style={{ padding: "0.75rem 1rem", backgroundColor: "#1E3A6D", color: "#FFFFFF", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Limpiar
              </button>
            </div>
          </div>

          {mostrarResumen && (
            <div style={{ backgroundColor: "#071B3B", padding: "1.5rem", borderRadius: "10px" }}>
              <div id="resumenFactura" style={{ backgroundColor: "#ffffff", color: "#333333", padding: "2rem", borderRadius: "8px", marginBottom: "1.5rem", textAlign: "center" }}>
                <h2 style={{ color: "#031129", margin: "0 0 1rem 0" }}>BI-IN LOGISTICS</h2>
                <p style={{ margin: "0.5rem 0" }}><strong>Cliente:</strong> <span id="nombreResumen">{nombreResumen}</span></p>
                <p style={{ margin: "0.5rem 0" }}><strong>Provincia:</strong> {provincia}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Peso:</strong> {peso} kg</p>
                <h3 style={{ color: "#F58220", marginTop: "1.5rem" }}>Total: <span id="totalResumen">{totalResumen}</span></h3>
              </div>

              <div id="accionesFactura" style={{ display: "flex", gap: "0.5rem" }}>
                <button id="btnCompartir" type="button" onClick={compartirImagen} style={{ flex: 1, padding: "0.75rem", backgroundColor: "#25D366", color: "#FFFFFF", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                  Compartir por WhatsApp
                </button>
                <button id="btnPNG" type="button" onClick={descargarPNG} style={{ padding: "0.75rem 1rem", backgroundColor: "#1E3A6D", color: "#FFFFFF", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                  Descargar PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}