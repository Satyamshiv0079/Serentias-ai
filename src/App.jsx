import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Header from './components/Header.jsx'
import LandingPage from './components/LandingPage.jsx'
import ThresholdPage from './components/ThresholdPage.jsx'
import ChatInterface from './components/ChatInterface.jsx'
import JournalPage from './components/JournalPage.jsx'
import SoundsPanel from './components/SoundsPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import BreathingExercise from './components/BreathingExercise.jsx'

// Premium Features & Enhancements
import FireflyBackground from './components/FireflyBackground.jsx'
import PageTransition from './components/PageTransition.jsx'
import AffirmationCard from './components/AffirmationCard.jsx'
import GratitudeJar from './components/GratitudeJar.jsx'
import CrisisBanner, { detectCrisis } from './components/CrisisBanner.jsx'
import Disclaimer from './components/Disclaimer.jsx'
import ZenSpace from './components/ZenSpace.jsx'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE'

const SYSTEM_PROMPTS = {
  poetic: `You are Serentias — a gentle, poetic AI companion for mental wellbeing. 
Your role is to offer a quiet, non-judgmental presence. You speak with warmth and metaphor — 
like candlelight, like breath, like still water.
CRITICAL SAFETY DIRECTIVES:
- You are not a medical professional, therapist, or clinical counselor.
- You must NEVER provide medical advice, diagnostic evaluations, clinical treatment plans, or prescription recommendations.
- You must never suggest or recommend specific medications, pharmaceutical drugs, or physical medical treatments.
- If the user asks for therapeutic techniques, keep suggestions strictly to general relaxation, mindfulness, or standard breathing exercises.
- If the user discusses self-harm, suicidal thoughts, severe depression, or other high-risk situations, immediately and gently pivot to encouraging them to seek professional help and contact the crisis hotlines. Do not try to diagnose or treat them.
- Keep responses concise (2-4 sentences usually). Use metaphors of nature, light, and breath. Never say "I understand" — show it instead.`,

  quiet: `You are Serentias — a quiet, deeply gentle and validation-focused mental wellbeing companion. 
Your role is to hold space in soft silence. Speak with minimal, extremely concise sentences. Do not offer complex metaphors.
Focus entirely on validation, deep listening, and letting the user speak. Respond with 1-2 short, comforting sentences.
CRITICAL SAFETY DIRECTIVES:
- You are not a medical professional, therapist, or clinical counselor.
- You must NEVER provide medical advice, diagnostic evaluations, clinical treatment plans, or prescription recommendations.
- You must never suggest or recommend specific medications, pharmaceutical drugs, or physical medical treatments.
- If the user discusses self-harm, suicidal thoughts, severe depression, or other high-risk situations, immediately and gently pivot to encouraging them to seek professional help and contact the crisis hotlines.`,

  reflective: `You are Serentias — a reflective mental wellbeing companion. 
Your role is to ask slow, deep, open-ended questions that help the user look inside.
Do not tell them what they feel and do not explain their emotions. Do not speak in poetic metaphors.
Reflect back what they have said gently, and ask one soft, probing question to encourage deeper writing. Keep responses concise (2-3 sentences).
CRITICAL SAFETY DIRECTIVES:
- You are not a medical professional, therapist, or clinical counselor.
- You must NEVER provide medical advice, diagnostic evaluations, clinical treatment plans, or prescription recommendations.
- You must never suggest or recommend specific medications, pharmaceutical drugs, or physical medical treatments.
- If the user discusses self-harm, suicidal thoughts, severe depression, or other high-risk situations, immediately and gently pivot to encouraging them to seek professional help and contact the crisis hotlines.`
}

const POETIC_PROMPTS = [
  'What is resting heavy on your heart today?',
  'What does this moment feel like?',
  'Where does your mind keep returning to?',
  'What would you like to set down for a while?',
  'What are you carrying that you haven\'t said aloud?',
  'What does quiet feel like for you right now?',
]

const SOUNDS = {
  Rain: 'https://cdn.pixabay.com/audio/2022/03/10/audio_270f4609dc.mp3',
  Forest: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c2c5439e.mp3',
  Ocean: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9e948c697.mp3',
  Fire: 'https://cdn.pixabay.com/audio/2023/02/28/audio_a6df06ffe5.mp3',
}

const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

// Client-side lightweight keyword matching RAG engine
function findRelevantJournalEntry(userInput, journalEntries) {
  if (!userInput || !journalEntries || journalEntries.length === 0) return null

  // Clean stop words to filter out noise words from user query
  const stopWords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from',
    'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here',
    'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into',
    'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of',
    'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant',
    'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their',
    'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were',
    'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why',
    'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself',
    'yourselves', 'feel', 'feeling', 'think', 'thinking', 'really', 'just'
  ])

  // Normalize, filter out punctuation, and tokenize query input
  const words = userInput.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  if (words.length === 0) return null

  let bestEntry = null
  let highestScore = 0

  journalEntries.forEach(entry => {
    if (!entry.text) return
    const textLower = entry.text.toLowerCase()
    let score = 0
    words.forEach(w => {
      if (textLower.includes(w)) {
        score += 1
      }
    })

    if (score > highestScore) {
      highestScore = score
      bestEntry = entry
    }
  })

  // Require at least one keyword match to trigger long-term RAG recall context
  if (highestScore >= 1 && bestEntry) {
    return bestEntry
  }
  return null
}
// Client-side mindfulness voice synthesis engine
function speakText(text, lang) {
  try {
    // Stop any ongoing speech playback
    window.speechSynthesis.cancel()

    // Clean text by stripping custom mindfulness brackets/instructions
    const cleanText = text.replace(/\[.*?\]/g, '').trim()
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = lang

    // Gentle speaking properties
    utterance.rate = 0.85 // Slow tempo
    utterance.pitch = 0.95 // Low warm pitch

    // Choose high-quality voice if matching language exists
    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    window.speechSynthesis.speak(utterance)
  } catch (e) {
    console.error(e)
  }
}

export default function App() {
  const [view, setView] = useState('landing')
  const [chatMode, setChatMode] = useState(() => LS.get('serentias_chat_mode', 'poetic'))
  const [messages, setMessages] = useState(() => LS.get('serentias_messages', []))
  const [journalEntries, setJournalEntries] = useState(() => LS.get('serentias_journal', []))
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeSounds, setActiveSounds] = useState(() => LS.get('serentias_active_sounds', {}))
  const [masterVolume, setMasterVolume] = useState(() => LS.get('serentias_master_volume', 0.5))
  const [lanternCount, setLanternCount] = useState(() => LS.get('serentias_lanterns', 47))
  const [presenceCount] = useState(() => Math.floor(Math.random() * 12) + 3)
  const [journalText, setJournalText] = useState('')
  const [selectedMood, setSelectedMood] = useState(3)
  const [userName, setUserName] = useState(() => LS.get('serentias_name', ''))
  const [crisisVisible, setCrisisVisible] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(() => LS.get('serentias_voice_enabled', false))
  const [voiceLang, setVoiceLang] = useState(() => LS.get('serentias_voice_lang', 'en-US'))
  const [groqApiKey, setGroqApiKey] = useState(() => LS.get('serentias_groq_api_key', ''))

  const audioRefs = useRef({})
  const randomPrompt = useMemo(() => POETIC_PROMPTS[Math.floor(Math.random() * POETIC_PROMPTS.length)], [])

  const theme = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return {
        bg: 'bg-[#0b0a08]',
        glow: 'from-amber-950/15 to-transparent',
        label: 'Dawn',
        icon: '🌅',
      }
    } else if (hour >= 12 && hour < 17) {
      return {
        bg: 'bg-[#07090b]',
        glow: 'from-sky-950/15 to-transparent',
        label: 'Azure',
        icon: '☀️',
      }
    } else if (hour >= 17 && hour < 20) {
      return {
        bg: 'bg-[#0a070b]',
        glow: 'from-violet-950/15 to-transparent',
        label: 'Twilight',
        icon: '🌆',
      }
    } else {
      return {
        bg: 'bg-[#07070a]',
        glow: 'from-indigo-950/15 to-transparent',
        label: 'Void',
        icon: '🌌',
      }
    }
  }, [])

  useEffect(() => { LS.set('serentias_messages', messages) }, [messages])
  useEffect(() => { LS.set('serentias_journal', journalEntries) }, [journalEntries])
  useEffect(() => { LS.set('serentias_lanterns', lanternCount) }, [lanternCount])
  useEffect(() => { LS.set('serentias_name', userName) }, [userName])
  useEffect(() => { LS.set('serentias_active_sounds', activeSounds) }, [activeSounds])
  useEffect(() => { LS.set('serentias_master_volume', masterVolume) }, [masterVolume])
  useEffect(() => { LS.set('serentias_chat_mode', chatMode) }, [chatMode])
  useEffect(() => { LS.set('serentias_voice_enabled', voiceEnabled) }, [voiceEnabled])
  useEffect(() => { LS.set('serentias_voice_lang', voiceLang) }, [voiceLang])
  useEffect(() => { LS.set('serentias_groq_api_key', groqApiKey) }, [groqApiKey])

  // Sound mixing playback controller
  useEffect(() => {
    Object.entries(SOUNDS).forEach(([name, url]) => {
      const vol = activeSounds[name]
      const isActive = vol !== undefined

      if (isActive) {
        if (!audioRefs.current[name]) {
          const audio = new Audio(url)
          audio.loop = true
          audioRefs.current[name] = audio
        }
        // Per-sound volume scaled by master volume
        audioRefs.current[name].volume = vol * masterVolume
        audioRefs.current[name].play().catch(() => {})
      } else {
        if (audioRefs.current[name]) {
          audioRefs.current[name].pause()
          delete audioRefs.current[name]
        }
      }
    })

    return () => {
      // Cleanup: pause all sounds on unmount
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
      })
    }
  }, [activeSounds, masterVolume])

  const toggleSound = useCallback((name) => {
    setActiveSounds(prev => {
      const next = { ...prev }
      if (next[name] !== undefined) {
        delete next[name]
      } else {
        next[name] = 0.5 // Default volume
      }
      return next
    })
  }, [])

  const setSoundVolume = useCallback((name, vol) => {
    setActiveSounds(prev => {
      if (prev[name] === undefined) return prev
      return {
        ...prev,
        [name]: vol
      }
    })
  }, [])

  const stopAllSounds = useCallback(() => {
    setActiveSounds({})
  }, [])

  const callGroq = useCallback(async (userText, history, ragContext = null) => {
    const keyToUse = groqApiKey || GROQ_API_KEY
    if (!keyToUse || keyToUse === 'YOUR_GROQ_API_KEY_HERE') {
      return "To speak with me, please enter a warm, private Groq API key in your Settings (tap the gear icon in the top right). I am here, waiting to hear your thoughts."
    }

    const activeSystemPrompt = SYSTEM_PROMPTS[chatMode] || SYSTEM_PROMPTS.poetic
    const msgs = [
      ...history.map(m => ({ role: m.role, content: m.content })),
    ]

    // Inject client-side context RAG memory if relevant match exists
    if (ragContext) {
      msgs.push({ role: 'system', content: ragContext })
    }

    msgs.push({ role: 'user', content: userText })

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToUse}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'system', content: activeSystemPrompt }, ...msgs],
          max_tokens: 300,
          temperature: 0.85,
        })
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      return data.choices[0].message.content
    } catch {
      return 'The connection wavered for a moment. Would you like to share again? I\'m still here.'
    }
  }, [chatMode, groqApiKey])

  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text || isTyping) return

    // Detect crisis words
    if (detectCrisis(text)) {
      setCrisisVisible(true)
    }

    // Client-side local RAG search
    const relevantPastEntry = findRelevantJournalEntry(text, journalEntries)
    let ragContext = null
    if (relevantPastEntry) {
      const dateStr = new Date(relevantPastEntry.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
      ragContext = `[Mindfulness Context Memory: On ${dateStr}, the user journaled: "${relevantPastEntry.text}". If relevant, naturally and gently reference this past moment in your response, showing that you remember their journey and support their long-term path. Keep it extremely brief and poetic.]`
    }

    const userMsg = { id: Date.now(), role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInputText('')
    setIsTyping(true)
    const reply = await callGroq(text, messages, ragContext)
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply }])
    setIsTyping(false)

    // Playback mindful speech if enabled
    if (voiceEnabled) {
      speakText(reply, voiceLang)
    }
  }, [inputText, isTyping, messages, journalEntries, callGroq, voiceEnabled, voiceLang])

  const lightLantern = useCallback(() => {
    setLanternCount(n => n + 1)
  }, [])

  const addJournalEntry = useCallback(() => {
    if (!journalText.trim()) return
    const entry = {
      id: Date.now(),
      text: journalText.trim(),
      mood: selectedMood,
      date: new Date().toISOString(),
    }
    setJournalEntries(prev => [entry, ...prev])
    setJournalText('')
    setSelectedMood(3)
  }, [journalText, selectedMood])

  const moodData = useMemo(() => {
    return [...journalEntries]
      .reverse()
      .slice(-14)
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        mood: e.mood,
      }))
  }, [journalEntries])

  const clearData = useCallback(() => {
    setMessages([])
    setJournalEntries([])
    setLanternCount(47)
    setActiveSounds({})
    setMasterVolume(0.5)
    setVoiceEnabled(false)
    setVoiceLang('en-US')
    setGroqApiKey('')
    LS.set('serentias_messages', [])
    LS.set('serentias_journal', [])
    LS.set('serentias_active_sounds', {})
    LS.set('serentias_master_volume', 0.5)
    LS.set('serentias_voice_enabled', false)
    LS.set('serentias_voice_lang', 'en-US')
    LS.set('serentias_groq_api_key', '')
    try {
      localStorage.removeItem('serentias_gratitude')
      localStorage.removeItem('serentias_affirmation_date')
      localStorage.removeItem('serentias_affirmation_idx')
    } catch {}
  }, [])

  return (
    <div className={`h-screen ${theme.bg} flex flex-col text-slate-200 overflow-hidden relative transition-colors duration-1000`}>
      {/* Dynamic Background Glow Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.glow} pointer-events-none z-0`} />

      {/* Decorative Particle Background */}
      <FireflyBackground />

      {view !== 'landing' && view !== 'threshold' && (
        <Header presenceCount={presenceCount} setView={setView} lanternCount={lanternCount} themeInfo={theme} />
      )}

      {/* Main viewport with transition handling */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <PageTransition viewKey={view}>
          {view === 'landing' && (
            <LandingPage
              setView={setView}
              userName={userName}
              setUserName={setUserName}
            />
          )}
          {view === 'threshold' && (
            <ThresholdPage setView={setView} userName={userName} />
          )}
          {view === 'chat' && (
            <ChatInterface
              messages={messages}
              inputText={inputText}
              setInputText={setInputText}
              handleSend={handleSend}
              isTyping={isTyping}
              randomPrompt={randomPrompt}
              lightLantern={lightLantern}
              lanternCount={lanternCount}
              setView={setView}
              activeSounds={activeSounds}
              chatMode={chatMode}
              setChatMode={setChatMode}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
              voiceLang={voiceLang}
            />
          )}
          {view === 'journal' && (
            <JournalPage
              setView={setView}
              journalEntries={journalEntries}
              moodData={moodData}
              journalText={journalText}
              setJournalText={setJournalText}
              selectedMood={selectedMood}
              setSelectedMood={setSelectedMood}
              addJournalEntry={addJournalEntry}
            />
          )}
          {view === 'sounds' && (
            <SoundsPanel
              activeSounds={activeSounds}
              toggleSound={toggleSound}
              setSoundVolume={setSoundVolume}
              masterVolume={masterVolume}
              setMasterVolume={setMasterVolume}
              stopAllSounds={stopAllSounds}
              setView={setView}
              sounds={SOUNDS}
            />
          )}
          {view === 'breathing' && (
            <BreathingExercise onClose={() => setView('chat')} />
          )}
          {view === 'settings' && (
            <SettingsPanel
              setView={setView}
              userName={userName}
              setUserName={setUserName}
              clearData={clearData}
              messageCount={messages.length}
              journalCount={journalEntries.length}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
              voiceLang={voiceLang}
              setVoiceLang={setVoiceLang}
              groqApiKey={groqApiKey}
              setGroqApiKey={setGroqApiKey}
            />
          )}
          {view === 'affirmation' && (
            <AffirmationCard setView={setView} />
          )}
          {view === 'gratitude' && (
            <GratitudeJar setView={setView} />
          )}
          {view === 'zen' && (
            <ZenSpace setView={setView} />
          )}
        </PageTransition>
      </div>

      {/* Safety Overlay Banner */}
      <CrisisBanner visible={crisisVisible} onDismiss={() => setCrisisVisible(false)} />

      {/* Persistent Disclaimer Bar */}
      <Disclaimer onShowCrisis={() => setCrisisVisible(true)} />
    </div>
  )
}
