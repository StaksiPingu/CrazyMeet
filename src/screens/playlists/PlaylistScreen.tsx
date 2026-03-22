import { useEffect, useState } from 'react'
import { Plus, ListMusic, Trash2, X, Play, ChevronDown, ChevronUp, Music2, Youtube } from 'lucide-react'
import { subscribePlaylists, createPlaylist, deletePlaylist, removeSongFromPlaylist, subscribeSongs, addSongToPlaylist } from '@/services/firestoreService'
import { useAuth } from '@/context/AuthContext'
import type { Playlist, Song } from '@/types'

function SpotifyEmbed({ trackId }: { trackId: string }) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
      height="80"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="w-full rounded-xl border-0"
    />
  )
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
      height="180"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
      className="w-full rounded-xl border-0"
    />
  )
}

function extractSpotifyPlaylistId(input: string): string | null {
  const m = input.match(/playlist\/([a-zA-Z0-9]+)/)
  if (m) return m[1]
  if (/^[a-zA-Z0-9]{10,}$/.test(input.trim())) return input.trim()
  return null
}

function CreatePlaylistModal({ onClose, userId, userName }: { onClose: () => void; userId: string; userName: string }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [spotifyLink, setSpotifyLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Bitte einen Namen eingeben.'); return }
    const spotifyPlaylistId = spotifyLink.trim() ? extractSpotifyPlaylistId(spotifyLink.trim()) ?? undefined : undefined
    if (spotifyLink.trim() && !spotifyPlaylistId) { setError('Ungültiger Spotify-Playlist-Link.'); return }
    setLoading(true)
    try {
      await createPlaylist({ name: name.trim(), description: description.trim(), songIds: [], spotifyPlaylistId, createdBy: userId, createdByName: userName })
      onClose()
    } catch { setError('Fehler beim Erstellen.') } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#2A2A2A]">
          <h2 className="font-bold text-white flex items-center gap-2"><ListMusic size={18} className="text-[#8B00FF]" /> Playlist erstellen</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="z.B. Setlist Gig Berlin"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Spotify Playlist Link (optional)</label>
            <input
              type="text"
              value={spotifyLink}
              onChange={e => setSpotifyLink(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Beschreibung (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="z.B. Probe 14.04. – neue Songs"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><Plus size={18} /> Erstellen</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function AddSongModal({ playlist, songs, onClose }: { playlist: Playlist; songs: Song[]; onClose: () => void }) {
  const available = songs.filter(s => !playlist.songIds.includes(s.id))
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = available.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd(song: Song) {
    setLoading(song.id)
    await addSongToPlaylist(playlist.id, song.id, playlist.songIds)
    setLoading(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#2A2A2A] flex-shrink-0">
          <h2 className="font-bold text-white flex items-center gap-2"><Music2 size={18} className="text-[#8B00FF]" /> Song hinzufügen</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white"><X size={20} /></button>
        </div>
        <div className="px-5 pt-3 flex-shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Song suchen..."
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
          />
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-[#555] text-sm text-center py-8">Alle Songs bereits in der Playlist.</p>
          ) : filtered.map(song => (
            <div key={song.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A]">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{song.title}</div>
                <div className="text-xs text-[#888888] truncate">{song.artist || 'Unbekannt'}</div>
              </div>
              <button
                onClick={() => handleAdd(song)}
                disabled={loading === song.id}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 text-white text-xs font-semibold transition-all"
              >
                {loading === song.id ? '...' : '+ Add'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlaylistCard({ playlist, songs, currentUserId, isAdmin }: {
  playlist: Playlist; songs: Song[]; currentUserId: string; isAdmin: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [showAddSong, setShowAddSong] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const canDelete = isAdmin || playlist.createdBy === currentUserId
  const playlistSongs = playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[]

  async function handleRemove(songId: string) {
    await removeSongFromPlaylist(playlist.id, songId, playlist.songIds)
  }

  async function handleDelete() {
    if (confirm(`Playlist "${playlist.name}" löschen?`)) await deletePlaylist(playlist.id)
  }

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#8B00FF]/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-[#8B00FF]/20 flex items-center justify-center flex-shrink-0">
          <ListMusic size={22} className="text-[#8B00FF]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white truncate">{playlist.name}</div>
          {playlist.description && <div className="text-[#888888] text-xs truncate">{playlist.description}</div>}
          <div className="text-[10px] text-[#555] mt-0.5">{playlistSongs.length} Songs · von {playlist.createdByName}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canDelete && (
            <button onClick={handleDelete} className="text-[#888888] hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)} className="text-[#888888] hover:text-white transition-colors">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Songs */}
      {expanded && (
        <div className="border-t border-[#2A2A2A]">
          {playlist.spotifyPlaylistId && (
            <div className="p-3">
              <iframe
                src={`https://open.spotify.com/embed/playlist/${playlist.spotifyPlaylistId}?utm_source=generator&theme=0`}
                height="380"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full rounded-xl border-0"
              />
            </div>
          )}
          {!playlist.spotifyPlaylistId && playlistSongs.length === 0 ? (
            <p className="text-[#555] text-xs text-center py-6">Noch keine Songs in dieser Playlist.</p>
          ) : !playlist.spotifyPlaylistId && (
            <div className="divide-y divide-[#1E1E1E]">
              {playlistSongs.map((song, i) => (
                <div key={song.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[#555] text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                      {song.coverImage ? (
                        <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                      ) : song.urlType === 'youtube' ? (
                        <Youtube size={14} className="text-red-500" />
                      ) : (
                        <Music2 size={14} className="text-[#555]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{song.title}</div>
                      <div className="text-xs text-[#888888] truncate">{song.artist || 'Unbekannt'}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(song.spotifyTrackId || song.youtubeId) && (
                        <button
                          onClick={() => setPlayingId(playingId === song.id ? null : song.id)}
                          className="text-[#888888] hover:text-[#8B00FF] transition-colors"
                        >
                          <Play size={15} className={playingId === song.id ? 'text-[#8B00FF]' : ''} />
                        </button>
                      )}
                      {(isAdmin || playlist.createdBy === currentUserId) && (
                        <button onClick={() => handleRemove(song.id)} className="text-[#888888] hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {playingId === song.id && (
                    <div className="mt-3">
                      {song.spotifyTrackId && <SpotifyEmbed trackId={song.spotifyTrackId} />}
                      {!song.spotifyTrackId && song.youtubeId && <YouTubeEmbed videoId={song.youtubeId} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!playlist.spotifyPlaylistId && (
            <div className="px-4 py-3 border-t border-[#1E1E1E]">
              <button
                onClick={() => setShowAddSong(true)}
                className="w-full py-2 rounded-xl border border-dashed border-[#8B00FF]/40 text-[#8B00FF] text-sm hover:bg-[#8B00FF]/10 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Song hinzufügen
              </button>
            </div>
          )}
        </div>
      )}

      {showAddSong && (
        <AddSongModal playlist={playlist} songs={songs} onClose={() => setShowAddSong(false)} />
      )}
    </div>
  )
}

export default function PlaylistScreen() {
  const { user, isAdmin } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    const unsub1 = subscribePlaylists(setPlaylists)
    const unsub2 = subscribeSongs(setSongs)
    return () => { unsub1(); unsub2() }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <div className="px-4 pb-4 screen-top">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black gradient-text">Playlists</h1>
            <p className="text-[#888888] text-xs mt-0.5">{playlists.length} Playlists · Setlists & Proben</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] text-white text-sm font-semibold transition-all purple-glow-sm"
          >
            <Plus size={16} /> Neu
          </button>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3 flex-1">
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <ListMusic size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Noch keine Playlists. Erstelle die erste!</p>
          </div>
        ) : (
          playlists.map(pl => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              songs={songs}
              currentUserId={user?.uid || ''}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      {showCreate && user && (
        <CreatePlaylistModal
          onClose={() => setShowCreate(false)}
          userId={user.uid}
          userName={user.displayName}
        />
      )}
    </div>
  )
}
