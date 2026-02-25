import { useCallback, useState } from "react";
import type { ReportResponse } from "@/api/contracts";
import { OrdersReportFacade } from "@/pages/reports/OrdersReportFacade";

/**
 * Interfaz del controlador de reportes agregados con fechas.
 */
export interface ReportController {
  /** Estado de carga */
  loading: boolean;
  /** Reporte agregado (null si no se ha cargado) */
  report: ReportResponse | null;
  /** Mensaje de error (vacío si no hay error) */
  error: string;
  /** Función para cargar reporte por rango de fechas */
  fetchReport: (startDate: string, endDate: string) => Promise<void>;
}

/**
 * Hook que gestiona el estado de reportes agregados por fecha.
 * 
 * @returns Controlador con estado y acciones para reportes
 */
export function useReportController(facade: OrdersReportFacade): ReportController {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchReport = useCallback(
    async (startDate: string, endDate: string) => {
      setLoading(true);
      setError("");

      try {
        const data = await facade.fetchReport(startDate, endDate);
        setReport(data);
        setError("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "No pudimos cargar el reporte";
        setError(msg);
        setReport(null);
      } finally {
        setLoading(false);
      }
    },
    [facade]
  );

  return {
    loading,
    report,
    error,
    fetchReport,
  };
}
