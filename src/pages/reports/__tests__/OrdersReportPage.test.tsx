import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { OrdersReportPage } from "@/pages/reports/OrdersReportPage";
import type { ReportResponse } from "@/api/contracts";
import type { ReportController } from "@/pages/reports/useReportController";

// ════════════════════════════════════════════════════════════════════════════
// Mocks
// ════════════════════════════════════════════════════════════════════════════

const mockUseReportController = vi.fn<() => ReportController>();

vi.mock("@/pages/reports/useReportController", () => ({
  useReportController: (...args: unknown[]) => mockUseReportController(),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// ════════════════════════════════════════════════════════════════════════════
// Fixtures
// ════════════════════════════════════════════════════════════════════════════

const MOCK_REPORT: ReportResponse = {
  totalReadyOrders: 15,
  totalRevenue: 450000,
  productBreakdown: [
    { productId: 1, productName: "Bandeja Paisa", quantitySold: 8, totalAccumulated: 240000 },
    { productId: 2, productName: "Arepas", quantitySold: 12, totalAccumulated: 120000 },
    { productId: 3, productName: "Empanadas", quantitySold: 20, totalAccumulated: 90000 },
  ],
};

const EMPTY_REPORT: ReportResponse = {
  totalReadyOrders: 0,
  totalRevenue: 0,
  productBreakdown: [],
};

function idleController(overrides: Partial<ReportController> = {}): ReportController {
  return {
    loading: false,
    report: null,
    error: "",
    fetchReport: vi.fn(),
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

describe("OrdersReportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders date inputs and generate button", () => {
    mockUseReportController.mockReturnValue(idleController());

    render(<OrdersReportPage />);

    expect(screen.getByLabelText(/fecha inicio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha fin/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generar reporte/i })).toBeInTheDocument();
  });

  it("calls fetchReport with selected dates when button clicked", async () => {
    const mockFetch = vi.fn();
    mockUseReportController.mockReturnValue(idleController({ fetchReport: mockFetch }));
    const user = userEvent.setup();

    render(<OrdersReportPage />);

    const startInput = screen.getByLabelText(/fecha inicio/i);
    const endInput = screen.getByLabelText(/fecha fin/i);

    await user.clear(startInput);
    await user.type(startInput, "2026-01-01");
    await user.clear(endInput);
    await user.type(endInput, "2026-01-31");

    await user.click(screen.getByRole("button", { name: /generar reporte/i }));

    expect(mockFetch).toHaveBeenCalledWith("2026-01-01", "2026-01-31");
  });

  it("shows loading state while fetching", () => {
    mockUseReportController.mockReturnValue(idleController({ loading: true }));

    render(<OrdersReportPage />);

    expect(screen.getByText(/generando reporte/i)).toBeInTheDocument();
  });

  it("shows error state with retry on failure", async () => {
    const mockFetch = vi.fn();
    mockUseReportController.mockReturnValue(
      idleController({ error: "Network error", fetchReport: mockFetch })
    );
    const user = userEvent.setup();

    render(<OrdersReportPage />);

    expect(screen.getByText("Error al generar reporte")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    await user.click(retryButton);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("shows revenue and order count KPIs after successful fetch", () => {
    mockUseReportController.mockReturnValue(
      idleController({ report: MOCK_REPORT })
    );

    render(<OrdersReportPage />);

    expect(screen.getByTestId("total-revenue").textContent).toMatch(/\$\s*450\.000/);
    expect(screen.getByTestId("total-orders")).toHaveTextContent("15");
    expect(screen.getByText(/ingresos totales/i)).toBeInTheDocument();
    expect(screen.getByText(/órdenes completadas/i)).toBeInTheDocument();
  });

  it("shows product breakdown table with correct data", () => {
    mockUseReportController.mockReturnValue(
      idleController({ report: MOCK_REPORT })
    );

    render(<OrdersReportPage />);

    // Headers
    expect(screen.getByText("Producto")).toBeInTheDocument();
    expect(screen.getByText("Cantidad Vendida")).toBeInTheDocument();
    expect(screen.getByText("Ingresos")).toBeInTheDocument();

    // Row data
    expect(screen.getByText("Bandeja Paisa")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText(/\$\s*240\.000/)).toBeInTheDocument();

    expect(screen.getByText("Arepas")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/\$\s*120\.000/)).toBeInTheDocument();

    expect(screen.getByText("Empanadas")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText(/\$\s*90\.000/)).toBeInTheDocument();

    // 1 header row + 3 data rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4);
  });

  it("shows empty state when productBreakdown is empty", () => {
    mockUseReportController.mockReturnValue(
      idleController({ report: EMPTY_REPORT })
    );

    render(<OrdersReportPage />);

    expect(screen.getByText(/no hay productos vendidos/i)).toBeInTheDocument();
  });

  it("formats currency correctly as Colombian Pesos", () => {
    const report: ReportResponse = {
      totalReadyOrders: 1,
      totalRevenue: 1234567,
      productBreakdown: [
        { productId: 1, productName: "Test", quantitySold: 1, totalAccumulated: 9876543 },
      ],
    };
    mockUseReportController.mockReturnValue(idleController({ report }));

    render(<OrdersReportPage />);

    // COP formatting: $ with dots as thousands separator, no decimals
    expect(screen.getByTestId("total-revenue").textContent).toMatch(/\$\s*1\.234\.567/);
    expect(screen.getByText(/\$\s*9\.876\.543/)).toBeInTheDocument();
  });

  it("renders page title and subtitle", () => {
    mockUseReportController.mockReturnValue(idleController());

    render(<OrdersReportPage />);

    expect(screen.getByText("Reporte de Ventas")).toBeInTheDocument();
    expect(screen.getByText(/resumen de ingresos/i)).toBeInTheDocument();
  });

  it("renders back to kitchen link", () => {
    mockUseReportController.mockReturnValue(idleController());

    render(<OrdersReportPage />);

    const link = screen.getByRole("link", { name: /volver a cocina/i });
    expect(link).toHaveAttribute("href", "/kitchen/board");
  });

  it("disables generate button while loading", () => {
    mockUseReportController.mockReturnValue(idleController({ loading: true }));

    render(<OrdersReportPage />);

    expect(screen.getByRole("button", { name: /generar reporte/i })).toBeDisabled();
  });
});
