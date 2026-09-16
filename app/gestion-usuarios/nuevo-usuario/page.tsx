import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

async function guardarUsuario(formData: FormData) {
  "use server";

  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  if (!correo || !password) {
    redirect("/gestion-usuarios/nuevo-usuario?error=Campos+incompletos");
  }

  // Verifica si el correo ya existe
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { correo },
  });

  if (usuarioExistente) {
    redirect("/gestion-usuarios/nuevo-usuario?error=El+correo+ya+existe");
  }

  await prisma.usuario.create({
    data: {
      correo,
      password,
    },
  });

  // Redirige al listado tras guardar
  redirect("/gestion-usuarios?success=Usuario+creado+correctamente");
} // <-- Se agregó la llave de cierre que faltaba aquí

export default async function NuevoUsuarioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main>
      <h1>Nuevo Usuario</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form action={guardarUsuario}>
        <div>
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            name="correo"
            type="email"
            placeholder="correo@empresa.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Ingrese una contraseña"
            required
          />
        </div>

        <button type="submit">Guardar</button>
      </form>
    </main>
  );
}