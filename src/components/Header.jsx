import { Wind, Settings, BookOpen, Music, Flame, Sparkles, Heart, Compass } from 'lucide-react'

export default function Header({ presenceCount, setView, lanternCount, themeInfo }) {
  return (
    <header className="px-5 py-3 flex justify-between items-center border-b border-white/5 bg-[#07070a]/80 backdrop-blur-md flex-shrink-0 relative z-50">
      <button
        onClick={() => setView('chat')}
        className="flex items-center gap-2.5 hover:opacity-70 transition-opacity"
      >
        <Wind size={16} className="text-indigo-400" strokeWidth={1.5} />
        <span className="font-light tracking-[0.3em] uppercase text-xs text-white/70">Serentias</span>
      </button>

      <div className="flex items-center gap-1">
        <NavBtn icon={<Flame size={14} strokeWidth={1.5} />} label={lanternCount} onClick={() => {}} title="Lanterns lit" />
        <NavBtn icon={<Music size={14} strokeWidth={1.5} />} onClick={() => setView('sounds')} title="Sounds" />
        <NavBtn icon={<Sparkles size={14} strokeWidth={1.5} />} onClick={() => setView('affirmation')} title="Daily Card" />
        <NavBtn icon={<Heart size={14} strokeWidth={1.5} />} onClick={() => setView('gratitude')} title="Gratitude Jar" />
        <NavBtn icon={<Compass size={14} strokeWidth={1.5} />} onClick={() => setView('zen')} title="Zen Space" />
        <NavBtn icon={<BookOpen size={14} strokeWidth={1.5} />} onClick={() => setView('journal')} title="Journal" />
        <NavBtn icon={<Settings size={14} strokeWidth={1.5} />} onClick={() => setView('settings')} title="Settings" />
      </div>

      <div className="flex items-center gap-3 text-[8px] sm:text-[9px] tracking-widest uppercase text-slate-600 select-none">
        {themeInfo && (
          <div className="flex items-center gap-1.5" title={`Serentias Atmosphere: ${themeInfo.label}`}>
            <span>{themeInfo.icon}</span>
            <span className="hidden sm:inline">{themeInfo.label}</span>
          </div>
        )}
        {themeInfo && <span className="opacity-20">|</span>}
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 bg-indigo-400 rounded-full pulse-soft" />
          <span>{presenceCount} present</span>
        </div>
      </div>
    </header>
  )
}

function NavBtn({ icon, label, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all text-[10px]"
    >
      {icon}
      {label !== undefined && <span className="text-slate-600">{label}</span>}
    </button>
  )
}
