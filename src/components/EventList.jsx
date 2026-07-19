import { useState, useMemo } from 'react'

const MONTH_IT = {
  '01': 'gen', '02': 'feb', '03': 'mar', '04': 'apr',
  '05': 'mag', '06': 'giu', '07': 'lug', '08': 'ago',
  '09': 'set', '10': 'ott', '11': 'nov', '12': 'dic',
}

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

function formatDate(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${parseInt(d)} ${MONTH_IT[m] || m} ${iso.split('-')[0]}`
}

function sortEvents(events, sortBy) {
  const sorted = [...events]
  switch (sortBy) {
    case 'data-asc':
      return sorted.sort((a, b) => a.data.localeCompare(b.data))
    case 'data-desc':
      return sorted.sort((a, b) => b.data.localeCompare(a.data))
    case 'nome-az':
      return sorted.sort((a, b) => a.titolo.localeCompare(b.titolo))
    case 'nome-za':
      return sorted.sort((a, b) => b.titolo.localeCompare(a.titolo))
    default:
      return sorted
  }
}

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getAvailableYears(events) {
  const years = new Set()
  events.forEach(e => {
    if (e.data) years.add(e.data.split('-')[0])
  })
  return [...years].sort()
}

export default function EventList({ events, onDelete, onEdit, historyMode, onToggleHistory }) {
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('data-asc')
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))

  const today = getToday()
  const availableYears = useMemo(() => getAvailableYears(events), [events])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = events.filter(e =>
      e.titolo.toLowerCase().includes(q) ||
      (e.descrizione && e.descrizione.toLowerCase().includes(q)) ||
      (e.luogo && e.luogo.toLowerCase().includes(q))
    )

    if (historyMode) {
      result = result.filter(e => e.data && e.data < today)
    } else {
      result = result.filter(e => e.data && e.data >= today)
    }

    if (filterYear) {
      result = result.filter(e => e.data && e.data.startsWith(filterYear))
    }

    if (filterMonth) {
      result = result.filter(e => e.data && e.data.split('-')[1] === filterMonth)
    }

    return sortEvents(result, sortBy)
  }, [events, search, sortBy, filterMonth, filterYear, historyMode, today])

  const toggle = (id) => {
    setExpanded(prev => prev === id ? null : id)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    onDelete(id)
    setExpanded(null)
  }

  const handleEdit = (e, evento) => {
    e.stopPropagation()
    onEdit(evento)
  }

  const handleMaps = (e, url) => {
    e.stopPropagation()
    window.open(url, '_blank')
  }

  return (
    <div className="event-list">
      <div className="list-fixed-top">
        <div className="list-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Cerca evento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="data-asc">Data (asc)</option>
            <option value="data-desc">Data (desc)</option>
            <option value="nome-az">Titolo A-Z</option>
            <option value="nome-za">Titolo Z-A</option>
          </select>
        </div>

        <div className="list-filters">
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">Anni</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">Mesi</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={String(i + 1).padStart(2, '0')}>{name}</option>
            ))}
          </select>
          <button className={`btn-history ${historyMode ? 'active' : ''}`} onClick={onToggleHistory}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="list-scroll" style={{paddingBottom:'120px',paddingTop:'10px'}}>
        {filtered.length === 0 && (
          <p className="empty">Nessun evento trovato.</p>
        )}

        {filtered.map(ev => (
          <div
            key={ev.id}
            className={`event-card ${expanded === ev.id ? 'expanded' : ''}`}
            onClick={() => toggle(ev.id)}
          >
            <div className="card-header">
              <span className="card-date">{formatDate(ev.data)}</span>
              <span className="card-title">{ev.titolo}</span>
            </div>

            {expanded === ev.id && (
              <div className="card-details">
                {ev.descrizione && (
                  <p><strong>Descrizione:</strong><br />{ev.descrizione}</p>
                )}
                {ev.luogo && (
                  <p><strong>Luogo:</strong><br />{ev.luogo}</p>
                )}
                {ev.posizione && (
                  <p>
                    <button
                      className="btn-link"
                      onClick={(e) => handleMaps(e, ev.posizione)}
                    >
                      Apri su Maps
                    </button>
                  </p>
                )}
                <div className="card-actions">
                  {!historyMode && (
                    <button className="btn-edit" onClick={(e) => handleEdit(e, ev)}>
                      <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  )}
                  <button className="btn-delete" onClick={(e) => handleDelete(e, ev.id)}>
                    <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
