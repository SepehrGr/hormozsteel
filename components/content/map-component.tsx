'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default markers under bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const CENTER: [number, number] = [27.208223, 56.302951]
const ZOOM = 14

/**
 * Colorful street basemap (Carto Voyager) — greens, water, road hierarchy
 * similar to Google Maps light, not greyscale “positron/dark matter”.
 */
const VOYAGER_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

function resolveMapMode(
  theme: string | undefined,
  systemTheme: string | undefined,
) {
  const active = theme === 'system' ? systemTheme : theme
  return active === 'dark' ? 'dark' : 'light'
}

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const { theme, systemTheme, resolvedTheme } = useTheme()

  const mode = resolveMapMode(theme, resolvedTheme ?? systemTheme)

  // Create map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(CENTER, ZOOM)

    mapInstanceRef.current = map

    const tiles = L.tileLayer(VOYAGER_TILES.url, {
      attribution: VOYAGER_TILES.attribution,
      maxZoom: 19,
      subdomains: 'abcd',
      className: mode === 'dark' ? 'map-tiles-dark' : 'map-tiles-light',
    }).addTo(map)
    tileLayerRef.current = tiles

    L.marker(CENTER)
      .addTo(map)
      .bindPopup('<b>Hormoz Steel</b><br/>Bandar Abbas')

    requestAnimationFrame(() => {
      map.invalidateSize()
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
      tileLayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once; theme handled below
  }, [])

  // Keep tiles colorful; only adjust dark treatment + map chrome
  useEffect(() => {
    const map = mapInstanceRef.current
    const layer = tileLayerRef.current
    if (!map || !layer) return

    const container = layer.getContainer()
    if (container) {
      container.classList.remove('map-tiles-light', 'map-tiles-dark')
      container.classList.add(
        mode === 'dark' ? 'map-tiles-dark' : 'map-tiles-light',
      )
    }

    // Google-ish canvas under tiles while loading
    const el = map.getContainer()
    el.style.background = mode === 'dark' ? '#1d2c3d' : '#e5e3df'

    map.invalidateSize()
  }, [mode])

  return (
    <div
      ref={mapRef}
      className='h-full w-full [&_.leaflet-control-attribution]:bg-card/90 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-muted-foreground [&_.leaflet-control-zoom]:border-border [&_.leaflet-control-zoom]:shadow-none [&_.leaflet-bar_a]:border-border [&_.leaflet-bar_a]:bg-card [&_.leaflet-bar_a]:text-foreground [&_.leaflet-bar_a:hover]:bg-muted'
      role='img'
      aria-label='Map showing Hormoz Steel location in Bandar Abbas'
    />
  )
}
