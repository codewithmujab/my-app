"use client";

import { useState, useEffect } from "react";

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    // Ambil data kontak dari API
    const fetchContacts = async () => {
      const response = await fetch("/api/contact");
      if (response.ok) {
        const data = await response.json();
        setContacts(data); // Update state dengan data kontak
      } else {
        console.error("Failed to fetch contacts");
      }
    };

    fetchContacts();
  }, []); // Empty dependency array berarti ini hanya dipanggil sekali saat komponen dimuat


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true); // Set to true to indicate the form is being submitted
    
  
  const newContact: Omit<Contact, "id"> = { name, email, message }; // Data baru tanpa ID
  const tempContact: Contact = { ...newContact, id: Date.now() }; // Optimistic ID
  setContacts((prevContacts) => [tempContact, ...prevContacts]);

    // Kirim data ke API
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });

    if (response.ok) {
      alert("Pesan Anda berhasil terkirim!");

      // Reset form setelah berhasil
      setName("");
      setEmail("");
      setMessage("");

       // Untuk memastikan data dari database benar (opsional)
      const savedContact = await response.json();
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact === newContact ? savedContact : contact
        )
      );
    } else {
      alert("Terjadi kesalahan, coba lagi.");
      // Jika gagal, rollback optimistic update
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact !== newContact)
      );
    }

    setIsSubmitting(false); // Reset submitting state after request
  };

const handleDelete = async (id: number) => {
  const confirmDelete = confirm("Are you sure you want to delete this contact?");
  if (!confirmDelete) return;

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
      // Hapus kontak dari state lokal setelah berhasil
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== id)
      );
      alert("Contact deleted successfully.");
    } else {
      const error = await response.json();
      alert(`Failed to delete contact: ${error.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsDeleting(false);
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
            contact.id === updatedContact.id ? updatedContact : contact
          )
        );

        alert("Contact updated successfully!");
        setEditingContact(null); // Tutup modal setelah berhasil
      } else {
        alert("Failed to update contact.");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>
      
      {/* Formulir pengiriman pesan */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium">Message</label>
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
              <div key={contact.id} className="p-4 border rounded flex justify-between items-center">
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
  onClick={() => handleDelete(contact.id)}
  className={`bg-red-500 text-white px-4 py-2 rounded ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
  disabled={isDeleting} // Nonaktifkan tombol saat proses penghapusan berjalan
>
  {isDeleting ? "Deleting..." : "Delete"} {/* Indikator loading */}
</button>
                </div>
              </div>
            ))
          ) : (
            <p>No messages found</p>
          )}
        </div>
      </div>

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
                    setEditingContact({ ...editingContact, name: e.target.value })
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
                    setEditingContact({ ...editingContact, email: e.target.value })
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
                    setEditingContact({ ...editingContact, message: e.target.value })
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