"use client";

import { shrinkForUpload } from "@/lib/client-image";

/**
 * Sending photographs to a product, one request at a time.
 *
 * They used to go as one multipart body. Two phone photos already exceed the
 * platform's request limit, and it rejects the whole batch — so a person
 * adding four photos lost all four, with no message worth reading, because
 * that rejection is plain text where the panel expects JSON.
 */

export type UploadOutcome =
  | { status: "done"; added: number }
  | { status: "partial"; added: number; error: string }
  | { status: "failed"; error: string };

/** What a response means when it did not come from our own route. */
function platformError(status: number): string {
  if (status === 413) {
    return "Файл слишком большой для загрузки. Попробуйте фото меньшего размера.";
  }
  if (status === 401 || status === 403) {
    return "Сессия истекла — войдите заново.";
  }
  if (status >= 500) {
    return "Сервер не принял фото. Попробуйте ещё раз.";
  }
  return "Не удалось загрузить фото.";
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    // A rejection from the platform rather than from the route: not JSON.
  }
  return platformError(res.status);
}

export async function uploadPhotos(input: {
  productId: string;
  files: File[];
  colorKey?: string;
  /** Called after each file so the panel can count up as they land. */
  onProgress?: (done: number, total: number) => void;
}): Promise<UploadOutcome> {
  let added = 0;

  for (const original of input.files) {
    const file = await shrinkForUpload(original);
    const body = new FormData();
    body.append("files", file);
    if (input.colorKey) body.append("colorKey", input.colorKey);

    let res: Response;
    try {
      res = await fetch(`/api/admin/products/${input.productId}/images`, {
        method: "POST",
        body,
      });
    } catch {
      const error = "Нет связи с сервером. Проверьте интернет.";
      return added
        ? { status: "partial", added, error }
        : { status: "failed", error };
    }

    if (!res.ok) {
      // Name the file that stopped it: the others already landed, and saying
      // "не удалось" about all of them would be untrue.
      const reason = await readError(res);
      const error = `«${original.name}»: ${reason}`;
      return added
        ? { status: "partial", added, error }
        : { status: "failed", error };
    }

    added += 1;
    input.onProgress?.(added, input.files.length);
  }

  return { status: "done", added };
}
