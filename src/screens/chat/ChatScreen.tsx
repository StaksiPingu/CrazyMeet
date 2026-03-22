import { useEffect, useRef, useState } from 'react'
import { Send, Trash2, Music2 } from 'lucide-react'
import { subscribeMessages, sendMessage, deleteMessage } from '@/services/firestoreService'
import { useAuth } from '@/context/AuthContext'
import type { Message } from '@/types'
import { format, isToday, isYesterday } from 'date-fns'
import { de } from 'date-fns/locale'

function formatTime(ts: any) {
  try {
    const d = ts?.toDate?.() || new Date(ts)
    if (isToday(d)) return format(d, 'HH:mm')
    if (isYesterday(d)) return 'Gestern ' + format(d, 'HH:mm')
    return format(d, 'dd. MMM HH:mm', { locale: de })
  } catch { return '' }
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#8B00FF]/30 flex-shrink-0 flex items-center justify-center">
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[#AA44FF] font-bold text-sm">{name?.[0]?.toUpperCase()}</span>
      )}
    </div>
  )
}

export default function ChatScreen() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const unsub = subscribeMessages(setMessages)
    return unsub
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !user || sending) return
    setSending(true)
    setText('')
    try {
      await sendMessage(user.uid, user.displayName, user.photoUrl || '', trimmed)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleDelete(msgId: string) {
    if (confirm('Nachricht löschen?')) await deleteMessage(msgId)
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="glass border-b border-[#2A2A2A] px-4 py-3 flex items-center gap-3 flex-shrink-0 safe-top">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#8B00FF] purple-glow-sm">
          <img src="/icons/icon-512.png" alt="CM" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white">Crazy Mess · Band-Chat</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#555]">
            <Music2 size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Noch keine Nachrichten.</p>
            <p className="text-xs mt-1">Schreib was Crazyyyyyy! 🤘</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.uid
          const showAvatar = !isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId)
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                <div className="w-8 flex-shrink-0">
                  {showAvatar && <Avatar name={msg.senderName} photo={msg.senderPhoto} />}
                </div>
              )}
              <div className={`group flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {showAvatar && !isMe && (
                  <span className="text-[10px] text-[#888888] mb-1 px-1">{msg.senderName}</span>
                )}
                <div
                  className={`relative px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-[#8B00FF] text-white rounded-br-sm'
                      : 'bg-[#1E1E1E] text-[#F0F0F0] border border-[#2A2A2A] rounded-bl-sm'
                  }`}
                >
                  {msg.type === 'image' && msg.imageUrl ? (
                    <img src={msg.imageUrl} alt="Bild" className="max-w-[240px] rounded-xl" />
                  ) : (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 px-1">
                  <span className="text-[9px] text-[#555]">{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={11} className="text-[#555] hover:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 glass border-t border-[#2A2A2A] px-3 py-3 safe-bottom">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            rows={1}
            className="flex-1 resize-none bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#8B00FF] transition-colors max-h-28 overflow-y-auto hide-scrollbar"
            style={{ lineHeight: '1.5' }}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 purple-glow-sm"
          >
            <Send size={16} className="text-white ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
