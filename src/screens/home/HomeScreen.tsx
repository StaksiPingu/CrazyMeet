import { Link } from 'react-router-dom'
import { Calendar, Music2, Vote, MessageCircle, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { subscribeEvents, subscribeVotes } from '@/services/firestoreService'
import { useAuth } from '@/context/AuthContext'
import type { BandEvent, Vote as VoteType } from '@/types'
import { format, isFuture, isToday } from 'date-fns'
import { de } from 'date-fns/locale'

function EventBadge({ type }: { type: string }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
      type === 'gig' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'bg-[#00D4AA]/20 text-[#00D4AA]'
    }`}>
      {type === 'gig' ? '🎸 Gig' : '🥁 Probe'}
    </span>
  )
}

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

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] px-4 pt-8 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#888888] text-sm mb-0.5">Willkommen zurück,</p>
            <h1 className="text-2xl font-black gradient-text">{user?.displayName?.split(' ')[0] || 'Rockstar'} 🤘</h1>
          </div>
          <Link to="/profile">
            <div className="w-11 h-11 rounded-full border-2 border-[#8B00FF] overflow-hidden purple-glow-sm">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#8B00FF]/30 flex items-center justify-center text-[#AA44FF] text-lg font-bold">
                  {user?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { to: '/events', icon: Calendar, label: 'Events', color: '#FF6B35', bg: 'rgba(255,107,53,0.1)' },
          { to: '/songs', icon: Music2, label: 'Songs', color: '#8B00FF', bg: 'rgba(139,0,255,0.1)' },
          { to: '/voting', icon: Vote, label: 'Abstimmung', color: '#AA44FF', bg: 'rgba(170,68,255,0.1)' },
          { to: '/chat', icon: MessageCircle, label: 'Chat', color: '#00D4AA', bg: 'rgba(0,212,170,0.1)' },
        ].map(({ to, icon: Icon, label, color, bg }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-4 rounded-2xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-200 active:scale-95"
            style={{ background: bg }}
          >
            <Icon size={22} style={{ color }} />
            <span className="font-semibold text-sm text-white">{label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming Events */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <Calendar size={16} className="text-[#8B00FF]" /> Nächste Events
          </h2>
          <Link to="/events" className="text-[#8B00FF] text-xs flex items-center gap-0.5 hover:text-[#AA44FF]">
            Alle <ChevronRight size={14} />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 text-center text-[#555]">
            <Calendar size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Keine Events geplant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(event => {
              const d = event.date?.toDate()
              const att = event.attendance?.[user?.uid || '']
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center gap-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 hover:border-[#8B00FF]/40 transition-all duration-200"
                >
                  <div className="text-center min-w-[44px]">
                    <div className="text-[#8B00FF] font-black text-xl leading-none">
                      {d ? format(d, 'd', { locale: de }) : '?'}
                    </div>
                    <div className="text-[#888888] text-[10px] uppercase">
                      {d ? format(d, 'MMM', { locale: de }) : ''}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{event.title}</div>
                    <div className="text-[#888888] text-xs truncate">{event.location}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <EventBadge type={event.type} />
                    {att && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        att.status === 'yes' ? 'text-green-400' :
                        att.status === 'no' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {att.status === 'yes' ? '✓ Dabei' : att.status === 'no' ? '✗ Absage' : '? Vlt.'}
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <Vote size={16} className="text-[#8B00FF]" /> Offene Abstimmungen
          </h2>
          <Link to="/voting" className="text-[#8B00FF] text-xs flex items-center gap-0.5 hover:text-[#AA44FF]">
            Alle <ChevronRight size={14} />
          </Link>
        </div>
        {openVotes.length === 0 ? (
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 text-center text-[#555]">
            <Vote size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Keine offenen Abstimmungen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openVotes.map(vote => {
              const totalVotes = Object.keys(vote.votes || {}).length
              const myVote = vote.votes?.[user?.uid || '']
              return (
                <Link
                  key={vote.id}
                  to={`/voting/${vote.id}`}
                  className="flex items-center gap-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 hover:border-[#8B00FF]/40 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white">{vote.question}</div>
                    <div className="text-[#888888] text-xs mt-0.5">{totalVotes} Stimme{totalVotes !== 1 ? 'n' : ''}</div>
                  </div>
                  {myVote ? (
                    <span className="text-green-400 text-xs whitespace-nowrap">✓ Abgestimmt</span>
                  ) : (
                    <span className="text-[#8B00FF] text-xs whitespace-nowrap font-medium">→ Abstimmen</span>
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
