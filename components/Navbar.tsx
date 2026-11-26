"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/ruang", teks: "Daftar Ruang" },
  { href: "/pinjam", teks: "Ajukan Peminjaman" },
  { href: "/peminjaman", teks: "Jadwal Publik" },
  { href: "/cek", teks: "Cek Status" },
  { href: "/admin", teks: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-t-4 border-blue-600 bg-linear-to-r from-blue-50 via-white to-sky-50 shadow-sm">
      <nav className="flex min-h-15.5 flex-nowrap items-center gap-6 overflow-x-auto border-b border-blue-100 px-6 py-3 sm:px-8 scrollbar-none">
        <Link
          href="/"
          className="mr-2 shrink-0 text-xl font-extrabold tracking-tight text-blue-700"
        >
          PinjamLab<span className="text-sky-500"></span>
        </Link>

        {/* Menu Navigasi */}
        <div className="flex shrink-0 items-center gap-6">
          {menu.map((m) => {
            const aktif =
              pathname === m.href || pathname.startsWith(m.href + "/");

            return (
              <Link
                key={m.href}
                href={m.href}
                className={`relative whitespace-nowrap py-2 text-sm transition-colors duration-200 ${
                  aktif
                    ? "font-bold text-blue-700 after:absolute after:bottom-0 after:left-0 after:h-0.75 after:w-full after:rounded-full after:bg-blue-600"
                    : "font-medium text-slate-600 hover:text-blue-600"
                }`}
              >
                {m.teks}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
