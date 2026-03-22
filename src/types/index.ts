import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  displayName: string
  email: string
  photoUrl?: string
  role: 'admin' | 'member'
  instrument?: string
  createdAt: Timestamp
}

export interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  senderPhoto?: string
  type: 'text' | 'image'
  imageUrl?: string
  createdAt: Timestamp
}

export type EventType = 'gig' | 'rehearsal'
export type AttendanceStatus = 'yes' | 'no' | 'maybe'

export interface Attendance {
  status: AttendanceStatus
  userId: string
  userName: string
  updatedAt: Timestamp
}

export interface BandEvent {
  id: string
  title: string
  type: EventType
  date: Timestamp
  endDate?: Timestamp
  location: string
  description?: string
  createdBy: string
  createdByName: string
  songIds?: string[]
  attendance?: Record<string, Attendance>
  setlistNote?: string
  createdAt: Timestamp
}

export type SongUrlType = 'spotify' | 'youtube' | 'soundcloud' | 'other'
export type SongTag = 'original' | 'cover' | 'idee' | 'setlist'

export interface Song {
  id: string
  title: string
  artist: string
  url: string
  urlType: SongUrlType
  spotifyTrackId?: string
  youtubeId?: string
  coverImage?: string
  duration?: string
  tags: SongTag[]
  note?: string
  addedBy: string
  addedByName: string
  createdAt: Timestamp
}

export type VoteType = 'songs' | 'date' | 'general'

export interface VoteOption {
  id: string
  label: string
  songId?: string
  date?: string
}

export interface Vote {
  id: string
  question: string
  type: VoteType
  options: VoteOption[]
  votes: Record<string, string[]>  // uid → optionIds[]
  createdBy: string
  createdByName: string
  createdAt: Timestamp
  closesAt?: Timestamp
  closed?: boolean
  multiSelect?: boolean
}

export interface Playlist {
  id: string
  name: string
  description?: string
  songIds: string[]
  spotifyPlaylistId?: string
  createdBy: string
  createdByName: string
  createdAt: Timestamp
}

export interface LinksConfig {
  spotifyArtistUrl?: string
  spotifyPlaylistId?: string
  discordInvite?: string
  instagramUrl?: string
  youtubeUrl?: string
  bandcampUrl?: string
  websiteUrl?: string
}
