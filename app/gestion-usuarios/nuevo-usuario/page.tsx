import { prisma } from "../../../lib/prisma";

async function guardarUsuario(formData: FormData) {
  "use server";

  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  if (!correo || !password) {
    return;
  }

  await prisma.usuario.create({
    data: {
      correo,
      password,
    },
  });

  console.log("Usuario guardado exitosamente");
}

export default function NuevoUsuarioPage() {
  return (
    <main>
      <h1>Nuevo Usuario</h1>

      {/* Se abre correctamente la etiqueta form con la action asociada */}
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