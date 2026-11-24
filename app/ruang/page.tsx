import { supabasePublic } from "@/lib/supabase";
import Link from "next/link";

export const instant = false;

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
    <div>
      <h1 className="mb-4 text-2xl font-bold">Daftar Ruang & Laboratorium</h1>

      {/* Filter Jenis Ruangan */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/ruang"
          className={`rounded-md px-3 py-2 text-sm transition-colors ${
            !jenisFilter
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Semua
        </Link>

        <Link
          href="/ruang?jenis=lab"
          className={`rounded-md px-3 py-2 text-sm transition-colors ${
            jenisFilter === "lab"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Lab
        </Link>

        <Link
          href="/ruang?jenis=kelas"
          className={`rounded-md px-3 py-2 text-sm transition-colors ${
            jenisFilter === "kelas"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Kelas
        </Link>

        <Link
          href="/ruang?jenis=aula"
          className={`rounded-md px-3 py-2 text-sm transition-colors ${
            jenisFilter === "aula"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Aula
        </Link>
      </div>

      {error ? (
        <p className="text-red-500">Gagal memuat data ruang.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">
            {ruangList?.length ?? 0} ruang ditemukan
          </p>

          {ruangList && ruangList.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ruangList.map((ruang) => (
                <div
                  key={ruang.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <h2 className="mb-1 text-lg font-bold text-slate-900">
                    {ruang.nama}
                  </h2>

                  <p className="text-sm uppercase text-slate-500">
                    Jenis: {ruang.jenis}
                  </p>

                  <p className="text-sm text-slate-500">
                    Kapasitas: {ruang.kapasitas} orang
                  </p>

                  <p className="mb-4 text-sm text-slate-500">
                    Lokasi: {ruang.lokasi}
                  </p>

                  <Link
                    href={`/ruang/${ruang.id}`}
                    className="inline-block rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Lihat Detail & Jadwal
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">
              Belum ada ruang atau laboratorium yang tersedia.
            </p>
          )}
        </>
      )}
    </div>
  );
}
