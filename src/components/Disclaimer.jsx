import React from 'react'
import { Info } from 'lucide-react'

/**
 * Disclaimer — a subtle, always-visible medical disclaimer footer.
 * @param {{ onShowCrisis: () => void }} props
 */
export default function Disclaimer({ onShowCrisis }) {
  return (
    <footer className="flex items-center justify-center gap-1.5 px-4 py-1.5 border-t border-white/5 bg-[#07070a]/60 backdrop-blur-sm flex-shrink-0">
      <Info size={10} className="text-slate-700 flex-shrink-0" strokeWidth={1.5} />
      <p className="text-[9px] text-slate-700 tracking-wide leading-none">
        Serentias is not a therapist. This is not medical advice. If you need help, please contact a professional.
      </p>
      <span className="text-slate-800 text-[9px] mx-1">·</span>
      <button
        onClick={onShowCrisis}
        className="text-[9px] text-indigo-500/60 hover:text-indigo-400 tracking-wide transition-colors whitespace-nowrap"
      >
        Crisis helplines →
      </button>
    </footer>
  )
}
