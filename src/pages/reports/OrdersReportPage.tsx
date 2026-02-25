import { Link } from "react-router-dom";
import { FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useOrdersReportController } from "@/pages/reports/useOrdersReportController";
import { toReportRows } from "@/domain/reportHelpers";

/**
 * Página de reporte de órdenes.
 * Muestra todas las órdenes en formato de tabla.
 */
export function OrdersReportPage() {
  const { initialLoading, orders, error, reload } = useOrdersReportController();

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="page-wrap py-20">
          <Loading label="Cargando reporte de órdenes..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="glass-topbar">
          <div className="page-wrap py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-accent p-2 text-accent-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-medium">Reporte de Órdenes</h1>
                  <p className="text-sm text-muted-foreground">Historial completo de pedidos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link to="/kitchen/board">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a Cocina
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="page-wrap py-6">
          <ErrorState title="Error al cargar órdenes" detail={error} onRetry={reload} />
        </main>
      </div>
    );
  }

  const rows = toReportRows(orders);

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-topbar">
        <div className="page-wrap py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent p-2 text-accent-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-medium">Reporte de Órdenes</h1>
                <p className="text-sm text-muted-foreground">
                  {orders.length} orden{orders.length !== 1 ? 'es' : ''} registrada{orders.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={reload}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualizar
              </Button>
              <Link to="/kitchen/board">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver a Cocina
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="page-wrap py-6">
        {orders.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No hay órdenes para mostrar
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-semibold">ID Orden</th>
                    <th className="p-3 text-left text-sm font-semibold">Mesa</th>
                    <th className="p-3 text-left text-sm font-semibold">Estado</th>
                    <th className="p-3 text-left text-sm font-semibold">Items</th>
                    <th className="p-3 text-left text-sm font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 text-sm font-mono">{row.id}</td>
                      <td className="p-3 text-sm">{row.tableId}</td>
                      <td className="p-3 text-sm">
                        <Badge>{row.statusLabel}</Badge>
                      </td>
                      <td className="p-3 text-sm">{row.itemCount}</td>
                      <td className="p-3 text-sm">{row.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
