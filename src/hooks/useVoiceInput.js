import { useState, useRef, useCallback } from 'react'

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(null)
  const lastTranscriptRef = useRef('')

  const start = useCallback((onResult) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Il browser non supporta il riconoscimento vocale.')
      return
    }

    onResultRef.current = onResult || null
    lastTranscriptRef.current = ''
    console.log('[Voice] start called')

    const recognition = new SpeechRecognition()
    recognition.lang = 'it-IT'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('[Voice] listening...')
      setIsListening(true)
      setError(null)
      setTranscript('')
      lastTranscriptRef.current = ''
    }

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      console.log('[Voice] result:', text)
      setTranscript(text)
      setIsListening(false)
      lastTranscriptRef.current = text
    }

    recognition.onerror = (event) => {
      console.log('[Voice] error:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        setError('Permesso microfono negato.')
      } else if (event.error === 'no-speech') {
        setError('Nessun audio rilevato. Riprova.')
      } else {
        setError('Errore nel riconoscimento vocale.')
      }
    }

    recognition.onend = () => {
      console.log('[Voice] ended')
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stop = useCallback((onStopped) => {
    console.log('[Voice] stop called')
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null
      recognitionRef.current.stop()
      setIsListening(false)
      if (onStopped) onStopped(lastTranscriptRef.current)
      lastTranscriptRef.current = ''
    }
  }, [])

  return { start, stop, isListening, transcript, error }
}
