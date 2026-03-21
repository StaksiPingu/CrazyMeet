import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { createEvent } from '@/services/firestoreService'
import { Timestamp } from 'firebase/firestore'
import type { EventType } from '@/types'

export default function CreateEventModal({ onClose, userId, userName }: { onClose: () => void; userId: string; userName: string }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('rehearsal')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) { setError('Datum fehlt.'); return }
    setLoading(true)
    try {
      const dt = new Date(`${date}T${time}:00`)
      await createEvent({
        title: title.trim(),
        type,
        date: Timestamp.fromDate(dt),
        location: location.trim(),
        description: description.trim(),
        createdBy: userId,
        createdByName: userName,
        songIds: [],
      })
      onClose()
    } catch { setError('Event konnte nicht erstellt werden.') } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#2A2A2A]">
          <h2 className="font-bold text-white flex items-center gap-2"><Calendar size={18} className="text-[#8B00FF]" /> Event erstellen</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-2">Typ</label>
            <div className="flex gap-2">
              {([['rehearsal', '🥁 Probe'], ['gig', '🎸 Gig']] as const).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    type === t
                      ? t === 'gig' ? 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/50' : 'bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/50'
                      : 'border-[#2A2A2A] text-[#888888]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Title */}
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Titel *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder={type === 'gig' ? 'z.B. Konzert im Blau' : 'z.B. Probe Donnerstag'}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors" />
          </div>
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Datum *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm focus:border-[#8B00FF] transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Uhrzeit</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm focus:border-[#8B00FF] transition-colors" />
            </div>
          </div>
          {/* Location */}
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Ort</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="z.B. Proberaum Stadtmitte"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors" />
          </div>
          {/* Description */}
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Notiz / Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Infos, Setlist-Hinweise..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors resize-none" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 font-bold text-white transition-all flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><Calendar size={18} /> Event erstellen</>}
          </button>
        </form>
      </div>
    </div>
  )
}
