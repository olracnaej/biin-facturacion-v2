import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

async function actualizarUsuario(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const correo = formData.get("correo") as string;

  if (!id || !correo) {
    return;
  }

  await prisma.usuario.update({
    where: {
      id,
    },
    data: {
      correo,
    },
  });

  // Redirige al listado tras guardar los cambios
  redirect("/gestion-usuarios?success=Usuario+actualizado+correctamente");
}

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: Number(id),
    },
  });

  // Si no se encuentra el usuario, redirige a la lista
  if (!usuario) {
    redirect("/gestion-usuarios");
  }

  return (
    <main>
      <h1>Editar Usuario</h1>

      {/* Se abre correctamente la etiqueta form con su action */}
      <form action={actualizarUsuario}>
        <input
          type="hidden"
          name="id"
          value={usuario.id}
        />

        <div>
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            name="correo"
            type="email"
            defaultValue={usuario.correo}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
          />
        </div>

        <button type="submit">
          Guardar Cambios
        </button>
      </form>
    </main>
  );
}