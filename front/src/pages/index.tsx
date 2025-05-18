'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Fuel, User } from 'lucide-react'

// Carrega o MapWithRoute somente no cliente
const MapWithRoute = dynamic(
  () => import('../components/MapWithRoute'),
  { ssr: false }
)

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

export default function Home() {
  const [tipo, setTipo] = useState<'gasolina' | 'etanol' | 'diesel'>('gasolina')
  const [postos, setPostos] = useState<Posto[]>([])
  const [melhorPosto, setMelhorPosto] = useState<Posto | null>(null)
  const [userPosition, setUserPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [loading, setLoading] = useState(false)

  // Busca todos os postos para o mapa e estatísticas
  const fetchPostos = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/postos')
      const data = await res.json()
      setPostos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Busca top 10 para a tabela
  const fetchTop10 = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/top10?tipo=${tipo}`)
      const data = await res.json()
      setPostos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Sugere o melhor posto perto do usuário e traça a rota
  const sugerirMelhorPosto = () => {
    if (!navigator.geolocation) {
      return alert('Geolocalização não suportada pelo navegador')
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords
        setUserPosition({ lat, lon })
        try {
          const res = await fetch(
            `http://localhost:5000/api/sugerir?lat=${lat}&lon=${lon}&tipo=${tipo}`
          )
          const data = await res.json()
          setMelhorPosto(data)
        } catch (err) {
          console.error(err)
        }
      },
      () => alert('Erro ao obter localização')
    )
  }

  useEffect(() => {
    fetchPostos()
  }, [])

  return (
    <div className="bg-[#19202C] min-h-screen flex">
      {/* Sidebar Minimal */}
      <aside className="flex flex-col items-center gap-4 bg-[#23272F] w-[90px] p-4 h-screen fixed top-0 left-0 z-30 text-white shadow-lg border-r-2 border-[#FFD200]">
        <div className="mt-2 mb-4">
          <Fuel size={32} className="text-[#D7263D]" />
        </div>
        <span className="font-extrabold text-[11px] text-center leading-4 text-white drop-shadow-sm">
          Postos<br />Inteligentes
        </span>
        <div className="flex-grow" />
        <div className="w-4 h-4 rounded-full bg-[#FFD200] mb-3 opacity-60" />
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-[90px] flex flex-col">
        {/* Header com usuário */}
        <header className="w-full flex justify-between items-center px-12 py-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Global View</h1>
          <Link href="/login">
            <button className="flex items-center gap-2 bg-[#23272F] hover:bg-[#FFD200]/90 text-white hover:text-[#23272F] rounded-full px-5 py-2 shadow-lg font-bold transition">
              <User size={20} className="text-[#FFD200]" />
              <span className="font-semibold">Login</span>
            </button>
          </Link>
        </header>

        {/* Conteúdo central */}
        <div className="flex-1 flex flex-col items-center px-2 md:px-10">
          {/* BOTÃO + MAPA */}
          <button
            onClick={sugerirMelhorPosto}
            className="bg-[#FFD200] text-[#D7263D] font-extrabold rounded-xl text-lg px-8 py-4 mt-6 shadow-md border-2 border-[#FFD200] hover:bg-[#ffe366] hover:text-[#23272F] transition"
            style={{ letterSpacing: 1 }}
          >
            Melhor Posto Perto de Mim
          </button>

          <div className="w-full max-w-6xl mt-6 flex justify-center">
            {!loading ? (
              <MapWithRoute
                postos={postos}
                userPosition={userPosition}
                suggestedPosto={melhorPosto}
              />
            ) : (
              <div className="text-white py-36">Carregando mapa...</div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="flex flex-col gap-6 mt-6 w-full max-w-6xl">
            <div className="bg-[#23272F] rounded-2xl px-6 py-5 text-white shadow-lg flex flex-col items-center text-center border-2 border-[#FFD200]">
              <span className="uppercase text-sm tracking-widest text-blue-100 mb-1">
                Postos cadastrados
              </span>
              <span className="text-4xl font-extrabold text-[#FFD200] mb-1">
                {postos.length}
              </span>
              <span className="text-xs text-blue-200">Última atualização</span>
              <span className="text-base font-bold">
                {postos[0]?.atualizado_em
                  ? new Date(postos[0].atualizado_em).toLocaleDateString()
                  : '-'}
              </span>
            </div>
          </div>

          {/* RANKING */}
          <div className="w-full max-w-6xl bg-[#23272F] rounded-2xl p-6 shadow-2xl mt-14 mb-12 border-2 border-[#FFD200]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-extrabold text-white">Ranking dos 10 Melhores Preços</h2>
              <div className="flex gap-2 items-center">
                <label htmlFor="tipo" className="text-blue-100 font-semibold">
                  Tipo:
                </label>
                <select
                  id="tipo"
                  value={tipo}
                  onChange={e => setTipo(e.target.value as any)}
                  className="border border-blue-300 rounded-lg px-3 py-1 text-blue-900"
                >
                  <option value="gasolina">Gasolina</option>
                  <option value="etanol">Etanol</option>
                  <option value="diesel">Diesel</option>
                </select>
                <button
                  onClick={fetchTop10}
                  className="bg-yellow-400 text-blue-950 px-4 py-1 rounded-lg font-bold"
                >
                  Filtrar
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-blue-100 text-sm">
                <thead>
                  <tr className="bg-[#FFD200] text-[#D7263D]">
                    <th className="border-b px-4 py-2 text-left">#</th>
                    <th className="border-b px-4 py-2 text-left">Posto</th>
                    <th className="border-b px-4 py-2 text-left">Preço (R$)</th>
                    <th className="border-b px-4 py-2 text-left">Endereço</th>
                    <th className="border-b px-4 py-2 text-left">Atualizado em</th>
                  </tr>
                </thead>
                <tbody>
                  {postos.slice(0, 10).map((posto, idx) => (
                    <tr key={posto.id} className="hover:bg-[#FFD200]/10 transition">
                      <td className="border-b px-4 py-2">{idx + 1}</td>
                      <td className="border-b px-4 py-2">{posto.nome}</td>
                      <td className="border-b px-4 py-2">
                        {(tipo === 'gasolina'
                          ? posto.preco_gasolina
                          : tipo === 'etanol'
                          ? posto.preco_etanol
                          : posto.preco_diesel
                        )?.toFixed(3)}
                      </td>
                      <td className="border-b px-4 py-2 text-xs">{posto.endereco}</td>
                      <td className="border-b px-4 py-2 text-xs">
                        {new Date(posto.atualizado_em).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
