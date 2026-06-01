import React from 'react'
import { X, Music } from 'lucide-react'

const SOUND_ICONS = {
  Rain: '🌧️',
  Forest: '🌿',
  Ocean: '🌊',
  Fire: '🔥',
}

export default function SoundsPanel({
  activeSounds = {},
  toggleSound,
  setSoundVolume,
  masterVolume,
  setMasterVolume,
  stopAllSounds,
  setView,
  sounds
}) {
  const allSilent = Object.keys(activeSounds).length === 0

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-xs space-y-8 fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
            <Music size={12} strokeWidth={1.5} />
            Atmosphere
          </h2>
          <button onClick={() => setView('chat')} className="text-slate-700 hover:text-white transition-colors">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-3">
          {Object.keys(sounds).map(s => {
            const isActive = activeSounds[s] !== undefined
            const currentVol = activeSounds[s] ?? 0.5

            return (
              <div
                key={s}
                className="rounded-2xl border transition-all overflow-hidden bg-white/[0.02]"
                style={{
                  borderColor: isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                }}
              >
                <button
                  onClick={() => toggleSound(s)}
                  className="w-full flex items-center gap-3 py-3.5 px-4 text-left transition-colors"
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  }}
                >
                  <span className="text-xl">{SOUND_ICONS[s]}</span>
                  <span className={`text-[11px] uppercase tracking-[0.3em] transition-colors ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                    {s}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-[8px] text-indigo-400 tracking-wider uppercase">Playing</span>
                  )}
                </button>
                {isActive && (
                  <div className="px-4 pb-3 pt-1 bg-indigo-500/[0.04] space-y-1.5 fade-in">
                    <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-500">
                      <span>Sound volume</span>
                      <span>{Math.round(currentVol * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={currentVol}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setSoundVolume(s, parseFloat(e.target.value))}
                      className="w-full h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>
                )}
              </div>
            )
          })}

          <button
            onClick={stopAllSounds}
            className="w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl border transition-all text-left"
            style={{
              background: allSilent ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              borderColor: allSilent ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-xl">🤫</span>
            <span className={`text-[11px] uppercase tracking-[0.3em] transition-colors ${allSilent ? 'text-white/60' : 'text-slate-500'}`}>
              Silence All
            </span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[9px] uppercase tracking-[0.3em] text-slate-700">
            <span>Master Volume</span>
            <span>{Math.round(masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={e => setMasterVolume(parseFloat(e.target.value))}
            className="w-full h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-400"
          />
        </div>
      </div>
    </div>
  )
}
