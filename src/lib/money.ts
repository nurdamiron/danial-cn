export function formatKzt(amount: number): string {
  const n = Math.round(amount);
  const withSpaces = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withSpaces} ₸`;
}
