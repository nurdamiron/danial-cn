export function canPublishProduct(input: { imageCount: number }) {
  if (input.imageCount < 1) {
    return {
      ok: false as const,
      reason: "At least one product image is required",
    };
  }
  return { ok: true as const };
}
