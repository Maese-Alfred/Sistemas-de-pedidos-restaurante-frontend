import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, DollarSign, ShoppingBag } from "lucide-react";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useReportController } from "@/pages/reports/useReportController";
import { OrdersReportFacade } from "@/pages/reports/OrdersReportFacade";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Página de reporte de ventas.
 * Muestra ingresos totales, órdenes completadas y desglose por producto.
 */
export function OrdersReportPage() {
  const facade = useMemo(() => new OrdersReportFacade(), []);
  const { loading, report, error, fetchReport } = useReportController(facade);

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleGenerate = () => {
    if (startDate && endDate) {
      fetchReport(startDate, endDate);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-topbar">
        <div className="page-wrap py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent p-2 text-accent-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-medium">Reporte de Ventas</h1>
                <p className="text-sm text-muted-foreground">
                  Resumen de ingresos y productos vendidos
                </p>
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

      <main className="page-wrap py-6 space-y-6">
        {/* Date Range Picker */}
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                Fecha Inicio
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                Fecha Fin
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              Generar Reporte
            </Button>
          </div>
        </Card>

        {/* Loading */}
        {loading && <Loading label="Generando reporte..." />}

        {/* Error */}
        {error && (
          <ErrorState
            title="Error al generar reporte"
            detail={error}
            onRetry={handleGenerate}
          />
        )}

        {/* Report Results */}
        {report && !loading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-success/10 p-3">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                    <p className="text-2xl font-bold" data-testid="total-revenue">
                      {formatCurrency(report.totalRevenue)}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent/10 p-3">
                    <ShoppingBag className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Órdenes Completadas</p>
                    <p className="text-2xl font-bold" data-testid="total-orders">
                      {report.totalReadyOrders}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Product Breakdown */}
            {report.productBreakdown.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                No hay productos vendidos en este período
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left text-sm font-semibold">Producto</th>
                        <th className="p-3 text-left text-sm font-semibold">Cantidad Vendida</th>
                        <th className="p-3 text-left text-sm font-semibold">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.productBreakdown.map((product) => (
                        <tr
                          key={product.productId}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-3 text-sm">{product.productName}</td>
                          <td className="p-3 text-sm">{product.quantitySold}</td>
                          <td className="p-3 text-sm">
                            {formatCurrency(product.totalAccumulated)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
