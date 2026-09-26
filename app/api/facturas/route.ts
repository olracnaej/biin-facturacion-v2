import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const { provincia, nombre, peso, total } = datos;

    if (!nombre || !peso) {
      return NextResponse.json(
        { exito: false, error: "Faltan campos requeridos." },
        { status: 400 }
      );
    }

    const pesoNumero = parseFloat(peso);
    const totalNumero = parseFloat(String(total).replace(/[^\d.-]/g, ""));

    const factura = await prisma.factura.create({
      data: {
        provincia: provincia || "",
        nombre,
        peso: pesoNumero,
        total: totalNumero,
      },
    });

    return NextResponse.json({ exito: true, factura });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { exito: false, error: "Error al guardar la factura." },
      { status: 500 }
    );
  }
}