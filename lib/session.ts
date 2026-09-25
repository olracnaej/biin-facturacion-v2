import { SignJWT, jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
  "biin-facturacion-secreto-muy-seguro"
);

export async function crearSesion(correo: string) {
  const token = await new SignJWT({ correo })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);

  return token;
}

export async function verificarSesion(token: string) {
  const { payload } = await jwtVerify(token, secretKey);

  return payload;
}