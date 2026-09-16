import { prisma } from "../lib/prisma";

export default async function Home() {
  const usuarios = await prisma.usuario.findMany();

  return (
    <main>
      <h1>BI-IN Facturación V2</h1>

      <h2>Usuarios</h2>

      {usuarios.map((usuario) => (
        <div key={usuario.id}>
          {usuario.correo}
        </div>
      ))}
    </main>
  );
}