import React, { useMemo, useState } from 'react'

const MOODS = [
  { value: 1, label: 'Heavy', emoji: '🌧️', opacity: 0.2 },
  { value: 2, label: 'Low', emoji: '☁️', opacity: 0.4 },
  { value: 3, label: 'Neutral', emoji: '🌥️', opacity: 0.55 },
  { value: 4, label: 'Calm', emoji: '🌤️', opacity: 0.75 },
  { value: 5, label: 'Light', emoji: '☀️', opacity: 1 },
]

function getMoodInfo(value) {
  return MOODS.find(m => m.value === value)
}

function formatDate(date) {
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

export default function MoodHeatmap({ journalEntries = [] }) {
  const [tooltip, setTooltip] = useState(null)

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date()
    const totalDays = 84 // 12 weeks
    const days = []

    // Generate all 84 days ending today
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      days.push(d)
    }

    // Build lookup from journal entries
    const entryMap = new Map()
    journalEntries.forEach(entry => {
      const d = new Date(entry.date)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!entryMap.has(key)) {
        entryMap.set(key, entry.mood)
      }
    })

    // Organize into weeks (columns) × days-of-week (rows)
    // We need to align to day-of-week: 0=Mon...6=Sun
    const weeks = []
    let currentWeek = []

    days.forEach((day) => {
      // JS getDay: 0=Sun, convert to 0=Mon
      let dow = (day.getDay() + 6) % 7
      if (currentWeek.length === 0 && weeks.length === 0) {
        // Pad the first week if it doesn't start on Monday
        for (let p = 0; p < dow; p++) {
          currentWeek.push(null)
        }
      }
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
      currentWeek.push({
        date: day,
        mood: entryMap.get(key) || null,
        dow,
      })
      if (dow === 6) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    // Compute month labels with their column positions
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const firstDay = week.find(d => d !== null)
      if (firstDay) {
        const m = firstDay.date.getMonth()
        if (m !== lastMonth) {
          labels.push({
            text: firstDay.date.toLocaleDateString('en', { month: 'short' }),
            col: wi,
          })
          lastMonth = m
        }
      }
    })

    return { grid: weeks, monthLabels: labels }
  }, [journalEntries])

  const dayLabels = ['M', '', 'W', '', 'F', '', '']

  return (
    <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] relative">
      <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600 mb-4 text-center">
        Mood over 12 weeks
      </p>

      <div className="flex gap-1 overflow-x-auto">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[3px] mr-1 flex-shrink-0 pt-4">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="h-[13px] w-5 flex items-center justify-end pr-1 text-[8px] text-slate-600"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 h-3">
            {grid.map((_, wi) => {
              const lbl = monthLabels.find(l => l.col === wi)
              return (
                <div key={wi} className="w-[13px] flex-shrink-0 text-[7px] text-slate-600 leading-none">
                  {lbl ? lbl.text : ''}
                </div>
              )
            })}
          </div>

          {/* Heatmap columns */}
          <div className="flex gap-[3px]">
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week[di] || null
                  if (!cell) {
                    return <div key={di} className="w-[13px] h-[13px]" />
                  }

                  const moodInfo = cell.mood ? getMoodInfo(cell.mood) : null

                  return (
                    <div
                      key={di}
                      className="w-[13px] h-[13px] rounded-[3px] cursor-pointer transition-all hover:scale-125 hover:z-10 relative"
                      style={{
                        backgroundColor: moodInfo
                          ? `rgba(99,102,241,${moodInfo.opacity})`
                          : 'transparent',
                        border: moodInfo
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.05)',
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          date: cell.date,
                          mood: cell.mood,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-[7px] text-slate-700 uppercase tracking-wider">Less</span>
        {MOODS.map(m => (
          <div
            key={m.value}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: `rgba(99,102,241,${m.opacity})` }}
            title={m.label}
          />
        ))}
        <span className="text-[7px] text-slate-700 uppercase tracking-wider">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-[#0f0f18] border border-white/10 rounded-xl px-3 py-2 text-xs pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-slate-400 text-[9px]">{formatDate(tooltip.date)}</div>
          {tooltip.mood ? (
            <div className="flex items-center gap-1 mt-0.5">
              <span>{getMoodInfo(tooltip.mood)?.emoji}</span>
              <span className="text-slate-300 text-[10px]">{getMoodInfo(tooltip.mood)?.label}</span>
            </div>
          ) : (
            <div className="text-slate-600 text-[9px] italic mt-0.5">No entry</div>
          )}
        </div>
      )}
    </div>
  )
}
