import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Parse body JSON
    const { name, email, message } = await req.json();

    // Validasi input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // Menyimpan data kontak ke database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        message,
      },
    });

    // Mengembalikan respons dengan data yang baru saja disimpan
    return new Response(JSON.stringify(contact), { status: 200 });
  } catch (error) {
    console.error(error); // Log kesalahan untuk debugging

    // Menangani kesalahan umum
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi Prisma ditutup setelah selesai
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Mengambil semua data kontak dari database
    const contacts = await prisma.contact.findMany();
    
    return new Response(JSON.stringify(contacts), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Something went wrong." }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json(); // Ambil `id` dari body request

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
    }

    // Hapus kontak berdasarkan ID
    await prisma.contact.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "Contact deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, email, message } = await req.json();

    if (!id || !name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // Update kontak di database
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: { name, email, message },
    });

    return new Response(JSON.stringify(updatedContact), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
