import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

async function guardarUsuario(formData: FormData) {
  "use server";

  console.log("Entró a guardarUsuario");

  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  if (!correo || !password) {
    return;
  }

  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });

  if (usuarioExistente) {
    console.log("El correo ya existe");
    return;
  }

  await prisma.usuario.create({
    data: {
      correo,
      password,
    },
  });

  console.log("Usuario guardado exitosamente");

  // Redirige al listado de usuarios tras guardar
  redirect("/gestion-usuarios");
}

export default function NuevoUsuarioPage() {
  return (
    <main>
      <h1>Nuevo Usuario</h1>

      {/* Se abre correctamente la etiqueta form */}
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