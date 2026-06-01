# Serentias AI 🌿

> *A gentle, quiet companion for the moments between moments.*

Serentias is a beautiful, minimalist mental wellness app designed to give you a private space for reflection. It features poetic AI chat, local journaling, guided breathing exercises, ambient sound mixing, and interactive mindfulness elements. 

Everything is kept **100% private** on your device. There are no accounts, no tracking, and no external databases.

---

## 🌟 Premium Features

### 🛡️ 1. Crisis & Safety First
* **Crisis Helpline Banner**: Dynamic, non-intrusive keyword analysis triggers a helper banner offering localized emergency resources for India, the USA, and globally.
* **Persistent Clinical Disclaimer**: A subtle, elegant bar on the footer reminding users that Serentias is a wellness companion and not a substitute for clinical therapy.
* **Reinforced Guardrails**: Safety-focused prompts prevent the AI from prescribing medications or delivering clinical diagnoses.

### ✨ 2. Visual Excellence & Zen Elements
* **Ambient Firefly Particles**: A dynamic, interactive canvas particle system rendering soft glowing "fireflies" that float gently in the background.
* **Dynamic Time-of-Day Themes**: The background transitions seamlessly depending on the hour of the day:
  * 🌅 **Dawn** (5 AM - 12 PM): Warm amber morning sunrise glow.
  * ☀️ **Azure** (12 PM - 5 PM): Calm, bright sky blue afternoon.
  * 🌆 **Twilight** (5 PM - 8 PM): A beautiful twilight violet.
  * 🌌 **Void** (8 PM - 5 AM): Deep stellar space black.
* **Zen Sand Garden**: An interactive dark sand canvas where cursor movements rake organic 3D grooves that slowly fade out over 10 seconds, encouraging continuous, mindful drawing.
* **Interactive Virtual Candle**: Light a minimalist CSS flame that flickers randomly, accompanied by synthesized wood-crackling loops generated dynamically via Web Audio API.

### 🃏 3. High Stickiness & Guided Practice
* **Guided Breathing Customizer**: Preset selector for multiple deep breathing exercises (4-4-6 Calm Grounding, 4-4-4-4 Box Breathing, and 4-7-8 Deep Sleep) accompanied by Web Audio synthesized mindfulness bowl transition chimes.
* **Daily Affirmation Cards**: Seeded deterministically by the date, draw a beautiful card once a day featuring soft, poetic encouragement with a full 3D flip animation.
* **Gratitude Jar**: Write down what you're grateful for and watch your glass jar fill up with colorful visual moments of reflection stored in your local logs.
* **Atmosphere Sound Mixer**: Simultaneously mix up to four ambient sounds (Rain, Forest, Ocean, Fire) with individual track volume sliders, global silence toggles, and a master volume control.
* **Mood Heatmap Calendar**: A comprehensive GitHub-style 12-week grid tracker summarizing your long-term emotional journey using color intensity levels.

### 4. 🧠 Dynamic Companionship & Local RAG
* **Client-Side Soulful Memory RAG**: Scans your latest chat message, cleans stopwords, and automatically searches your past local journal entries for emotional matches. Relevant memories are seamlessly supplied to the AI context so it organically remembers your life journey.
* **Reflective Conversation Modes**: Toggle your companion style dynamically to match your mood:
  * 🌿 **Poetic**: Metaphors of light, space, and nature.
  * 🤫 **Quiet**: Concise, warm, and highly comforting validation.
  * 🪞 **Reflective**: Gentle open-ended probes prompting deeper writing.
* **Backup & Portability**: Secure JSON data backup utilities to export all your private journal entries, messages, and settings into a single file and import them back cleanly.

### 🎙️ 5. Multilingual Voice & Speech
* **Gentle Text-to-Speech (TTS)**: Let Serentias read replies aloud. Configured with a gentle speaking tempo (`rate: 0.85`) and a warm tone (`pitch: 0.95`).
* **Multilingual Options**: Toggle spoken languages between English, Hindi, Spanish, or French inside the settings.
* **Microphone Input (STT)**: Dictate thoughts directly in the chat input through a pulse-animated microphone recorder button, completely hand-free.

---

## 🚀 Setup

### 1. Get a free Groq API key
Go to [console.groq.com](https://console.groq.com) → Sign up → Create API key (100% free and super fast).

### 2. Add your key
```bash
cp .env.example .env
# Open the .env file and paste your Groq key:
# VITE_GROQ_API_KEY=your_key_here
```

### 3. Run locally
```bash
npm install
npm run dev
```

---

## 🌍 Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import this repository.
3. **Keep "Environment Variables" completely empty** to ensure your personal API key is never exposed or bundled publicly!
4. Click **Deploy**.
5. Once your site is live, open the URL, go to the **Settings Panel (gear icon)**, and paste your API key securely into the AI Companion Key field. It will save privately to your browser cache!

---

## 🛠️ Tech Stack

* **Core**: React 18 + Vite + Tailwind CSS 3 + Lucide Icons
* **Audio Synthesis**: Native Web Audio API (completely offline-ready bowl chimes and wood-crackling loops)
* **AI engine**: Groq API (`llama-3.1-8b-instant` with client-side context RAG indexing and local key setup)
* **Data Visualization**: Recharts (Mood charts)
* **Storage**: LocalStorage (Zero server storage)

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/Arpana%20Kumari/Desktop/projects/1/serentias/LICENSE) for more information.
