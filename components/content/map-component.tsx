'use client'

import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'

const CENTER: [number, number] = [27.208223, 56.302951]
const ZOOM = 14
// OSM's own tiles need no key, only the attribution (CARTO's now return an
// "API key required" image)
const OSM_TILES = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

export default function MapComponent() {
  return (
    <div
      aria-label='Map showing Hormoz Steel location in Bandar Abbas'
      className='h-full w-full'
      role='region'
    >
      <MapContainer center={CENTER} className='h-full w-full' zoom={ZOOM}>
        <TileLayer
          attribution={OSM_TILES.attribution}
          className='map-tiles'
          maxZoom={19}
          url={OSM_TILES.url}
        />
        <CircleMarker
          center={CENTER}
          pathOptions={{
            color: '#92400e',
            fillColor: '#d97706',
            fillOpacity: 0.9,
            weight: 2,
          }}
          radius={10}
        >
          <Popup>
            <strong>Hormoz Steel</strong>
            <br />
            Bandar Abbas
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  )
}
