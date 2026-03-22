import { Link } from 'react-router-dom'
import { Calendar, Music2, CheckSquare, MessageCircle, ChevronRight, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { subscribeEvents, subscribeVotes } from '@/services/firestoreService'
import { useAuth } from '@/context/AuthContext'
import type { BandEvent, Vote as VoteType } from '@/types'
import { format, isFuture, isToday } from 'date-fns'
import { de } from 'date-fns/locale'

function EventTypePill({ type }: { type: string }) {
  const isGig = type === 'gig'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
      isGig ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#00D4AA]/15 text-[#00D4AA]'
    }`}>
      {isGig ? 'Gig' : 'Probe'}
    </span>
  )
}

const quickActions = [
  { to: '/events',  icon: Calendar,     label: 'Events',      color: '#FF6B35' },
  { to: '/songs',   icon: Music2,       label: 'Songs',       color: '#8B00FF' },
  { to: '/voting',  icon: CheckSquare,  label: 'Abstimmung',  color: '#AA44FF' },
  { to: '/chat',    icon: MessageCircle,label: 'Chat',        color: '#00D4AA' },
]

export default function HomeScreen() {
  const { user } = useAuth()
  const [events, setEvents] = useState<BandEvent[]>([])
  const [votes, setVotes] = useState<VoteType[]>([])

  useEffect(() => {
    const u1 = subscribeEvents(setEvents)
    const u2 = subscribeVotes(setVotes)
    return () => { u1(); u2() }
  }, [])

  const upcoming = events.filter(e => {
    const d = e.date?.toDate()
    return d && (isFuture(d) || isToday(d))
  }).slice(0, 3)

  const openVotes = votes.filter(v => !v.closed).slice(0, 2)

  const firstName = user?.displayName?.split(' ')[0] || 'Rockstar'

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] px-5 pb-6 screen-top">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-2">
        <div>
          <p className="text-[#555] text-xs font-medium tracking-wider uppercase mb-1">Willkommen zurück</p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {firstName}<span className="ml-2 text-[#8B00FF]">🤘</span>
          </h1>
        </div>
        <Link to="/profile">
          <div className="w-10 h-10 rounded-full border border-[#8B00FF]/60 overflow-hidden">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#8B00FF]/20 flex items-center justify-center text-[#AA44FF] text-base font-bold">
                {user?.displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {quickActions.map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#111] border border-[#1E1E1E] active:scale-95 transition-transform duration-150"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span className="text-[11px] font-semibold text-[#AAA] tracking-tight leading-none">{label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming Events */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white tracking-wide">Nächste Events</h2>
          <Link to="/events" className="flex items-center gap-1 text-[#8B00FF] text-xs font-medium">
            Alle <ChevronRight size={13} />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-8 text-center">
            <Calendar size={28} className="mx-auto mb-2 text-[#333]" />
            <p className="text-xs text-[#444]">Keine Events geplant</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map(event => {
              const d = event.date?.toDate()
              const att = event.attendance?.[user?.uid || '']
              const attColor = att?.status === 'yes' ? '#22c55e' : att?.status === 'no' ? '#ef4444' : '#eab308'
              const attLabel = att?.status === 'yes' ? 'Dabei' : att?.status === 'no' ? 'Absage' : 'Vlt.'

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center gap-4 bg-[#111] border border-[#1E1E1E] rounded-2xl px-4 py-3.5 hover:border-[#8B00FF]/30 transition-colors duration-200"
                >
                  {/* Date block */}
                  <div className="flex flex-col items-center justify-center w-10 shrink-0">
                    <span className="text-lg font-black text-white leading-none">
                      {d ? format(d, 'd', { locale: de }) : '?'}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555] mt-0.5">
                      {d ? format(d, 'MMM', { locale: de }) : ''}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-[#222] shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{event.title}</p>
                    <p className="text-xs text-[#555] truncate mt-0.5">{event.location}</p>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <EventTypePill type={event.type} />
                    {att && (
                      <span className="text-[10px] font-semibold" style={{ color: attColor }}>
                        {attLabel}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Open Votes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white tracking-wide">Offene Abstimmungen</h2>
          <Link to="/voting" className="flex items-center gap-1 text-[#8B00FF] text-xs font-medium">
            Alle <ChevronRight size={13} />
          </Link>
        </div>

        {openVotes.length === 0 ? (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-8 text-center">
            <CheckSquare size={28} className="mx-auto mb-2 text-[#333]" />
            <p className="text-xs text-[#444]">Keine offenen Abstimmungen</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {openVotes.map(vote => {
              const totalVotes = Object.keys(vote.votes || {}).length
              const myVote = vote.votes?.[user?.uid || '']
              return (
                <Link
                  key={vote.id}
                  to={`/voting/${vote.id}`}
                  className="flex items-center gap-4 bg-[#111] border border-[#1E1E1E] rounded-2xl px-4 py-3.5 hover:border-[#8B00FF]/30 transition-colors duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{vote.question}</p>
                    <p className="text-xs text-[#555] mt-0.5">{totalVotes} Stimme{totalVotes !== 1 ? 'n' : ''}</p>
                  </div>
                  {myVote ? (
                    <span className="text-[11px] font-semibold text-[#22c55e]">Abgestimmt</span>
                  ) : (
                    <div className="flex items-center gap-1 text-[#8B00FF]">
                      <span className="text-[11px] font-semibold">Abstimmen</span>
                      <ArrowRight size={12} />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
