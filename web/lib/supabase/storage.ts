import { createClient } from "@/lib/supabase/client";

const BUCKET = "documentos-medicos";

async function optimizarArchivo(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const MAX_PX = 1920;
    const QUALITY = 0.82;
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) {
          height = Math.round((height * MAX_PX) / width);
          width = MAX_PX;
        } else {
          width = Math.round((width * MAX_PX) / height);
          height = MAX_PX;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        QUALITY,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export async function uploadDocumentoMedico(
  file: File,
  examenId: string,
  tipo: "orden" | "resultado",
): Promise<string | null> {
  const optimizado = await optimizarArchivo(file);
  const supabase = createClient();
  const ext = optimizado.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() ?? "pdf");
  const path = `${examenId}/${tipo}.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, optimizado, { upsert: true, contentType: optimizado.type });
  if (error || !data) { console.error(error); return null; }
  return data.path;
}

export async function uploadArchivoCita(file: File, citaId: string): Promise<string | null> {
  const optimizado = await optimizarArchivo(file);
  const supabase = createClient();
  const ext = optimizado.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() ?? "pdf");
  const path = `citas/${citaId}/orden.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, optimizado, { upsert: true, contentType: optimizado.type });
  if (error || !data) { console.error(error); return null; }
  return data.path;
}

export async function uploadArchivoMedicamento(file: File, medId: string): Promise<string | null> {
  const optimizado = await optimizarArchivo(file);
  const supabase = createClient();
  const ext = optimizado.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() ?? "pdf");
  const path = `medicamentos/${medId}/formula.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, optimizado, { upsert: true, contentType: optimizado.type });
  if (error || !data) { console.error(error); return null; }
  return data.path;
}

export async function getUrlDocumento(storagePath: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);
  return data?.signedUrl ?? null;
}

export async function deleteDocumento(storagePath: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
