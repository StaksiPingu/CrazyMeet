// Spotify Web API – Client Credentials Flow (for public data)
// Set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET in .env

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''

let accessToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured')
  }
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000
  return accessToken!
}

export async function getPlaylist(playlistId: string) {
  const token = await getAccessToken()
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getPlaylistTracks(playlistId: string) {
  const token = await getAccessToken()
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(track(id,name,artists,album(images),duration_ms,external_urls))`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  return data.items?.map((item: any) => item.track).filter(Boolean) ?? []
}

export async function getTrackById(trackId: string) {
  const token = await getAccessToken()
  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

/** Extract Spotify track ID from various URL formats */
export function extractSpotifyTrackId(url: string): string | null {
  const patterns = [
    /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/,
    /spotify:track:([a-zA-Z0-9]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

/** Extract YouTube video ID from various URL formats */
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

/** Detect URL type from link */
export function detectUrlType(url: string): 'spotify' | 'youtube' | 'soundcloud' | 'other' {
  if (url.includes('spotify.com') || url.startsWith('spotify:')) return 'spotify'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('soundcloud.com')) return 'soundcloud'
  return 'other'
}

/** Get Spotify open URL for a track */
export function getSpotifyOpenUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`
}

/** Try to get Spotify app URI first, fall back to web */
export function openSpotify(trackId: string) {
  // Try to open Spotify app
  const appUri = `spotify:track:${trackId}`
  const webUrl = `https://open.spotify.com/track/${trackId}`

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = appUri
  document.body.appendChild(iframe)
  setTimeout(() => {
    document.body.removeChild(iframe)
    window.open(webUrl, '_blank', 'noopener,noreferrer')
  }, 1000)
}
