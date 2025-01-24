import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "A Next.js app with Header, Footer, Sidebar, and Content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-800`}
      >
        {/* Header */}
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-lg font-bold">My App</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-gray-100 p-6 border-r border-gray-700">
            <h2 className="text-xl font-semibold mb-6">Menu</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">🏠</span> {/* Ikon */}
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">👤</span> {/* Ikon */}
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">⚙️</span> {/* Ikon */}
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6">{children}</main>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-4">
          <p>&copy; 2025 My App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
