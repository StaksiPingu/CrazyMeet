import { useEffect, useState } from 'react'
import { Plus, Vote, X, Check, Lock } from 'lucide-react'
import { subscribeVotes, createVote, castVote, closeVote, deleteVote } from '@/services/firestoreService'
import { useAuth } from '@/context/AuthContext'
import type { Vote as VoteType, VoteType as VType } from '@/types'

function VoteBar({ count, total }: { count: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#888888] w-5 text-right">{pct}%</span>
      <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div className="h-full bg-[#8B00FF] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#888888]">{count}</span>
    </div>
  )
}

function CreateVoteModal({ onClose, userId, userName }: { onClose: () => void; userId: string; userName: string }) {
  const [question, setQuestion] = useState('')
  const [type, setType] = useState<VType>('general')
  const [options, setOptions] = useState(['', ''])
  const [multiSelect, setMultiSelect] = useState(false)
  const [loading, setLoading] = useState(false)

  function addOption() { setOptions(o => [...o, '']) }
  function removeOption(i: number) { setOptions(o => o.filter((_, idx) => idx !== i)) }
  function updateOption(i: number, val: string) { setOptions(o => o.map((opt, idx) => idx === i ? val : opt)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validOptions = options.filter(o => o.trim())
    if (validOptions.length < 2) return
    setLoading(true)
    try {
      await createVote({
        question: question.trim(),
        type,
        options: validOptions.map((label, i) => ({ id: String(i), label })),
        createdBy: userId,
        createdByName: userName,
        multiSelect,
        closed: false,
      })
      onClose()
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#2A2A2A] sticky top-0 bg-[#141414] z-10">
          <h2 className="font-bold text-white flex items-center gap-2"><Vote size={18} className="text-[#8B00FF]" /> Abstimmung erstellen</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Frage *</label>
            <input type="text" value={question} onChange={e => setQuestion(e.target.value)} required placeholder='z.B. "Welche Songs für die nächste Probe?"'
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors" />
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-2">Typ</label>
            <div className="flex gap-2 flex-wrap">
              {([['general', 'Allgemein'], ['songs', 'Songs'], ['date', 'Termin']] as const).map(([t, label]) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${type === t ? 'bg-[#8B00FF]/20 text-[#8B00FF] border-[#8B00FF]/50' : 'border-[#2A2A2A] text-[#888888]'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-2">Optionen *</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors" />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-[#555] hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 8 && (
              <button type="button" onClick={addOption} className="mt-2 text-[#8B00FF] text-xs hover:text-[#AA44FF] transition-colors">+ Option hinzufügen</button>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-all ${multiSelect ? 'bg-[#8B00FF]' : 'bg-[#2A2A2A]'}`}
              onClick={() => setMultiSelect(v => !v)}>
              <div className={`w-4 h-4 m-0.5 bg-white rounded-full shadow transition-all ${multiSelect ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-[#888888]">Mehrfachauswahl erlaubt</span>
          </label>
          <button type="submit" disabled={loading || question.trim().length === 0 || options.filter(o => o.trim()).length < 2}
            className="w-full py-3 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-50 font-bold text-white transition-all flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><Vote size={18} /> Abstimmung starten</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function VoteCard({ vote, userId, isAdmin }: { vote: VoteType; userId: string; isAdmin: boolean }) {
  const myVotes = vote.votes?.[userId] || []
  const totalVoters = Object.keys(vote.votes || {}).length
  const [selected, setSelected] = useState<string[]>(myVotes)
  const [saving, setSaving] = useState(false)

  function toggleOption(optId: string) {
    if (vote.closed) return
    if (vote.multiSelect) {
      setSelected(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
    } else {
      setSelected([optId])
    }
  }

  async function handleVote() {
    if (!selected.length) return
    setSaving(true)
    try { await castVote(vote.id, userId, selected) } finally { setSaving(false) }
  }

  function getOptionCount(optId: string) {
    return Object.values(vote.votes || {}).filter((ids: unknown) => (ids as string[]).includes(optId)).length
  }

  const hasVoted = myVotes.length > 0
  const showResults = vote.closed || hasVoted

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 hover:border-[#8B00FF]/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm leading-snug">{vote.question}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-[#888888]">von {vote.createdByName}</span>
            <span className="text-[10px] text-[#888888]">{totalVoters} Stimme{totalVoters !== 1 ? 'n' : ''}</span>
            {vote.multiSelect && <span className="text-[10px] text-[#8B00FF]">Mehrfach</span>}
            {vote.closed && <span className="text-[10px] text-red-400 flex items-center gap-0.5"><Lock size={9} /> Geschlossen</span>}
          </div>
        </div>
        {(isAdmin || vote.createdBy === userId) && !vote.closed && (
          <button onClick={() => closeVote(vote.id)} className="text-[10px] text-[#555] hover:text-yellow-400 flex items-center gap-1 transition-colors whitespace-nowrap">
            <Lock size={11} /> Schließen
          </button>
        )}
        {(isAdmin || vote.createdBy === userId) && (
          <button onClick={() => { if (confirm('Abstimmung löschen?')) deleteVote(vote.id) }} className="text-[#555] hover:text-red-400 transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {vote.options.map((opt: { id: string; label: string }) => {
          const count = getOptionCount(opt.id)
          const isSelected = selected.includes(opt.id)
          const isMyVote = myVotes.includes(opt.id)
          return (
            <div key={opt.id}>
              <button
                onClick={() => toggleOption(opt.id)}
                disabled={vote.closed}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  isSelected && !showResults ? 'bg-[#8B00FF]/20 border-[#8B00FF]/60 text-[#AA44FF]' :
                  isMyVote && showResults ? 'bg-[#8B00FF]/10 border-[#8B00FF]/30 text-white' :
                  'border-[#2A2A2A] text-[#888888] hover:border-[#3A3A3A] hover:text-white'
                } ${vote.closed ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected && !showResults ? 'border-[#8B00FF] bg-[#8B00FF]' :
                  isMyVote && showResults ? 'border-[#8B00FF] bg-[#8B00FF]' :
                  'border-[#3A3A3A]'
                }`}>
                  {((isSelected && !showResults) || (isMyVote && showResults)) && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
                <span className="flex-1 text-left text-sm">{opt.label}</span>
                {showResults && <span className="text-xs text-[#888888]">{count}</span>}
              </button>
              {showResults && <VoteBar count={count} total={totalVoters} label={opt.label} />}
            </div>
          )
        })}
      </div>

      {/* Vote button */}
      {!vote.closed && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleVote}
            disabled={saving || !selected.length || JSON.stringify(selected.sort()) === JSON.stringify(myVotes.sort())}
            className="flex-1 py-2 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            {saving ? 'Speichere...' : hasVoted ? 'Ändern & Speichern' : 'Abstimmen'}
          </button>
          {hasVoted && (
            <button onClick={() => { castVote(vote.id, userId, []); setSelected([]) }} className="text-[10px] text-[#555] hover:text-red-400 transition-colors">
              Austragen
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function VotingScreen() {
  const { user, isAdmin } = useAuth()
  const [votes, setVotes] = useState<VoteType[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<'open' | 'closed'>('open')

  useEffect(() => { return subscribeVotes(setVotes) }, [])

  const open = votes.filter(v => !v.closed)
  const closed = votes.filter(v => v.closed)
  const displayed = tab === 'open' ? open : closed

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <div className="px-4 pb-4 screen-top">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black gradient-text">Abstimmungen</h1>
            <p className="text-[#888888] text-xs mt-0.5">Songs · Termine · Entscheidungen</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] text-white text-sm font-semibold transition-all purple-glow-sm">
            <Plus size={16} /> Neu
          </button>
        </div>
        <div className="flex gap-2 bg-[#141414] border border-[#2A2A2A] rounded-xl p-1">
          {([['open', `Offen (${open.length})`], ['closed', `Geschlossen (${closed.length})`]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-[#8B00FF] text-white' : 'text-[#888888]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pb-6 space-y-3">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <Vote size={48} className="mb-3 opacity-30" />
            <p className="text-sm">{tab === 'open' ? 'Keine offenen Abstimmungen.' : 'Keine abgeschlossenen Abstimmungen.'}</p>
          </div>
        ) : (
          displayed.map(vote => (
            <VoteCard key={vote.id} vote={vote} userId={user?.uid || ''} isAdmin={isAdmin} />
          ))
        )}
      </div>
      {showCreate && user && (
        <CreateVoteModal onClose={() => setShowCreate(false)} userId={user.uid} userName={user.displayName} />
      )}
    </div>
  )
}
