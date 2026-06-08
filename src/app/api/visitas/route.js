// app/api/visitas/route.js
import { sql } from "@vercel/postgres";
import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";

// POST: Crear nueva visita (ahora con soporte para archivos)
export async function POST(request) {
  try {
    const formData = await request.formData();

    const nombre = formData.get("nombre");
    const email = formData.get("email");
    const telefono = formData.get("telefono");
    const fecha = formData.get("fecha");
    const archivo = formData.get("archivo"); // Puede ser null

    let archivoUrl = null;

    // 1. Si hay archivo, subirlo a Vercel Blob
    if (archivo && archivo.size > 0) {
      const extension = archivo.name.split(".").pop();
      const timestamp = Date.now();
      const nombreUnico = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

      const { url } = await put(`visitas/${nombreUnico}`, archivo, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      archivoUrl = url;
    }

    // 2. Guardar en PostgreSQL (con la URL del archivo si existe)
    const result = await sql`
      INSERT INTO visitas (nombre, email, telefono, fecha, archivo_url)
      VALUES (${nombre}, ${email}, ${telefono}, ${fecha}, ${archivoUrl})
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        visita: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear visita:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// GET: Obtener todas las visitas (con URLs de archivos)
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM visitas 
      ORDER BY fecha DESC, id DESC
    `;

    return NextResponse.json({
      success: true,
      visitas: rows,
    });
  } catch (error) {
    console.error("Error al obtener visitas:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar visita (y su archivo asociado)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
        },
        { status: 400 },
      );
    }

    // 1. Obtener la visita para saber si tiene archivo
    const visita = await sql`
      SELECT archivo_url FROM visitas WHERE id = ${id}
    `;

    // 2. Si tiene archivo, eliminarlo de Blob Storage
    if (visita.rows[0]?.archivo_url) {
      const url = visita.rows[0].archivo_url;
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    }

    // 3. Eliminar el registro de la base de datos
    await sql`
      DELETE FROM visitas WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Visita eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar visita:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
