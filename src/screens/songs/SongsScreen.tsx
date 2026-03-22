import { useEffect, useState } from 'react'
import { Plus, Music2, ExternalLink, Trash2, Youtube, Search, X, Play } from 'lucide-react'
import { subscribeSongs, addSong, deleteSong } from '@/services/firestoreService'
import { detectUrlType, extractSpotifyTrackId, extractYoutubeId, getTrackById } from '@/services/spotifyService'
import { useAuth } from '@/context/AuthContext'
import type { Song, SongTag } from '@/types'

const TAG_COLORS: Record<SongTag, string> = {
  original: 'bg-[#8B00FF]/20 text-[#AA44FF]',
  cover: 'bg-[#FF6B35]/20 text-[#FF6B35]',
  idee: 'bg-[#888]/20 text-[#888]',
  setlist: 'bg-[#00D4AA]/20 text-[#00D4AA]',
}
const TAG_LABELS: Record<SongTag, string> = {
  original: 'Eigener Song', cover: 'Cover', idee: 'Idee', setlist: 'Setlist',
}

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

function AddSongModal({ onClose, userId, userName }: { onClose: () => void; userId: string; userName: string }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [note, setNote] = useState('')
  const [tags, setTags] = useState<SongTag[]>(['idee'])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  async function handleUrlChange(val: string) {
    setUrl(val)
    setError('')
    const urlType = detectUrlType(val)
    if (urlType === 'spotify') {
      const trackId = extractSpotifyTrackId(val)
      if (trackId) {
        setFetching(true)
        try {
          const track = await getTrackById(trackId)
          if (track?.name) {
            setTitle(track.name)
            setArtist(track.artists?.map((a: any) => a.name).join(', ') || '')
          }
        } catch { /* ignore */ } finally { setFetching(false) }
      }
    } else if (urlType === 'youtube') {
      const ytId = extractYoutubeId(val)
      if (ytId && !title) {
        // YouTube thumbnail available – just note it
      }
    }
  }

  function toggleTag(tag: SongTag) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) { setError('Bitte Titel und Link angeben.'); return }
    setLoading(true)
    try {
      const urlType = detectUrlType(url)
      const spotifyTrackId = urlType === 'spotify' ? (extractSpotifyTrackId(url) || undefined) : undefined
      const youtubeId = urlType === 'youtube' ? (extractYoutubeId(url) || undefined) : undefined
      const coverImage = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : undefined
      await addSong({
        title: title.trim(), artist: artist.trim(), url,
        urlType, spotifyTrackId, youtubeId, coverImage,
        tags: tags.length ? tags : ['idee'],
        note: note.trim(), addedBy: userId, addedByName: userName,
      })
      onClose()
    } catch (e: any) { setError(e?.message || 'Fehler beim Hinzufügen.') } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#2A2A2A]">
          <h2 className="font-bold text-white flex items-center gap-2"><Music2 size={18} className="text-[#8B00FF]" /> Song hinzufügen</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Link (Spotify, YouTube, SoundCloud...)</label>
            <input
              type="url"
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://open.spotify.com/track/... oder https://youtu.be/..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
            {fetching && <p className="text-xs text-[#8B00FF] mt-1 animate-pulse">Lade Spotify-Infos...</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Titel *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="Song-Titel"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Künstler</label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder="Interpret"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TAG_LABELS) as SongTag[]).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    tags.includes(tag) ? TAG_COLORS[tag] + ' border-current' : 'border-[#2A2A2A] text-[#888]'
                  }`}
                >
                  {TAG_LABELS[tag]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Notiz (optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder='z.B. "Für nächste Probe ausprobieren"'
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><Plus size={18} /> Hinzufügen</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function SongCard({ song, currentUserId, isAdmin, onDelete }: {
  song: Song; currentUserId: string; isAdmin: boolean; onDelete: (id: string) => void
}) {
  const [showEmbed, setShowEmbed] = useState(false)
  const canDelete = isAdmin || song.addedBy === currentUserId

  function openLink() {
    window.open(song.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#8B00FF]/30 transition-all duration-200">
      <div className="flex items-start gap-3 p-4">
        {/* Cover */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1E1E1E] flex-shrink-0 flex items-center justify-center">
          {song.coverImage ? (
            <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
          ) : song.urlType === 'spotify' ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.241-3.021-1.858-6.832-2.278-11.322-1.237-.43.101-.86-.159-.97-.589-.101-.43.159-.86.589-.97 4.911-1.121 9.121-.63 12.511 1.431.38.24.5.721.24 1.101l.053.023zm1.44-3.3c-.301.47-.921.619-1.381.319-3.461-2.122-8.731-2.738-12.821-1.5-.521.159-1.071-.131-1.24-.641-.16-.521.13-1.07.641-1.24 4.67-1.411 10.47-.74 14.44 1.71.46.29.62.921.32 1.38l.041-.029zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.23-.15-1.39-.74-.18-.6.15-1.23.74-1.41 4.23-1.281 11.26-1.031 15.71 1.56.54.32.72 1.02.4 1.56-.32.54-1.02.72-1.56.4l.04-.03z"/></svg>
          ) : song.urlType === 'youtube' ? (
            <Youtube size={22} className="text-red-500" />
          ) : (
            <Music2 size={22} className="text-[#555]" />
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white truncate">{song.title}</div>
          <div className="text-[#888888] text-xs truncate">{song.artist || 'Unbekannt'}</div>
          {song.note && <div className="text-[#888888] text-xs mt-0.5 italic truncate">"{song.note}"</div>}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {song.tags.map(tag => (
              <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag]}`}>
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <button onClick={openLink} className="text-[#888888] hover:text-[#8B00FF] transition-colors">
            <ExternalLink size={16} />
          </button>
          {(song.spotifyTrackId || song.youtubeId) && (
            <button onClick={() => setShowEmbed(v => !v)} className="text-[#888888] hover:text-[#AA44FF] transition-colors">
              <Play size={16} className={showEmbed ? 'text-[#8B00FF]' : ''} />
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(song.id)} className="text-[#888888] hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {/* Embed */}
      {showEmbed && (
        <div className="px-4 pb-4 song-embed">
          {song.spotifyTrackId && <SpotifyEmbed trackId={song.spotifyTrackId} />}
          {!song.spotifyTrackId && song.youtubeId && <YouTubeEmbed videoId={song.youtubeId} />}
        </div>
      )}
      {/* Added by */}
      <div className="px-4 pb-3 text-[10px] text-[#555]">
        von {song.addedByName}
      </div>
    </div>
  )
}

export default function SongsScreen() {
  const { user, isAdmin } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<SongTag | 'all'>('all')

  useEffect(() => {
    return subscribeSongs(setSongs)
  }, [])

  async function handleDelete(id: string) {
    if (confirm('Song löschen?')) await deleteSong(id)
  }

  const filtered = songs.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase())
    const matchTag = filterTag === 'all' || s.tags.includes(filterTag)
    return matchSearch && matchTag
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black gradient-text">Songs</h1>
            <p className="text-[#888888] text-xs mt-0.5">{songs.length} Songs · Proben & Gigs</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] text-white text-sm font-semibold transition-all purple-glow-sm"
          >
            <Plus size={16} /> Song
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Song oder Künstler suchen..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
          />
        </div>

        {/* Tag filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {(['all', ...Object.keys(TAG_LABELS)] as (SongTag | 'all')[]).map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag as any)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                filterTag === tag
                  ? tag === 'all' ? 'bg-[#8B00FF]/20 text-[#8B00FF] border-[#8B00FF]/50' : TAG_COLORS[tag as SongTag] + ' border-current'
                  : 'border-[#2A2A2A] text-[#888888]'
              }`}
            >
              {tag === 'all' ? 'Alle' : TAG_LABELS[tag as SongTag]}
            </button>
          ))}
        </div>
      </div>

      {/* Song list */}
      <div className="px-4 pb-6 space-y-3 flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <Music2 size={48} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? 'Keine Songs gefunden.' : 'Noch keine Songs. Füge den ersten hinzu!'}</p>
          </div>
        ) : (
          filtered.map(song => (
            <SongCard
              key={song.id}
              song={song}
              currentUserId={user?.uid || ''}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showAdd && user && (
        <AddSongModal
          onClose={() => setShowAdd(false)}
          userId={user.uid}
          userName={user.displayName}
        />
      )}
    </div>
  )
}
