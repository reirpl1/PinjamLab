import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";

const poppins = localFont({
  src: [
    {
      path: "./fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

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
      <body
        className={`${poppins.className} min-h-screen bg-slate-50 text-slate-900`}
      >
        <Suspense
          fallback={
            <header className="min-h-15.5 border-b border-blue-100 bg-blue-50" />
          }
        >
          <Navbar />
        </Suspense>

        <main className="mx-auto w-full max-w-6xl px-6 py-9">{children}</main>
      </body>
    </html>
  );
}
