'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fuel, User } from 'lucide-react'

type Posto = {
  id: number
  nome: string
  endereco: string
  imagem?: string | null
}

export default function AdminPage() {
  const [postos, setPostos] = useState<Posto[]>([])
  const router = useRouter()

  const fetchPostos = async () => {
    const res = await fetch('http://localhost:5000/api/postos')
    const data = await res.json()
    setPostos(data)
  }

  const excluirPosto = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este posto?')) return
    await fetch(`http://localhost:5000/api/postos/${id}`, { method: 'DELETE' })
    fetchPostos()
  }

  useEffect(() => {
    fetchPostos()
  }, [])

  return (
    <div className="bg-[#19202C] min-h-screen flex">
      {/* Sidebar */}
      <aside className="flex flex-col items-center gap-4 bg-[#23272F] w-[90px] p-4 fixed top-0 left-0 h-full text-white shadow-lg border-r-2 border-[#FFD200]">
        <div className="mt-2 mb-4">
          <Fuel size={32} className="text-[#D7263D]" />
        </div>
        <span className="font-extrabold text-[11px] text-center leading-4">
          Postos<br/>Inteligentes
        </span>
        <div className="flex-grow" />
        <div className="w-4 h-4 rounded-full bg-[#FFD200] mb-3 opacity-60" />
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-[90px] flex flex-col">
        {/* Header */}
        <header className="w-full flex justify-between items-center px-12 py-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Painel de Administração
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/novo')}
              className="bg-[#FFD200] text-[#23272F] px-4 py-2 rounded font-bold hover:bg-[#ffe366] transition"
            >
              Cadastrar Novo Posto
            </button>
            <Link href="/">
              <button className="flex items-center gap-2 bg-[#23272F] hover:bg-[#FFD200]/90 text-white hover:text-[#23272F] rounded-full px-5 py-2 shadow-lg font-bold transition">
                <User size={20} className="text-[#FFD200]" />
                <span className="font-semibold">Voltar</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Table */}
        <div className="flex-1 flex flex-col items-center px-2 md:px-10">
          <div className="w-full max-w-6xl bg-[#23272F] rounded-2xl p-6 shadow-2xl mt-6 mb-12 border-2 border-[#FFD200] overflow-x-auto">
            <table className="w-full border-collapse text-blue-100 text-sm">
              <thead>
                <tr className="bg-[#FFD200] text-[#D7263D]">
                  <th className="border-b px-4 py-2 text-left">ID</th>
                  <th className="border-b px-4 py-2 text-left">Imagem</th>
                  <th className="border-b px-4 py-2 text-left">Nome</th>
                  <th className="border-b px-4 py-2 text-left">Endereço</th>
                  <th className="border-b px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {postos.map((posto) => (
                  <tr key={posto.id} className="hover:bg-[#FFD200]/10 transition">
                    <td className="border-b px-4 py-2 text-white">{posto.id}</td>
                    <td className="border-b px-4 py-2 text-white">
                      {posto.imagem ? (
                        <img
                          src={posto.imagem}
                          alt={posto.nome}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        'Sem imagem'
                      )}
                    </td>
                    <td className="border-b px-4 py-2 text-white">{posto.nome}</td>
                    <td className="border-b px-4 py-2 text-white">{posto.endereco}</td>
                    <td className="border-b px-4 py-2">
                      <button
                        onClick={() => router.push(`/admin/editar/${posto.id}`)}
                        className="bg-yellow-400 text-blue-950 px-3 py-1 rounded font-semibold hover:brightness-110 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirPosto(posto.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded font-semibold ml-2 hover:brightness-90 transition"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
