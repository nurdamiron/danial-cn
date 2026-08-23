import Link from "next/link";
import type { ProductRow } from "@/lib/analytics";
import { formatKzt } from "@/lib/money";

export type NamedProductRow = ProductRow & { name: string; id: string | null };

/**
 * Enough visits to judge a page by. Below this a zero conversion is silence,
 * not a verdict, and flagging it would send the owner to rewrite a page four
 * people saw.
 */
const ENOUGH_TO_JUDGE = 20;

function needsAttention(row: NamedProductRow): boolean {
  return row.views >= ENOUGH_TO_JUDGE && row.orders === 0;
}

/**
 * The catalogue ranked by what visitors did with it.
 *
 * Sorted by views rather than by revenue on purpose: a list ordered by money
 * shows the shop what it already knows sells. Ordered by attention it also
 * shows the pages people keep opening and leaving, which is the only place on
 * this dashboard where a fix is worth more than a restock.
 */
export function ProductTable({ rows }: { rows: NamedProductRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted">
        За этот период товары никто не открывал.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line-strong text-left">
            <th className="t-label pb-2 font-medium text-muted">Товар</th>
            <th className="t-label pb-2 text-right font-medium text-muted">
              Смотрели
            </th>
            <th className="t-label pb-2 text-right font-medium text-muted">
              В корзину
            </th>
            <th className="t-label pb-2 text-right font-medium text-muted">
              Заказы
            </th>
            <th className="t-label pb-2 text-right font-medium text-muted">
              Выручка
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug} className="border-b border-line last:border-0">
              <td className="py-3 pr-3">
                {row.id ? (
                  <Link
                    href={`/admin/products/${row.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
                {needsAttention(row) ? (
                  <span className="mt-1 block text-[0.8125rem] text-danger">
                    открывали {row.views} раз, не купил никто
                  </span>
                ) : null}
              </td>
              <td className="tabular py-3 text-right">{row.views}</td>
              <td className="tabular py-3 text-right text-muted">
                {row.cartAdds}
              </td>
              <td className="tabular py-3 text-right">{row.orders}</td>
              <td className="tabular t-price py-3 text-right whitespace-nowrap">
                {row.revenue > 0 ? formatKzt(row.revenue) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
