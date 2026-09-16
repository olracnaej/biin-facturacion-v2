import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";

async function iniciarSesion(formData: FormData) {
  "use server";

  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  if (!correo || !password) {
    redirect("/login?error=Campos+incompletos");
  }

  // Busca el usuario por correo
  const usuario = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });

  if (!usuario) {
    redirect("/login?error=Credenciales+incorrectas");
  }

  // Compara la contraseña ingresada con el hash guardado en la base de datos
  const passwordValido = await bcrypt.compare(
    password,
    usuario.password
  );

  if (!passwordValido) {
    redirect("/login?error=Credenciales+incorrectas");
  }

  // Redirige al panel tras un inicio de sesión exitoso
  redirect("/gestion-usuarios");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main>
      <h1>Iniciar Sesión</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form action={iniciarSesion}>
        <div>
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            name="correo"
            type="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            required
          />
        </div>

        <button type="submit">
          Ingresar
        </button>
      </form>
    </main>
  );
}