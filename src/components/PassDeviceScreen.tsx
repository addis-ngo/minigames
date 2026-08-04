import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Player } from '../types';
import player1Logo from '../assets/images/player1_logo_1785281331067.jpg';
import player2Logo from '../assets/images/player2_logo_1785281340728.jpg';

interface PassDeviceScreenProps {
  player: Player;
  onReady: () => void;
  title?: string;
  subtext?: string;
}

export const PassDeviceScreen: React.FC<PassDeviceScreenProps> = ({
  player,
  onReady,
  title,
  subtext,
}) => {
  const playerLabel = player === 'P1' ? 'Player 1' : 'Player 2';
  const isP1 = player === 'P1';
  const bgClass = isP1 ? 'bg-blue-700' : 'bg-red-700';
  const playerLogo = isP1 ? player1Logo : player2Logo;

  return (
    <div className={`min-h-screen ${bgClass} text-white flex flex-col items-center justify-center p-6 select-none transition-colors duration-300`}>
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Badge / Avatar Logo */}
        <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-lg overflow-hidden">
          <img
            src={playerLogo}
            alt={playerLabel}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <h2 className="text-2xl font-light tracking-tight mb-2">
          {title || `Pass device to ${playerLabel}`}
        </h2>

        <p className="text-xs text-white/80 mb-8 max-w-xs">
          {subtext || `Make sure ${player === 'P1' ? 'Player 2' : 'Player 1'} is not looking at the screen.`}
        </p>

        <button
          onClick={onReady}
          className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md border border-white/10"
        >
          I am {playerLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
