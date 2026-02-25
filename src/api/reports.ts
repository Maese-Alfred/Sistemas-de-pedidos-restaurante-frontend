import { ENV } from '@/api/env'
import { http } from '@/api/http'
import type { ReportResponse } from '@/api/contracts'

/**
 * Obtiene reporte agregado de órdenes por rango de fechas.
 * 
 * @param startDate - Fecha inicial en formato YYYY-MM-DD
 * @param endDate - Fecha final en formato YYYY-MM-DD
 * @returns ReportResponse con totales y breakdown por producto
 * @throws Error si startDate > endDate o si el backend devuelve 400
 */
export async function getReport(startDate: string, endDate: string): Promise<ReportResponse> {
  // Validar que startDate <= endDate
  if (startDate > endDate) {
    throw new Error('La fecha inicial debe ser menor o igual a la fecha final')
  }

  const qs = new URLSearchParams()
  qs.set('startDate', startDate)
  qs.set('endDate', endDate)
  
  try {
    return await http<ReportResponse>(`/reports?${qs.toString()}`, { 
      baseUrl: ENV.REPORT_API_BASE_URL 
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('400')) {
      throw new Error('Rango de fechas inválido')
    }
    throw error
  }
}
