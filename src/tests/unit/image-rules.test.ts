import { describe, expect, it } from "vitest";
import {
  ACCEPT_ATTRIBUTE,
  MAX_IMAGE_BYTES,
  imageFileProblem,
} from "@/lib/image-rules";

describe("imageFileProblem", () => {
  it("passes every format the shop actually accepts", () => {
    for (const type of [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]) {
      expect(imageFileProblem({ name: "x", type, size: 1000 })).toBeNull();
    }
  });

  it("names the file that is the wrong kind", () => {
    const problem = imageFileProblem({
      name: "договор.pdf",
      type: "application/pdf",
      size: 1000,
    });
    expect(problem).toContain("договор.pdf");
    expect(problem).toMatch(/[а-яА-ЯёЁ]/);
  });

  it("names the file that is too heavy", () => {
    const problem = imageFileProblem({
      name: "огромное.jpg",
      type: "image/jpeg",
      size: MAX_IMAGE_BYTES + 1,
    });
    expect(problem).toContain("огромное.jpg");
    expect(problem).toContain("12");
  });

  it("allows a file sitting exactly on the limit", () => {
    expect(
      imageFileProblem({
        name: "ровно.jpg",
        type: "image/jpeg",
        size: MAX_IMAGE_BYTES,
      }),
    ).toBeNull();
  });

  it("rejects an empty file, which uploads as nothing at all", () => {
    expect(
      imageFileProblem({ name: "пусто.jpg", type: "image/jpeg", size: 0 }),
    ).not.toBeNull();
  });
});

describe("ACCEPT_ATTRIBUTE", () => {
  it("offers the browser the same list the server enforces", () => {
    // A picker that shows files the upload will refuse is a trap.
    for (const type of [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]) {
      expect(ACCEPT_ATTRIBUTE).toContain(type);
    }
  });
});
