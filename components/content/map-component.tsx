'use client'

import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'

const CENTER: [number, number] = [27.208223, 56.302951]
const ZOOM = 14
const VOYAGER_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

export default function MapComponent() {
  return (
    <div
      className='h-full w-full'
      role='region'
      aria-label='Map showing Hormoz Steel location in Bandar Abbas'
    >
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        className='h-full w-full [&_.leaflet-control-attribution]:bg-card/90 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-muted-foreground [&_.leaflet-control-zoom]:border-border [&_.leaflet-control-zoom]:shadow-none [&_.leaflet-bar_a]:border-border [&_.leaflet-bar_a]:bg-card [&_.leaflet-bar_a]:text-foreground [&_.leaflet-bar_a:hover]:bg-muted'
      >
        <TileLayer
          attribution={VOYAGER_TILES.attribution}
          url={VOYAGER_TILES.url}
          maxZoom={19}
          subdomains='abcd'
          className='map-tiles'
        />
        <CircleMarker
          center={CENTER}
          radius={10}
          pathOptions={{
            color: '#92400e',
            fillColor: '#d97706',
            fillOpacity: 0.9,
            weight: 2,
          }}
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
