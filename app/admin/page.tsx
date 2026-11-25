import { supabasePublic, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import DaftarPermohonan from "@/components/DaftarPermohonan";

export const instant = false;

export default async function AdminPanel() {
  // Mengambil seluruh data permohonan dari Supabase
  const { data: permohonanList, error } = await supabaseAdmin
    .from("peminjaman")
    .select("*, ruang(nama)")
    .order("dibuat", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-5 text-red-700">
        Gagal mengambil data permohonan: {error.message}
      </div>
    );
  }

  // Server Action untuk menyetujui atau menolak permohonan
  async function updateStatus(formData: FormData) {
    "use server";

    const id = formData.get("id");
    const status = formData.get("status");
    const alasan_tolak = formData.get("alasan_tolak");

    if (!id || !["disetujui", "ditolak"].includes(String(status))) {
      throw new Error("Data permohonan tidak valid.");
    }

    const alasan = typeof alasan_tolak === "string" ? alasan_tolak.trim() : "";

    if (status === "ditolak" && alasan.length < 5) {
      throw new Error("Penolakan wajib disertai alasan minimal 5 karakter.");
    }

    const { error } = await supabaseAdmin
      .from("peminjaman")
      .update({
        status: String(status),
        alasan_tolak: status === "ditolak" ? alasan : null,
      })
      .eq("id", id)
      .eq("status", "menunggu");

    if (error) {
      throw new Error("Gagal memperbarui status: " + error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/jadwal");
    revalidatePath("/cek");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <DaftarPermohonan 
        data={permohonanList ?? []}
        updateStatus={updateStatus}
      />
    </div>
  );
}
