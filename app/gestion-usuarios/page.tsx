import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import { verificarSesion } from "../../lib/session";

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

async function cerrarSesion() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.delete("auth_token");

  redirect("/login");
}

export default async function GestionUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const success = params?.success;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  await verificarSesion(token);

  const usuarios = await prisma.usuario.findMany();

  return (
    <main style={{ padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1>Gestión de Usuarios</h1>

        {/* AGREGADO: Formulario para ejecutar cerrarSesion */}
        <form action={cerrarSesion}>
          <button type="submit">Cerrar Sesión</button>
        </form>
      </header>

      {success && (
        <div style={{ color: "green", marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <Link href="/gestion-usuarios/nuevo-usuario">
          <button>Nuevo Usuario</button>
        </Link>
      </div>

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

                <form action={eliminarUsuario}>
                  <input
                    type="hidden"
                    name="id"
                    value={usuario.id}
                  />

                  <button type="submit">
                    Eliminar
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}