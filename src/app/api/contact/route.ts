import prisma from "../client";
import { NextResponse } from "next/server";

// get all contacts
export async function GET() {
  try {
    // Mengambil semua data kontak dari database
    const contacts = await prisma.contact.findMany();
    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Menambahkan kontak baru
export async function POST(req: Request) {
  try {
    // Parse body JSON
    const { name, email, message } = await req.json();

    // Validasi input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
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
    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    console.error(error); // Log kesalahan untuk debugging

    // Menangani kesalahan umum
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    // Pastikan koneksi Prisma ditutup setelah selesai
    await prisma.$disconnect();
  }
}

// Update kontak berdasarkan ID
export async function PUT(req: Request) {
  try {
    const { id, name, email, message } = await req.json();

    if (!id || !name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Update kontak di database
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: { name, email, message },
    });

    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Menghapus kontak berdasarkan ID
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json(); // Ambil `id` dari body request

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Hapus kontak berdasarkan ID
    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
