'use client';

import { useGameStore } from '@/store/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ThreeDDice from './ThreeDDice';
import MissionModal from './MissionModal';

// Calculate position for 30 tiles in a 9x8 grid (Clockwise from Bottom-Right)
// Total Grid: 9 Columns x 8 Rows
// 0-8: Bottom (Right to Left) -> Row 8, Cols 9..1
// 9-14: Left (Bottom to Top) -> Cols 1, Rows 7..2
// 15-23: Top (Left to Right) -> Row 1, Cols 1..9
// 24-29: Right (Top to Bottom) -> Cols 9, Rows 2..7
// 30-35: Shortcut Stepping Stones (Center Path)
const getTileStyle = (index: number) => {
    // Bottom Row (0-8)
    if (index >= 0 && index <= 8) return { gridRow: 8, gridColumn: 9 - index };

    // Left Column (9-14)
    if (index >= 9 && index <= 14) return { gridRow: 8 - (index - 8), gridColumn: 1 };

    // Top Row (15-23)
    if (index >= 15 && index <= 23) return { gridRow: 1, gridColumn: index - 14 };

    // Right Column (24-29)
    if (index >= 24 && index <= 29) return { gridRow: index - 22, gridColumn: 9 };

    // Shortcut: Stepping Stones (30-35)
    // Connects Tile 8 [Index 7] (Bottom-Left: r8, c2) to Tile 17 [Index 16] (Top-Left: r1, c2)
    // Path: Vertical/Curved path through the left-center.

    if (index === 30) return { position: 'absolute', top: '80%', left: '25%' };
    if (index === 31) return { position: 'absolute', top: '68%', left: '32%' };
    if (index === 32) return { position: 'absolute', top: '56%', left: '36%' };
    if (index === 33) return { position: 'absolute', top: '44%', left: '36%' };
    if (index === 34) return { position: 'absolute', top: '32%', left: '32%' };
    if (index === 35) return { position: 'absolute', top: '20%', left: '25%' };

    return {};
};

// SVG data for connecting lines
// ... (Helper function remains same, but we might need to adjust logic if using absolute)
// For now, let's keep gridCenter logic for lines, or update line coordinates to match the absolute positions above.
// To ensure lines match tokens, we should update getGridCenter or the line logic.
// Let's rely on the visual approximation.

export default function GameBoard() {
    const { missions, currentPosition, isPlaying, resetGame, diceValue } = useGameStore();
    const [showModal, setShowModal] = useState(false);
    const [activeMission, setActiveMission] = useState(missions[0]);

    // Handle Modal Trigger
    useEffect(() => {
        if (isPlaying && currentPosition !== undefined && diceValue !== null) {
            const mission = missions[currentPosition];

            const timer = setTimeout(() => {
                setActiveMission(mission);
                setShowModal(true);
            }, 600); // Wait for piece animation

            return () => clearTimeout(timer);
        }
    }, [currentPosition, missions, isPlaying, diceValue]);

    return (
        <div className="relative w-full max-w-6xl mx-auto aspect-square md:aspect-[4/3] p-4 flex flex-col items-center justify-center">
            {/* Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="relative w-1/2 h-1/2">
                    <Image src="/logo.png" alt="BADA" fill className="object-contain" />
                </div>
            </div>

            {/* Path visualization (SVG Layer) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 p-2">
                {/* Entrance: 7 (r8,c2) -> 30 (25%, 80%) */}
                {/* Grid 8,2 Center roughly: x=16%, y=93% */}
                <line
                    x1="16%" y1="93%"
                    x2="25%" y2="80%"
                    className="stroke-neon-green/30 stroke-[3] stroke-dashed"
                    strokeDasharray="5,5"
                />

                {/* Shortcut Internal Path */}
                <line x1="25%" y1="80%" x2="32%" y2="68%" className="stroke-neon-green/30 stroke-[3] stroke-dashed" strokeDasharray="5,5" />
                <line x1="32%" y1="68%" x2="36%" y2="56%" className="stroke-neon-green/30 stroke-[3] stroke-dashed" strokeDasharray="5,5" />
                <line x1="36%" y1="56%" x2="36%" y2="44%" className="stroke-neon-green/30 stroke-[3] stroke-dashed" strokeDasharray="5,5" />
                <line x1="36%" y1="44%" x2="32%" y2="32%" className="stroke-neon-green/30 stroke-[3] stroke-dashed" strokeDasharray="5,5" />
                <line x1="32%" y1="32%" x2="25%" y2="20%" className="stroke-neon-green/30 stroke-[3] stroke-dashed" strokeDasharray="5,5" />

                {/* Exit: 35 (25%, 20%) -> 16 (r1,c2) roughly x=16%, y=6% */}
                <line
                    x1="25%" y1="20%"
                    x2="16%" y2="6%"
                    className="stroke-neon-green/30 stroke-[3] stroke-dashed"
                    strokeDasharray="5,5"
                />
            </svg>

            {/* Board Grid: 9 Cols x 8 Rows */}
            <div className="grid grid-cols-9 grid-rows-8 gap-2 w-full h-full p-2 relative">
                {missions.map((mission, i) => {
                    const isShortcutTile = i >= 30;
                    // Type casting the style because we are mixing grid and absolute
                    const tileStyle = getTileStyle(i) as any;

                    return (
                        <div
                            key={mission.id}
                            style={tileStyle}
                            className={`
                                relative flex items-center justify-center p-1 border
                                ${isShortcutTile
                                    ? 'rounded-lg aspect-square w-12 h-12 md:w-16 md:h-16 shadow-lg z-30 border-2 border-yellow-400 bg-gray-800 text-white'
                                    : 'rounded-lg border-slate-700 bg-slate-900/80 w-full h-full'}
                                ${i === currentPosition
                                    ? 'border-neon-blue bg-cyan-900/50 shadow-[0_0_15px_rgba(0,240,255,0.5)] z-40 scale-110'
                                    : ''}
                                ${mission.type === 'BACK' ? 'border-pink-500/50 bg-pink-900/20' : ''}
                                text-xs md:text-sm text-center font-medium
                                transition-all duration-300
                            `}
                        >
                            {!isShortcutTile && <div className="absolute top-1 left-1 text-[10px] text-slate-500">{i + 1}</div>}
                            <span className={`line-clamp-2 px-1 break-keep ${isShortcutTile ? 'text-xs font-bold text-yellow-300' : ''}`}>
                                {isShortcutTile
                                    ? (mission.text?.replace(/지름길\s*[:]?\s*/g, '').trim() || `미션 ${i - 29}`)
                                    : mission.text
                                }
                            </span>

                            {/* Entrance Indicator on Tile 7. Label: 'Entrance' */}
                            {i === 7 && <span className="absolute -top-4 -right-4 text-[10px] bg-neon-green text-black px-1 rounded animate-bounce z-20 font-bold">SHORTCUT<br />ENTER</span>}

                            {/* Exit Indicator on Tile 16. Label: 'Exit' */}
                            {i === 16 && <span className="absolute -bottom-4 -right-4 text-[10px] bg-neon-blue text-black px-1 rounded z-20 font-bold">SHORTCUT<br />EXIT</span>}

                            {/* Special Icons */}
                            {mission.type === 'BACK' && <span className="absolute bottom-1 right-1 text-xs">🔙</span>}
                        </div>
                    );
                })}

                {/* Center Control Area */}
                {/* Spanning inner area: Cols 2-8, Rows 2-7 */}
                <div className="col-start-2 col-end-9 row-start-2 row-end-8 flex flex-col items-center justify-center z-10 gap-8 pointer-events-none">
                    <h1 className="text-4xl md:text-6xl font-bold neon-text-blue tracking-widest pointer-events-none mb-8">BADA</h1>
                    {/* 3DDice and Logo, ensuring they don't block the path visually or functionally */}
                    {/* The path goes through the center diagonal. UI might overlap. */}
                    {/* Let's shift UI to Top-Left or Bottom-Right empty spaces? */}
                    {/* Or just keep centered and let them overlap with z-index. */}
                    {/* Path is z-0/z-10. UI is z-20. */}
                    <div className="pointer-events-auto bg-black/50 p-4 rounded-xl backdrop-blur-sm">
                        <ThreeDDice />
                    </div>
                    {/* Soft Reset (Clear Board) - Optional, keeping for testing */}
                    <button
                        onClick={resetGame}
                        className="mt-8 text-slate-500 hover:text-white text-sm underline pointer-events-auto"
                    >
                        Clear Board
                    </button>
                </div>

                {/* Player Piece */}
                {isPlaying && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
                            gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
                            gap: '0.5rem',
                            padding: '0.5rem',
                        }}
                    >
                        <motion.div
                            layoutId="player-piece"
                            className="relative w-8 h-8 md:w-12 md:h-12 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] z-50 place-self-center"
                            style={getTileStyle(currentPosition) as any}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                        </motion.div>
                    </div>
                )}
            </div>

            <MissionModal
                isOpen={showModal}
                mission={activeMission}
                onClose={() => setShowModal(false)}
            />

            {/* Hard Reset Button */}
            <button
                onClick={() => window.location.reload()}
                className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg z-50 transition-colors"
                title="Reload Page"
            >
                Game Reset
            </button>
        </div>
    );
}
