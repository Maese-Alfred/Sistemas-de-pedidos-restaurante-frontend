import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrdersReportFacade } from "@/pages/reports/OrdersReportFacade";
import * as ordersApi from "@/api/orders";
import * as reportsApi from "@/api/reports";
import type { Order, ReportResponse } from "@/api/contracts";

// Mock del API
vi.mock("@/api/orders", () => ({
  listOrders: vi.fn(),
}));

vi.mock("@/api/reports", () => ({
  getReport: vi.fn(),
}));

// ════════════════════════════════════════════════════════════════════════════
// Fixtures
// ════════════════════════════════════════════════════════════════════════════

const MOCK_ORDERS: Order[] = [
  {
    id: "order-001",
    tableId: 3,
    status: "PENDING",
    items: [{ productId: 1, quantity: 2, name: "Empanadas" }],
    createdAt: "2026-02-19T10:00:00Z",
  },
];

const MOCK_REPORT: ReportResponse = {
  totalReadyOrders: 15,
  totalRevenue: 32000,
  productBreakdown: [
    {
      productId: 1,
      productName: "Empanadas criollas",
      quantitySold: 30,
      totalAccumulated: 13500,
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

describe("OrdersReportFacade", () => {
  let facade: OrdersReportFacade;

  beforeEach(() => {
    vi.clearAllMocks();
    facade = new OrdersReportFacade();
  });

  describe("fetchAllOrders", () => {
    it("fetchAllOrders() retorna orders desde el API", async () => {
      vi.mocked(ordersApi.listOrders).mockResolvedValue(MOCK_ORDERS);

      const result = await facade.fetchAllOrders();

      expect(result).toEqual(MOCK_ORDERS);
      expect(ordersApi.listOrders).toHaveBeenCalledWith({});
    });

    it("fetchAllOrders() propaga errores del API", async () => {
      const errorMsg = "API error";
      vi.mocked(ordersApi.listOrders).mockRejectedValue(new Error(errorMsg));

      await expect(facade.fetchAllOrders()).rejects.toThrow(errorMsg);
    });

    it("fetchAllOrders() retorna array vacío sin lanzar error", async () => {
      vi.mocked(ordersApi.listOrders).mockResolvedValue([]);

      const result = await facade.fetchAllOrders();

      expect(result).toEqual([]);
    });
  });

  describe("fetchReport", () => {
    it("fetchReport() llama a getReport con fechas correctas", async () => {
      vi.mocked(reportsApi.getReport).mockResolvedValue(MOCK_REPORT);

      const result = await facade.fetchReport("2026-02-01", "2026-02-28");

      expect(result).toEqual(MOCK_REPORT);
      expect(reportsApi.getReport).toHaveBeenCalledWith("2026-02-01", "2026-02-28");
    });

    it("fetchReport() propaga error de validación de fechas", async () => {
      const errorMsg = "La fecha inicial debe ser menor o igual a la fecha final";
      vi.mocked(reportsApi.getReport).mockRejectedValue(new Error(errorMsg));

      await expect(facade.fetchReport("2026-03-01", "2026-02-01")).rejects.toThrow(
        errorMsg
      );
    });

    it("fetchReport() propaga errores del backend", async () => {
      const errorMsg = "Rango de fechas inválido";
      vi.mocked(reportsApi.getReport).mockRejectedValue(new Error(errorMsg));

      await expect(facade.fetchReport("2026-02-01", "2026-02-28")).rejects.toThrow(
        errorMsg
      );
    });
  });
});

