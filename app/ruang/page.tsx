import { supabasePublic } from "@/lib/supabase";
import Link from "next/link";

export default async function DaftarRuang({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const resolvedParams = await searchParams;
  const jenisFilter = resolvedParams.jenis;

  let query = supabasePublic.from("ruang").select("*").eq("aktif", true);

  if (jenisFilter) {
    query = query.eq("jenis", jenisFilter);
  }

  const { data: ruangList, error } = await query;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Ruang & Laboratorium</h1>

      {/* Filter Jenis */}
      <div className="flex gap-2 mb-6">
        <Link href="/ruang" className="px-3 py-1 bg-gray-200 rounded">
          Semua
        </Link>
        <Link href="/ruang?jenis=lab" className="px-3 py-1 bg-blue-100 rounded">
          Lab
        </Link>
        <Link
          href="/ruang?jenis=kelas"
          className="px-3 py-1 bg-green-100 rounded"
        >
          Kelas
        </Link>
        <Link
          href="/ruang?jenis=aula"
          className="px-3 py-1 bg-yellow-100 rounded"
        >
          Aula
        </Link>
      </div>

      {error && <p className="text-red-500">Gagal memuat data ruang.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ruangList?.map((ruang) => (
          <div key={ruang.id} className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg">{ruang.nama}</h2>
            <p className="text-sm text-gray-600 uppercase">
              Jenis: {ruang.jenis}
            </p>
            <p className="text-sm text-gray-600">
              Kapasitas: {ruang.kapasitas} orang
            </p>
            <p className="text-sm text-gray-600 mb-4">Lokasi: {ruang.lokasi}</p>
            <Link
              href={`/ruang/${ruang.id}`}
              className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
            >
              Lihat Detail & Jadwal[cite: 3]
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
