/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, 
  RefreshCw, 
  Settings as SettingsIcon, 
  Compass, 
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Genre, Mood, UserPreferences, Quote } from './types';
import { fetchCuratedQuote } from './lib/gemini';
import { ambient } from './lib/audio';

// --- Constants ---

const GENRES: Genre[] = [
  'Classic Literature', 'Sci-Fi & Fantasy', 'Self-Help & Philosophy', 
  'Manga & Manhwa', 'Shonen', 'Fiction', 'Movie Scripts', 'Poetry'
];

const MOODS: Mood[] = ['Melancholic', 'Inspired', 'Pensive', 'Determined', 'Calm', 'Energetic'];

// --- Main Application ---

export default function App() {
  const [prefs, setPrefs] = useState<UserPreferences>({
    genres: [],
    authors: [],
    hasOnboarded: false
  });
  
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [bgImage, setBgImage] = useState<string>('');

  // Audio Control
  useEffect(() => {
    if (!isMuted) {
      ambient.start();
    } else {
      ambient.stop();
    }
    return () => ambient.stop();
  }, [isMuted]);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('monochrome_muse_prefs');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPrefs(parsed);
    }
  }, []);

  // Fetch initial quote after onboarding
  useEffect(() => {
    if (prefs.hasOnboarded && !currentQuote && !loading) {
      handleRefresh();
    }
  }, [prefs.hasOnboarded]);

  const savePrefs = (newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    localStorage.setItem('monochrome_muse_prefs', JSON.stringify(newPrefs));
  };

  const handleRefresh = async (mood?: Mood, genre?: Genre, discovery = false) => {
    setLoading(true);
    try {
      const quote = await fetchCuratedQuote(prefs, mood, genre, discovery);
      setCurrentQuote(quote);
      
      const query = encodeURIComponent(quote.backgroundPrompt + " grayscale atmospheric");
      setBgImage(`https://images.unsplash.com/photo-14?fit=crop&w=1920&q=80&sat=-100&query=${query}&sig=${Math.random()}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!prefs.hasOnboarded) {
    return <Onboarding onComplete={savePrefs} />;
  }

  return (
    <div className="relative h-screen w-screen bg-ink text-ash overflow-hidden font-serif">
      <div className="atmosphere"></div>
      
      {/* Background Image / Atmospheric Visual */}
      <AnimatePresence mode="wait">
        {bgImage && (
          <motion.div
            key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={bgImage} 
              alt="bg" 
              className="w-full h-full object-cover grayscale brightness-50 scale-105 animate-pulse-slow"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-7xl h-full md:h-[700px] grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch py-12 md:py-0 overflow-y-auto md:overflow-visible">
          
          {/* Left Column: Library & Sidebar */}
          <div className="md:col-span-3 flex flex-col justify-between py-4 space-y-8">
            <div className="space-y-8">
              <div>
                <h1 className="text-[10px] letter-spacing-wide uppercase opacity-50 mb-6 flex items-center gap-2 font-sans font-bold">
                   <Library className="w-3 h-3" /> Library
                </h1>
                <nav className="space-y-4">
                  {prefs.genres.slice(0, 4).map((g) => (
                    <div key={g} className="text-sm font-medium border-l-2 border-white pl-4 tracking-tight">
                      {g}
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="text-sm font-medium opacity-40 hover:opacity-100 pl-4 transition-all flex items-center gap-2"
                  >
                    Edit Preferences <ChevronRight className="w-3 h-3" />
                  </button>
                </nav>
              </div>

              <div>
                <h1 className="text-[10px] letter-spacing-wide uppercase opacity-50 mb-4 font-sans font-bold">Current Moods</h1>
                <div className="flex flex-wrap gap-2">
                  {MOODS.slice(0, 3).map(m => (
                    <button 
                      key={m}
                      onClick={() => handleRefresh(m)}
                      className="px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase tracking-tighter hover:bg-white/20 transition-colors font-sans"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="text-[10px] letter-spacing-wide uppercase opacity-50 flex justify-between items-center font-sans font-bold">
                Now Playing
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-white transition-colors"
                >
                   {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center gap-3 font-sans">
                <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                  <div className="flex gap-1 h-4 items-end">
                    <motion.div animate={{ height: isMuted ? 2 : [2, 8, 4, 10, 2] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-[3px] bg-white/40 rounded-full" />
                    <motion.div animate={{ height: isMuted ? 4 : [4, 14, 6, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-[3px] bg-white/40 rounded-full" />
                    <motion.div animate={{ height: isMuted ? 3 : [3, 10, 5, 8, 3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-[3px] bg-white/40 rounded-full" />
                    <motion.div animate={{ height: isMuted ? 1 : [1, 5, 2, 7, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.3 }} className="w-[3px] bg-white/40 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-tight">{currentQuote?.musicMood || 'Silent Ambience'}</div>
                  <div className="text-[10px] opacity-50 lowercase tracking-widest font-sans">monochrome • 432Hz</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: The Fragment */}
          <div className="md:col-span-6 glass-card relative overflow-hidden flex flex-col items-center justify-center p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 pointer-events-none"></div>
            
            <AnimatePresence mode="wait">
              {!loading && currentQuote ? (
                <motion.div
                  key={currentQuote.text}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 1.5 }}
                  className="relative z-10 w-full"
                >
                  <div className="mb-12 flex justify-center">
                    <div className="w-[1px] h-16 bg-white/20 rounded-full"></div>
                  </div>
                  
                  <blockquote className="text-3xl md:text-5xl lg:text-5xl mb-12 tracking-tight italic leading-tight text-white drop-shadow-2xl font-serif">
                    "{currentQuote.text}"
                  </blockquote>

                  <div className="space-y-3 font-sans">
                    <div className="text-xs letter-spacing-wide uppercase opacity-80 font-black tracking-[0.3em]">{currentQuote.author}</div>
                    <div className="text-[10px] opacity-40 uppercase tracking-[0.2em]">{currentQuote.source}</div>
                  </div>

                  <div className="mt-20 flex gap-6 justify-center">
                    <button 
                      onClick={() => handleRefresh()}
                      className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors group"
                    >
                      <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                    </button>
                    <button 
                      onClick={() => handleRefresh(undefined, undefined, true)}
                      className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors group"
                    >
                      <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-20 font-sans">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] letter-spacing-wide uppercase">Summoning Fragment</span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Mood Analysis & Actions */}
          <div className="md:col-span-3 flex flex-col justify-between py-4 space-y-8 font-sans">
            <div className="glass-card p-8">
              <h2 className="text-[10px] letter-spacing-wide uppercase opacity-50 mb-8 font-bold">Mood Resonator</h2>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-[10px] mb-3">
                    <span className="uppercase opacity-70 tracking-widest">Impact</span>
                    <span className="font-mono">82%</span>
                  </div>
                  <div className="w-full h-[2px] bg-white/10 rounded-full">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "82%" }}
                      className="h-full bg-white/60 rounded-full" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-3">
                    <span className="uppercase opacity-70 tracking-widest">Atmosphere</span>
                    <span className="font-mono">94%</span>
                  </div>
                  <div className="w-full h-[2px] bg-white/10 rounded-full">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      className="h-full bg-white/30 rounded-full" 
                    />
                  </div>
                </div>
              </div>
              
              {currentQuote?.context && (
                <div className="mt-12 pt-8 border-t border-white/5 font-serif italic">
                  <p className="text-[11px] opacity-40 leading-relaxed">
                    {currentQuote.context}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="text-right">
                <button className="w-full px-8 py-4 bg-white text-black text-[10px] font-black uppercase letter-spacing-wide rounded-full hover:bg-zinc-200 transition-colors shadow-2xl">
                  Save Fragment
                </button>
              </div>
              <div className="text-right">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="w-full px-8 py-4 border border-white/20 text-white text-[10px] font-black uppercase letter-spacing-wide rounded-full hover:bg-white/5 transition-colors"
                >
                  Configure Muse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <Settings 
            prefs={prefs} 
            onClose={() => setShowSettings(false)} 
            onSave={(p) => {
              savePrefs(p);
              setShowSettings(false);
              handleRefresh();
            }} 
          />
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// --- Sub-components ---

function Onboarding({ onComplete }: { onComplete: (p: UserPreferences) => void }) {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [authorInput, setAuthorInput] = useState('');
  const [authors, setAuthors] = useState<string[]>([]);

  const toggleGenre = (g: Genre) => {
    setSelectedGenres(prev => 
      prev.includes(g) ? prev.filter(i => i !== g) : [...prev, g]
    );
  };

  const addAuthor = () => {
    if (authorInput.trim() && !authors.includes(authorInput.trim())) {
      setAuthors([...authors, authorInput.trim()]);
      setAuthorInput('');
    }
  };

  return (
    <div className="h-screen w-screen bg-ink flex items-center justify-center p-6 font-serif overflow-hidden">
      <div className="atmosphere opacity-30"></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-16 relative z-10"
      >
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ letterSpacing: "0.5em", opacity: 0 }}
            animate={{ letterSpacing: "0.1em", opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-6xl md:text-8xl font-light italic text-white tracking-tight"
          >
            Monochrome Muse
          </motion.h1>
          <div className="h-[1px] w-24 bg-white/20 mx-auto" />
          <p className="text-white/30 uppercase tracking-[0.4em] font-sans text-[11px]">Define your narrative landscape</p>
        </div>

        <div className="space-y-10">
          <div className="space-y-5 text-center md:text-left">
            <label className="text-[10px] uppercase tracking-[0.3em] font-sans font-black text-white/40">Favorite Spheres</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-4 py-4 rounded-xl text-[10px] uppercase tracking-widest font-sans border transition-all duration-300 ${
                    selectedGenres.includes(g) 
                      ? 'bg-white text-black border-white scale-105 shadow-xl' 
                      : 'border-white/10 text-white/30 hover:border-white/30'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 text-center md:text-left">
            <label className="text-[10px] uppercase tracking-[0.3em] font-sans font-black text-white/40">Specific Architects (Authors/Artists)</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={authorInput}
                onChange={e => setAuthorInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addAuthor()}
                placeholder="Murakami, Nolan, Miyazaki..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 font-sans transition-colors"
              />
              <button 
                onClick={addAuthor}
                className="px-8 py-4 bg-white text-black rounded-xl font-sans font-black text-[10px] uppercase tracking-widest transition-all active:scale-90"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {authors.map(a => (
                <motion.span 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={a} 
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60 flex items-center gap-3 font-sans uppercase tracking-widest"
                >
                  {a}
                  <button onClick={() => setAuthors(authors.filter(x => x !== a))} className="hover:text-white transition-colors">×</button>
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <button
          disabled={selectedGenres.length === 0}
          onClick={() => onComplete({ genres: selectedGenres, authors, hasOnboarded: true })}
          className="w-full py-6 bg-white text-black rounded-full font-sans font-black uppercase tracking-[0.5em] text-xs transition-all hover:bg-zinc-200 active:scale-95 shadow-2xl disabled:opacity-30"
        >
          Begin Journey
        </button>
      </motion.div>
    </div>
  );
}

function Settings({ prefs, onClose, onSave }: { 
  prefs: UserPreferences; 
  onClose: () => void;
  onSave: (p: UserPreferences) => void;
}) {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(prefs.genres);
  const [authors, setAuthors] = useState<string[]>(prefs.authors);
  const [authorInput, setAuthorInput] = useState('');

  const toggleGenre = (g: Genre) => {
    setSelectedGenres(prev => 
      prev.includes(g) ? prev.filter(i => i !== g) : [...prev, g]
    );
  };

  const addAuthor = () => {
    if (authorInput.trim() && !authors.includes(authorInput.trim())) {
      setAuthors([...authors, authorInput.trim()]);
      setAuthorInput('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
    >
      <div className="max-w-2xl w-full space-y-12">
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <h2 className="text-5xl font-light italic text-white tracking-tight">Configuration</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white font-sans text-[10px] uppercase tracking-[0.3em] px-4 py-2 border border-white/10 rounded-full transition-all">Close</button>
        </div>

        <div className="space-y-10">
          <div className="space-y-5">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30 text-white">Active Spheres</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-4 py-3 rounded-xl text-[10px] uppercase tracking-widest font-sans border transition-all ${
                    selectedGenres.includes(g) 
                      ? 'bg-white text-black border-white' 
                      : 'border-white/10 text-white/30 hover:border-white/30'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30 text-white">Personal Architects</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={authorInput}
                onChange={e => setAuthorInput(e.target.value)}
                placeholder="Add author..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none"
              />
              <button 
                onClick={addAuthor}
                className="px-6 py-4 border border-white/20 text-white rounded-xl text-[10px] uppercase tracking-widest font-black"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {authors.map(a => (
                <span key={a} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] text-white/40 flex items-center gap-3 uppercase tracking-widest font-sans">
                  {a}
                  <button onClick={() => setAuthors(authors.filter(x => x !== a))} className="hover:text-white transition-colors">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onSave({ ...prefs, genres: selectedGenres, authors })}
          className="w-full py-6 bg-white text-black rounded-full font-sans font-black uppercase tracking-[0.6em] text-[10px] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl"
        >
          Confirm Trajectory
        </button>
      </div>
    </motion.div>
  );
}
