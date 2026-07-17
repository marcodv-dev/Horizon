import { useEffect, useRef } from 'react'
import { useVoiceInput } from '../hooks/useVoiceInput'

export default function VoiceButton({ onResult, autoStart }) {
  const { start, stop, isListening, transcript, error } = useVoiceInput()
  const lastTranscript = useRef('')

  useEffect(() => {
    if (transcript && transcript !== lastTranscript.current) {
      lastTranscript.current = transcript
      onResult(transcript)
    }
  }, [transcript])

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => start(), 300)
      return () => clearTimeout(timer)
    }
  }, [autoStart, start])

  const handleClick = () => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }

  return (
    <div className="voice-section">
      <button
        type="button"
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={handleClick}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        {isListening ? 'Ascolto...' : 'Parla'}
      </button>
      {error && <p className="voice-error">{error}</p>}
      {transcript && <p className="voice-transcript">"{transcript}"</p>}
    </div>
  )
}
