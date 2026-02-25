import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Order } from "@/api/contracts";
import { OrdersReportFacade } from "@/pages/reports/OrdersReportFacade";

/**
 * Interfaz del controlador del reporte de órdenes.
 */
export interface OrdersReportController {
  /** Estado de carga inicial */
  initialLoading: boolean;
  /** Array de órdenes cargadas */
  orders: Order[];
  /** Mensaje de error (vacío si no hay error) */
  error: string;
  /** Función para recargar las órdenes manualmente */
  reload: () => void;
}

/**
 * Hook que gestiona el estado del reporte de órdenes.
 * Sigue el patrón Facade + Hook usado en KitchenBoard.
 * 
 * @returns Controlador con estado y acciones para el reporte
 */
export function useOrdersReportController(): OrdersReportController {
  const facade = useMemo(() => new OrdersReportFacade(), []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const mountedRef = useRef(false);

  const loadOrders = useCallback(async () => {
    setInitialLoading(true);
    setError("");

    try {
      const data = await facade.fetchAllOrders();
      if (!mountedRef.current) return;
      setOrders(data);
      setError("");
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "No pudimos cargar las órdenes";
      setError(msg);
      setOrders([]);
    } finally {
      if (mountedRef.current) {
        setInitialLoading(false);
      }
    }
  }, [facade]);

  const reload = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    mountedRef.current = true;
    loadOrders();
    return () => {
      mountedRef.current = false;
    };
  }, [loadOrders]);

  return {
    initialLoading,
    orders,
    error,
    reload,
  };
}
