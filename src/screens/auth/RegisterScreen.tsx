import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { register } from '@/services/authService'

const INSTRUMENTS = ['Gesang/Vocals', 'E-Gitarre', 'Rhythmusgitarre', 'Bass', 'Schlagzeug', 'Sonstige']

export default function RegisterScreen() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [instrument, setInstrument] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Passwort mindestens 6 Zeichen.'); return }
    setError('')
    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/home', { replace: true })
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'E-Mail wird bereits verwendet.'
        : err.code === 'auth/weak-password'
        ? 'Passwort zu schwach.'
        : 'Registrierung fehlgeschlagen.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen purple-gradient-bg flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden purple-glow border-2 border-[#8B00FF]">
          <img src="/icons/icon-512.png" alt="Crazy Mess" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-black tracking-widest gradient-text uppercase">Registrieren</h1>
        <p className="text-[#888888] text-sm mt-1">Werde Teil der Band-App</p>
      </div>

      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-xs text-[#888888] mb-1 uppercase tracking-wide">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Dein Name"
            className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] text-white placeholder-[#555] focus:border-[#8B00FF] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[#888888] mb-1 uppercase tracking-wide">Instrument</label>
          <select
            value={instrument}
            onChange={e => setInstrument(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] text-white focus:border-[#8B00FF] transition-colors"
          >
            <option value="">– Wählen –</option>
            {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#888888] mb-1 uppercase tracking-wide">E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="deine@email.de"
            className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] text-white placeholder-[#555] focus:border-[#8B00FF] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[#888888] mb-1 uppercase tracking-wide">Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Mindestens 6 Zeichen"
            className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] text-white placeholder-[#555] focus:border-[#8B00FF] transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 font-bold text-white transition-all duration-200 purple-glow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <><UserPlus size={18} /> Registrieren</>
          )}
        </button>

        <p className="text-center text-sm text-[#888888]">
          Schon dabei?{' '}
          <Link to="/login" className="text-[#8B00FF] hover:text-[#AA44FF] transition-colors">Anmelden →</Link>
        </p>
      </form>
    </div>
  )
}
