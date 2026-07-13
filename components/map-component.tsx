'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // مختصات بندرعباس
      const bandarAbbasCenter: [number, number] = [27.208223, 56.302951]

      // ایجاد نقشه
      const map = L.map(mapRef.current).setView(bandarAbbasCenter, 13)
      mapInstanceRef.current = map

      // اضافه کردن لایه نقشه
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // اضافه کردن مارکر برای بندرعباس
      const marker = L.marker(bandarAbbasCenter).addTo(map)
      marker.bindPopup('<b>دفتر آهن هرمز</b>').openPopup()

      // تنظیم محدوده نمایش روی بندرعباس
      map.setView(bandarAbbasCenter, 13)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    />
  )
}
