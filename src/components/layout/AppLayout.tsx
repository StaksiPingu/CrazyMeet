import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      {/* Desktop: content shifted right of sidebar */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
