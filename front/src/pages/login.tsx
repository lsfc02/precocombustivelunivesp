'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Fuel, User } from 'lucide-react'

export default function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usuario, senha }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Erro ao fazer login')
      }
      router.push('/admin')
    } catch (err: any) {
      setErro(err.message)
    }
  }

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

      {/* Main */}
      <div className="flex-1 ml-[90px] flex flex-col">
        {/* Header */}
        <header className="w-full flex justify-between items-center px-12 py-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Login</h1>
          <Link href="/">
            <button className="flex items-center gap-2 bg-[#23272F] hover:bg-[#FFD200]/90 text-white hover:text-[#23272F] rounded-full px-5 py-2 shadow-lg font-bold transition">
              <User size={20} className="text-[#FFD200]" />
              <span className="font-semibold">Voltar</span>
            </button>
          </Link>
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-10">
          <div className="bg-[#23272F] rounded-2xl p-8 shadow-2xl border-2 border-[#FFD200] max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Login do Administrador
            </h2>

            {erro && (
              <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                {erro}
              </div>
            )}

            <label className="block text-white mb-1">Usuário</label>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded border border-blue-300 bg-[#1A2433] text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
              placeholder="Digite seu usuário"
            />

            <label className="block text-white mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full mb-6 px-3 py-2 rounded border border-blue-300 bg-[#1A2433] text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
              placeholder="••••••••"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-[#FFD200] text-[#23272F] font-bold py-2 rounded hover:bg-[#FFE366] transition"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
