import { useEffect, useMemo, useState } from 'react'

type ProductImageProps = {
  src?: string
  alt: string
  className?: string
  category?: string
}

type Palette = {
  from: string
  to: string
  text: string
}

const DEFAULT_PALETTE: Palette = { from: '#3a3a3a', to: '#242424', text: '#f3f3f3' }

const CATEGORY_PALETTES: Record<string, Palette> = {
  entradas: { from: '#6b4e3d', to: '#2e231d', text: '#fff6ef' },
  principales: { from: '#a63f27', to: '#3a2018', text: '#fff3ec' },
  postres: { from: '#76506a', to: '#2f1f2a', text: '#fff2fb' },
  bebidas: { from: '#2f5f6a', to: '#1e2f33', text: '#effbff' },
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function initials(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

function fallbackDataUri(label: string, category?: string) {
  const palette = CATEGORY_PALETTES[(category ?? '').toLowerCase()] ?? DEFAULT_PALETTE
  const monogram = escapeXml(initials(label) || 'OK')
  const safeLabel = escapeXml(label.slice(0, 26))

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="${safeLabel}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.from}"/>
      <stop offset="100%" stop-color="${palette.to}"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" fill="url(#g)"/>
  <circle cx="160" cy="124" r="60" fill="rgba(255,255,255,0.14)"/>
  <text x="160" y="142" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="42" fill="${palette.text}" font-weight="700">${monogram}</text>
  <text x="160" y="250" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" fill="${palette.text}" opacity="0.95">${safeLabel}</text>
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function ProductImage({ src, alt, className, category }: ProductImageProps) {
  const fallback = useMemo(() => fallbackDataUri(alt, category), [alt, category])
  const [resolvedSrc, setResolvedSrc] = useState(src || fallback)

  useEffect(() => {
    setResolvedSrc(src || fallback)
  }, [src, fallback])

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (resolvedSrc !== fallback) setResolvedSrc(fallback)
      }}
    />
  )
}
