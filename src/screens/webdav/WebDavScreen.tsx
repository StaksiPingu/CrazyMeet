import { useState, useEffect } from 'react'
import { FolderOpen, ArrowLeft, Settings, X, ExternalLink, RefreshCw, Download, AlertCircle } from 'lucide-react'

interface WebDavConfig {
  url: string
  username: string
  password: string
}

const DEFAULT_CONFIG: WebDavConfig = {
  url: import.meta.env.VITE_WEBDAV_URL || '',
  username: import.meta.env.VITE_WEBDAV_USER || '',
  password: import.meta.env.VITE_WEBDAV_PASS || '',
}

interface DavEntry {
  name: string
  href: string
  isDir: boolean
  size?: number
  modified?: string
  contentType?: string
}

function formatSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(s?: string) {
  if (!s) return ''
  try { return new Date(s).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return s }
}

function fileIcon(name: string, isDir: boolean) {
  if (isDir) return '📁'
  const ext = name.split('.').pop()?.toLowerCase()
  if (['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext || '')) return '🎵'
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return '🎬'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return '🖼️'
  if (['pdf'].includes(ext || '')) return '📄'
  if (['doc', 'docx'].includes(ext || '')) return '📝'
  if (['xls', 'xlsx'].includes(ext || '')) return '📊'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return '📦'
  return '📄'
}

async function propfind(config: WebDavConfig, path: string): Promise<DavEntry[]> {
  const base64 = btoa(`${config.username}:${config.password}`)
  const url = config.url.replace(/\/$/, '') + path

  const res = await fetch(url, {
    method: 'PROPFIND',
    headers: {
      'Authorization': `Basic ${base64}`,
      'Depth': '1',
      'Content-Type': 'application/xml; charset=utf-8',
    },
    body: `<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:displayname/><d:resourcetype/><d:getcontentlength/><d:getlastmodified/><d:getcontenttype/></d:prop></d:propfind>`,
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

  const text = await res.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')
  const responses = Array.from(xml.querySelectorAll('response'))

  const entries: DavEntry[] = []
  for (const r of responses) {
    const href = r.querySelector('href')?.textContent || ''
    const name = decodeURIComponent(href.split('/').filter(Boolean).pop() || '')
    const isDir = !!r.querySelector('resourcetype collection')
    const size = parseInt(r.querySelector('getcontentlength')?.textContent || '0') || undefined
    const modified = r.querySelector('getlastmodified')?.textContent || undefined
    const contentType = r.querySelector('getcontenttype')?.textContent || undefined

    // Skip the current directory itself
    const normalizedHref = href.replace(/\/$/, '')
    const normalizedPath = path.replace(/\/$/, '')
    if (normalizedHref === normalizedPath || normalizedHref === decodeURIComponent(normalizedPath)) continue
    if (!name) continue

    entries.push({ name, href, isDir, size, modified, contentType })
  }

  return entries.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1
    if (!a.isDir && b.isDir) return 1
    return a.name.localeCompare(b.name)
  })
}

function ConfigModal({ onSave, onClose, current }: { onSave: (cfg: WebDavConfig) => void; onClose: () => void; current?: WebDavConfig }) {
  const [url, setUrl] = useState(current?.url || '')
  const [username, setUsername] = useState(current?.username || '')
  const [password, setPassword] = useState(current?.password || '')

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    onSave({ url: url.trim(), username: username.trim(), password })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#2A2A2A]">
          <h2 className="font-bold text-white flex items-center gap-2"><Settings size={18} className="text-[#8B00FF]" /> WebDAV Verbindung</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Server URL *</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://dein-server.de/webdav/"
              autoFocus
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[#888888] uppercase tracking-wide block mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm placeholder-[#555] focus:border-[#8B00FF] transition-colors"
            />
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-xs text-[#888888] space-y-1">
            <p>Unterstützt: Nextcloud, ownCloud, eigene WebDAV-Server</p>
            <p>Der Server muss CORS für diese App erlauben.</p>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#8B00FF] hover:bg-[#AA44FF] font-bold text-white transition-all"
          >
            Verbinden
          </button>
        </form>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'crazymeet_webdav_config'

export default function WebDavScreen() {
  const [config, setConfig] = useState<WebDavConfig>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      return saved || DEFAULT_CONFIG
    } catch { return DEFAULT_CONFIG }
  })
  const [showConfig, setShowConfig] = useState(false)
  const [path, setPath] = useState('/')
  const [pathStack, setPathStack] = useState<string[]>([])
  const [entries, setEntries] = useState<DavEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load(cfg: WebDavConfig, p: string) {
    setLoading(true)
    setError('')
    try {
      const result = await propfind(cfg, p)
      setEntries(result)
    } catch (e: any) {
      setError(e.message || 'Verbindung fehlgeschlagen. Prüfe URL und Zugangsdaten.')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (config) load(config, path)
  }, [config])

  function handleSaveConfig(cfg: WebDavConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    setConfig(cfg)
    setPath('/')
    setPathStack([])
    setShowConfig(false)
    load(cfg, '/')
  }

  function handleDisconnect() {
    localStorage.removeItem(STORAGE_KEY)
    setConfig(DEFAULT_CONFIG)
    setEntries([])
    setPath('/')
    setPathStack([])
    setShowConfig(true)
  }

  function openDir(entry: DavEntry) {
    const newPath = entry.href.startsWith('http') ? new URL(entry.href).pathname : entry.href
    setPathStack(s => [...s, path])
    setPath(newPath)
    load(config, newPath)
  }

  function goBack() {
    const prev = pathStack[pathStack.length - 1] || '/'
    setPathStack(s => s.slice(0, -1))
    setPath(prev)
    load(config, prev)
  }

  function openFile(entry: DavEntry) {
    const fileUrl = entry.href.startsWith('http')
      ? entry.href
      : (config.url.replace(/\/$/, '') + entry.href)
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  function currentFolderName() {
    const parts = path.split('/').filter(Boolean)
    return parts.length === 0 ? 'Root' : decodeURIComponent(parts[parts.length - 1])
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="px-4 pt-8 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-black gradient-text">Dateien</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(config, path)}
              className="p-2 rounded-xl text-[#888888] hover:text-white hover:bg-[#1E1E1E] transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowConfig(true)}
              className="p-2 rounded-xl text-[#888888] hover:text-white hover:bg-[#1E1E1E] transition-all"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
        <p className="text-[#888888] text-xs truncate">{new URL(config.url).hostname}</p>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {pathStack.length > 0 && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-[#8B00FF] hover:text-[#AA44FF] transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <span className="text-white text-sm font-semibold truncate">{currentFolderName()}</span>
        {pathStack.length > 0 && (
          <span className="text-[#555] text-xs">({pathStack.length} Ebene{pathStack.length > 1 ? 'n' : ''} hoch)</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-900/20 border border-red-800/30 mb-4">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-semibold">Verbindungsfehler</p>
              <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
              <button onClick={handleDisconnect} className="text-xs text-[#888888] hover:text-white mt-2 underline">Server-Einstellungen ändern</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <span className="animate-spin rounded-full h-8 w-8 border-2 border-[#8B00FF] border-t-transparent" />
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-[#555]">
            <FolderOpen size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Ordner ist leer.</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="space-y-1.5">
            {entries.map((entry, i) => (
              <button
                key={i}
                onClick={() => entry.isDir ? openDir(entry) : openFile(entry)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#141414] border border-[#2A2A2A] hover:border-[#8B00FF]/30 transition-all text-left group"
              >
                <span className="text-xl flex-shrink-0">{fileIcon(entry.name, entry.isDir)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{entry.name}</div>
                  <div className="text-xs text-[#555] flex items-center gap-2 mt-0.5">
                    {entry.size ? <span>{formatSize(entry.size)}</span> : null}
                    {entry.modified ? <span>{formatDate(entry.modified)}</span> : null}
                  </div>
                </div>
                {!entry.isDir && (
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Download size={14} className="text-[#888888]" />
                    <ExternalLink size={14} className="text-[#888888]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showConfig && (
        <ConfigModal
          onSave={handleSaveConfig}
          onClose={() => setShowConfig(false)}
          current={config}
        />
      )}
    </div>
  )
}
