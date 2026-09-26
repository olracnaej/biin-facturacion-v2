import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { crearSesion } from "../../lib/session";
import { cookies } from "next/headers";

async function iniciarSesion(formData: FormData) {
  "use server";

  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  if (!correo || !password) {
    redirect("/login?error=Campos+incompletos");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });

  if (!usuario) {
    redirect("/login?error=Credenciales+incorrectas");
  }

  const passwordValido = await bcrypt.compare(
    password,
    usuario.password
  );

  if (!passwordValido) {
    redirect("/login?error=Credenciales+incorrectas");
  }

  const token = await crearSesion(usuario.correo);

  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/facturas");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div
      style={{
        backgroundColor: "#031129",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "#071B3B",
          padding: "2rem",
          borderRadius: "12px",
          border: "2px solid #F58220",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <img
            src="/logo.png"
            alt="BI-IN Logo"
            style={{
              width: "100px",
              height: "auto",
              display: "block",
              margin: "0 auto 1rem auto",
            }}
          />

          <h1
            style={{
              color: "#F58220",
              margin: 0,
            }}
          >
            BI-IN Facturación
          </h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#7A1F1F",
              color: "#FFFFFF",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <form action={iniciarSesion}>
          <div
            style={{
              marginBottom: "1rem",
            }}
          >
            <label
              htmlFor="correo"
              style={{
                display: "block",
                color: "#FFFFFF",
                marginBottom: "0.5rem",
              }}
            >
              Correo
            </label>

            <input
              id="correo"
              name="correo"
              type="email"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #1E3A6D",
                backgroundColor: "#031129",
                color: "#FFFFFF",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "1.5rem",
            }}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                color: "#FFFFFF",
                marginBottom: "0.5rem",
              }}
            >
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #1E3A6D",
                backgroundColor: "#031129",
                color: "#FFFFFF",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.9rem",
              backgroundColor: "#F58220",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Ingresar
          </button>
        </form>
      </main>
    </div>
  );
}