import React, { useState, useMemo, useEffect } from 'react';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { Character, ImpostorSettings, GuessWhoSettings } from '../types';
import { getImpostorSettings, saveImpostorSettings, getGuessWhoSettings, saveGuessWhoSettings } from '../utils/storage';
import { FloatingBubblesBackground } from './FloatingBubblesBackground';
import { MENU_TITLES } from '../data/menuTitles';

interface MainScreenProps {
  onPlay: (selectedCategories?: string[]) => void;
  onPlayCharacterImpostor: (selectedCategories?: string[]) => void;
  onPlayQuestionImpostor: () => void;
  onPlayBlindRank: (selectedCategories?: string[]) => void;
  onOpenLibrary: () => void;
  characters: Character[];
}

export const MainScreen: React.FC<MainScreenProps> = ({
  onPlay,
  onPlayCharacterImpostor,
  onPlayQuestionImpostor,
  onPlayBlindRank,
  onOpenLibrary,
  characters,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'POOL' | 'GUESS_WHO' | 'IMPOSTOR'>('POOL');

  // Impostor settings state
  const [impostorSettings, setImpostorSettings] = useState<ImpostorSettings>(getImpostorSettings);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Guess Who settings state
  const [guessWhoSettings, setGuessWhoSettings] = useState<GuessWhoSettings>(getGuessWhoSettings);

  // Random title selection on home screen load
  const [titleIndex] = useState(() => {
    if (!MENU_TITLES || MENU_TITLES.length === 0) return 0;
    return Math.floor(Math.random() * MENU_TITLES.length);
  });

  // Load settings when opening settings modal
  useEffect(() => {
    if (isSettingsOpen) {
      setImpostorSettings(getImpostorSettings());
      setGuessWhoSettings(getGuessWhoSettings());
    }
  }, [isSettingsOpen]);

  const handleUpdateGuessWhoSettings = (updated: GuessWhoSettings) => {
    setGuessWhoSettings(updated);
    saveGuessWhoSettings(updated);
  };

  const handleUpdateImpostorSettings = (updated: ImpostorSettings) => {
    setImpostorSettings(updated);
    saveImpostorSettings(updated);
  };

  const handleAddPlayer = () => {
    const name = newPlayerName.trim() || `Player ${impostorSettings.players.length + 1}`;
    const updatedPlayers = [...impostorSettings.players, name];
    setNewPlayerName('');
    handleUpdateImpostorSettings({
      ...impostorSettings,
      players: updatedPlayers,
    });
  };

  const handleRemovePlayer = (index: number) => {
    if (impostorSettings.players.length <= 2) return; // Keep at least 2 players
    const updatedPlayers = impostorSettings.players.filter((_, i) => i !== index);
    const newImpostorCount = Math.min(impostorSettings.impostorCount, updatedPlayers.length - 1);
    handleUpdateImpostorSettings({
      players: updatedPlayers,
      impostorCount: Math.max(1, newImpostorCount),
    });
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedPlayers = [...impostorSettings.players];
    updatedPlayers[index] = name;
    handleUpdateImpostorSettings({
      ...impostorSettings,
      players: updatedPlayers,
    });
  };

  // Extract all unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    characters.forEach((c) => {
      const cat = c.category || c.theme;
      if (cat) cats.add(cat);
    });
    return Array.from(cats).sort();
  }, [characters]);

  // Selected categories state for the game pool (empty array = ALL)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Count active eligible characters in selected categories
  const eligibleCharactersCount = useMemo(() => {
    const active = characters.filter((c) => !c.excluded);
    if (selectedCategories.length === 0) return active.length;
    const selectedSet = new Set(selectedCategories.map((c) => c.toLowerCase()));
    return active.filter((c) => {
      const cat = (c.category || c.theme || 'General').toLowerCase();
      return selectedSet.has(cat);
    }).length;
  }, [characters, selectedCategories]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      const updated = selectedCategories.filter((c) => c !== cat);
      setSelectedCategories(updated);
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSelectAll = () => {
    setSelectedCategories([]);
  };

  const handlePlayGame = () => {
    onPlay(selectedCategories.length > 0 ? selectedCategories : undefined);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Floating Colored Bubbles Background on White Canvas */}
      <FloatingBubblesBackground characters={characters} />

      {/* Main console card box over floating bubbles background */}
      <div
        className="w-full max-w-md sm:max-w-lg bg-[#a5b4fc]/95 backdrop-blur-xl px-10 sm:px-14 py-9 shadow-[0_25px_60px_rgba(165,180,252,0.45)] border-4 border-white flex flex-col items-center text-center relative z-10 ring-4 ring-indigo-300/50 transition-all duration-300 hover:scale-[1.01]"
        style={{
          borderRadius: '55% 45% 62% 38% / 38% 62% 38% 62%',
        }}
      >
        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bangers tracking-wider text-white uppercase -mt-12 sm:-mt-14 mb-4 transform -rotate-2 hover:scale-105 transition-transform duration-300 [-webkit-text-stroke:2.5px_black] whitespace-nowrap z-20 px-2 pointer-events-auto">
          {MENU_TITLES[titleIndex % (MENU_TITLES.length || 1)] || 'ichigobankai'}
        </h1>

        {/* Main Games and Library / Settings Grid */}
        <div className="w-full max-w-[330px] sm:max-w-[370px] space-y-3">
          {/* 1. Guess Who */}
          <button
            type="button"
            onClick={handlePlayGame}
            className="w-full py-3 px-5 bg-amber-300 hover:bg-amber-200 text-black font-comic font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer group border-2 border-white"
            style={{
              borderRadius: '60% 40% 55% 45% / 45% 55% 45% 55%',
            }}
          >
            <span className="font-comic font-black text-black tracking-wider">Guess Who</span>
          </button>

          {/* 2. Impostor Games (Header above Character & Question) */}
          <div
            className="w-full flex flex-col gap-1.5 p-3 bg-white/80 backdrop-blur-md border-2 border-white/90 shadow-sm"
            style={{
              borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
            }}
          >
            <div className="flex items-center justify-center px-1 mb-0.5">
              <span className="font-comic font-extrabold text-[11px] tracking-widest text-black uppercase">
                Impostor
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => onPlayCharacterImpostor(selectedCategories)}
                className="py-2.5 px-2 bg-purple-300/90 hover:bg-purple-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase transition-all border-2 border-white shadow-sm active:scale-[0.98] cursor-pointer text-center"
                style={{
                  borderRadius: '50% 50% 65% 35% / 40% 60% 40% 60%',
                }}
              >
                Character
              </button>

              <button
                type="button"
                onClick={onPlayQuestionImpostor}
                className="py-2.5 px-2 bg-sky-300/90 hover:bg-sky-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase transition-all border-2 border-white shadow-sm active:scale-[0.98] cursor-pointer text-center"
                style={{
                  borderRadius: '65% 35% 45% 55% / 55% 45% 55% 45%',
                }}
              >
                Question
              </button>
            </div>
          </div>

          {/* 3. Blind Rank */}
          <button
            type="button"
            onClick={() => onPlayBlindRank(selectedCategories)}
            className="w-full py-3 px-5 bg-emerald-300/90 hover:bg-emerald-300 text-black font-comic font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-all border-2 border-white shadow-md active:scale-[0.98] cursor-pointer group"
            style={{
              borderRadius: '40% 60% 50% 50% / 60% 40% 60% 40%',
            }}
          >
            <span className="font-comic font-extrabold text-black tracking-wider">Blind Rank</span>
          </button>

          {/* Bottom Row: 4. Character Library (Left Half) & Settings (Right Half) */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              onClick={onOpenLibrary}
              className="py-2.5 px-3 bg-teal-300/90 hover:bg-teal-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center transition-all border-2 border-white shadow-md active:scale-[0.98] cursor-pointer group"
              style={{
                borderRadius: '55% 45% 60% 40% / 45% 55% 45% 55%',
              }}
            >
              <span className="truncate font-comic text-black">Library</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="py-2.5 px-3 bg-fuchsia-300/90 hover:bg-fuchsia-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center transition-all border-2 border-white shadow-md active:scale-[0.98] cursor-pointer group relative"
              style={{
                borderRadius: '45% 55% 40% 60% / 55% 45% 55% 45%',
              }}
            >
              <span className="truncate font-comic text-black">Settings</span>
              {selectedCategories.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 ring-2 ring-white animate-pulse rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal Popup */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-950 w-full max-w-sm border-2 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden p-6 flex flex-col text-left animate-in zoom-in-95 duration-150 relative text-slate-100 ring-1 ring-white/10 [border-radius:38px_24px_42px_28px]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-orbitron font-bold text-amber-300 tracking-wider uppercase">Console Settings</h2>
                <p className="text-[11px] font-rajdhani font-semibold text-slate-400">Configure pools and players</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Sub-Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 mb-4 border border-slate-800 [border-radius:20px_12px_18px_14px]">
              <button
                type="button"
                onClick={() => setSettingsTab('POOL')}
                className={`py-1.5 text-[10px] sm:text-xs font-comic font-bold uppercase transition-all [border-radius:14px_10px_12px_10px] ${
                  settingsTab === 'POOL'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Game Pool
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('GUESS_WHO')}
                className={`py-1.5 text-[10px] sm:text-xs font-comic font-bold uppercase transition-all [border-radius:12px_10px_12px_10px] ${
                  settingsTab === 'GUESS_WHO'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guess Who
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('IMPOSTOR')}
                className={`py-1.5 text-[10px] sm:text-xs font-comic font-bold uppercase transition-all [border-radius:10px_14px_10px_12px] ${
                  settingsTab === 'IMPOSTOR'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Impostor
              </button>
            </div>

            {/* TAB 1: GAME POOL CATEGORIES */}
            {settingsTab === 'POOL' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-orbitron font-semibold text-slate-300 uppercase tracking-wider">Categories</span>
                  <span className="text-[11px] font-rajdhani font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-none border border-emerald-500/40 tracking-wider">
                    {eligibleCharactersCount} Active
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-2 border border-slate-800/80 rounded-none bg-slate-900/60">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`px-3 py-1.5 rounded-none text-xs font-rajdhani font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
                      selectedCategories.length === 0
                        ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {selectedCategories.length === 0 && <Check className="w-3.5 h-3.5 text-slate-950" />}
                    All ({characters.filter((c) => !c.excluded).length})
                  </button>

                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    const catActiveCount = characters.filter(
                      (c) => !c.excluded && (c.category || c.theme || '').toLowerCase() === cat.toLowerCase()
                    ).length;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-none text-xs font-rajdhani font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-950" />}
                        {cat} ({catActiveCount})
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] font-rajdhani font-semibold text-slate-400 mt-3 leading-relaxed">
                  {selectedCategories.length === 0
                    ? 'Currently using all active characters in library.'
                    : `Filtered to: ${selectedCategories.join(', ')}.`}
                </p>
              </div>
            )}

            {/* TAB 2: GUESS WHO SETTINGS */}
            {settingsTab === 'GUESS_WHO' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-orbitron font-semibold text-slate-300 uppercase tracking-wider">
                    Game Options
                  </span>
                  <span className="text-[11px] font-rajdhani font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 border border-amber-500/40 tracking-wider">
                    2 Players
                  </span>
                </div>

                {/* Random Secret Character Toggle */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex-1 text-left">
                    <div className="text-xs font-orbitron font-bold text-slate-100 uppercase tracking-wide">
                      Random Secret Character
                    </div>
                    <div className="text-[11px] font-rajdhani text-slate-400 leading-snug mt-1">
                      Give players a random character automatically instead of choosing from the selection grid.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateGuessWhoSettings({
                        ...guessWhoSettings,
                        randomSecretCharacter: !guessWhoSettings.randomSecretCharacter,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 p-0.5 ${
                      guessWhoSettings.randomSecretCharacter ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                        guessWhoSettings.randomSecretCharacter ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: IMPOSTOR SETTINGS */}
            {settingsTab === 'IMPOSTOR' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-orbitron font-semibold text-slate-300 uppercase tracking-wider">
                    Players ({impostorSettings.players.length})
                  </span>
                  <span className="text-[11px] font-rajdhani font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 border border-amber-500/40 tracking-wider">
                    Min 2 Players
                  </span>
                </div>

                {/* Player List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-900/60 border border-slate-800/80 mb-2">
                  {impostorSettings.players.map((player, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-orbitron text-slate-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={player}
                        onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 px-2 py-1 text-xs font-orbitron text-slate-200 focus:outline-none focus:border-amber-400"
                        placeholder={`Player ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(idx)}
                        disabled={impostorSettings.players.length <= 2}
                        className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        title="Remove player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Player Box */}
                <div className="flex gap-1.5 mb-4">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="New Player Name..."
                    className="flex-1 bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-rajdhani font-bold text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-orbitron font-bold text-xs uppercase flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {/* Impostor Count Selector */}
                <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-2.5">
                  <div>
                    <div className="text-xs font-orbitron font-bold text-slate-200 uppercase">Impostors Count</div>
                    <div className="text-[10px] font-rajdhani text-slate-400">Number of impostors in game</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateImpostorSettings({
                          ...impostorSettings,
                          impostorCount: Math.max(1, impostorSettings.impostorCount - 1),
                        })
                      }
                      disabled={impostorSettings.impostorCount <= 1}
                      className="w-7 h-7 bg-slate-950 border border-slate-700 text-amber-400 font-orbitron font-bold text-sm disabled:opacity-20 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-orbitron font-black text-amber-300 text-sm w-4 text-center">
                      {impostorSettings.impostorCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateImpostorSettings({
                          ...impostorSettings,
                          impostorCount: Math.min(impostorSettings.players.length - 1, impostorSettings.impostorCount + 1),
                        })
                      }
                      disabled={impostorSettings.impostorCount >= impostorSettings.players.length - 1}
                      className="w-7 h-7 bg-slate-950 border border-slate-700 text-amber-400 font-orbitron font-bold text-sm disabled:opacity-20 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-comic font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer [border-radius:18px_12px_20px_14px]"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

