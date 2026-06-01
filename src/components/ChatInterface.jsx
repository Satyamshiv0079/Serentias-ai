import React, { useEffect, useRef, useState } from 'react'
import { Send, Flame, Wind, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

export default function ChatInterface({
  messages, inputText, setInputText, handleSend,
  isTyping, randomPrompt, lightLantern, lanternCount, setView, activeSounds = {},
  chatMode = 'poetic', setChatMode,
  voiceEnabled = false, setVoiceEnabled, voiceLang = 'en-US'
}) {
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionClass) {
        alert('Speech recognition is not supported in this browser. Try Google Chrome.')
        return
      }

      const rec = new SpeechRecognitionClass()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = voiceLang

      rec.onstart = () => {
        setListening(true)
      }

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript)
        }
      }

      rec.onerror = () => {
        setListening(false)
      }

      rec.onend = () => {
        setListening(false)
      }

      recognitionRef.current = rec
      rec.start()
    } catch (e) {
      console.error(e)
      setListening(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const onKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeSoundNames = Object.keys(activeSounds)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 fade-in">
            <div className="space-y-3">
              <p className="text-slate-600 italic text-sm leading-relaxed max-w-xs">
                {randomPrompt}
              </p>
              <p className="text-slate-800 text-xs">
                This space holds no judgment.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {['I\'m feeling overwhelmed', 'I need to breathe', 'Something is on my mind'].map(s => (
                <button
                  key={s}
                  onClick={() => { setInputText(s); inputRef.current?.focus() }}
                  className="px-4 py-2 rounded-full border border-white/8 text-[10px] tracking-wide text-slate-600 hover:text-slate-400 hover:border-white/15 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                <Wind size={12} className="text-indigo-400" strokeWidth={1.5} />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600/15 border border-indigo-500/20 text-slate-200 rounded-tr-sm'
                  : 'bg-white/3 border border-white/6 text-slate-300 rounded-tl-sm italic'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 fade-in">
            <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Wind size={12} className="text-indigo-400" strokeWidth={1.5} />
            </div>
            <div className="bg-white/3 border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                    style={{ animation: `pulse-soft 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-2 flex gap-2 flex-wrap">
        <ActionChip icon={<Wind size={12} />} label="Breathe" onClick={() => setView('breathing')} />
        <ActionChip
          icon={<Flame size={12} />}
          label={`Light a lantern · ${lanternCount}`}
          onClick={lightLantern}
        />
        <ActionChip
          icon={voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          label={voiceEnabled ? "Voice On" : "Voice Off"}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
        />
        {activeSoundNames.length > 0 && (
          <span className="text-[9px] text-indigo-400/60 self-center tracking-wider uppercase ml-1">
            ♫ {activeSoundNames.join(' · ')}
          </span>
        )}
      </div>

      {/* Companion Mode Selector */}
      <div className="px-5 pb-2 pt-1 flex items-center gap-2 select-none">
        <span className="text-[8px] uppercase tracking-widest text-slate-700">Companion:</span>
        <div className="flex gap-1 bg-white/[0.01] border border-white/[0.04] p-0.5 rounded-xl">
          {[
            { key: 'poetic', label: '🌿 Poetic' },
            { key: 'quiet', label: '🤫 Quiet' },
            { key: 'reflective', label: '🪞 Reflective' }
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setChatMode(m.key)}
              className={`px-3 py-1 rounded-lg text-[8px] uppercase tracking-wider transition-all ${
                chatMode === m.key
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium'
                  : 'border border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-2">
        <div className="flex items-end gap-2 bg-white/4 border border-white/8 rounded-2xl px-4 py-3 focus-within:border-indigo-500/30 transition-all">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Share what's on your mind…"
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm text-slate-300 placeholder-slate-700 leading-relaxed max-h-32"
            style={{ fieldSizing: 'content' }}
          />
          <button
            onClick={toggleListening}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 mr-1 ${
              listening
                ? 'border-red-500/30 bg-red-500/10 text-red-400 animate-pulse'
                : 'border-white/8 text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
            title="Talk to Serentias"
          >
            {listening ? <MicOff size={13} strokeWidth={1.5} /> : <Mic size={13} strokeWidth={1.5} />}
          </button>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 hover:bg-indigo-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send size={13} strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-800 mt-2 tracking-wider">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

function ActionChip({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8 text-[10px] tracking-wide text-slate-600 hover:text-slate-300 hover:border-white/15 transition-all"
    >
      <span className="text-indigo-400/60">{icon}</span>
      {label}
    </button>
  )
}
