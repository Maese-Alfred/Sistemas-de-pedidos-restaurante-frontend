import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { OrdersReportPage } from "@/pages/reports/OrdersReportPage";
import * as controllerModule from "@/pages/reports/useOrdersReportController";
import type { Order } from "@/api/contracts";
import type { OrdersReportController } from "@/pages/reports/useOrdersReportController";

// Mock del hook
vi.mock("@/pages/reports/useOrdersReportController", () => ({
  useOrdersReportController: vi.fn(),
}));

// Mock de react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock de ThemeToggle
vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div>Theme Toggle</div>,
}));

// ════════════════════════════════════════════════════════════════════════════
// Fixtures
// ════════════════════════════════════════════════════════════════════════════

const MOCK_ORDERS: Order[] = [
  {
    id: "order-001",
    tableId: 3,
    status: "PENDING",
    items: [
      { productId: 1, quantity: 2, name: "Empanadas" },
      { productId: 2, quantity: 1, name: "Café" },
    ],
    createdAt: "2026-02-19T10:00:00Z",
  },
  {
    id: "order-002",
    tableId: 7,
    status: "IN_PREPARATION",
    items: [{ productId: 5, quantity: 1, name: "Bife" }],
    createdAt: "2026-02-19T11:30:00Z",
  },
  {
    id: "order-003",
    tableId: 12,
    status: "READY",
    items: [{ productId: 3, quantity: 4, name: "Milanesa" }],
    createdAt: "2026-02-19T09:15:00Z",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

describe("OrdersReportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra loading state durante carga inicial", () => {
    const mockController: OrdersReportController = {
      initialLoading: true,
      orders: [],
      error: "",
      reload: vi.fn(),
    };
    vi.mocked(controllerModule.useOrdersReportController).mockReturnValue(mockController);

    render(<OrdersReportPage />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("muestra error state con mensaje y botón reload", async () => {
    const user = userEvent.setup();
    const mockReload = vi.fn();
    const mockController: OrdersReportController = {
      initialLoading: false,
      orders: [],
      error: "Network error",
      reload: mockReload,
    };
    vi.mocked(controllerModule.useOrdersReportController).mockReturnValue(mockController);

    render(<OrdersReportPage />);

    expect(screen.getByText("Error al cargar órdenes")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();

    const reloadButton = screen.getByRole("button", { name: /reintentar/i });
    await user.click(reloadButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("renderiza botón de actualizar en página con datos", async () => {
    const user = userEvent.setup();
    const mockReload = vi.fn();
    const mockController: OrdersReportController = {
      initialLoading: false,
      orders: MOCK_ORDERS,
      error: "",
      reload: mockReload,
    };
    vi.mocked(controllerModule.useOrdersReportController).mockReturnValue(mockController);

    render(<OrdersReportPage />);

    const updateButton = screen.getByRole("button", { name: /actualizar/i });
    await user.click(updateButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("muestra mensaje cuando no hay órdenes", () => {
    const mockController: OrdersReportController = {
      initialLoading: false,
      orders: [],
      error: "",
      reload: vi.fn(),
    };
    vi.mocked(controllerModule.useOrdersReportController).mockReturnValue(mockController);

    render(<OrdersReportPage />);

    expect(screen.getByText(/no hay órdenes/i)).toBeInTheDocument();
  });

  it("renderiza la tabla con encabezados correctos", () => {
    const mockController: OrdersReportController = {
      initialLoading: false,
      orders: MOCK_ORDERS,
      error: "",
      reload: vi.fn(),
    };
    vi.mocked(controllerModule.useOrdersReportController).mockReturnValue(mockController);

    render(<OrdersReportPage />);

    // Verificar encabezados
    expect(screen.getByText("ID Orden")).toBeInTheDocument();
    expect(screen.getByText("Mesa")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Fecha")).toBeInTheDocument();
  });

  it("renderiza todas las filas de órdenes con datos correctos", () => {
    const mockController: OrdersReportController = {
      initialLoading: false,
      orders: MOCK_ORDERS,
      error: "",
      reload: vi.fn(),
    };
    vi.mocked(controllerModule.useOrdersReportController).mockReturnValue(mockController);

    render(<OrdersReportPage />);

    // Verificar IDs de órdenes
    expect(screen.getByText("order-001")).toBeInTheDocument();
    expect(screen.getByText("order-002")).toBeInTheDocument();
    expect(screen.getByText("order-003")).toBeInTheDocument();

    // Verificar badges de estado
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("En preparacion")).toBeInTheDocument();
    expect(screen.getByText("Listo")).toBeInTheDocument();

    // Verificar que hay 3 filas de datos (excluyendo header)
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // 1 header + 3 data rows
  });

  it("renderiza el título de la sección", () => {
    const mockController: OrdersReportController = {
      initialLoading: false,
      orders: MOCK_ORDERS,
      error: "",
      reload: vi.fn(),
    };
    vi.mocked(controllerModule.useOrdersReportController).mockReturnValue(mockController);

    render(<OrdersReportPage />);

    expect(screen.getByText("Reporte de Órdenes")).toBeInTheDocument();
  });
});
