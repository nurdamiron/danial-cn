/**
 * Moving one item of a list to another position.
 *
 * Written out rather than inlined at the call site because the indices shift
 * the moment the item is lifted: dropping the first photo onto the third has
 * to land it where the third was, and doing that by hand is where an
 * off-by-one hides until somebody notices their gallery is in the wrong order.
 */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return [...list];
  }

  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
