"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]); // Array of Contact
  const [editingContact, setEditingContact] = useState<Contact | null>(null); // Either Contact or null
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Optional: To show loading state

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Ambil data kontak dari API
    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/contact");
        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        } else {
          console.error("Failed to fetch contacts");
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []); // Empty dependency array berarti ini hanya dipanggil sekali saat komponen dimuat

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newContact: Omit<Contact, "id"> = { name, email, message };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      });

      if (response.ok) {
        const savedContact = await response.json();

        // Tambahkan kontak yang berhasil disimpan ke state
        setContacts((prevContacts) => [savedContact, ...prevContacts]);

        // Reset form
        setName("");
        setEmail("");
        setMessage("");

        toast.success("Pesan Anda berhasil terkirim!"); // Ganti toast dengan toast
      } else {
        toast.error("Terjadi kesalahan, coba lagi."); // Ganti toast dengan toast
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong."); // Ganti toast dengan toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingContact) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingContact), // Kirim data kontak yang diperbarui
      });

      if (response.ok) {
        const updatedContact = await response.json();

        // Update kontak di state
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.id === updatedContact.id ? updatedContact : contact,
          ),
        );

        toast.success("Contact updated successfully!");
        setEditingContact(null); // Tutup modal setelah berhasil
      } else {
        toast.error("Failed to update contact.");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = (id: number) => {
    setContactToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setContactToDelete(null);
  };

  const handleDelete = async (id: number) => {
    if (!id) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), // Kirim ID kontak yang akan dihapus
      });

      if (response.ok) {
        // Pastikan respons memiliki JSON
        const data = response.headers
          .get("Content-Type")
          ?.includes("application/json")
          ? await response.json()
          : null;

        // Hapus kontak dari state lokal
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact.id !== id),
        );

        toast.success(data?.message || "Contact deleted successfully.");
      } else {
        const error = response.headers
          .get("Content-Type")
          ?.includes("application/json")
          ? await response.json()
          : { message: "Unknown error" };

        toast.error(
          `Failed to delete contact: ${error.message || "Unknown error"}`,
        );
      }
    } catch (error: unknown) {
      // Pengecekan error dengan lebih aman
      if (error instanceof Error) {
        console.error("Error deleting contact:", error);
        toast.error(error.message || "Something went wrong. Please try again.");
      } else {
        console.error("Unknown error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsDeleting(false);
       handleCloseModal(); // Tambahkan ini untuk memastikan modal ditutup setelah selesai
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>

      {/* Formulir pengiriman pesan */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Daftar Kontak */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Contact Messages</h2>
        <div className="space-y-4">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 border rounded flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  <p>{contact.message}</p>
                </div>
                <div className="flex gap-2">
                  {/* Tombol Edit */}
                  <button
                    onClick={() => setEditingContact(contact)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleOpenModal(contact.id)}
                    className={`bg-red-500 text-white px-4 py-2 rounded ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No messages found</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this contact?
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(contactToDelete!)}
                className="bg-red-500 text-white px-4 py-2 rounded"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editingContact && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Contact</h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editingContact.name}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2 mt-1 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={editingContact.email}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      email: e.target.value,
                    })
                  }
                  className="w-full p-2 mt-1 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  value={editingContact.message}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      message: e.target.value,
                    })
                  }
                  className="w-full p-2 mt-1 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
