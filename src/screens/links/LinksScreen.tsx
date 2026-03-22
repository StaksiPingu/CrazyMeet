import { useEffect, useState } from 'react'
import { ExternalLink, Music2, Instagram, Youtube, Globe, Edit3, Save, X } from 'lucide-react'
import { subscribeLinksConfig, updateLinksConfig } from '@/services/firestoreService'
import { useAuth } from '@/context/AuthContext'
import type { LinksConfig } from '@/types'


function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.241-3.021-1.858-6.832-2.278-11.322-1.237-.43.101-.86-.159-.97-.589-.101-.43.159-.86.589-.97 4.911-1.121 9.121-.63 12.511 1.431.38.24.5.721.24 1.101l.053.023zm1.44-3.3c-.301.47-.921.619-1.381.319-3.461-2.122-8.731-2.738-12.821-1.5-.521.159-1.071-.131-1.24-.641-.16-.521.13-1.07.641-1.24 4.67-1.411 10.47-.74 14.44 1.71.46.29.62.921.32 1.38l.041-.029zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.23-.15-1.39-.74-.18-.6.15-1.23.74-1.41 4.23-1.281 11.26-1.031 15.71 1.56.54.32.72 1.02.4 1.56-.32.54-1.02.72-1.56.4l.04-.03z"/>
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

function EditLinksModal({ config, onClose }: { config: LinksConfig; onClose: () => void }) {
  const [form, setForm] = useState({ ...config })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try { await updateLinksConfig(form); onClose() } finally { setSaving(false) }
  }

  const fields: { key: keyof LinksConfig; label: string; placeholder: string }[] = [
    { key: 'spotifyArtistUrl', label: 'Spotify Artist/Playlist URL', placeholder: 'https://open.spotify.com/artist/...' },
    { key: 'spotifyPlaylistId', label: 'Spotify Playlist ID (für Song-Import)', placeholder: '37i9dQZF1DX...' },
    { key: 'discordInvite', label: 'Discord Einladungs-Link', placeholder: 'https://discord.gg/...' },
    { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://www.instagram.com/...' },
    { key: 'youtubeUrl', label: 'YouTube Kanal URL', placeholder: 'https://www.youtube.com/@...' },
    { key: 'bandcampUrl', label: 'Bandcamp URL', placeholder: 'https://crazymess.bandcamp.com' },
    { key: 'websiteUrl', label: 'Website URL', placeholder: 'https://crazymess.band' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#2A2A2A] sticky top-0 bg-[#141414]">
          <h2 className="font-bold text-white">Links bearbeiten</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">{label}</label>
              <input type="text" value={(form as any)[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors" />
            </div>
          ))}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 mt-2 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 font-bold text-white transition-all flex items-center justify-center gap-2">
            {saving ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><Save size={18} /> Speichern</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LinksScreen() {
  const { isAdmin } = useAuth()
  const [config, setConfig] = useState<LinksConfig>({})
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => { return subscribeLinksConfig(setConfig) }, [])

  const hasAnyLink = Object.values(config).some(v => typeof v === 'string' && v.trim())

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <div className="px-4 pb-4 screen-top">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black gradient-text">Links & Socials</h1>
            <p className="text-[#888888] text-xs mt-0.5">Spotify · Discord · Social Media</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#2A2A2A] text-[#888888] hover:text-white hover:border-[#3A3A3A] text-sm transition-all">
              <Edit3 size={15} /> Bearbeiten
            </button>
          )}
        </div>

        {!hasAnyLink && !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <Globe size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Noch keine Links konfiguriert.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Spotify */}
            {config.spotifyArtistUrl && (
              <a href={config.spotifyArtistUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#1DB954]/30 transition-all group active:scale-95">
                <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center flex-shrink-0"><SpotifyIcon /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">Spotify</div>
                  <div className="text-[#888888] text-xs mt-0.5">Crazy Mess auf Spotify · Songs & Playlists</div>
                </div>
                <ExternalLink size={16} className="text-[#555] group-hover:text-[#888888] transition-colors" />
              </a>
            )}

            {/* Discord */}
            {config.discordInvite && (
              <a href={config.discordInvite} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#5865F2]/30 transition-all group active:scale-95">
                <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 flex items-center justify-center flex-shrink-0"><DiscordIcon /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">Discord</div>
                  <div className="text-[#888888] text-xs mt-0.5">Crazy Mess Discord Server beitreten</div>
                </div>
                <ExternalLink size={16} className="text-[#555] group-hover:text-[#888888] transition-colors" />
              </a>
            )}

            {/* Instagram */}
            {config.instagramUrl && (
              <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#E1306C]/30 transition-all group active:scale-95">
                <div className="w-12 h-12 rounded-2xl bg-[#E1306C]/10 flex items-center justify-center flex-shrink-0">
                  <Instagram size={24} className="text-[#E1306C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">Instagram</div>
                  <div className="text-[#888888] text-xs mt-0.5">Crazy Mess auf Instagram</div>
                </div>
                <ExternalLink size={16} className="text-[#555] group-hover:text-[#888888] transition-colors" />
              </a>
            )}

            {/* YouTube */}
            {config.youtubeUrl && (
              <a href={config.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#FF0000]/30 transition-all group active:scale-95">
                <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/10 flex items-center justify-center flex-shrink-0">
                  <Youtube size={24} className="text-[#FF0000]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">YouTube</div>
                  <div className="text-[#888888] text-xs mt-0.5">Crazy Mess auf YouTube</div>
                </div>
                <ExternalLink size={16} className="text-[#555] group-hover:text-[#888888] transition-colors" />
              </a>
            )}

            {/* Bandcamp */}
            {config.bandcampUrl && (
              <a href={config.bandcampUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#1DA0C3]/30 transition-all group active:scale-95">
                <div className="w-12 h-12 rounded-2xl bg-[#1DA0C3]/10 flex items-center justify-center flex-shrink-0">
                  <Music2 size={24} className="text-[#1DA0C3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">Bandcamp</div>
                  <div className="text-[#888888] text-xs mt-0.5">Musik kaufen & unterstützen</div>
                </div>
                <ExternalLink size={16} className="text-[#555] group-hover:text-[#888888] transition-colors" />
              </a>
            )}

            {/* Website */}
            {config.websiteUrl && (
              <a href={config.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#8B00FF]/30 transition-all group active:scale-95">
                <div className="w-12 h-12 rounded-2xl bg-[#8B00FF]/10 flex items-center justify-center flex-shrink-0">
                  <Globe size={24} className="text-[#8B00FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">Website</div>
                  <div className="text-[#888888] text-xs mt-0.5 truncate">{config.websiteUrl}</div>
                </div>
                <ExternalLink size={16} className="text-[#555] group-hover:text-[#888888] transition-colors" />
              </a>
            )}

            {isAdmin && !hasAnyLink && (
              <div className="text-center py-8 text-[#555]">
                <p className="text-sm">Noch keine Links. Klick auf "Bearbeiten" um Links hinzuzufügen.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showEdit && <EditLinksModal config={config} onClose={() => setShowEdit(false)} />}
    </div>
  )
}
