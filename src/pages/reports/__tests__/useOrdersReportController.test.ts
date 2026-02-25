import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOrdersReportController } from "@/pages/reports/useOrdersReportController";
import * as ordersApi from "@/api/orders";
import type { Order } from "@/api/contracts";

// Mock del API
vi.mock("@/api/orders", () => ({
  listOrders: vi.fn(),
}));

// ════════════════════════════════════════════════════════════════════════════
// Fixtures
// ════════════════════════════════════════════════════════════════════════════

const MOCK_ORDERS: Order[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    tableId: 3,
    status: "PENDING",
    items: [
      {
        id: 1,
        productId: 1,
        productName: "Empanadas criollas",
        quantity: 2,
        note: "Sin cebolla",
      },
    ],
    createdAt: "2026-02-19T10:00:00Z",
    updatedAt: "2026-02-19T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    tableId: 7,
    status: "IN_PREPARATION",
    items: [
      {
        id: 2,
        productId: 5,
        productName: "Bife de chorizo",
        quantity: 1,
      },
    ],
    createdAt: "2026-02-19T11:00:00Z",
    updatedAt: "2026-02-19T11:00:00Z",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

describe("useOrdersReportController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("inicia en estado de carga (initialLoading=true)", () => {
    vi.mocked(ordersApi.listOrders).mockImplementation(
      () => new Promise(() => {}) // Promise que nunca resuelve
    );

    const { result } = renderHook(() => useOrdersReportController());

    expect(result.current.initialLoading).toBe(true);
    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("carga orders exitosamente (estado success)", async () => {
    vi.mocked(ordersApi.listOrders).mockResolvedValue(MOCK_ORDERS);

    const { result } = renderHook(() => useOrdersReportController());

    await waitFor(() => {
      expect(result.current.initialLoading).toBe(false);
    });

    expect(result.current.orders).toEqual(MOCK_ORDERS);
    expect(result.current.error).toBe("");
  });

  it("maneja errores correctamente (estado error)", async () => {
    const errorMsg = "Network error";
    vi.mocked(ordersApi.listOrders).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useOrdersReportController());

    await waitFor(() => {
      expect(result.current.initialLoading).toBe(false);
    });

    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toContain(errorMsg);
  });

  it("estado empty cuando no hay orders", async () => {
    vi.mocked(ordersApi.listOrders).mockResolvedValue([]);

    const { result } = renderHook(() => useOrdersReportController());

    await waitFor(() => {
      expect(result.current.initialLoading).toBe(false);
    });

    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("llama a listOrders sin filtro de status", async () => {
    vi.mocked(ordersApi.listOrders).mockResolvedValue(MOCK_ORDERS);

    renderHook(() => useOrdersReportController());

    await waitFor(() => {
      expect(ordersApi.listOrders).toHaveBeenCalledWith({});
    });
  });

  it("permite refrescar los datos con reload()", async () => {
    vi.mocked(ordersApi.listOrders).mockResolvedValue(MOCK_ORDERS);

    const { result } = renderHook(() => useOrdersReportController());

    await waitFor(() => {
      expect(result.current.initialLoading).toBe(false);
    });

    // Refrescar
    vi.mocked(ordersApi.listOrders).mockClear();
    result.current.reload();

    await waitFor(() => {
      expect(ordersApi.listOrders).toHaveBeenCalledTimes(1);
    });
  });
});
