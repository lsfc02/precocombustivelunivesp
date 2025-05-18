'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Fuel, ArrowLeft } from 'lucide-react'

export default function NovoPosto() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome: '',
    endereco: '',
    latitude: '',
    longitude: '',
    preco_gasolina: '',
    preco_etanol: '',
    preco_diesel: ''
  })
  const [imagem, setImagem] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagem(e.target.files?.[0] || null)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (imagem) fd.append('imagem', imagem)

    try {
      const res = await fetch('http://localhost:5000/api/postos', {
        method: 'POST',
        body: fd,
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Erro ao cadastrar posto')
      setSuccess('Posto cadastrado com sucesso!')
      setTimeout(() => router.push('/admin'), 1000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="bg-[#19202C] min-h-screen flex">
      {/* Sidebar */}
      <aside className="flex flex-col items-center gap-4 bg-[#23272F] w-[90px] p-4 fixed top-0 left-0 h-full text-white shadow-lg border-r-2 border-[#FFD200]">
        <Fuel size={32} className="text-[#D7263D]" />
        <span className="font-extrabold text-[11px] text-center leading-4">
          Postos<br/>Inteligentes
        </span>
        <div className="flex-grow" />
        <div className="w-4 h-4 rounded-full bg-[#FFD200] opacity-60" />
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-[90px] flex flex-col">
        {/* Header */}
        <header className="w-full flex justify-between items-center px-12 py-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Cadastrar Posto
          </h1>
          <Link href="/admin">
            <button className="flex items-center gap-2 bg-[#23272F] hover:bg-[#FFD200]/90 text-white hover:text-[#23272F] rounded-full px-5 py-2 shadow-lg font-bold transition">
              <ArrowLeft size={20} className="text-[#FFD200]" />
              <span className="font-semibold">Voltar</span>
            </button>
          </Link>
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-10">
          <div className="bg-[#23272F] rounded-2xl p-8 shadow-2xl border-2 border-[#FFD200] w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-white mb-1">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full bg-[#1A2433] border border-blue-300 text-white rounded px-3 py-2 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  placeholder="Nome do posto"
                  required
                />
              </div>
              {/* Endereço */}
              <div>
                <label className="block text-white mb-1">Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className="w-full bg-[#1A2433] border border-blue-300 text-white rounded px-3 py-2 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                  placeholder="Rua, número, bairro"
                  required
                />
              </div>
              {/* Latitude / Longitude */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-white mb-1">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    className="w-full bg-[#1A2433] border border-blue-300 text-white rounded px-3 py-2 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    placeholder="-23.55052"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white mb-1">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    className="w-full bg-[#1A2433] border border-blue-300 text-white rounded px-3 py-2 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                    placeholder="-46.63331"
                    required
                  />
                </div>
              </div>
              {/* Preços */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['gasolina','etanol','diesel'].map(tipo => (
                  <div key={tipo}>
                    <label className="block text-white mb-1">
                      Preço {tipo.charAt(0).toUpperCase() + tipo.slice(1)} (R$)
                    </label>
                    <input
                      type="text"
                      name={`preco_${tipo}`}
                      value={(form as any)[`preco_${tipo}`]}
                      onChange={handleChange}
                      className="w-full bg-[#1A2433] border border-blue-300 text-white rounded px-3 py-2 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                      placeholder="0.000"
                    />
                  </div>
                ))}
              </div>
              {/* Imagem */}
              <div>
                <label className="block text-white mb-1">Imagem do Posto</label>
                <input
                  type="file"
                  name="imagem"
                  onChange={handleFile}
                  className="w-full text-white"
                />
              </div>
              {/* Feedback */}
              {error && <div className="text-red-500">{error}</div>}
              {success && <div className="text-green-500">{success}</div>}
              {/* Botão */}
              <button
                type="submit"
                className="w-full bg-[#FFD200] text-[#23272F] font-bold py-2 rounded hover:bg-[#FFE366] transition"
              >
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
