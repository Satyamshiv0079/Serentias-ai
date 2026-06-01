import React from 'react'
import { Heart, X, Phone } from 'lucide-react'

const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end it all',
  'self-harm',
  'self harm',
  "don't want to live",
  'dont want to live',
  'want to die',
  'hurt myself',
  'no reason to live',
  'overdose',
  'end my life',
  'cut myself',
  'not worth living',
  'better off dead',
]

/**
 * Checks user input text for crisis-related keywords.
 * Case-insensitive matching.
 * @param {string} text - The user's input text
 * @returns {boolean} true if crisis keywords are detected
 */
export function detectCrisis(text) {
  if (!text || typeof text !== 'string') return false
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword))
}

const HELPLINES = [
  {
    flag: '🇮🇳',
    country: 'India',
    name: 'iCall',
    number: '9152987821',
    tel: 'tel:9152987821',
  },
  {
    flag: '🇮🇳',
    country: 'India',
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    tel: 'tel:18602662345',
  },
  {
    flag: '🇺🇸',
    country: 'USA',
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    tel: 'tel:988',
  },
  {
    flag: '🌍',
    country: 'Global',
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    tel: null,
  },
]

/**
 * CrisisBanner — a calm, non-alarming helpline banner shown when crisis keywords are detected.
 * @param {{ visible: boolean, onDismiss: () => void }} props
 */
export default function CrisisBanner({ visible, onDismiss }) {
  if (!visible) return null

  return (
    <div
      className="fade-in mx-4 mt-3 mb-1 rounded-2xl border border-rose-500/20 bg-rose-950/10 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
            <Heart size={14} className="text-rose-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-light text-slate-200 tracking-wide">
              You are not alone
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              If you're in crisis, please reach out to someone who can help.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all flex-shrink-0"
          aria-label="Dismiss crisis banner"
        >
          <X size={13} strokeWidth={1.5} />
        </button>
      </div>

      {/* Helpline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 pb-4 pt-2">
        {HELPLINES.map((line) => (
          <div
            key={line.name}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/5 hover:border-rose-500/15 transition-all group"
          >
            <span className="text-base leading-none flex-shrink-0">{line.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 tracking-wide">
                {line.country} · {line.name}
              </p>
              {line.tel ? (
                <a
                  href={line.tel}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium tracking-wider"
                >
                  <Phone size={10} className="inline mr-1 -mt-px" strokeWidth={1.5} />
                  {line.number}
                </a>
              ) : (
                <p className="text-xs text-indigo-400 font-medium tracking-wider">
                  {line.number}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
