import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, orderBy, limit, onSnapshot, serverTimestamp, setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { BandEvent, Song, Vote, LinksConfig, Message, Playlist } from '@/types'

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export function subscribeMessages(callback: (msgs: Message[]) => void) {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(200))
  return onSnapshot(q, snap => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[]
    callback(msgs)
  })
}

export async function sendMessage(senderId: string, senderName: string, senderPhoto: string, text: string) {
  return addDoc(collection(db, 'messages'), {
    text, senderId, senderName, senderPhoto,
    type: 'text',
    createdAt: serverTimestamp(),
  })
}

export async function sendImageMessage(senderId: string, senderName: string, senderPhoto: string, imageUrl: string) {
  return addDoc(collection(db, 'messages'), {
    text: '', senderId, senderName, senderPhoto,
    type: 'image', imageUrl,
    createdAt: serverTimestamp(),
  })
}

export async function deleteMessage(messageId: string) {
  return deleteDoc(doc(db, 'messages', messageId))
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export function subscribeEvents(callback: (events: BandEvent[]) => void) {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'))
  return onSnapshot(q, snap => {
    const events = snap.docs.map(d => ({ id: d.id, ...d.data() })) as BandEvent[]
    callback(events)
  })
}

export async function createEvent(data: Omit<BandEvent, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'events'), { ...data, attendance: {}, createdAt: serverTimestamp() })
}

export async function updateEvent(id: string, data: Partial<BandEvent>) {
  return updateDoc(doc(db, 'events', id), data)
}

export async function deleteEvent(id: string) {
  return deleteDoc(doc(db, 'events', id))
}

export async function setAttendance(eventId: string, userId: string, userName: string, status: 'yes' | 'no' | 'maybe') {
  return updateDoc(doc(db, 'events', eventId), {
    [`attendance.${userId}`]: { status, userId, userName, updatedAt: Timestamp.now() },
  })
}

// ─── SONGS ───────────────────────────────────────────────────────────────────

export function subscribeSongs(callback: (songs: Song[]) => void) {
  const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    const songs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Song[]
    callback(songs)
  })
}

export async function addSong(data: Omit<Song, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'songs'), { ...data, createdAt: serverTimestamp() })
}

export async function updateSong(id: string, data: Partial<Song>) {
  return updateDoc(doc(db, 'songs', id), data)
}

export async function deleteSong(id: string) {
  return deleteDoc(doc(db, 'songs', id))
}

// ─── VOTES ───────────────────────────────────────────────────────────────────

export function subscribeVotes(callback: (votes: Vote[]) => void) {
  const q = query(collection(db, 'votes'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    const votes = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Vote[]
    callback(votes)
  })
}

export async function createVote(data: Omit<Vote, 'id' | 'createdAt' | 'votes'>) {
  return addDoc(collection(db, 'votes'), { ...data, votes: {}, createdAt: serverTimestamp() })
}

export async function castVote(voteId: string, userId: string, optionIds: string[]) {
  return updateDoc(doc(db, 'votes', voteId), { [`votes.${userId}`]: optionIds })
}

export async function closeVote(voteId: string) {
  return updateDoc(doc(db, 'votes', voteId), { closed: true })
}

export async function deleteVote(id: string) {
  return deleteDoc(doc(db, 'votes', id))
}

// ─── LINKS CONFIG ─────────────────────────────────────────────────────────────

export async function getLinksConfig(): Promise<LinksConfig> {
  const snap = await getDoc(doc(db, 'config', 'links'))
  return snap.exists() ? (snap.data() as LinksConfig) : {}
}

export async function updateLinksConfig(data: Partial<LinksConfig>) {
  return setDoc(doc(db, 'config', 'links'), data, { merge: true })
}

export function subscribeLinksConfig(callback: (cfg: LinksConfig) => void) {
  return onSnapshot(doc(db, 'config', 'links'), snap => {
    callback(snap.exists() ? (snap.data() as LinksConfig) : {})
  })
}

// ─── PLAYLISTS ────────────────────────────────────────────────────────────────

export function subscribePlaylists(callback: (playlists: Playlist[]) => void) {
  const q = query(collection(db, 'playlists'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Playlist[])
  })
}

export async function createPlaylist(data: Omit<Playlist, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'playlists'), { ...data, createdAt: serverTimestamp() })
}

export async function updatePlaylist(id: string, data: Partial<Playlist>) {
  return updateDoc(doc(db, 'playlists', id), data)
}

export async function deletePlaylist(id: string) {
  return deleteDoc(doc(db, 'playlists', id))
}

export async function addSongToPlaylist(playlistId: string, songId: string, currentSongIds: string[]) {
  if (currentSongIds.includes(songId)) return
  return updateDoc(doc(db, 'playlists', playlistId), { songIds: [...currentSongIds, songId] })
}

export async function removeSongFromPlaylist(playlistId: string, songId: string, currentSongIds: string[]) {
  return updateDoc(doc(db, 'playlists', playlistId), { songIds: currentSongIds.filter(id => id !== songId) })
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => d.data())
}

export async function updateUserProfile(uid: string, data: { displayName?: string; photoUrl?: string; instrument?: string }) {
  return updateDoc(doc(db, 'users', uid), data)
}
