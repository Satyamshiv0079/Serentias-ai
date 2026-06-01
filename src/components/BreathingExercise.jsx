import React, { useState, useEffect, useMemo } from 'react'
import { X, Play, Square } from 'lucide-react'

const PRESETS = {
  calm: {
    name: 'Calm',
    description: '4-4-6 Gentle Grounding',
    phases: [
      { name: 'Inhale', duration: 4, next: 'Hold', color: '#818cf8', guide: 'Draw breath slowly through your nose…' },
      { name: 'Hold', duration: 4, next: 'Exhale', color: '#a78bfa', guide: 'Hold gently. Feel the fullness.' },
      { name: 'Exhale', duration: 6, next: 'Inhale', color: '#6d7cca', guide: 'Release slowly through your mouth…' },
    ]
  },
  box: {
    name: 'Box Breathing',
    description: '4-4-4-4 Focus & Balance',
    phases: [
      { name: 'Inhale', duration: 4, next: 'Hold', color: '#818cf8', guide: 'Inhale slowly… fill your lungs.' },
      { name: 'Hold', duration: 4, next: 'Exhale', color: '#a78bfa', guide: 'Suspend the breath. Keep the stillness.' },
      { name: 'Exhale', duration: 4, next: 'Rest', color: '#6d7cca', guide: 'Exhale gently, releasing completely.' },
      { name: 'Rest', duration: 4, next: 'Inhale', color: '#818cf8', guide: 'Remain empty. Hold the space.' },
    ]
  },
  sleep: {
    name: 'Deep Sleep',
    description: '4-7-8 Calm Mind & Sleep',
    phases: [
      { name: 'Inhale', duration: 4, next: 'Hold', color: '#818cf8', guide: 'Inhale quietly through your nose.' },
      { name: 'Hold', duration: 7, next: 'Exhale', color: '#a78bfa', guide: 'Hold your breath. Rest in the suspension.' },
      { name: 'Exhale', duration: 8, next: 'Inhale', color: '#6d7cca', guide: 'Exhale completely with a whoosh.' },
    ]
  }
}

// Synthesize organic chimes via Web Audio API
function playPhaseChime(phaseName) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Map frequencies to stages to give sonic variance (chords)
    let freq = 392.00 // Hold stage (G4 - peaceful suspension)
    if (phaseName === 'Inhale') freq = 523.25 // Inhale stage (C5 - high expansion)
    else if (phaseName === 'Exhale') freq = 329.63 // Exhale stage (E4 - grounding release)
    else if (phaseName === 'Rest') freq = 261.63 // Rest stage (C4 - low stillness)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    // Soft organic mindful bowl envelope
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 1.8)
  } catch (e) {
    console.error(e)
  }
}

const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

export default function BreathingExercise({ onClose }) {
  const [presetKey, setPresetKey] = useState('calm')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [timer, setTimer] = useState(4)
  const [cycles, setCycles] = useState(0)
  const [active, setActive] = useState(false)

  const [customInhale, setCustomInhale] = useState(() => LS.get('serentias_custom_inhale', 4))
  const [customHold, setCustomHold] = useState(() => LS.get('serentias_custom_hold', 4))
  const [customExhale, setCustomExhale] = useState(() => LS.get('serentias_custom_exhale', 4))

  useEffect(() => {
    LS.set('serentias_custom_inhale', customInhale)
    LS.set('serentias_custom_hold', customHold)
    LS.set('serentias_custom_exhale', customExhale)
  }, [customInhale, customHold, customExhale])

  const activePreset = useMemo(() => {
    if (presetKey === 'custom') {
      return {
        name: 'Custom',
        description: 'Personalized Rhythm',
        phases: [
          { name: 'Inhale', duration: customInhale, next: 'Hold', color: '#818cf8', guide: 'Draw breath slowly through your nose…' },
          { name: 'Hold', duration: customHold, next: 'Exhale', color: '#a78bfa', guide: 'Hold gently. Feel the fullness.' },
          { name: 'Exhale', duration: customExhale, next: 'Inhale', color: '#6d7cca', guide: 'Release slowly through your mouth…' },
        ]
      }
    }
    return PRESETS[presetKey]
  }, [presetKey, customInhale, customHold, customExhale])

  const phase = activePreset.phases[phaseIdx]

  useEffect(() => {
    if (!active && presetKey === 'custom') {
      setTimer(customInhale)
    }
  }, [customInhale, presetKey, active])

  // Reset preset states on selection change
  const changePreset = (key) => {
    if (active) return // ignore changes while playing
    setPresetKey(key)
    setPhaseIdx(0)
    
    const targetPreset = key === 'custom'
      ? { phases: [{ duration: customInhale }] }
      : PRESETS[key]
    setTimer(targetPreset.phases[0].duration)
    setCycles(0)
  }

  // Active play controller
  useEffect(() => {
    if (!active) return

    // Trigger starting chime
    playPhaseChime(phase.name)

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          const nextIdx = activePreset.phases.findIndex((p) => p.name === phase.next)
          setPhaseIdx(nextIdx)
          setTimer(activePreset.phases[nextIdx].duration)
          
          // Trigger phase transition chime
          playPhaseChime(activePreset.phases[nextIdx].name)

          // Increment cycle counter on completion of last state
          if (phase.name === activePreset.phases[activePreset.phases.length - 1].name) {
            setCycles((c) => c + 1)
          }

          return activePreset.phases[nextIdx].duration
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [active, phaseIdx, presetKey])

  const circleClass = active
    ? phase.name === 'Inhale'
      ? 'breathe-in'
      : phase.name === 'Exhale'
      ? 'breathe-out'
      : 'breathe-hold'
    : ''

  // Custom animation styles injected
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .breathe-in { animation-name: scaleUp; animation-fill-mode: forwards; animation-timing-function: linear; }
      .breathe-out { animation-name: scaleDown; animation-fill-mode: forwards; animation-timing-function: linear; }
      .breathe-hold { animation: none; }
      @keyframes scaleUp { from { transform: scale(1); } to { transform: scale(1.4); } }
      @keyframes scaleDown { from { transform: scale(1.4); } to { transform: scale(1); } }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative select-none">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-slate-700 hover:text-white transition-colors"
      >
        <X size={18} strokeWidth={1.5} />
      </button>

      <div className="text-center space-y-8 w-full max-w-sm fade-in">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.5em] text-slate-600 mb-2">Breathing</h2>
          <p className="text-xs text-slate-700 italic">
            {cycles > 0 ? `${cycles} cycle${cycles > 1 ? 's' : ''} complete` : activePreset.description}
          </p>
        </div>

        {/* Preset Selector Dropdown */}
        {!active && (
          <div className="flex flex-col gap-4 items-center pt-2">
            <select
              value={presetKey}
              onChange={(e) => changePreset(e.target.value)}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2 text-xs text-slate-400 outline-none focus:border-indigo-500/20 transition-all font-light cursor-pointer"
            >
              {Object.entries(PRESETS).map(([k, p]) => (
                <option key={k} value={k} className="bg-[#0f0f18] text-slate-400">
                  {p.name} ({p.phases.map(ph => ph.duration).join('-')})
                </option>
              ))}
              <option value="custom" className="bg-[#0f0f18] text-slate-400">
                Custom Rhythm
              </option>
            </select>

            {presetKey === 'custom' && (
              <div className="w-full bg-white/3 border border-white/6 rounded-2xl p-4 space-y-4 fade-in max-w-xs text-left">
                <p className="text-[9px] uppercase tracking-[0.2em] text-indigo-300 font-medium">Custom Rhythm (seconds)</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Inhale</span>
                    <span className="text-white font-mono">{customInhale}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={customInhale}
                    onChange={(e) => setCustomInhale(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Hold</span>
                    <span className="text-white font-mono">{customHold}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={customHold}
                    onChange={(e) => setCustomHold(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Exhale</span>
                    <span className="text-white font-mono">{customExhale}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={customExhale}
                    onChange={(e) => setCustomExhale(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-300"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Breathing Circle */}
        <div className="relative flex items-center justify-center h-48">
          <div
            className={`w-36 h-36 rounded-full border-2 ${circleClass} flex items-center justify-center`}
            style={{
              borderColor: active ? phase.color : 'rgba(255, 255, 255, 0.05)',
              background: active ? `${phase.color}08` : 'transparent',
              transition: 'border-color 0.8s ease, background 0.8s ease',
              animationDuration: active ? `${phase.duration}s` : '0s',
            }}
          />
          <div className="absolute text-center">
            {active ? (
              <>
                <p className="text-3xl font-light text-white tracking-wider">{timer}</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 mt-1 font-light">{phase.name}</p>
              </>
            ) : (
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600 font-light">Ready</p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 italic max-w-xs mx-auto text-center leading-relaxed h-8">
          {active ? phase.guide : 'Find a comfortable position. Drop your shoulders.'}
        </p>

        <button
          onClick={() => {
            setActive((a) => !a)
            if (active) {
              setPhaseIdx(0)
              setTimer(activePreset.phases[0].duration)
              setCycles(0)
            }
          }}
          className={`px-12 py-3.5 rounded-full border text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 mx-auto ${
            active
              ? 'border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10'
              : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10'
          }`}
        >
          {active ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
          {active ? 'Stop' : 'Begin'}
        </button>
      </div>
    </div>
  )
}
