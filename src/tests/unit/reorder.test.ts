import { describe, expect, it } from "vitest";
import { moveItem } from "@/lib/reorder";

const list = ["a", "b", "c", "d"];

describe("moveItem", () => {
  it("moves an item forward, closing the gap behind it", () => {
    // Dropping "a" onto "c" puts it where "c" was, not after it: the indices
    // shift once "a" is lifted out, which is the easy thing to get wrong.
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("moves an item backward", () => {
    expect(moveItem(list, 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("moves to the very front and the very back", () => {
    expect(moveItem(list, 2, 0)).toEqual(["c", "a", "b", "d"]);
    expect(moveItem(list, 0, 3)).toEqual(["b", "c", "d", "a"]);
  });

  it("returns an equal list when nothing actually moved", () => {
    expect(moveItem(list, 1, 1)).toEqual(list);
  });

  it("never mutates the list it was given", () => {
    const original = [...list];
    moveItem(list, 0, 3);
    expect(list).toEqual(original);
  });

  it("ignores indices outside the list rather than dropping items", () => {
    expect(moveItem(list, -1, 2)).toEqual(list);
    expect(moveItem(list, 1, 99)).toEqual(list);
    expect(moveItem(list, 99, 1)).toEqual(list);
  });

  it("leaves a one-item list alone", () => {
    expect(moveItem(["only"], 0, 0)).toEqual(["only"]);
  });
});
