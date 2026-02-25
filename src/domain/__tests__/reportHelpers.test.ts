import { describe, it, expect } from "vitest";
import type { Order } from "@/api/contracts";
import {
  toReportRows,
  formatReportDate,
  countOrdersByStatus,
} from "@/domain/reportHelpers";

// ════════════════════════════════════════════════════════════════════════════
// Fixtures determinísticas
// ════════════════════════════════════════════════════════════════════════════

const ORDER_PENDING: Order = {
  id: "order-001",
  tableId: 3,
  status: "PENDING",
  items: [
    { productId: 1, quantity: 2, name: "Empanadas criollas" },
    { productId: 5, quantity: 1, name: "Bife de chorizo" },
  ],
  createdAt: "2026-02-19T10:30:00Z",
};

const ORDER_IN_PREP: Order = {
  id: "order-002",
  tableId: 7,
  status: "IN_PREPARATION",
  items: [{ productId: 8, quantity: 3, name: "Pasta carbonara" }],
  createdAt: "2026-02-19T11:00:00Z",
};

const ORDER_READY: Order = {
  id: "order-003",
  tableId: 1,
  status: "READY",
  items: [],
  createdAt: "2026-02-19T09:15:00Z",
};

const ORDER_NO_DATE: Order = {
  id: "order-004",
  tableId: 12,
  status: "PENDING",
  items: [{ productId: 2, quantity: 1 }],
};

// ════════════════════════════════════════════════════════════════════════════
// toReportRows — 8 tests
// ════════════════════════════════════════════════════════════════════════════

describe("toReportRows", () => {
  it("transforma una lista de orders en filas de reporte", () => {
    const rows = toReportRows([ORDER_PENDING, ORDER_IN_PREP]);

    expect(rows).toHaveLength(2);

    expect(rows[0]).toEqual({
      id: "order-001",
      tableId: 3,
      status: "PENDING",
      statusLabel: "Pendiente",
      itemCount: 3, // quantity 2 + quantity 1
      createdAt: expect.any(String),
    });

    expect(rows[1]).toEqual({
      id: "order-002",
      tableId: 7,
      status: "IN_PREPARATION",
      statusLabel: "En preparacion",
      itemCount: 3,
      createdAt: expect.any(String),
    });
  });

  it("devuelve array vacío si recibe lista vacía", () => {
    expect(toReportRows([])).toEqual([]);
  });

  it("suma quantities de items (no cuenta items)", () => {
    const rows = toReportRows([ORDER_PENDING]);
    // ORDER_PENDING tiene 2 items: quantity 2 + quantity 1 = 3 total
    expect(rows[0].itemCount).toBe(3);
  });

  it("maneja orders sin items (items vacíos)", () => {
    const rows = toReportRows([ORDER_READY]);
    expect(rows[0].itemCount).toBe(0);
  });

  it("maneja order sin createdAt", () => {
    const rows = toReportRows([ORDER_NO_DATE]);
    expect(rows[0].createdAt).toBe("—");
  });

  it("mapea correctamente los status labels", () => {
    const rows = toReportRows([ORDER_PENDING, ORDER_IN_PREP, ORDER_READY]);
    expect(rows[0].statusLabel).toBe("Pendiente");
    expect(rows[1].statusLabel).toBe("En preparacion");
    expect(rows[2].statusLabel).toBe("Listo");
  });

  it("preserva el id y tableId originales", () => {
    const rows = toReportRows([ORDER_IN_PREP]);
    expect(rows[0].id).toBe("order-002");
    expect(rows[0].tableId).toBe(7);
  });

  it("maneja lista con un solo order", () => {
    const rows = toReportRows([ORDER_READY]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("order-003");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// formatReportDate — 6 tests
// ════════════════════════════════════════════════════════════════════════════

describe("formatReportDate", () => {
  it('devuelve "—" si el input es undefined', () => {
    expect(formatReportDate(undefined)).toBe("—");
  });

  it('devuelve "—" si el input es string vacío', () => {
    expect(formatReportDate("")).toBe("—");
  });

  it("formatea una fecha ISO válida como locale string", () => {
    const result = formatReportDate("2026-02-19T10:30:00Z");
    // Debe contener al menos el año y no ser el placeholder
    expect(result).not.toBe("—");
    expect(result).toContain("2026");
  });

  it("devuelve el string original si no es parseable", () => {
    expect(formatReportDate("not-a-date")).toBe("not-a-date");
  });

  it("maneja fecha con timezone Z", () => {
    const result = formatReportDate("2026-02-19T10:30:00Z");
    expect(result).not.toBe("—");
    expect(typeof result).toBe("string");
  });

  it("maneja fecha sin timezone", () => {
    const result = formatReportDate("2026-02-19T10:30:00");
    expect(result).not.toBe("—");
    expect(typeof result).toBe("string");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// countOrdersByStatus — 5 tests
// ════════════════════════════════════════════════════════════════════════════

describe("countOrdersByStatus", () => {
  it("cuenta correctamente por cada status", () => {
    const counts = countOrdersByStatus([
      ORDER_PENDING,
      ORDER_IN_PREP,
      ORDER_READY,
      ORDER_NO_DATE, // PENDING también
    ]);

    expect(counts).toEqual({
      PENDING: 2,
      IN_PREPARATION: 1,
      READY: 1,
    });
  });

  it("devuelve todos los contadores en 0 para lista vacía", () => {
    const counts = countOrdersByStatus([]);

    expect(counts).toEqual({
      PENDING: 0,
      IN_PREPARATION: 0,
      READY: 0,
    });
  });

  it("cuenta un solo status correctamente", () => {
    const counts = countOrdersByStatus([ORDER_READY, ORDER_READY]);

    expect(counts.READY).toBe(2);
    expect(counts.PENDING).toBe(0);
    expect(counts.IN_PREPARATION).toBe(0);
  });

  it("acumula correctamente múltiples orders del mismo status", () => {
    const counts = countOrdersByStatus([
      ORDER_PENDING,
      ORDER_NO_DATE, // Ambos PENDING
    ]);

    expect(counts.PENDING).toBe(2);
  });

  it("devuelve todos los status válidos en el resultado", () => {
    const counts = countOrdersByStatus([ORDER_PENDING]);

    expect(counts).toHaveProperty("PENDING");
    expect(counts).toHaveProperty("IN_PREPARATION");
    expect(counts).toHaveProperty("READY");
  });
});
