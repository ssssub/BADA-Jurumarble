'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Dice face mappings (rotations to show each number)
const FACE_ROTATIONS: Record<number, [number, number]> = {
    1: [0, 0],
    2: [-90, 0],  // Top face? No, let's map standard
    3: [0, -90],  // Right face?
    4: [0, 90],   // Left face?
    5: [90, 0],   // Bottom face?
    6: [180, 0],  // Back face
};

// Adjust rotations based on standard net layout
// Front: 1
// Back: 6
// Right: 3
// Left: 4
// Top: 2
// Bottom: 5
const GET_ROTATION = (val: number): [number, number] => {
    switch (val) {
        case 1: return [0, 0];       // Front
        case 6: return [180, 0];     // Back
        case 2: return [-90, 0];     // Top
        case 5: return [90, 0];      // Bottom
        case 3: return [0, -90];     // Right
        case 4: return [0, 90];      // Left
        default: return [0, 0];
    }
};

export default function ThreeDDice() {
    const { diceValue, isRolling, rollDice } = useGameStore();
    const [rotation, setRotation] = useState<[number, number]>([0, 0]);

    // Handle rolling animation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRolling) {
            // Spin wildly
            interval = setInterval(() => {
                setRotation([
                    Math.random() * 720 - 360,
                    Math.random() * 720 - 360
                ]);
            }, 100);
        } else if (diceValue) {
            // Land on specific face
            // Add some full spins to make it look like it settled
            const [targetX, targetY] = GET_ROTATION(diceValue);
            // Ensure we rotate to the nearest multiple of 360 to avoid snapping?
            // Actually, CSS transition handles it if we just set target. 
            // Better to add 360 * n to ensure it spins to it.
            setRotation([targetX + 720, targetY + 720]);
        }
        return () => clearInterval(interval);
    }, [isRolling, diceValue]);

    return (
        <div className="flex flex-col items-center gap-8 z-30" style={{ perspective: '1000px' }}>
            {/* Dice Container */}
            <motion.div
                className="relative w-24 h-24 cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                onClick={rollDice}
                animate={{
                    rotateX: rotation[0],
                    rotateY: rotation[1],
                }}
                transition={{
                    duration: isRolling ? 0.1 : 0.6,
                    ease: isRolling ? "linear" : "backOut"
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {/* Faces */}
                {/* Front (1) - translateZ(48px) */}
                <div className="absolute inset-0 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center"
                    style={{ transform: 'translateZ(48px)' }}>
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-inner" />
                </div>

                {/* Back (6) - rotateY(180deg) translateZ(48px) */}
                <div className="absolute inset-0 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center"
                    style={{ transform: 'rotateY(180deg) translateZ(48px)' }}>
                    <div className="grid grid-cols-2 gap-2">
                        {[...Array(6)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-slate-800" />)}
                    </div>
                </div>

                {/* Top (2) - rotateX(90deg) translateZ(48px) */}
                <div className="absolute inset-0 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center"
                    style={{ transform: 'rotateX(90deg) translateZ(48px)' }}>
                    <div className="flex gap-4">
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                    </div>
                </div>

                {/* Bottom (5) - rotateX(-90deg) translateZ(48px) */}
                <div className="absolute inset-0 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center"
                    style={{ transform: 'rotateX(-90deg) translateZ(48px)' }}>
                    <div className="grid grid-cols-3 gap-1 rotate-45">
                        <div className="w-3 h-3 rounded-full bg-slate-800 col-start-1" />
                        <div className="w-3 h-3 rounded-full bg-slate-800 col-start-3" />
                        <div className="w-3 h-3 rounded-full bg-slate-800 col-start-2 row-start-2" />
                        <div className="w-3 h-3 rounded-full bg-slate-800 col-start-1 row-start-3" />
                        <div className="w-3 h-3 rounded-full bg-slate-800 col-start-3 row-start-3" />
                    </div>
                </div>

                {/* Right (3) - rotateY(90deg) translateZ(48px) */}
                <div className="absolute inset-0 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center"
                    style={{ transform: 'rotateY(90deg) translateZ(48px)' }}>
                    <div className="flex gap-1 transform -rotate-45">
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                    </div>
                </div>

                {/* Left (4) - rotateY(-90deg) translateZ(48px) */}
                <div className="absolute inset-0 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center"
                    style={{ transform: 'rotateY(-90deg) translateZ(48px)' }}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                    </div>
                </div>
            </motion.div>

            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                {isRolling ? "Rolling..." : "Roll Dice"}
            </span>
        </div>
    );
}
