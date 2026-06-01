import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, Sparkles } from 'lucide-react'

const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

const AFFIRMATIONS = [
  'You are allowed to take up space in this world.',
  'Rest is not a reward. It is a necessity.',
  'The moon does not fight the night. It simply shines.',
  'You do not have to earn the right to breathe.',
  'Even the darkest night will end, and the sun will rise.',
  'Your feelings are visitors. Let them come and go.',
  'You are not behind. You are exactly where you need to be.',
  'Healing is not linear. Some days you bloom, some days you rest.',
  'You are worthy of the tenderness you give to others.',
  'The river does not rush to the sea. It simply flows.',
  'You carry more light than you know.',
  'Stillness is not emptiness. It is where you find yourself.',
  'Growth often feels like unraveling before it feels like rising.',
  'You do not owe anyone a performance of being okay.',
  'The sky holds both storms and stars. So can you.',
  'Let your pace be gentle. The earth does not hurry.',
  'What you are feeling right now is temporary and valid.',
  'Softness is not weakness. It is its own kind of strength.',
  'You have survived every difficult day so far.',
  'The seeds you planted in silence will bloom in their own time.',
  'It is okay to outgrow who you used to be.',
  'You are not a burden. You are a breathing, beautiful thing.',
  'Sometimes courage looks like simply getting through the day.',
  'Your heart knows how to mend. Trust the quiet work it does.',
  'Not all who wander are lost. Some are simply finding their way home.',
  'There is bravery in asking for help. There is wisdom in receiving it.',
  'The stars do not compete with one another. They simply shine.',
  'Let yourself be a work in progress and a masterpiece at the same time.',
  'You are the poem you have been searching for.',
  'Even in the fog, the path is still beneath your feet.',
]

function hashDateToIndex(dateStr) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % AFFIRMATIONS.length
}

export default function AffirmationCard({ setView }) {
  const today = new Date().toDateString()
  const savedDate = LS.get('serentias_affirmation_date', null)
  const savedIdx = LS.get('serentias_affirmation_idx', null)

  const alreadyDrawn = savedDate === today && savedIdx !== null

  const [flipped, setFlipped] = useState(alreadyDrawn)
  const [animating, setAnimating] = useState(false)

  const affirmationIdx = useMemo(() => {
    if (alreadyDrawn) return savedIdx
    return hashDateToIndex(today)
  }, [today, alreadyDrawn, savedIdx])

  const affirmation = AFFIRMATIONS[affirmationIdx]

  const handleFlip = () => {
    if (flipped || animating) return
    setAnimating(true)
    LS.set('serentias_affirmation_date', today)
    LS.set('serentias_affirmation_idx', affirmationIdx)
    setTimeout(() => {
      setFlipped(true)
      setAnimating(false)
    }, 600)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <button onClick={() => setView('chat')} className="text-slate-600 hover:text-white transition-colors">
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-indigo-300 flex items-center gap-2">
          <Sparkles size={12} strokeWidth={1.5} />
          Daily Card
        </h2>
        <div className="w-6" />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div
          className="w-full max-w-sm cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={handleFlip}
        >
          <div
            className="relative w-full transition-transform duration-700 ease-in-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped || animating ? 'rotateY(180deg)' : 'rotateY(0deg)',
              aspectRatio: '3 / 4',
            }}
          >
            {/* Card Back */}
            <div
              className="absolute inset-0 rounded-2xl border border-indigo-500/20 flex flex-col items-center justify-center gap-4"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: 'linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(15,15,24,0.9) 50%, rgba(99,102,241,0.06) 100%)',
              }}
            >
              <div className="text-5xl pulse-soft">✨</div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400/70">
                Draw today's card
              </p>
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, transparent 30%, rgba(99,102,241,0.06) 50%, transparent 70%)',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />
              {/* Decorative border pattern */}
              <div className="absolute inset-3 rounded-xl border border-indigo-500/10" />
              <div className="absolute inset-5 rounded-lg border border-indigo-500/5" />
            </div>

            {/* Card Front */}
            <div
              className="absolute inset-0 rounded-2xl border border-indigo-500/20 flex flex-col items-center justify-center px-8"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(160deg, rgba(15,15,24,0.95) 0%, rgba(99,102,241,0.06) 100%)',
              }}
            >
              {/* Top decorative line */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px bg-indigo-500/30" />
                <Sparkles size={10} className="text-indigo-400/50" />
                <div className="w-8 h-px bg-indigo-500/30" />
              </div>

              {/* Affirmation text */}
              <p className="text-center text-lg text-slate-300 italic leading-relaxed font-serif">
                "{affirmation}"
              </p>

              {/* Bottom decorative line */}
              <div className="flex items-center gap-3 mt-8">
                <div className="w-8 h-px bg-indigo-500/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
                <div className="w-8 h-px bg-indigo-500/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Sub-message */}
        {flipped && (
          <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-slate-700 fade-in">
            A new card awaits tomorrow
          </p>
        )}
      </div>

      {/* Shimmer keyframes injected inline */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
