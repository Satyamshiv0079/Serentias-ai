import React, { useEffect, useState } from 'react'

export default function ThresholdPage({ setView, userName }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center space-y-14">
      <div
        className="space-y-5 transition-all duration-1000"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <h1 className="text-2xl font-light tracking-[0.6em] uppercase text-white/80">
          The Threshold
        </h1>
        <p className="max-w-xs mx-auto text-slate-500 italic text-sm leading-relaxed">
          {userName
            ? `Welcome, ${userName}. Leave the noise behind.`
            : 'Leave the noise behind. This space is yours.'}
        </p>
        <p className="text-slate-700 text-xs">
          Breathe. You are safe here.
        </p>
      </div>

      <button
        onClick={() => setView('chat')}
        className="px-14 py-5 rounded-full border border-white/8 text-[10px] uppercase tracking-[0.5em] text-slate-500 hover:text-white hover:bg-white/4 hover:border-white/15 transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease, background 0.3s, color 0.3s, border-color 0.3s' }}
      >
        Step Inside
      </button>
    </div>
  )
}
