export function canPublishProduct(input: { imageCount: number }) {
  if (input.imageCount < 1) {
    return {
      ok: false as const,
      reason: "Для публикации нужно хотя бы одно фото",
    };
  }
  return { ok: true as const };
}
