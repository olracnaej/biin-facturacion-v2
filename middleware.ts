import { NextRequest, NextResponse } from "next/server";
import { verificarSesion } from "./lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verificarSesion(token);
    return NextResponse.next();
  } catch (error) {
    // Token inválido o expirado
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/facturas/:path*", "/gestion-usuarios/:path*"],
};