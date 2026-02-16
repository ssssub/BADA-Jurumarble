import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ChevronUp, ChevronDown, MapPin } from 'lucide-react';

export default function DevTools() {
    const { teleportPlayer, currentPosition } = useGameStore();
    const [isOpen, setIsOpen] = useState(true);
    const [target, setTarget] = useState('');

    const handleTeleport = () => {
        let index = parseInt(target);
        if (isNaN(index)) {
            // Handle S1-S6
            const upper = target.toUpperCase();
            if (upper.startsWith('S')) {
                const sIndex = parseInt(upper.replace('S', ''));
                if (!isNaN(sIndex) && sIndex >= 1 && sIndex <= 6) {
                    index = 29 + sIndex; // S1=30
                }
            }
        }

        if (!isNaN(index) && index >= 0 && index <= 35) {
            teleportPlayer(index);
        } else {
            alert('Invalid Tile! Use 0-29 or S1-S6');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 p-2 rounded-full text-slate-400 hover:text-white z-50 opacity-50 hover:opacity-100"
            >
                <ChevronUp size={20} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-xl z-50 w-64 backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <MapPin size={14} className="text-cyan-400" />
                    Dev Tools
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 hover:text-white"
                >
                    <ChevronDown size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <div className="text-xs text-slate-500">Current Tile: <span className="text-cyan-400 font-mono">{currentPosition}</span></div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="0-29 or S1"
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:border-cyan-400 outline-none"
                    />
                    <button
                        onClick={handleTeleport}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
                    >
                        GO
                    </button>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                    Try: 7 (Ent), 30 (S1), 16 (Exit)
                </div>
            </div>
        </div>
    );
}
