import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Character } from '../types';
import { getLibrary } from '../utils/storage';

interface FloatingBubblesBackgroundProps {
  characters?: Character[];
}

const COLOR_PALETTE = [
  'bg-pink-400',
  'bg-cyan-400',
  'bg-purple-500',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-fuchsia-500',
  'bg-sky-400',
  'bg-indigo-500',
  'bg-lime-400',
  'bg-rose-400',
  'bg-orange-400',
  'bg-violet-400',
  'bg-teal-400',
  'bg-yellow-400',
  'bg-red-400',
  'bg-blue-500',
];

interface SingleBubbleProps {
  slotIndex: number;
  initialDelay: number;
  characters: Character[];
}

const SingleBubble: React.FC<SingleBubbleProps> = ({ slotIndex, initialDelay, characters }) => {
  const [cycle, setCycle] = useState(0);
  const [isPopped, setIsPopped] = useState(false);
  const isDraggingRef = useRef(false);
  const animationFinishedRef = useRef(false);

  useEffect(() => {
    animationFinishedRef.current = false;
    isDraggingRef.current = false;
  }, [cycle]);

  // Generate fresh random properties every cycle (new character, size, color, trajectory)
  const bubbleState = useMemo(() => {
    // Pick completely random character from active list
    const randomChar =
      characters && characters.length > 0
        ? characters[Math.floor(Math.random() * characters.length)]
        : null;

    // Pick random bubble size (65px to 220px)
    const randomSize = Math.floor(Math.random() * 155) + 65;

    // Pick random solid opaque color
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    // Off-screen bottom spawn across screen width (2% to 92%)
    const startLeft = `${Math.floor(Math.random() * 90) + 2}%`;
    const startTop = `${Math.floor(Math.random() * 20) + 108}%`; // 108% to 128% off-screen bottom

    // Slight horizontal drift/sway as it rises
    const driftX = `${Math.floor(Math.random() * 60) - 30}px`; // -30px to +30px

    // Rise far past the top of screen completely (-220vh to -250vh) so even dragged bubbles float off-screen
    const deltaY = `-${Math.floor(Math.random() * 30) + 220}vh`;

    // Speed duration
    const duration = Math.floor(Math.random() * 8) + 12; // 12s to 20s

    return {
      character: randomChar,
      size: randomSize,
      color: randomColor,
      startLeft,
      startTop,
      driftX,
      deltaY,
      duration,
    };
  }, [characters, cycle]);

  const triggerRespawn = () => {
    setIsPopped(true);
    setTimeout(() => {
      setIsPopped(false);
      setCycle((c) => c + 1);
    }, 320);
  };

  const handlePop = () => {
    if (isPopped || isDraggingRef.current) return;
    triggerRespawn();
  };

  if (isPopped) {
    return (
      <div
        style={{
          width: `${bubbleState.size}px`,
          height: `${bubbleState.size}px`,
          left: bubbleState.startLeft,
          top: bubbleState.startTop,
        }}
        className="absolute pointer-events-none select-none z-30"
      >
        {/* Main bubble shrinking / decreasing inwards really fast */}
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: [1, 1.1, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.2, ease: [0.32, 0, 0.67, 0] }}
          className={`w-full h-full rounded-full ${bubbleState.color} overflow-hidden flex items-center justify-center shadow-lg border-2 border-white/90 p-0.5 relative`}
        >
          {bubbleState.character && (
            <img
              src={bubbleState.character.imageUrl}
              alt={bubbleState.character.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          )}
        </motion.div>

        {/* Inward imploding shock ring */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0.9 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeIn' }}
          className={`absolute inset-0 rounded-full border-2 border-white ${bubbleState.color}`}
        />

        {/* Particles released outward from the circle as it pops/implodes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * (360 / 16)) * (Math.PI / 180);
            const dist = bubbleState.size * (0.6 + (i % 2) * 0.3);
            const particleSize = 4 + (i % 3) * 3;
            const isWhite = i % 3 === 0;

            return (
              <motion.div
                key={`pop-particle-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  opacity: 0,
                  scale: 0.1,
                }}
                transition={{ duration: 0.28, ease: 'easeOut', delay: 0.05 }}
                className={`absolute rounded-full border border-white/90 ${
                  isWhite ? 'bg-white' : bubbleState.color
                } shadow-xs`}
                style={{
                  width: `${particleSize}px`,
                  height: `${particleSize}px`,
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={`${slotIndex}-${cycle}`}
      initial={{
        x: '0px',
        y: '0vh',
      }}
      animate={{
        x: ['0px', bubbleState.driftX],
        y: ['0vh', bubbleState.deltaY],
      }}
      transition={{
        duration: bubbleState.duration,
        ease: 'linear',
        delay: cycle === 0 ? initialDelay : 0,
      }}
      onAnimationComplete={() => {
        animationFinishedRef.current = true;
        if (!isDraggingRef.current && !isPopped) {
          triggerRespawn();
        }
      }}
      style={{
        width: `${bubbleState.size}px`,
        height: `${bubbleState.size}px`,
        left: bubbleState.startLeft,
        top: bubbleState.startTop,
      }}
      className="absolute pointer-events-auto select-none z-10"
    >
      <motion.div
        drag
        dragConstraints={{ left: -600, right: 600, top: -1200, bottom: 1200 }}
        dragElastic={0.2}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
            if (animationFinishedRef.current && !isPopped) {
              triggerRespawn();
            }
          }, 150);
        }}
        whileHover={{ scale: 1.06 }}
        whileDrag={{ scale: 1.15, zIndex: 50 }}
        onTap={handlePop}
        className={`w-full h-full rounded-full ${bubbleState.color} overflow-hidden flex items-center justify-center shadow-lg border-2 border-white/90 p-0.5 cursor-grab active:cursor-grabbing relative transition-shadow hover:shadow-xl`}
      >
        {bubbleState.character && (
          <img
            src={bubbleState.character.imageUrl}
            alt={bubbleState.character.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full pointer-events-none select-none"
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export const FloatingBubblesBackground: React.FC<FloatingBubblesBackgroundProps> = ({ characters: propCharacters }) => {
  const [activeCharacters, setActiveCharacters] = useState<Character[]>([]);

  useEffect(() => {
    if (propCharacters && propCharacters.length > 0) {
      const active = propCharacters.filter((c) => !c.excluded);
      setActiveCharacters(active.length > 0 ? active : propCharacters);
    } else {
      const lib = getLibrary();
      const active = lib.filter((c) => !c.excluded);
      setActiveCharacters(active.length > 0 ? active : lib);
    }
  }, [propCharacters]);

  // 25 staggered spawn slots continuously generating rising bubbles
  const slots = useMemo(() => {
    return Array.from({ length: 25 }, (_, idx) => ({
      slotIndex: idx,
      initialDelay: idx * 0.65, // 0s, 0.65s, 1.3s, 1.95s, etc.
    }));
  }, []);

  return (
    <div className="absolute inset-0 bg-white overflow-hidden pointer-events-none select-none z-0">
      {/* Continuously spawning opaque bubbles rising straight up from the bottom */}
      {activeCharacters.length > 0 &&
        slots.map((slot) => (
          <SingleBubble
            key={slot.slotIndex}
            slotIndex={slot.slotIndex}
            initialDelay={slot.initialDelay}
            characters={activeCharacters}
          />
        ))}
    </div>
  );
};
