const MESI = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3,
  maggio: 4, giugno: 5, luglio: 6, agosto: 7,
  settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
}

const KEYWORDS = ['titolo', 'descrizione', 'luogo']

export function parseVoice(text) {
  const lower = text.toLowerCase().trim()
  const tokens = lower.split(/\s+/)

  let giorno = null
  let meseIdx = null
  let anno = new Date().getFullYear()
  let dateStart = -1
  let dateEnd = -1

  for (let i = 0; i < tokens.length; i++) {
    const num = parseInt(tokens[i], 10)
    if (!isNaN(num) && num >= 1 && num <= 31 && i + 1 < tokens.length) {
      const next = tokens[i + 1]
      if (next in MESI) {
        giorno = num
        meseIdx = MESI[next]
        dateStart = i
        dateEnd = i + 1
        if (i + 2 < tokens.length && /^\d{4}$/.test(tokens[i + 2])) {
          anno = parseInt(tokens[i + 2], 10)
          dateEnd = i + 2
        }
        break
      }
    }
  }

  const data = giorno !== null
    ? `${anno}-${String(meseIdx + 1).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`
    : null

  const remaining = [
    ...tokens.slice(0, dateStart),
    ...tokens.slice(dateEnd + 1),
  ]

  const keywordPositions = []
  for (let i = 0; i < remaining.length; i++) {
    if (KEYWORDS.includes(remaining[i])) {
      keywordPositions.push({ keyword: remaining[i], index: i })
    }
  }

  const result = { data, titolo: '', descrizione: '', luogo: '' }

  if (keywordPositions.length === 0) {
    result.titolo = remaining.join(' ').trim()
    return result
  }

  for (let k = 0; k < keywordPositions.length; k++) {
    const start = keywordPositions[k].index + 1
    const end = k + 1 < keywordPositions.length
      ? keywordPositions[k + 1].index
      : remaining.length
    const content = remaining.slice(start, end).join(' ').trim()
    result[keywordPositions[k].keyword] = content
  }

  return result
}
