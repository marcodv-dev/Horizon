import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pwa-events'

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export function useEvents() {
  const [events, setEvents] = useState(loadEvents)

  useEffect(() => {
    saveEvents(events)
  }, [events])

  const addEvent = useCallback((evento) => {
    const newEvent = { ...evento, id: uuid() }
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }, [])

  const updateEvent = useCallback((id, updates) => {
    setEvents(prev =>
      prev.map(e => e.id === id ? { ...e, ...updates } : e)
    )
  }, [])

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  return { events, addEvent, updateEvent, deleteEvent }
}
