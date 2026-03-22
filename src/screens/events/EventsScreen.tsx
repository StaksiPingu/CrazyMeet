import { useEffect, useState } from 'react'
import { Plus, Calendar, MapPin, Trash2 } from 'lucide-react'
import { subscribeEvents, deleteEvent, setAttendance } from '@/services/firestoreService'
import { useAuth } from '@/context/AuthContext'
import type { BandEvent, AttendanceStatus } from '@/types'
import { format, isFuture, isToday, isPast } from 'date-fns'
import { de } from 'date-fns/locale'
import CreateEventModal from './CreateEventModal'

function EventCard({ event, userId, isAdmin, onDelete }: { event: BandEvent; userId: string; isAdmin: boolean; onDelete: (id: string) => void }) {
  const d = event.date?.toDate()
  const myAtt = event.attendance?.[userId]?.status
  const past = d ? isPast(d) && !isToday(d) : false
  const attCounts = Object.values(event.attendance || {}).reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1; return acc
  }, {} as Record<string, number>)

  async function handleAtt(status: AttendanceStatus) {
    await setAttendance(event.id, userId, '', status)
  }

  return (
    <div className={`bg-[#141414] border rounded-2xl overflow-hidden transition-all duration-200 ${past ? 'opacity-60 border-[#222]' : 'border-[#2A2A2A] hover:border-[#8B00FF]/30'}`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className={`text-center min-w-[52px] px-2 py-1.5 rounded-xl border ${event.type === 'gig' ? 'bg-[#FF6B35]/10 border-[#FF6B35]/30' : 'bg-[#00D4AA]/10 border-[#00D4AA]/30'}`}>
            <div className={`text-xl font-black leading-none ${event.type === 'gig' ? 'text-[#FF6B35]' : 'text-[#00D4AA]'}`}>
              {d ? format(d, 'd') : '?'}
            </div>
            <div className="text-[10px] uppercase text-[#888888]">
              {d ? format(d, 'MMM', { locale: de }) : ''}
            </div>
            <div className="text-[10px] text-[#555]">{d ? format(d, 'yyyy') : ''}</div>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${event.type === 'gig' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'bg-[#00D4AA]/20 text-[#00D4AA]'}`}>
                {event.type === 'gig' ? '🎸 Gig' : '🥁 Probe'}
              </span>
              {isToday(d!) && <span className="text-[10px] font-bold text-[#8B00FF] bg-[#8B00FF]/10 px-2 py-0.5 rounded-full">Heute!</span>}
            </div>
            <h3 className="font-bold text-white text-base leading-tight">{event.title}</h3>
            {event.location && (
              <div className="flex items-center gap-1 mt-1 text-[#888888] text-xs">
                <MapPin size={11} /> <span className="truncate">{event.location}</span>
              </div>
            )}
            {d && (
              <div className="text-[#888888] text-xs mt-0.5">{format(d, 'HH:mm', { locale: de })} Uhr</div>
            )}
            {event.description && (
              <p className="text-[#888888] text-xs mt-1.5 line-clamp-2">{event.description}</p>
            )}
            {/* Attendance count */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-green-400">✓ {attCounts.yes || 0}</span>
              <span className="text-[10px] text-red-400">✗ {attCounts.no || 0}</span>
              <span className="text-[10px] text-yellow-400">? {attCounts.maybe || 0}</span>
            </div>
          </div>
          {/* Delete */}
          {(isAdmin || event.createdBy === userId) && (
            <button onClick={() => onDelete(event.id)} className="text-[#555] hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Attendance buttons */}
        {!past && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[#888888] mr-1">Du:</span>
            {([['yes', '✓ Dabei', 'bg-green-900/40 text-green-400 border-green-800'], ['no', '✗ Nein', 'bg-red-900/40 text-red-400 border-red-800'], ['maybe', '? Vlt.', 'bg-yellow-900/40 text-yellow-400 border-yellow-800']] as const).map(([status, label, cls]) => (
              <button
                key={status}
                onClick={() => handleAtt(status as AttendanceStatus)}
                className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all duration-200 ${myAtt === status ? cls : 'border-[#2A2A2A] text-[#888888] hover:border-[#3A3A3A]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventsScreen() {
  const { user, isAdmin } = useAuth()
  const [events, setEvents] = useState<BandEvent[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => { return subscribeEvents(setEvents) }, [])

  async function handleDelete(id: string) {
    if (confirm('Event löschen?')) await deleteEvent(id)
  }

  const upcoming = events.filter(e => {
    const d = e.date?.toDate()
    return d && (isFuture(d) || isToday(d))
  })
  const past = events.filter(e => {
    const d = e.date?.toDate()
    return d && isPast(d) && !isToday(d)
  })
  const displayed = tab === 'upcoming' ? upcoming : past

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="px-4 pb-4 screen-top">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black gradient-text">Events</h1>
            <p className="text-[#888888] text-xs mt-0.5">Gigs · Proben · Termine</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] text-white text-sm font-semibold transition-all purple-glow-sm"
          >
            <Plus size={16} /> Event
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 bg-[#141414] border border-[#2A2A2A] rounded-xl p-1">
          {([['upcoming', `Kommend (${upcoming.length})`], ['past', `Vergangen (${past.length})`]] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-[#8B00FF] text-white' : 'text-[#888888] hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-6 space-y-3">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <Calendar size={48} className="mb-3 opacity-30" />
            <p className="text-sm">{tab === 'upcoming' ? 'Keine kommenden Events.' : 'Noch keine vergangenen Events.'}</p>
            {tab === 'upcoming' && (
              <button onClick={() => setShowCreate(true)} className="mt-3 text-[#8B00FF] text-sm hover:text-[#AA44FF]">+ Event erstellen</button>
            )}
          </div>
        ) : (
          displayed.map(event => (
            <EventCard key={event.id} event={event} userId={user?.uid || ''} isAdmin={isAdmin} onDelete={handleDelete} />
          ))
        )}
      </div>

      {showCreate && user && (
        <CreateEventModal onClose={() => setShowCreate(false)} userId={user.uid} userName={user.displayName} />
      )}
    </div>
  )
}
