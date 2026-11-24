import Link from "next/link";
import { supabasePublic, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const instant = false;

type AdminProps = {
  searchParams: Promise<{
    status?: string;
    info?: string;
  }>;
};

export default async function AdminPanel({ searchParams }: AdminProps) {
  const params = await searchParams;

  const filterStatus = ["menunggu", "disetujui", "ditolak"].includes(
    params.status ?? "",
  )
    ? params.status
    : "semua";

  let query = supabasePublic
    .from("peminjaman")
    .select("*, ruang(nama, aktif, kapasitas)")
    .order("dibuat", { ascending: false });

  if (filterStatus !== "semua") {
    query = query.eq("status", filterStatus);
  }

  const { data: permohonanList, error } = await query;

  // Server Action untuk menyetujui atau menolak peminjaman
  async function updateStatus(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    const alasanTolak = String(formData.get("alasan_tolak") ?? "").trim();

    if (!id || !["disetujui", "ditolak"].includes(status)) {
      redirect("/admin?info=Permohonan+tidak+valid");
    }

    if (status === "ditolak" && alasanTolak.length < 5) {
      redirect("/admin?info=Alasan+penolakan+minimal+5+karakter");
    }

    // Ambil data permohonan
    const { data: item, error: itemError } = await supabaseAdmin
      .from("peminjaman")
      .select("*, ruang(nama, aktif, kapasitas)")
      .eq("id", id)
      .maybeSingle();

    if (itemError || !item) {
      redirect("/admin?info=Data+permohonan+tidak+ditemukan");
    }

    if (item.status !== "menunggu") {
      redirect("/admin?info=Permohonan+sudah+diproses");
    }

    if (status === "disetujui") {
      // Pastikan ruang masih aktif
      if (!item.ruang?.aktif) {
        redirect("/admin?info=Ruang+tidak+aktif");
      }

      // Pastikan jumlah peminjam tidak melebihi kapasitas
      if (item.jumlah_orang > item.ruang.kapasitas) {
        redirect("/admin?info=Jumlah+peminjam+melebihi+kapasitas+ruang");
      }

      // Periksa jadwal yang sudah disetujui
      const { data: jadwalBentrok, error: cekError } = await supabaseAdmin
        .from("peminjaman")
        .select("id")
        .eq("ruang_id", item.ruang_id)
        .eq("tanggal", item.tanggal)
        .eq("status", "disetujui")
        .lt("mulai", item.selesai)
        .gt("selesai", item.mulai);

      if (cekError) {
        redirect("/admin?info=Gagal+memeriksa+jadwal");
      }

      // Jika sudah ada jadwal yang disetujui dan bertabrakan
      if (jadwalBentrok && jadwalBentrok.length > 0) {
        await supabaseAdmin
          .from("peminjaman")
          .update({
            status: "ditolak",
            alasan_tolak:
              "Jadwal bertabrakan dengan peminjaman lain yang sudah disetujui.",
          })
          .eq("id", id)
          .eq("status", "menunggu");

        revalidatePath("/admin");
        revalidatePath("/");
        redirect("/admin?info=Permohonan+ditolak+karena+jadwal+bentrok");
      }
    }

    // Update status permohonan yang dipilih
    const { error: updateError } = await supabaseAdmin
      .from("peminjaman")
      .update({
        status,
        alasan_tolak: status === "ditolak" ? alasanTolak : null,
      })
      .eq("id", id)
      .eq("status", "menunggu");

    if (updateError) {
      redirect("/admin?info=Gagal+memperbarui+status");
    }

    // Jika disetujui, tolak otomatis permohonan lain
    // yang memiliki jadwal bertabrakan
    if (status === "disetujui") {
      const { error: bentrokError } = await supabaseAdmin
        .from("peminjaman")
        .update({
          status: "ditolak",
          alasan_tolak:
            "Jadwal bertabrakan dengan peminjaman lain yang sudah disetujui.",
        })
        .eq("ruang_id", item.ruang_id)
        .eq("tanggal", item.tanggal)
        .eq("status", "menunggu")
        .neq("id", id)
        .lt("mulai", item.selesai)
        .gt("selesai", item.mulai);

      if (bentrokError) {
        redirect(
          "/admin?info=Peminjaman+disetujui,+tetapi+gagal+memproses+jadwal+bentrok",
        );
      }
    }

    revalidatePath("/admin");
    revalidatePath("/");

    redirect(
      `/admin?info=${encodeURIComponent(
        status === "disetujui"
          ? "Permohonan berhasil disetujui"
          : "Permohonan berhasil ditolak",
      )}`,
    );
  }

  // Menghitung jumlah permohonan
  const { data: semuaPermohonan } = await supabasePublic
    .from("peminjaman")
    .select("status");

  const jumlahMenunggu =
    semuaPermohonan?.filter((p) => p.status === "menunggu").length ?? 0;

  const jumlahDisetujui =
    semuaPermohonan?.filter((p) => p.status === "disetujui").length ?? 0;

  const jumlahDitolak =
    semuaPermohonan?.filter((p) => p.status === "ditolak").length ?? 0;

  return (
    <div>
      {/* Judul dan navigasi pengelolaan */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Kelola Permohonan</h1>

        <Link
          href="/admin/ruang"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Kelola Ruang
        </Link>
      </div>

      {/* Informasi hasil tindakan */}
      {params.info && (
        <p className="mb-4 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {params.info}
        </p>
      )}

      {/* Ringkasan permohonan */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Menunggu</p>
          <p className="text-2xl font-bold text-yellow-600">{jumlahMenunggu}</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Disetujui</p>
          <p className="text-2xl font-bold text-green-600">{jumlahDisetujui}</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Ditolak</p>
          <p className="text-2xl font-bold text-red-600">{jumlahDitolak}</p>
        </div>
      </div>

      {/* Filter status */}
      <form method="GET" className="mb-4 flex flex-wrap gap-2">
        <select
          name="status"
          defaultValue={filterStatus}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="semua">Semua Permohonan</option>
          <option value="menunggu">Menunggu</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>

        <button
          type="submit"
          className="rounded bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
        >
          Cari
        </button>
      </form>

      {/* Tabel permohonan */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1050px] border border-black bg-white text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="border-b border-black p-2">Ruang</th>
              <th className="border-b border-black p-2">Peminjam</th>
              <th className="border-b border-black p-2">Keperluan</th>
              <th className="border-b border-black p-2">Tanggal</th>
              <th className="border-b border-black p-2">Waktu</th>
              <th className="border-b border-black p-2">Jumlah</th>
              <th className="border-b border-black p-2">Status</th>
              <th className="border-b border-black p-2">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {error ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-red-600">
                  Gagal mengambil data permohonan.
                </td>
              </tr>
            ) : permohonanList && permohonanList.length > 0 ? (
              permohonanList.map((item) => (
                <tr key={item.id} className="border-b border-black">
                  <td className="p-2">{item.ruang?.nama ?? "-"}</td>

                  <td className="p-2">{item.peminjam}</td>

                  <td className="max-w-[200px] p-2">{item.keperluan}</td>

                  <td className="whitespace-nowrap p-2">{item.tanggal}</td>

                  <td className="whitespace-nowrap p-2">
                    {item.mulai} - {item.selesai}
                  </td>

                  <td className="whitespace-nowrap p-2">
                    {item.jumlah_orang} orang
                  </td>

                  <td className="p-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold uppercase ${
                        item.status === "disetujui"
                          ? "bg-green-100 text-green-700"
                          : item.status === "ditolak"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-2">
                    {item.status === "menunggu" ? (
                      <form
                        action={updateStatus}
                        className="flex min-w-[190px] flex-col gap-2"
                      >
                        <input type="hidden" name="id" value={item.id} />

                        <button
                          name="status"
                          value="disetujui"
                          className="rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700"
                        >
                          Setujui
                        </button>

                        <input
                          type="text"
                          name="alasan_tolak"
                          minLength={5}
                          placeholder="Alasan penolakan..."
                          className="w-full rounded border border-gray-300 px-2 py-1.5"
                        />

                        <button
                          name="status"
                          value="ditolak"
                          className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                        >
                          Tolak
                        </button>
                      </form>
                    ) : (
                      <span className="text-gray-500">Selesai</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Belum ada permohonan peminjaman.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
