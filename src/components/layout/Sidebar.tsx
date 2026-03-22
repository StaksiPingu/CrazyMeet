import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Music2, Calendar, Link2, ListMusic, User, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/songs', icon: Music2, label: 'Songs' },
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/links', icon: Link2, label: 'Links & Socials' },
]

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="desktop-sidebar flex-col w-64 min-h-screen bg-[#141414] border-r border-[#2A2A2A] px-4 py-6 fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8B00FF] purple-glow-sm">
          <img src="/icons/icon-512.png" alt="CM" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-black text-base tracking-widest gradient-text uppercase leading-tight">Crazy Mess</div>
          <div className="text-[10px] text-[#888888] uppercase tracking-wider">Band-App</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#8B00FF]/20 text-[#8B00FF] border border-[#8B00FF]/30'
                  : 'text-[#888888] hover:bg-[#1E1E1E] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="font-medium text-sm">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mt-4 ${
            isActive ? 'bg-[#8B00FF]/20 text-[#8B00FF]' : 'text-[#888888] hover:bg-[#1E1E1E] hover:text-white'
          }`
        }
      >
        <div className="w-7 h-7 rounded-full bg-[#8B00FF]/30 flex items-center justify-center overflow-hidden">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={14} className="text-[#8B00FF]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user?.displayName || 'Profil'}</div>
          <div className="text-[10px] text-[#888888]">{user?.instrument || user?.role}</div>
        </div>
        <Settings size={14} />
      </NavLink>
    </aside>
  )
}
