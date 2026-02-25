import type { Order, OrderStatus } from "@/api/contracts";
import { STATUS_LABEL } from "@/domain/orderStatus";

/**
 * Tipo de fila para el reporte de pedidos.
 */
export type OrderReportRow = {
  id: string;
  tableId: number;
  status: OrderStatus;
  statusLabel: string;
  itemCount: number;
  createdAt: string;
};

/**
 * Transforma una lista de orders en filas de reporte.
 * 
 * @param orders - Lista de pedidos
 * @returns Lista de filas con datos formateados para la tabla
 */
export function toReportRows(orders: Order[]): OrderReportRow[] {
  return orders.map((order) => ({
    id: order.id,
    tableId: order.tableId,
    status: order.status,
    statusLabel: STATUS_LABEL[order.status],
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: formatReportDate(order.createdAt),
  }));
}

/**
 * Formatea una fecha ISO para mostrar en el reporte.
 * Si la fecha es inválida o ausente, devuelve un placeholder.
 * 
 * @param isoDate - Fecha en formato ISO string o undefined
 * @returns Fecha formateada como string legible o "—"
 */
export function formatReportDate(isoDate: string | undefined): string {
  if (!isoDate || isoDate.trim() === "") {
    return "—";
  }

  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) {
    return isoDate; // Devuelve el string original si no es parseable
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Cuenta la cantidad de pedidos agrupados por status.
 * Siempre devuelve todos los status posibles, incluso si el conteo es 0.
 * 
 * @param orders - Lista de pedidos
 * @returns Objeto con contadores por cada status
 */
export function countOrdersByStatus(
  orders: Order[]
): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    PENDING: 0,
    IN_PREPARATION: 0,
    READY: 0,
  };

  for (const order of orders) {
    counts[order.status]++;
  }

  return counts;
}
