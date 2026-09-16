import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";

async function eliminarUsuario(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!id) {
    return;
  }

  await prisma.usuario.delete({
    where: {
      id,
    },
  });

  redirect("/gestion-usuarios?success=Usuario+eliminado+correctamente");
}

export default async function GestionUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const success = params?.success;

  // Se obtiene la lista de usuarios desde la base de datos
  const usuarios = await prisma.usuario.findMany();

  return (
    <main>
      <h1>Gestión de Usuarios</h1>

      {/* Mensaje de éxito si viene en la URL */}
      {success && (
        <div style={{ color: "green", marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      <Link href="/gestion-usuarios/nuevo-usuario">
        <button>Nuevo Usuario</button>
      </Link>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.correo}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/gestion-usuarios/editar-usuario/${usuario.id}`}>
                  <button>Editar</button>
                </Link>

                {/* Formulario para ejecutar la Server Action de eliminación */}
                <form action={eliminarUsuario}>
                  <input type="hidden" name="id" value={usuario.id} />
                  <button type="submit">Eliminar</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}