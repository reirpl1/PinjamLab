import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PinjamLab - Aplikasi Peminjaman Ruang dan Laboratorium",
  description: "Sistem peminjaman ruang dan lab sekolah online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Suspense
          fallback={
            <header className="min-h-15.5 border-b border-blue-100 bg-blue-50" />
          }
        >
          <Navbar />
        </Suspense>

        {/* Konten utama */}
        <main className="mx-auto w-full max-w-6xl px-6 py-9">{children}</main>
      </body>
    </html>
  );
}
