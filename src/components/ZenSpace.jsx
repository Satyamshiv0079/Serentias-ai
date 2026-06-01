import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, Flame, Sparkles } from 'lucide-react'

// Web Audio API crackle and hum synthesizer
function createCandleAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    const ctx = new AudioContextClass()

    // 1. Warm base hum oscillators (A2 chord)
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const baseGain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(110, ctx.currentTime) // A2 root
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(165, ctx.currentTime) // E3 fifth harmony

    osc1.connect(baseGain)
    osc2.connect(baseGain)
    baseGain.connect(ctx.destination)
    baseGain.gain.setValueAtTime(0.015, ctx.currentTime)

    // 2. White noise for wood crackling
    const bufferSize = ctx.sampleRate * 2 // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    // Bandpass filter to isolate higher frequency wood pop noises
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, ctx.currentTime)
    filter.Q.setValueAtTime(4, ctx.currentTime)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.003, ctx.currentTime)

    // LFO to create irregular crackling intervals
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.setValueAtTime(6, ctx.currentTime) // 6Hz flicker
    lfoGain.gain.setValueAtTime(0.003, ctx.currentTime)

    lfo.connect(lfoGain)
    lfoGain.connect(noiseGain.gain)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    osc1.start()
    osc2.start()
    noise.start()
    lfo.start()

    return {
      stop: () => {
        try {
          osc1.stop()
          osc2.stop()
          noise.stop()
          lfo.stop()
          ctx.close()
        } catch (e) {}
      },
      setVolume: (val) => {
        baseGain.gain.setValueAtTime(0.025 * val, ctx.currentTime)
        noiseGain.gain.setValueAtTime(0.006 * val, ctx.currentTime)
      },
    }
  } catch (e) {
    console.error(e)
    return null
  }
}

const SAND_STYLES = {
  obsidian: {
    name: 'Obsidian',
    bgColor: '#0e0e15',
    strokeRGB: '4, 4, 6',
    highlightRGB: '255, 255, 255',
    glowRGB: '129, 140, 248',
    grainColor: 'rgba(255, 255, 255, 0.015)'
  },
  white: {
    name: 'White Sand',
    bgColor: '#f4f4ec',
    strokeRGB: '205, 205, 195',
    highlightRGB: '255, 255, 255',
    glowRGB: '129, 140, 248',
    grainColor: 'rgba(0, 0, 0, 0.015)'
  },
  dune: {
    name: 'Golden Dune',
    bgColor: '#1c160f',
    strokeRGB: '12, 8, 4',
    highlightRGB: '245, 158, 11',
    glowRGB: '245, 158, 11',
    grainColor: 'rgba(245, 158, 11, 0.02)'
  },
  sage: {
    name: 'Sage Green',
    bgColor: '#0c120e',
    strokeRGB: '4, 6, 5',
    highlightRGB: '16, 185, 129',
    glowRGB: '16, 185, 129',
    grainColor: 'rgba(16, 185, 129, 0.02)'
  }
}

export default function ZenSpace({ setView }) {
  const [candleLit, setCandleLit] = useState(false)
  const [intensity, setIntensity] = useState(0.5)
  const [sandColor, setSandColor] = useState(() => {
    try {
      return localStorage.getItem('serentias_sand_color') || 'obsidian'
    } catch {
      return 'obsidian'
    }
  })

  const activeStyleRef = useRef(SAND_STYLES[sandColor])
  useEffect(() => {
    activeStyleRef.current = SAND_STYLES[sandColor]
    try {
      localStorage.setItem('serentias_sand_color', sandColor)
    } catch {}
  }, [sandColor])

  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const paths = useRef([]) // list of { points: [{x, y}], timestamp: number }
  const currentPath = useRef([])
  const audioInstance = useRef(null)

  // Audio lifecycle controller
  useEffect(() => {
    if (candleLit) {
      const audio = createCandleAudio()
      if (audio) {
        audio.setVolume(intensity)
        audioInstance.current = audio
      }
    } else {
      if (audioInstance.current) {
        audioInstance.current.stop()
        audioInstance.current = null
      }
    }

    return () => {
      if (audioInstance.current) {
        audioInstance.current.stop()
        audioInstance.current = null
      }
    }
  }, [candleLit])

  // Volume slider updater
  useEffect(() => {
    if (audioInstance.current) {
      audioInstance.current.setVolume(intensity)
    }
  }, [intensity])

  // Sand Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener('resize', resize)

    let animFrame

    const drawSandBackground = () => {
      const style = activeStyleRef.current
      ctx.fillStyle = style.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = style.grainColor
      for (let i = 0; i < canvas.width; i += 3) {
        for (let j = 0; j < canvas.height; j += 3) {
          if (Math.random() > 0.85) {
            ctx.fillRect(i, j, 1, 1)
          }
        }
      }
    }

    const render = () => {
      const style = activeStyleRef.current
      drawSandBackground()

      const now = Date.now()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Clean up expired paths
      paths.current = paths.current.filter((p) => now - p.timestamp < 10000)

      // Draw active sand paths
      paths.current.forEach((path) => {
        const age = now - path.timestamp
        const opacity = Math.max(0, 1 - age / 10000)

        // Draw shadow/groove
        ctx.lineWidth = 14
        ctx.strokeStyle = `rgba(${style.strokeRGB}, ${opacity * 0.75})`
        ctx.shadowColor = `rgba(${style.glowRGB}, ${opacity * 0.08})`
        ctx.shadowBlur = 8
        ctx.beginPath()
        path.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        })
        ctx.stroke()

        // Draw inner rake highlight
        ctx.lineWidth = 2
        ctx.strokeStyle = `rgba(${style.highlightRGB}, ${opacity * 0.05})`
        ctx.shadowBlur = 0
        ctx.beginPath()
        path.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        })
        ctx.stroke()
      })

      // Draw current path being drawn
      if (currentPath.current.length > 0) {
        ctx.lineWidth = 14
        ctx.strokeStyle = `rgba(${style.strokeRGB}, 0.75)`
        ctx.shadowColor = `rgba(${style.glowRGB}, 0.08)`
        ctx.shadowBlur = 8
        ctx.beginPath()
        currentPath.current.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        })
        ctx.stroke()

        ctx.lineWidth = 2
        ctx.strokeStyle = `rgba(${style.highlightRGB}, 0.05)`
        ctx.shadowBlur = 0
        ctx.beginPath()
        currentPath.current.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        })
        ctx.stroke()
      }

      animFrame = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrame)
    }
  }, [])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handleStart = (e) => {
    const coords = getCoordinates(e)
    if (!coords) return
    isDrawing.current = true
    currentPath.current = [coords]
  }

  const handleMove = (e) => {
    if (!isDrawing.current) return
    const coords = getCoordinates(e)
    if (!coords) return

    // Limit point density for smoother curves and performance
    const lastPt = currentPath.current[currentPath.current.length - 1]
    if (lastPt) {
      const dist = Math.hypot(coords.x - lastPt.x, coords.y - lastPt.y)
      if (dist < 4) return
    }

    currentPath.current.push(coords)
  }

  const handleEnd = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (currentPath.current.length > 1) {
      paths.current.push({
        points: currentPath.current,
        timestamp: Date.now(),
      })
    }
    currentPath.current = []
  }

  // Clear sand drawing instantly
  const clearSand = () => {
    paths.current = []
    currentPath.current = []
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0 relative z-50">
        <button onClick={() => setView('chat')} className="text-slate-600 hover:text-white transition-colors">
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-indigo-300 flex items-center gap-2">
          <Sparkles size={12} strokeWidth={1.5} />
          Zen Space
        </h2>
        <div className="w-6" />
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: Sand Garden */}
        <div className="flex-1 relative border-b md:border-b-0 md:border-r border-white/5 flex flex-col min-h-0 md:min-h-full">
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-light">
              Zen Garden
            </p>
            <p className="text-[8px] text-slate-700 mt-1 uppercase tracking-wider">
              Drag to rake the sand · Strokes fade gently
            </p>
          </div>
          <button
            onClick={clearSand}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl border border-white/5 bg-[#0f0f18]/60 hover:bg-[#0f0f18]/80 text-[8px] uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-all backdrop-blur-sm"
          >
            Smooth Sand
          </button>
          {/* Sand Color Picker swatches */}
          <div className="absolute bottom-4 left-4 z-20 flex gap-2 bg-[#0f0f18]/60 border border-white/5 rounded-2xl p-2 backdrop-blur-sm animate-fade-in">
            {Object.entries(SAND_STYLES).map(([key, item]) => {
              const colorPreviewMap = {
                obsidian: 'bg-slate-900 border-slate-700',
                white: 'bg-stone-100 border-stone-200',
                dune: 'bg-yellow-950 border-yellow-900/60',
                sage: 'bg-emerald-950 border-emerald-900/60'
              }
              const isActive = sandColor === key
              return (
                <button
                  key={key}
                  onClick={() => setSandColor(key)}
                  className={`w-6 h-6 rounded-full border transition-all ${colorPreviewMap[key]} ${
                    isActive ? 'scale-110 ring-1 ring-indigo-400' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={`${item.name} Sand`}
                />
              )
            })}
          </div>
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="w-full h-full cursor-crosshair flex-1 min-h-0"
          />
        </div>

        {/* Right Side: Virtual Candle */}
        <div className="w-full md:w-80 flex flex-col items-center justify-center p-8 bg-white/[0.01] shrink-0">
          <div className="text-center space-y-8 w-full max-w-xs">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-light mb-1">
                Ambient Light
              </p>
              <p className="text-[8px] text-slate-700 uppercase tracking-wider">
                Light the candle to play calming hums
              </p>
            </div>

            {/* Candle Container */}
            <div className="flex justify-center h-48 items-end relative">
              <div
                className="w-12 rounded-t-lg bg-indigo-950/20 border-t border-indigo-500/10 flex flex-col justify-end items-center relative transition-all"
                style={{
                  height: '110px',
                  background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(15,15,24,0.7) 100%)',
                  boxShadow: candleLit
                    ? `0 -25px 50px -10px rgba(245,158,11,${intensity * 0.15})`
                    : 'none',
                }}
              >
                {/* Wick */}
                <div className="w-[1.5px] h-3 bg-slate-700 -mt-3 absolute top-0" />

                {/* Flame */}
                {candleLit && (
                  <div
                    className="absolute -top-7 w-4 rounded-full transition-all duration-300"
                    style={{
                      height: `${20 + intensity * 15}px`,
                      background: 'linear-gradient(0deg, rgba(245,158,11,1) 0%, rgba(239,68,68,0.8) 50%, rgba(245,158,11,0) 100%)',
                      filter: 'blur(0.8px)',
                      boxShadow: `0 0 ${15 + intensity * 20}px ${intensity * 10}px rgba(245,158,11,0.45)`,
                      animation: 'candle-flicker 1.2s infinite ease-in-out',
                      transformOrigin: 'bottom center',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setCandleLit(!candleLit)}
              className={`w-full py-3 rounded-2xl border text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                candleLit
                  ? 'border-amber-500/30 bg-amber-500/5 text-amber-400'
                  : 'border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15'
              }`}
            >
              <Flame size={12} strokeWidth={1.5} />
              {candleLit ? 'Extinguish' : 'Light Candle'}
            </button>

            {/* Intensity Slider */}
            {candleLit && (
              <div className="space-y-3 pt-2 fade-in">
                <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-500">
                  <span>Flame & Volume</span>
                  <span>{Math.round(intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.01"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flame flicker keyframes */}
      <style>{`
        @keyframes candle-flicker {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.95; }
          25% { transform: scale(1.05, 0.95) rotate(-1.5deg); opacity: 0.9; }
          50% { transform: scale(0.95, 1.05) rotate(1deg); opacity: 1; }
          75% { transform: scale(1.02, 0.98) rotate(-0.5deg); opacity: 0.93; }
        }
      `}</style>
    </div>
  )
}
