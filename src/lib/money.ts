export function formatKzt(amount: number): string {
  const n = Math.round(amount);
  const withSpaces = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withSpaces} ₸`;
}

/**
 * What a product card says it costs.
 *
 * Cards used to print the base price, which the prices screen does not
 * change: give the 75 cm size its own price and the catalogue kept quoting
 * the old number while the product page showed another. The cheapest
 * variant is what a buyer can actually pay, so that is shown, with "от" when
 * the sizes differ.
 */
export function formatProductPrice(
  product: { basePriceKzt: number; variants?: { priceKzt?: number | null }[] },
  locale: string,
): string {
  const prices = (product.variants ?? []).map(
    (v) => v.priceKzt ?? product.basePriceKzt,
  );
  if (!prices.length) return formatKzt(product.basePriceKzt);
  const min = Math.min(...prices);
  if (Math.max(...prices) === min) return formatKzt(min);
  return locale === "kk" ? `${formatKzt(min)} бастап` : `от ${formatKzt(min)}`;
}
