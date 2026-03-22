import { useState } from 'react'
import { LogOut, Edit3, Save, Music2, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/services/authService'
import { updateUserProfile } from '@/services/firestoreService'
import { updateProfile } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { useNavigate } from 'react-router-dom'

const INSTRUMENTS = ['Gesang/Vocals', 'E-Gitarre', 'Rhythmusgitarre', 'Bass', 'Schlagzeug', 'Sonstige']

export default function ProfileScreen() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.displayName || '')
  const [instrument, setInstrument] = useState(user?.instrument || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { displayName: name, instrument })
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name })
      setEditing(false)
    } finally { setSaving(false) }
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] px-4 pb-6 screen-top">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#8B00FF] purple-glow mb-4">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#8B00FF]/30 flex items-center justify-center">
              <span className="text-[#AA44FF] font-black text-3xl">{initials}</span>
            </div>
          )}
        </div>
        <h1 className="text-2xl font-black text-white">{user?.displayName}</h1>
        <div className="flex items-center gap-2 mt-1">
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-[#8B00FF] bg-[#8B00FF]/10 px-2 py-0.5 rounded-full border border-[#8B00FF]/30">
              <Shield size={11} /> Admin
            </span>
          )}
          {user?.instrument && (
            <span className="flex items-center gap-1 text-xs text-[#888888] bg-[#1E1E1E] px-2 py-0.5 rounded-full">
              <Music2 size={11} /> {user.instrument}
            </span>
          )}
        </div>
        <p className="text-[#555] text-sm mt-1">{user?.email}</p>
      </div>

      {/* Edit profile */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-sm">Profil bearbeiten</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-[#8B00FF] text-xs hover:text-[#AA44FF] transition-colors">
              <Edit3 size={14} /> Bearbeiten
            </button>
          ) : (
            <button onClick={() => setEditing(false)} className="text-[#888888] text-xs hover:text-white">Abbrechen</button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm focus:border-[#8B00FF] transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Instrument</label>
              <select value={instrument} onChange={e => setInstrument(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm focus:border-[#8B00FF] transition-colors">
                <option value="">– Wählen –</option>
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-2.5 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 font-bold text-white text-sm transition-all flex items-center justify-center gap-2">
              {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Save size={15} /> Speichern</>}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#888888]">Name</span>
              <span className="text-white">{user?.displayName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#888888]">E-Mail</span>
              <span className="text-white text-right truncate ml-4">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#888888]">Instrument</span>
              <span className="text-white">{user?.instrument || '–'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#888888]">Rolle</span>
              <span className="text-white capitalize">{user?.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 mb-4">
        <h2 className="font-bold text-white text-sm mb-3">Über die App</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#8B00FF]/30">
            <img src="/icons/icon-512.png" alt="CM" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">CrazyMeet</div>
            <div className="text-[#888888] text-xs">Version 1.0.0 · Band-App</div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full py-3 rounded-2xl border border-red-900/50 text-red-400 hover:bg-red-950/30 font-semibold text-sm transition-all flex items-center justify-center gap-2">
        <LogOut size={16} /> Abmelden
      </button>
    </div>
  )
}
