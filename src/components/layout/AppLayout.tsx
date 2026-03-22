import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      {/* Desktop: content shifted right of sidebar. Mobile: full width with bottom nav padding */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-24 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
