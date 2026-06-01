import React, { useState } from 'react'
import { ChevronLeft, Settings, Trash2 } from 'lucide-react'

export default function SettingsPanel({
  setView, userName, setUserName, clearData, messageCount, journalCount,
  voiceLang = 'en-US', setVoiceLang, voiceEnabled = false, setVoiceEnabled,
  groqApiKey = '', setGroqApiKey
}) {
  const [name, setName] = useState(userName)
  const [confirmClear, setConfirmClear] = useState(false)

  const saveName = () => {
    setUserName(name.trim())
  }

  const handleClear = () => {
    if (confirmClear) {
      clearData()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
    }
  }

  const exportBackup = () => {
    try {
      const keys = [
        'serentias_messages',
        'serentias_journal',
        'serentias_lanterns',
        'serentias_name',
        'serentias_active_sounds',
        'serentias_master_volume',
        'serentias_gratitude',
        'serentias_affirmation_date',
        'serentias_affirmation_idx',
        'serentias_chat_mode'
      ]
      const backupData = {}
      keys.forEach(k => {
        const val = localStorage.getItem(k)
        if (val !== null) {
          backupData[k] = val
        }
      })
      
      const json = JSON.stringify(backupData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `serentias_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to generate backup.')
    }
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        const validKeys = [
          'serentias_messages',
          'serentias_journal',
          'serentias_lanterns',
          'serentias_name',
          'serentias_active_sounds',
          'serentias_master_volume',
          'serentias_gratitude',
          'serentias_affirmation_date',
          'serentias_affirmation_idx',
          'serentias_chat_mode'
        ]
        
        const importedKeys = Object.keys(data)
        const hasValidKey = importedKeys.some(k => validKeys.includes(k))
        
        if (!hasValidKey) {
          alert('This file does not appear to be a valid Serentias backup.')
          return
        }
        
        importedKeys.forEach(k => {
          if (validKeys.includes(k)) {
            localStorage.setItem(k, data[k])
          }
        })
        
        alert('Backup successfully imported! Refreshing your space…')
        window.location.reload()
      } catch (err) {
        alert('Failed to read backup file. Make sure it is a valid JSON backup.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <button onClick={() => setView('chat')} className="text-slate-600 hover:text-white transition-colors">
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
          <Settings size={12} strokeWidth={1.5} />
          Settings
        </h2>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 fade-in">

        {/* Name */}
        <section className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">Your name</p>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              placeholder="Anonymous"
              className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-300 placeholder-slate-700 outline-none focus:border-indigo-500/30 transition-all"
            />
            <button
              onClick={saveName}
              className="px-4 py-2.5 rounded-xl border border-white/8 text-[10px] uppercase tracking-wider text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              Save
            </button>
          </div>
        </section>

        {/* Groq API Key */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">AI Companion Key</p>
            <a 
              href="https://console.groq.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[8px] uppercase tracking-wider text-indigo-400/70 hover:text-indigo-300 transition-colors"
            >
              Get Free Key →
            </a>
          </div>
          <div className="bg-white/3 border border-white/6 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Serentias uses Groq Llama-3 to respond. Your key is stored locally in this browser and never uploaded.
            </p>
            <input
              type="password"
              value={groqApiKey}
              onChange={e => setGroqApiKey(e.target.value.trim())}
              placeholder="gsk_..."
              className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2 text-xs text-slate-300 placeholder-slate-700 outline-none focus:border-indigo-500/30 transition-all font-mono"
            />
          </div>
        </section>

        {/* Stats */}
        <section className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">Your space</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/3 border border-white/6 rounded-2xl p-4 text-center">
              <p className="text-2xl font-light text-indigo-300">{messageCount}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-600 mt-1">Messages</p>
            </div>
            <div className="bg-white/3 border border-white/6 rounded-2xl p-4 text-center">
              <p className="text-2xl font-light text-indigo-300">{journalCount}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-600 mt-1">Journal entries</p>
            </div>
          </div>
        </section>

        {/* Voice Settings */}
        <section className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">Voice Settings</p>
          <div className="bg-white/3 border border-white/6 rounded-2xl p-4 space-y-4">
            {/* Toggle Voice Output */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-light">Read AI replies aloud</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">Gentle mindful speaking</p>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 ${voiceEnabled ? 'bg-indigo-600/40 border border-indigo-500/30' : 'bg-white/5 border border-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-slate-300 transition-all duration-300 ${voiceEnabled ? 'translate-x-6 bg-indigo-400' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Language Selector */}
            {voiceEnabled && (
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-slate-400 font-light">Voice Language</span>
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  className="bg-white/5 border border-white/8 rounded-xl px-3 py-1.5 text-xs text-slate-400 outline-none focus:border-indigo-500/20 transition-all cursor-pointer"
                >
                  <option value="en-US" className="bg-[#0f0f18] text-slate-400">English (US)</option>
                  <option value="hi-IN" className="bg-[#0f0f18] text-slate-400">Hindi (भारत)</option>
                  <option value="es-ES" className="bg-[#0f0f18] text-slate-400">Spanish (España)</option>
                  <option value="fr-FR" className="bg-[#0f0f18] text-slate-400">French (France)</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Backup & Restore */}
        <section className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">Backup & Portability</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportBackup}
              className="py-3 rounded-2xl border border-white/8 bg-white/[0.01] text-[9px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all text-center"
            >
              Export JSON
            </button>
            <label
              className="py-3 rounded-2xl border border-white/8 bg-white/[0.01] text-[9px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all text-center cursor-pointer block"
            >
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </section>

        {/* Privacy */}
        <section className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">Privacy</p>
          <div className="bg-white/2 border border-white/6 rounded-2xl p-4 space-y-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              Everything you write stays on this device only. No servers, no accounts, no tracking.
            </p>
            <p className="text-[10px] text-slate-700">Stored in your browser's local storage.</p>
          </div>
        </section>

        {/* Clear data */}
        <section className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">Clear data</p>
          <button
            onClick={handleClear}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-[10px] uppercase tracking-[0.3em] transition-all ${
              confirmClear
                ? 'border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-white/8 text-slate-600 hover:text-slate-400 hover:border-white/15'
            }`}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            {confirmClear ? 'Tap again to confirm — this cannot be undone' : 'Clear all data'}
          </button>
          {confirmClear && (
            <button
              onClick={() => setConfirmClear(false)}
              className="w-full text-[10px] text-slate-700 hover:text-slate-500 transition-colors py-1"
            >
              Cancel
            </button>
          )}
        </section>

        <div className="text-center pt-4">
          <p className="text-[9px] text-slate-800 tracking-wider">Serentias v2.0 · Made with care</p>
        </div>
      </div>
    </div>
  )
}
