import { useState, useEffect } from 'react'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const initial = () => ({
  data: today(),
  titolo: '',
  descrizione: '',
  luogo: '',
  posizione: '',
})

export default function EventForm({ onSave, editingEvento, onCancelEdit, closing, onError }) {
  const [form, setForm] = useState(initial)

  useEffect(() => {
    if (editingEvento) {
      setForm({
        data: editingEvento.data,
        titolo: editingEvento.titolo,
        descrizione: editingEvento.descrizione || '',
        luogo: editingEvento.luogo || '',
        posizione: editingEvento.posizione || '',
      })
    } else {
      setForm(initial())
    }
  }, [editingEvento])

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.titolo.trim()) {
      onError?.('Inserisci il titolo')
      return
    }
    if (!form.data) {
      onError?.('Inserisci la data')
      return
    }
    onSave(form)
    if (!editingEvento) setForm(initial())
  }

  return (
    <form className={`event-form ${closing ? 'closing' : ''}`} onSubmit={handleSubmit} noValidate>
      <h2>{editingEvento ? 'Modifica evento' : 'Nuovo evento'}</h2>

      <div className="form-fields">
        <label>
          Data *
          <input type="date" style={{padding:'2px'}} value={form.data} onChange={set('data')} />
        </label>
        <label>
          Titolo *
          <input
            type="text"
            placeholder="Titolo evento"
            value={form.titolo}
            onChange={set('titolo')}
          />
        </label>
        <label>
          Descrizione
          <input
            type="text"
            placeholder="Descrizione"
            value={form.descrizione}
            onChange={set('descrizione')}
          />
        </label>
        <label>
          Luogo
          <input
            type="text"
            placeholder="Luogo"
            value={form.luogo}
            onChange={set('luogo')}
          />
        </label>
        <label>
          Posizione (link Google Maps)
          <input
            type="url"
            placeholder="https://maps.google.com/..."
            value={form.posizione}
            onChange={set('posizione')}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" style={{fontSize:'1rem'}}>
          {editingEvento ? 'Salva modifiche' : 'Crea evento'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancelEdit}>
          Annulla
        </button>
      </div>
    </form>
  )
}
