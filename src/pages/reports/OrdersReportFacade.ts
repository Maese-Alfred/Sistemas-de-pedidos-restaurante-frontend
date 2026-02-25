import type { Order, ReportResponse } from "@/api/contracts";
import { listOrders } from "@/api/orders";
import { getReport } from "@/api/reports";

/**
 * Facade para el reporte de órdenes.
 * Orquesta la carga de órdenes individuales o reportes agregados.
 */
export class OrdersReportFacade {
  /**
   * Carga todas las órdenes desde el API.
   * @returns Promise con array de órdenes (puede ser vacío)
   * @throws Error si falla la llamada al API
   */
  async fetchAllOrders(): Promise<Order[]> {
    return await listOrders({});
  }

  /**
   * Obtiene reporte agregado por rango de fechas.
   * @param startDate - Fecha inicial en formato YYYY-MM-DD
   * @param endDate - Fecha final en formato YYYY-MM-DD
   * @returns Promise con ReportResponse
   * @throws Error si el rango es inválido o falla la llamada
   */
  async fetchReport(startDate: string, endDate: string): Promise<ReportResponse> {
    return await getReport(startDate, endDate);
  }
}

