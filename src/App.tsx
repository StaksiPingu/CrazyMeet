import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import LoginScreen from '@/screens/auth/LoginScreen'
import RegisterScreen from '@/screens/auth/RegisterScreen'
import HomeScreen from '@/screens/home/HomeScreen'
import ChatScreen from '@/screens/chat/ChatScreen'
import SongsScreen from '@/screens/songs/SongsScreen'
import EventsScreen from '@/screens/events/EventsScreen'
import VotingScreen from '@/screens/voting/VotingScreen'
import LinksScreen from '@/screens/links/LinksScreen'
import ProfileScreen from '@/screens/profile/ProfileScreen'

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center">
      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#8B00FF] purple-glow splash-logo">
        <img src="/icons/icon-512.png" alt="Crazy Mess" className="w-full h-full object-cover" />
      </div>
      <div className="splash-text text-center mt-6">
        <div className="text-xl font-black tracking-widest gradient-text uppercase">Crazy Mess</div>
        <div className="text-[#555] text-xs mt-1">Wird geladen...</div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return <SplashScreen />
  if (!firebaseUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return <SplashScreen />
  if (firebaseUser) return <Navigate to="/home" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/songs" element={<SongsScreen />} />
        <Route path="/events" element={<EventsScreen />} />
        <Route path="/voting" element={<VotingScreen />} />
        <Route path="/links" element={<LinksScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
