'use client'

import { useEffect, useState, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ===== ícones padronizados =====
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})
// ================================

type Posto = {
  id: number
  nome: string
  endereco: string
  latitude: number
  longitude: number
  preco_gasolina: number | null
  preco_etanol: number | null
  preco_diesel: number | null
  atualizado_em: string
}

type Props = {
  postos: Posto[]
  userPosition: { lat: number; lon: number } | null
  suggestedPosto: Posto | null
}

function RouteAnimator({
  route,
  suggestedPosto,
}: {
  route: LatLngExpression[]
  suggestedPosto: Posto | null
}) {
  const map = useMap()

  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route)
      map.fitBounds(bounds, { padding: [50, 50], animate: true })
    }
  }, [route, map])

  useEffect(() => {
    if (suggestedPosto) {
      map.flyTo(
        [suggestedPosto.latitude, suggestedPosto.longitude],
        14,
        { duration: 1.5 }
      )
    }
  }, [suggestedPosto, map])

  return null
}

function PopupOpener({
  suggestedRef,
  userRef,
  suggestedPosto,
  userPosition,
}: {
  suggestedRef: React.RefObject<any>
  userRef: React.RefObject<any>
  suggestedPosto: Posto | null
  userPosition: { lat: number; lon: number } | null
}) {
  useEffect(() => {
    if (userPosition && userRef.current) {
      userRef.current.openPopup()
    }
    if (suggestedPosto && suggestedRef.current) {
      suggestedRef.current.openPopup()
    }
  }, [suggestedPosto, userPosition, suggestedRef, userRef])

  return null
}

export default function MapWithRoute({
  postos,
  userPosition,
  suggestedPosto,
}: Props) {
  const [route, setRoute] = useState<LatLngExpression[]>([])
  const suggestedRef = useRef<any>(null)
  const userRef = useRef<any>(null)

  useEffect(() => {
    if (userPosition && suggestedPosto) {
      const start = `${userPosition.lon},${userPosition.lat}`
      const end = `${suggestedPosto.longitude},${suggestedPosto.latitude}`
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${start};${end}?geometries=geojson`
      )
        .then(r => r.json())
        .then(json => {
          const coords = (json.routes[0].geometry.coordinates as [number, number][])
            .map(([lon, lat]) => [lat, lon] as LatLngExpression)
          setRoute(coords)
        })
    }
  }, [userPosition, suggestedPosto])

  const center: LatLngExpression = userPosition
    ? [userPosition.lat, userPosition.lon]
    : [-15.7801, -47.9292]

  return (
    <MapContainer
      center={center}
      zoom={userPosition ? 13 : 4}
      className="w-full h-[420px] rounded-3xl border-2 border-[#FFD200] shadow-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {postos.map(p => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          ref={p.id === suggestedPosto?.id ? suggestedRef : undefined}
        >
          <Popup autoClose={false} closeOnClick={false}>
            <div className="font-bold">{p.nome}</div>
            <div className="text-xs">{p.endereco}</div>
            <div className="text-sm">
              {(p.preco_gasolina ?? 0).toFixed(3)} R$
            </div>
          </Popup>
        </Marker>
      ))}

      {userPosition && (
        <Marker
          position={[userPosition.lat, userPosition.lon]}
          ref={userRef}
        >
          <Popup autoClose={false} closeOnClick={false}>
            Você está aqui
          </Popup>
        </Marker>
      )}

      {route.length > 0 && (
        <Polyline positions={route} weight={5} color="#D7263D" />
      )}

      <RouteAnimator route={route} suggestedPosto={suggestedPosto} />
      <PopupOpener
        suggestedRef={suggestedRef}
        userRef={userRef}
        suggestedPosto={suggestedPosto}
        userPosition={userPosition}
      />
    </MapContainer>
  )
}
