import React, { useState, useMemo } from 'react'
import { ChevronLeft, Heart, Plus } from 'lucide-react'

const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

const PILL_COLORS = [
  'bg-indigo-300',
  'bg-violet-300',
  'bg-rose-300',
  'bg-amber-300',
  'bg-emerald-300',
]

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function GratitudeJar({ setView }) {
  const [notes, setNotes] = useState(() => LS.get('serentias_gratitude', []))
  const [inputText, setInputText] = useState('')

  const hasEntryToday = useMemo(() => {
    const today = getToday()
    return notes.some(n => n.date.split('T')[0] === today)
  }, [notes])

  const handleAdd = () => {
    const text = inputText.trim()
    if (!text || hasEntryToday) return
    const newNote = {
      id: Date.now(),
      text,
      date: new Date().toISOString(),
    }
    const updated = [newNote, ...notes]
    setNotes(updated)
    LS.set('serentias_gratitude', updated)
    setInputText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  // For jar visualization, show newest at top (visually stacked from bottom)
  const jarPills = useMemo(() => {
    return [...notes].reverse().slice(-30) // show up to 30 pills in the jar
  }, [notes])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <button onClick={() => setView('chat')} className="text-slate-600 hover:text-white transition-colors">
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-indigo-300 flex items-center gap-2">
          <Heart size={12} strokeWidth={1.5} />
          Gratitude Jar
        </h2>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Jar Visualization */}
        <div className="flex flex-col items-center">
          {/* Jar lid */}
          <div
            className="w-24 h-3 rounded-t-lg border border-b-0 border-indigo-400/20"
            style={{
              background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)',
            }}
          />
          {/* Jar neck */}
          <div
            className="w-28 h-2 border-x border-indigo-400/10"
            style={{ background: 'rgba(99,102,241,0.03)' }}
          />

          {/* Jar body */}
          <div
            className="w-40 rounded-b-3xl border border-t-0 border-indigo-400/15 relative overflow-hidden"
            style={{
              minHeight: '200px',
              maxHeight: '240px',
              background: 'linear-gradient(180deg, rgba(99,102,241,0.02) 0%, rgba(99,102,241,0.06) 100%)',
            }}
          >
            {/* Glass reflection effect */}
            <div
              className="absolute top-0 left-2 w-[2px] h-full rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
              }}
            />
            <div
              className="absolute top-0 left-5 w-[1px] h-3/4 rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
              }}
            />

            {/* Pills stacking from bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap-reverse justify-center gap-1 p-2 content-start">
              {jarPills.map((note, i) => (
                <div
                  key={note.id}
                  className={`${PILL_COLORS[i % PILL_COLORS.length]} rounded-full opacity-70 hover:opacity-100 transition-opacity`}
                  style={{
                    width: `${Math.random() * 10 + 14}px`,
                    height: `${Math.random() * 6 + 12}px`,
                    flexShrink: 0,
                  }}
                  title={note.text}
                />
              ))}
            </div>

            {/* Empty state */}
            {notes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[9px] text-slate-700 italic text-center px-4">
                  Your jar is empty.<br />Add your first moment of gratitude.
                </p>
              </div>
            )}
          </div>

          {/* Count label */}
          <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-slate-600">
            {notes.length === 0
              ? 'Begin your collection'
              : `${notes.length} moment${notes.length === 1 ? '' : 's'} of gratitude`
            }
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasEntryToday
                  ? "You've already added today's gratitude ✨"
                  : 'What are you grateful for today?'
              }
              disabled={hasEntryToday}
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-700 outline-none focus:border-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed italic"
            />
            <button
              onClick={handleAdd}
              disabled={!inputText.trim() || hasEntryToday}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <Plus size={16} strokeWidth={1.5} />
            </button>
          </div>

          {hasEntryToday && (
            <p className="text-[8px] text-indigo-400/50 text-center uppercase tracking-[0.3em]">
              A new note can be added tomorrow
            </p>
          )}
        </div>

        {/* Past notes */}
        {notes.length > 0 && (
          <div className="space-y-2 border-t border-white/5 pt-5">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-700 text-center mb-3">
              Collected gratitude
            </p>
            {notes.map((note, i) => (
              <div
                key={note.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${PILL_COLORS[i % PILL_COLORS.length]} opacity-60`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 italic leading-relaxed">{note.text}</p>
                  <p className="text-[8px] text-slate-700 mt-1 uppercase tracking-wider">
                    {new Date(note.date).toLocaleDateString('en', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
