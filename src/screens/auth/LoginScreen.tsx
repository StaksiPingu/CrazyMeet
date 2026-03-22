import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { login, resetPassword } from '@/services/authService'

export default function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/home', { replace: true })
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'E-Mail oder Passwort falsch.'
        : err.code === 'auth/too-many-requests'
        ? 'Zu viele Versuche. Bitte kurz warten.'
        : 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!email) { setError('Bitte erst E-Mail eingeben.'); return }
    try {
      await resetPassword(email)
      setResetSent(true)
      setError('')
    } catch {
      setError('Passwort-Reset fehlgeschlagen.')
    }
  }

  return (
    <div className="min-h-screen purple-gradient-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden purple-glow border-2 border-[#8B00FF]">
          <img src="/icons/icon-512.png" alt="Crazy Mess" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-black tracking-widest gradient-text uppercase">Crazy Mess</h1>
        <p className="text-[#888888] text-sm mt-1">Band-App · Mitglieder-Login</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-xs text-[#888888] mb-1 uppercase tracking-wide">E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="deine@email.de"
            className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] text-white placeholder-[#555] focus:border-[#8B00FF] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[#888888] mb-1 uppercase tracking-wide">Passwort</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] text-white placeholder-[#555] focus:border-[#8B00FF] transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>
        )}
        {resetSent && (
          <p className="text-green-400 text-sm bg-green-950/40 border border-green-900/50 rounded-lg px-3 py-2">
            Reset-Link wurde gesendet! Check deine E-Mail.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white transition-all duration-200 purple-glow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <><LogIn size={18} /> Anmelden</>
          )}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={handleReset} className="text-[#8B00FF] hover:text-[#AA44FF] transition-colors">
            Passwort vergessen?
          </button>
          <Link to="/register" className="text-[#8B00FF] hover:text-[#AA44FF] transition-colors">
            Registrieren →
          </Link>
        </div>
      </form>

    </div>
  )
}
