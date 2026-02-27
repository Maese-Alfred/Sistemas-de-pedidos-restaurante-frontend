import { describe, it, expect } from 'vitest'
import { ENV } from '@/api/env'

// ════════════════════════════════════════════════════════════════════════════
// TESTS: ENV Configuration
// ════════════════════════════════════════════════════════════════════════════

describe('ENV configuration', () => {
  describe('ENV.API_BASE_URL', () => {
    it('should have a default value', () => {
      expect(ENV.API_BASE_URL).toBeDefined()
      expect(typeof ENV.API_BASE_URL).toBe('string')
      expect(ENV.API_BASE_URL.length).toBeGreaterThan(0)
    })

    it('should contain http protocol', () => {
      expect(ENV.API_BASE_URL).toMatch(/^https?:\/\//)
    })

    it('should default to localhost:8080', () => {
      expect(ENV.API_BASE_URL).toBe('http://localhost:8080')
    })
  })

  describe('ENV.REPORT_API_BASE_URL', () => {
    it('should have a default value', () => {
      expect(ENV.REPORT_API_BASE_URL).toBeDefined()
      expect(typeof ENV.REPORT_API_BASE_URL).toBe('string')
    })

    it('should contain http protocol', () => {
      expect(ENV.REPORT_API_BASE_URL).toMatch(/^https?:\/\//)
    })

    it('should default to localhost:8082', () => {
      expect(ENV.REPORT_API_BASE_URL).toBe('http://localhost:8082')
    })
  })

  describe('ENV.USE_MOCK', () => {
    it('should be a boolean', () => {
      expect(typeof ENV.USE_MOCK).toBe('boolean')
    })

    it('should be a boolean value (may be true or false based on environment)', () => {
      expect(typeof ENV.USE_MOCK).toBe('boolean')
      // Note: ENV.USE_MOCK can be true or false depending on VITE_USE_MOCK env var
    })
  })

  describe('ENV.ALLOW_MOCK_FALLBACK', () => {
    it('should be a boolean', () => {
      expect(typeof ENV.ALLOW_MOCK_FALLBACK).toBe('boolean')
    })

    it('should default to false', () => {
      expect(ENV.ALLOW_MOCK_FALLBACK).toBe(false)
    })
  })

  describe('ENV.KITCHEN_TOKEN_HEADER', () => {
    it('should have a default value', () => {
      expect(ENV.KITCHEN_TOKEN_HEADER).toBeDefined()
      expect(typeof ENV.KITCHEN_TOKEN_HEADER).toBe('string')
    })

    it('should default to X-Kitchen-Token', () => {
      expect(ENV.KITCHEN_TOKEN_HEADER).toBe('X-Kitchen-Token')
    })

    it('should be a valid HTTP header name', () => {
      expect(ENV.KITCHEN_TOKEN_HEADER).toMatch(/^[A-Za-z][-A-Za-z0-9]*$/)
    })
  })

  describe('ENV.KITCHEN_PIN', () => {
    it('should have a default value', () => {
      expect(ENV.KITCHEN_PIN).toBeDefined()
      expect(typeof ENV.KITCHEN_PIN).toBe('string')
    })

    it('should default to cocina123', () => {
      expect(ENV.KITCHEN_PIN).toBe('cocina123')
    })

    it('should not be empty', () => {
      expect(ENV.KITCHEN_PIN.length).toBeGreaterThan(0)
    })
  })

  describe('ENV.KITCHEN_FIXED_TOKEN', () => {
    it('should be a string', () => {
      expect(typeof ENV.KITCHEN_FIXED_TOKEN).toBe('string')
    })

    it('should handle empty token', () => {
      expect(ENV.KITCHEN_FIXED_TOKEN).toBeDefined()
    })
  })

  describe('ENV object completeness', () => {
    it('should have all required properties', () => {
      const requiredProperties = [
        'API_BASE_URL',
        'REPORT_API_BASE_URL',
        'USE_MOCK',
        'ALLOW_MOCK_FALLBACK',
        'KITCHEN_TOKEN_HEADER',
        'KITCHEN_PIN',
        'KITCHEN_FIXED_TOKEN',
      ]

      for (const prop of requiredProperties) {
        expect(ENV).toHaveProperty(prop)
      }
    })

    it('should not change API_BASE_URL during test', () => {
      // Verify the value is consistent throughout the test
      const value1 = ENV.API_BASE_URL
      const value2 = ENV.API_BASE_URL
      
      expect(value1).toBe(value2)
    })
  })

  describe('ENV type safety', () => {
    it('should have correct types for all properties', () => {
      expect(typeof ENV.API_BASE_URL).toBe('string')
      expect(typeof ENV.REPORT_API_BASE_URL).toBe('string')
      expect(typeof ENV.USE_MOCK).toBe('boolean')
      expect(typeof ENV.ALLOW_MOCK_FALLBACK).toBe('boolean')
      expect(typeof ENV.KITCHEN_TOKEN_HEADER).toBe('string')
      expect(typeof ENV.KITCHEN_PIN).toBe('string')
      expect(typeof ENV.KITCHEN_FIXED_TOKEN).toBe('string')
    })

    it('API URLs should be non-empty strings', () => {
      expect(ENV.API_BASE_URL).toBeTruthy()
      expect(ENV.REPORT_API_BASE_URL).toBeTruthy()
    })

    it('token header should be non-empty string', () => {
      expect(ENV.KITCHEN_TOKEN_HEADER).toBeTruthy()
    })
  })

  describe('ENV consistency', () => {
    it('should have consistent format for API URLs', () => {
      const urlPattern = /^https?:\/\/.+/
      expect(ENV.API_BASE_URL).toMatch(urlPattern)
      expect(ENV.REPORT_API_BASE_URL).toMatch(urlPattern)
    })

    it('should have different API URLs', () => {
      expect(ENV.API_BASE_URL).not.toBe(ENV.REPORT_API_BASE_URL)
    })

    it('should use different ports for different services', () => {
      const apiPort = ENV.API_BASE_URL.match(/:(\d+)/)?.[1]
      const reportPort = ENV.REPORT_API_BASE_URL.match(/:(\d+)/)?.[1]
      expect(apiPort).not.toBe(reportPort)
    })
  })
})
