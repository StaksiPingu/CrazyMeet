import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Music2, Calendar, ListMusic } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/songs', icon: Music2, label: 'Songs' },
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
  { to: '/events', icon: Calendar, label: 'Events' },
]

export default function BottomNav() {
  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#2A2A2A] bottom-nav">
      <div className="flex items-center justify-around px-2 pt-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-0 ${
                isActive
                  ? 'text-[#8B00FF]'
                  : 'text-[#888888] hover:text-[#AA44FF]'
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
      </div>
    </nav>
  )
}
