"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

export default function FacturasPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [peso, setPeso] = useState("");
  const [total, setTotal] = useState("");
  const [mostrarResumen, setMostrarResumen] = useState(false);

  // Función para cerrar sesión borrando las cookies mediante la API
  async function cerrarSesion() {
    await fetch("/api/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  // Función para calcular el total dinámicamente según el peso
  function calcularTotal(valor: string) {
    setPeso(valor);

    const pesoNumero = parseFloat(valor);

    if (isNaN(pesoNumero)) {
      setTotal("");
      return;
    }

    const resultado = pesoNumero * 14 * 500;
    setTotal(resultado.toLocaleString("es-CR"));
  }

  // Función para validar y mostrar la tarjeta de la factura
  function generarFactura() {
    if (!nombre.trim()) {
      alert("Debe ingresar un nombre");
      return;
    }

    if (!peso) {
      alert("Debe ingresar un peso");
      return;
    }

    setMostrarResumen(true);
  }

  // Función para limpiar todos los campos
  function limpiarCampos() {
    setNombre("");
    setPeso("");
    setTotal("");
    setMostrarResumen(false);
  }

  // Función para descargar la factura como PNG
  async function descargarPNG() {
    const factura = document.getElementById("resumenFactura");

    if (!factura) return;

    const canvas = await html2canvas(factura, { scale: 2 });

    const enlace = document.createElement("a");
    enlace.download = `factura-${nombre ? nombre.toLowerCase().replace(/\s+/g, "-") : "biin"}.png`;
    enlace.href = canvas.toDataURL("image/png");
    enlace.click();
  }

  // Función para compartir mediante el menú nativo del dispositivo
  async function compartirFactura() {
    const factura = document.getElementById("resumenFactura");

    if (!factura) return;

    const canvas = await html2canvas(factura, { scale: 2 });

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const nombreArchivo = `factura-${nombre ? nombre.toLowerCase().replace(/\s+/g, "-") : "biin"}.png`;
      const archivo = new File([blob], nombreArchivo, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        try {
          await navigator.share({
            files: [archivo],
            title: "Factura BI-IN",
            text: `Hola ${nombre}, adjunto el detalle de tu factura.`,
          });
        } catch (error) {
          console.log("Error al compartir:", error);
        }
      } else {
        alert("Tu dispositivo o navegador no admite compartir archivos directamente.");
      }
    });
  }

  return (
    <div style={{ backgroundColor: "#031129", color: "#FFFFFF", minHeight: "100vh", padding: "2rem 1rem" }}>
      <main style={{ maxWidth: "500px", margin: "0 auto" }}>
        
        {/* BOTÓN CERRAR SESIÓN */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={cerrarSesion}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "transparent",
              color: "#F58220",
              border: "1px solid #F58220",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* LOGO SUPERIOR PAGINA (CENTERED) */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src="/logo.png"
            alt="BI-IN Logistics Logo"
            style={{ maxWidth: "180px", height: "auto", display: "block", margin: "0 auto" }}
          />
        </div>

        {/* FORMULARIO DE INGRESO */}
        <div style={{ backgroundColor: "#071B3B", padding: "1.5rem", borderRadius: "10px", marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="nombre" style={{ display: "block", marginBottom: "0.4rem" }}>Nombre del Cliente</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "5px",
                border: "1px solid #1E3A6D",
                backgroundColor: "#031129",
                color: "#FFFFFF"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="peso" style={{ display: "block", marginBottom: "0.4rem" }}>Peso (kg)</label>
            <input
              id="peso"
              name="peso"
              type="number"
              value={peso}
              onChange={(e) => calcularTotal(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "5px",
                border: "1px solid #1E3A6D",
                backgroundColor: "#031129",
                color: "#FFFFFF"
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="total" style={{ display: "block", marginBottom: "0.4rem" }}>Total a Pagar</label>
            <input
              id="total"
              name="total"
              type="text"
              value={total ? `₡${total}` : ""}
              readOnly
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "5px",
                border: "1px solid #1E3A6D",
                backgroundColor: "#0A244D",
                color: "#F58220",
                fontWeight: "bold"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={generarFactura}
              style={{
                flex: 1,
                padding: "0.75rem",
                backgroundColor: "#F58220",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Generar Factura
            </button>

            <button
              type="button"
              onClick={limpiarCampos}
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#1E3A6D",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* TARJETA GENERADA (RESUMEN FACTURA / TICKET) */}
        {mostrarResumen && (
          <>
            <div
              id="resumenFactura"
              style={{
                padding: "2rem 1.5rem",
                border: "2px solid #F58220",
                borderRadius: "12px",
                textAlign: "center",
                backgroundColor: "#031129",
                color: "#FFFFFF",
                marginBottom: "1rem"
              }}
            >
              {/* LOGO DENTRO DEL TICKET (CENTERED) */}
              <img
                src="/logo.png"
                alt="BI-IN Logistics"
                style={{
                  maxWidth: "160px",
                  height: "auto",
                  display: "block",
                  margin: "0 auto 1.2rem auto"
                }}
              />

              <h2 style={{ color: "#F58220", margin: "0 0 0.2rem 0", fontSize: "1.4rem" }}>¡BUENAS NOTICIAS!</h2>
              <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.2rem" }}>TU PAQUETE ESTÁ LISTO</h3>
              <p style={{ margin: "0 0 1.2rem 0" }}>para retirar 📦</p>

              <p style={{ margin: "0 0 0.4rem 0", fontSize: "0.9rem", color: "#A0B0CB" }}>
                Aquí está el detalle de tu factura
              </p>

              <h3 style={{ textTransform: "uppercase", fontSize: "1.3rem", margin: "0 0 1.2rem 0", color: "#FFFFFF" }}>
                {nombre}
              </h3>

              <p style={{ margin: "0 0 0.2rem 0", fontSize: "0.85rem", color: "#A0B0CB" }}>TOTAL A PAGAR</p>
              <h2 style={{ color: "#F58220", fontSize: "2rem", margin: "0 0 1.2rem 0" }}>₡{total}</h2>

              <div
                style={{
                  border: "1px dashed #F58220",
                  borderRadius: "8px",
                  padding: "0.6rem",
                  marginBottom: "1.2rem",
                  backgroundColor: "#071B3B"
                }}
              >
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  SINPE MÓVIL: <span style={{ color: "#F58220" }}>6350-7070</span>
                </p>
              </div>

              <p style={{ margin: "0 0 0.3rem 0", fontSize: "0.9rem" }}>Por favor, enviar el comprobante.</p>
              <p style={{ margin: "0 0 0.3rem 0", fontSize: "0.9rem" }}>Gracias por confiar en nosotros.</p>
              <p style={{ margin: 0, fontWeight: "bold", color: "#F58220" }}>¡Estamos para servirte!</p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={compartirFactura}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "#F58220",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Compartir
              </button>

              <button
                type="button"
                onClick={descargarPNG}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "#1E3A6D",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Descargar PNG
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}