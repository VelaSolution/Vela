import { describe, it, expect } from "vitest";
import { buildCSV, escapeCSVCell } from "@/lib/exportCSV";

describe("escapeCSVCell", () => {
  it("returns plain string unchanged", () => {
    expect(escapeCSVCell("hello")).toBe("hello");
  });

  it("returns number as string", () => {
    expect(escapeCSVCell(42)).toBe("42");
  });

  it("wraps value containing comma in quotes", () => {
    expect(escapeCSVCell("a,b")).toBe('"a,b"');
  });

  it("wraps value containing newline in quotes", () => {
    expect(escapeCSVCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("escapes double quotes by doubling them", () => {
    expect(escapeCSVCell('say "hello"')).toBe('"say ""hello"""');
  });

  it("handles value with both comma and quotes", () => {
    expect(escapeCSVCell('a,"b"')).toBe('"a,""b"""');
  });
});

describe("buildCSV", () => {
  it("starts with UTF-8 BOM", () => {
    const csv = buildCSV(["A"], [[1]]);
    expect(csv.charCodeAt(0)).toBe(0xFEFF);
  });

  it("formats headers and rows correctly", () => {
    const csv = buildCSV(["Name", "Age"], [["Alice", 30], ["Bob", 25]]);
    const lines = csv.slice(1).split("\n"); // skip BOM
    expect(lines[0]).toBe("Name,Age");
    expect(lines[1]).toBe("Alice,30");
    expect(lines[2]).toBe("Bob,25");
  });

  it("handles commas in cell values", () => {
    const csv = buildCSV(["Item", "Price"], [["Rice, 10kg", 25000]]);
    const lines = csv.slice(1).split("\n");
    expect(lines[1]).toBe('"Rice, 10kg",25000');
  });

  it("handles quotes in cell values", () => {
    const csv = buildCSV(["Note"], [['He said "yes"']]);
    const lines = csv.slice(1).split("\n");
    expect(lines[1]).toBe('"He said ""yes"""');
  });

  it("handles empty rows", () => {
    const csv = buildCSV(["A", "B"], []);
    const lines = csv.slice(1).split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("A,B");
  });
});
