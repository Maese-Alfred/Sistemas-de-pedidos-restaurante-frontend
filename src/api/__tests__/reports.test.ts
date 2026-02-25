import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getReport } from '@/api/reports'
import * as httpModule from '@/api/http'
import type { ReportResponse } from '@/api/contracts'

// Mock del módulo http
vi.mock('@/api/http', () => ({
  http: vi.fn(),
}))

// ════════════════════════════════════════════════════════════════════════════
// Fixtures
// ════════════════════════════════════════════════════════════════════════════

const MOCK_REPORT: ReportResponse = {
  totalReadyOrders: 10,
  totalRevenue: 25000,
  productBreakdown: [
    {
      productId: 1,
      productName: 'Empanadas criollas',
      quantitySold: 20,
      totalAccumulated: 9000,
    },
    {
      productId: 5,
      productName: 'Bife de chorizo',
      quantitySold: 8,
      totalAccumulated: 14800,
    },
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

describe('getReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama al endpoint /reports con query params correctos', async () => {
    vi.mocked(httpModule.http).mockResolvedValue(MOCK_REPORT)

    await getReport('2026-02-01', '2026-02-28')

    expect(httpModule.http).toHaveBeenCalledWith(
      '/reports?startDate=2026-02-01&endDate=2026-02-28',
      expect.objectContaining({
        baseUrl: expect.stringContaining('8082'),
      })
    )
  })

  it('retorna ReportResponse cuando la llamada es exitosa', async () => {
    vi.mocked(httpModule.http).mockResolvedValue(MOCK_REPORT)

    const result = await getReport('2026-02-01', '2026-02-28')

    expect(result).toEqual(MOCK_REPORT)
    expect(result.totalReadyOrders).toBe(10)
    expect(result.productBreakdown).toHaveLength(2)
  })

  it('lanza error si startDate > endDate', async () => {
    await expect(getReport('2026-02-28', '2026-02-01')).rejects.toThrow(
      'La fecha inicial debe ser menor o igual a la fecha final'
    )

    // No debe llamar al http si falla validación
    expect(httpModule.http).not.toHaveBeenCalled()
  })

  it('permite startDate === endDate (mismo día)', async () => {
    vi.mocked(httpModule.http).mockResolvedValue(MOCK_REPORT)

    await getReport('2026-02-15', '2026-02-15')

    expect(httpModule.http).toHaveBeenCalled()
  })

  it('maneja error 400 del backend correctamente', async () => {
    const error = new Error('HTTP 400 al llamar /reports')
    vi.mocked(httpModule.http).mockRejectedValue(error)

    await expect(getReport('2026-02-01', '2026-02-28')).rejects.toThrow(
      'Rango de fechas inválido'
    )
  })

  it('propaga otros errores sin modificar', async () => {
    const error = new Error('Network error')
    vi.mocked(httpModule.http).mockRejectedValue(error)

    await expect(getReport('2026-02-01', '2026-02-28')).rejects.toThrow('Network error')
  })
})
