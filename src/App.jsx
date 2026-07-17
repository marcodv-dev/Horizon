import { useState, useEffect } from 'react'
import { useEvents } from './hooks/useEvents'
import EventForm from './components/EventForm'
import EventList from './components/EventList'
import ToastContainer, { useToast } from './components/Toast'
import { useVoiceInput } from './hooks/useVoiceInput'
import { parseVoice } from './utils/parseVoice'
import './App.css'

export default function App() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const { start, stop, isListening, error } = useVoiceInput()

  useEffect(() => {
    if (showVoiceOverlay && error) {
      const timer = setTimeout(() => {
        setShowVoiceOverlay(false)
        document.body.style.overflow = ''
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showVoiceOverlay, error])

  const animateClose = () => {
    setClosing(true)
    setTimeout(() => {
      setShowForm(false)
      setClosing(false)
      document.body.style.overflow = ''
    }, 300)
  }

  const handleSave = (formData) => {
    if (editing) {
      updateEvent(editing.id, formData)
      setEditing(null)
      addToast('Evento modificato')
    } else {
      addEvent(formData)
      addToast('Evento creato')
    }
    animateClose()
  }

  const handleEdit = (evento) => {
    setEditing(evento)
    setShowForm(true)
    document.body.style.overflow = 'hidden'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewEvent = () => {
    setEditing(null)
    setShowForm(true)
    document.body.style.overflow = 'hidden'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewEventAudio = () => {
    setShowVoiceOverlay(true)
    document.body.style.overflow = 'hidden'
    start((text) => {
      console.log('[Voice] auto result:', text)
    })
  }

  const handleVoiceConfirm = () => {
    stop((text) => {
      console.log('[Voice] confirm:', text)
      if (text) {
        const parsed = parseVoice(text)
        addEvent(parsed)
        addToast('Evento creato')
      }
      setShowVoiceOverlay(false)
      document.body.style.overflow = ''
    })
  }

  const handleVoiceCancel = () => {
    stop()
    console.log('[Voice] cancelled')
    setShowVoiceOverlay(false)
    document.body.style.overflow = ''
  }

  const handleCancel = () => {
    setEditing(null)
    animateClose()
  }

  const handleDelete = (id) => {
    if (!window.confirm('Eliminare questo evento?')) return
    deleteEvent(id)
    addToast('Evento eliminato')
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {showVoiceOverlay && (
        <div className="voice-overlay" onTouchStart={e => e.stopPropagation()}>
          {error ? (
            <div style={{display:'flex',flexDirection:'column',gap:'24px'}}>
              <div className="voice-circle" onClick={handleVoiceCancel} style={{margin:'0 auto'}}>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="#FF00FF">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <p className="voice-error" style={{margin:'0 auto'}}>{error}</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'32px',pointerEvents:'auto'}}>
              <div className={`voice-circle ${isListening ? 'pulse' : ''}`} onClick={handleVoiceConfirm}>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="#FF00FF">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <button className="btn-voice-cancel" onClick={handleVoiceCancel}>Annulla</button>
            </div>
          )}
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <EventForm
              onSave={handleSave}
              editingEvento={editing}
              onCancelEdit={handleCancel}
              closing={closing}
              onError={(msg) => addToast(msg, 'error')}
            />
          </div>
        </div>
      )}
      <div className="app">
        <header className="app-header">
          {/* <h1>Horizon</h1> */}
          <img src="/titolo.PNG" alt="" style={{width:'100%'}}/>
        </header>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleNewEvent}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Scrivi evento
          </button>
          <button className="btn-voice" onClick={handleNewEventAudio}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Registra evento
          </button>
        </div>
      <main>
        <EventList
          events={events}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </main>
      </div>
    </>
  )
}
