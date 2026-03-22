import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, MessageCircle, Music2, Calendar, MoreHorizontal, ListMusic, FolderOpen, Link2, Vote, User, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const MAIN_NAV = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/songs', icon: Music2, label: 'Songs' },
]

const MORE_ITEMS = [
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
  { to: '/voting', icon: Vote, label: 'Abstimmung' },
  { to: '/links', icon: Link2, label: 'Links & Socials' },
  { to: '/profile', icon: User, label: 'Profil' },
]

const EXTERNAL_ITEMS = [
  { href: 'https://files.crazymess.de', icon: FolderOpen, label: 'Dateien' },
]

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleMoreItem(to: string) {
    setShowMore(false)
    navigate(to)
  }

  const initials = user?.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <>
      {/* More Sheet Overlay */}
      {showMore && (
        <div
          className="mobile-nav fixed inset-0 z-40 bg-black/60"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Sheet */}
      {showMore && (
        <div className="mobile-nav fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-[#2A2A2A] rounded-t-3xl pb-safe slide-up">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2A2A2A]">
            <span className="font-bold text-white text-sm">Mehr</span>
            <button onClick={() => setShowMore(false)} className="text-[#888888] hover:text-white p-1">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            {MORE_ITEMS.map(({ to, icon: Icon, label }) => (
              <button
                key={to}
                onClick={() => handleMoreItem(to)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#8B00FF]/40 active:scale-95 transition-all text-left"
              >
                {to === '/profile' && user?.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : to === '/profile' ? (
                  <div className="w-7 h-7 rounded-full bg-[#8B00FF]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#AA44FF] font-bold text-xs">{initials}</span>
                  </div>
                ) : (
                  <Icon size={18} className="text-[#8B00FF] flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-white">{label}</span>
              </button>
            ))}
            {EXTERNAL_ITEMS.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#8B00FF]/40 active:scale-95 transition-all text-left"
              >
                <Icon size={18} className="text-[#8B00FF] flex-shrink-0" />
                <span className="text-sm font-medium text-white">{label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#2A2A2A] bottom-nav">
        <div className="flex items-center justify-around px-1 pt-1.5">
          {MAIN_NAV.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  isActive ? 'text-[#8B00FF]' : 'text-[#888888]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#8B00FF]/20' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Mehr Button */}
          <button
            onClick={() => setShowMore(v => !v)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              showMore ? 'text-[#8B00FF]' : 'text-[#888888]'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${showMore ? 'bg-[#8B00FF]/20' : ''}`}>
              <MoreHorizontal size={20} strokeWidth={showMore ? 2.5 : 1.8} />
            </div>
            <span className="text-[10px] font-medium leading-none">Mehr</span>
          </button>
        </div>
      </nav>
    </>
  )
}
