import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReportController } from "@/pages/reports/useReportController";
import { OrdersReportFacade } from "@/pages/reports/OrdersReportFacade";
import type { ReportResponse } from "@/api/contracts";

// ════════════════════════════════════════════════════════════════════════════
// Fixtures
// ════════════════════════════════════════════════════════════════════════════

const MOCK_REPORT: ReportResponse = {
  totalReadyOrders: 20,
  totalRevenue: 50000,
  productBreakdown: [
    {
      productId: 1,
      productName: "Empanadas criollas",
      quantitySold: 40,
      totalAccumulated: 18000,
    },
    {
      productId: 5,
      productName: "Bife de chorizo",
      quantitySold: 15,
      totalAccumulated: 27750,
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

describe("useReportController", () => {
  let mockFacade: OrdersReportFacade;

  beforeEach(() => {
    mockFacade = new OrdersReportFacade();
    vi.clearAllMocks();
  });

  it("inicia con estado vacío (report=null, loading=false)", () => {
    const { result } = renderHook(() => useReportController(mockFacade));

    expect(result.current.report).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("carga reporte exitosamente cuando se llama fetchReport", async () => {
    vi.spyOn(mockFacade, "fetchReport").mockResolvedValue(MOCK_REPORT);

    const { result } = renderHook(() => useReportController(mockFacade));

    await act(async () => {
      await result.current.fetchReport("2026-02-01", "2026-02-28");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toEqual(MOCK_REPORT);
    expect(result.current.error).toBe("");
  });

  it("muestra loading=true durante la carga", async () => {
    let resolvePromise: (value: ReportResponse) => void;
    const promise = new Promise<ReportResponse>((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(mockFacade, "fetchReport").mockReturnValue(promise);

    const { result } = renderHook(() => useReportController(mockFacade));

    act(() => {
      result.current.fetchReport("2026-02-01", "2026-02-28");
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!(MOCK_REPORT);
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it("maneja errores de validación de fechas", async () => {
    const errorMsg = "La fecha inicial debe ser menor o igual a la fecha final";
    vi.spyOn(mockFacade, "fetchReport").mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useReportController(mockFacade));

    await act(async () => {
      await result.current.fetchReport("2026-03-01", "2026-02-01");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
    expect(result.current.error).toContain(errorMsg);
  });

  it("maneja errores del backend (400)", async () => {
    const errorMsg = "Rango de fechas inválido";
    vi.spyOn(mockFacade, "fetchReport").mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useReportController(mockFacade));

    await act(async () => {
      await result.current.fetchReport("2026-02-01", "2026-02-28");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBe(errorMsg);
  });

  it("limpia error anterior cuando se hace una nueva petición exitosa", async () => {
    vi.spyOn(mockFacade, "fetchReport")
      .mockRejectedValueOnce(new Error("Error temporal"))
      .mockResolvedValueOnce(MOCK_REPORT);

    const { result } = renderHook(() => useReportController(mockFacade));

    // Primera llamada con error
    await act(async () => {
      await result.current.fetchReport("2026-02-01", "2026-02-28");
    });
    expect(result.current.error).toBe("Error temporal");

    // Segunda llamada exitosa
    await act(async () => {
      await result.current.fetchReport("2026-02-01", "2026-02-28");
    });

    expect(result.current.error).toBe("");
    expect(result.current.report).toEqual(MOCK_REPORT);
  });
});
