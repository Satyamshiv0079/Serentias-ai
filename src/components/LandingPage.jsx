import React, { useState } from 'react'
import { Wind } from 'lucide-react'

export default function LandingPage({ setView, userName, setUserName }) {
  const [name, setName] = useState(userName || '')

  const handleEnter = () => {
    if (name.trim()) setUserName(name.trim())
    setView('threshold')
  }

  return (
    <div className="h-screen bg-[#07070a] flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm space-y-14 py-10 fade-in">

        <div className="text-center space-y-5">
          <div className="w-20 h-20 rounded-full border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center mx-auto">
            <Wind className="text-indigo-400" size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-light tracking-[0.5em] uppercase text-white/90">
              Serentias
            </h1>
            <p className="mt-3 text-slate-500 italic text-sm font-light">
              "A companion for the quiet moments"
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] text-slate-600">
              What shall I call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnter()}
              placeholder="Your name (optional)"
              className="w-full bg-white/3 border border-white/8 rounded-2xl px-5 py-4 text-sm text-slate-300 placeholder-slate-700 outline-none focus:border-indigo-500/40 focus:bg-white/5 transition-all"
            />
          </div>

          <button
            onClick={handleEnter}
            className="w-full py-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-[11px] uppercase tracking-[0.4em] text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all"
          >
            Enter
          </button>

          <button
            onClick={() => setView('threshold')}
            className="w-full py-3 text-[10px] uppercase tracking-[0.3em] text-slate-700 hover:text-slate-500 transition-colors"
          >
            Enter anonymously
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-800 leading-relaxed">
          Everything you share stays on your device.
          <br />No accounts. No tracking.
        </p>
      </div>
    </div>
  )
}
