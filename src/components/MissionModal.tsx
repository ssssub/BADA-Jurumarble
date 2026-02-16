'use client';

import { Mission } from '@/types/game';
import { AnimatePresence, motion } from 'framer-motion';

interface MissionModalProps {
    isOpen: boolean;
    mission: Mission | null;
    onClose: () => void;
}

export default function MissionModal({ isOpen, mission, onClose }: MissionModalProps) {
    return (
        <AnimatePresence>
            {isOpen && mission && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 20 }}
                        className="relative w-full max-w-md bg-slate-900 border border-cyan-500 rounded-2xl p-8 neon-box-blue flex flex-col items-center text-center gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Title Badge */}
                        <div className="absolute -top-4 bg-cyan-500 text-black font-bold px-4 py-1 rounded-full text-sm">
                            MISSION
                        </div>

                        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 py-4 break-keep leading-tight">
                            {mission.text}
                        </p>

                        {mission.description && (
                            <p className="text-lg text-slate-300 font-medium bg-white/10 px-4 py-2 rounded-lg">
                                {mission.description}
                            </p>
                        )}

                        {mission.type === 'SHORTCUT' && (
                            <p className="text-neon-pink font-bold animate-pulse">
                                🚀 지름길! 다음 턴에 점프합니다!
                            </p>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all text-white"
                        >
                            확인 (Complete)
                        </button>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
}
