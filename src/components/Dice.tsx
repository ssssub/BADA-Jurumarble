'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { useEffect, useState } from 'react';

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function Dice() {
    const { diceValue, isRolling, rollDice } = useGameStore();
    const [displayValue, setDisplayValue] = useState(1);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRolling) {
            interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * 6) + 1);
            }, 100);
        } else if (diceValue) {
            setDisplayValue(diceValue);
        }
        return () => clearInterval(interval);
    }, [isRolling, diceValue]);

    const Icon = DICE_ICONS[displayValue - 1] || Dice1;

    return (
        <div className="flex flex-col items-center gap-4 z-20">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={rollDice}
                disabled={isRolling}
                className={`relative w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 ${isRolling ? 'border-cyan-400 animate-spin' : 'border-slate-500 hover:border-cyan-400 neon-box-blue'} transition-all`}
            >
                <Icon size={48} className={isRolling ? "text-cyan-400" : "text-white"} />
            </motion.button>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {isRolling ? "Rolling..." : "Roll Dice"}
            </span>
        </div>
    );
}
