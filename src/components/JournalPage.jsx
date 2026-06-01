import React from 'react'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import MoodHeatmap from './MoodHeatmap.jsx'

const MOODS = [
  { value: 1, emoji: '🌧️', label: 'Heavy' },
  { value: 2, emoji: '☁️', label: 'Low' },
  { value: 3, emoji: '🌥️', label: 'Neutral' },
  { value: 4, emoji: '🌤️', label: 'Calm' },
  { value: 5, emoji: '☀️', label: 'Light' },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const mood = MOODS.find(m => m.value === payload[0].value)
  return (
    <div className="bg-[#0f0f18] border border-white/10 rounded-xl px-3 py-2 text-xs">
      <span className="mr-1">{mood?.emoji}</span>
      <span className="text-slate-400">{mood?.label}</span>
    </div>
  )
}

export default function JournalPage({
  setView, journalEntries, moodData,
  journalText, setJournalText,
  selectedMood, setSelectedMood, addJournalEntry
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <button onClick={() => setView('chat')} className="text-slate-600 hover:text-white transition-colors">
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-indigo-300 flex items-center gap-2">
          <BookOpen size={12} strokeWidth={1.5} />
          Mood & Reflection
        </h2>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Mood Chart */}
        {moodData.length > 1 && (
          <div className="bg-white/3 rounded-2xl p-4 border border-white/6">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600 mb-4 text-center">
              Your mood over time
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" stroke="#334155" fontSize={9} tick={{ fill: '#475569' }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#334155" fontSize={9} tick={{ fill: '#475569' }} width={20} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ fill: '#818cf8', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#a5b4fc' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Mood Heatmap */}
        <MoodHeatmap journalEntries={journalEntries} />

        {/* New Entry */}
        <div className="space-y-4">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600 text-center">
            How are you feeling?
          </p>

          {/* Mood selector */}
          <div className="flex justify-around py-2">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                title={m.label}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                style={{
                  background: selectedMood === m.value ? 'rgba(99,102,241,0.12)' : 'transparent',
                  transform: selectedMood === m.value ? 'scale(1.15)' : 'scale(1)',
                  opacity: selectedMood === m.value ? 1 : 0.4,
                }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[8px] text-slate-600 uppercase tracking-wider">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Text area */}
          <textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            placeholder="Write freely… no one is watching."
            rows={4}
            className="w-full bg-white/3 border border-white/6 rounded-2xl px-4 py-3 text-sm text-slate-300 placeholder-slate-700 outline-none focus:border-indigo-500/30 resize-none leading-relaxed italic transition-all"
          />

          <button
            onClick={addJournalEntry}
            disabled={!journalText.trim()}
            className="w-full py-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-[10px] uppercase tracking-[0.4em] text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Save Entry
          </button>
        </div>

        {/* Past entries */}
        {journalEntries.length > 0 && (
          <div className="space-y-3 border-t border-white/5 pt-5">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-700 text-center">
              Past reflections
            </p>
            {journalEntries.map(entry => {
              const mood = MOODS.find(m => m.value === (entry.mood || 3))
              return (
                <div
                  key={entry.id}
                  className="p-4 border-l-2 border-indigo-500/20 bg-white/2 rounded-r-2xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{mood?.emoji}</span>
                    <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                      {mood?.label} · {new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">{entry.text}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
