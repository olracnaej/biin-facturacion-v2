import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function GestionUsuariosPage() {
    const usuarios = await prisma.usuario.findMany();

    return (
        <main>
            <h1>Gestión de Usuarios</h1>

            {/* Se agregó el href correspondiente */}
            <Link href="/gestion-usuarios/nuevo-usuario">
                <button>Nuevo Usuario</button>
            </Link>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Correo</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                            <td>{usuario.id}</td>
                            <td>{usuario.correo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}