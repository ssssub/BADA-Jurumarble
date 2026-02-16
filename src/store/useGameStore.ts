import { create } from 'zustand';
import { GameState, Mission, MissionType } from '@/types/game';

const TOTAL_TILES = 36; // 0-29: Main Board, 30-35: Shortcut

export const useGameStore = create<GameState>((set, get) => ({
    missions: Array.from({ length: TOTAL_TILES }, (_, i) => ({
        id: i,
        text: '',
        description: '',
        type: 'NORMAL', // We'll handle visual distinction in component
    })),
    currentPosition: 0,
    isPlaying: false,
    diceValue: null,
    isRolling: false,
    isShortcut: false, // New state to track if player is on shortcut path

    setMissions: (missions) => set({ missions }),

    startGame: () => set({ isPlaying: true, currentPosition: 0, isShortcut: false }),

    rollDice: () => {
        if (get().isRolling) return;

        set({ isRolling: true, isPlaying: true });

        // Simulate rolling delay
        const randomValue = Math.floor(Math.random() * 6) + 1;

        setTimeout(() => {
            set({ diceValue: randomValue, isRolling: false });
            get().movePiece(randomValue);
        }, 1000);
    },

    movePiece: (steps: number) => {
        const { currentPosition } = get();

        // Check if we are starting strictly ON Tile 8 (Index 7)
        // If so, we must enter the shortcut.
        let takingShortcut = currentPosition === 7;
        if (takingShortcut) {
            console.log(`Shortcut Triggered: Starting at Tile 8 (Index 7) -> Will enter S1.`);
        }

        // We also need to respect if we are ALREADY on the shortcut (30-35)
        let onShortcutPath = currentPosition >= 30;

        let current = currentPosition;

        // Animate step by step
        let stepCount = 0;
        const interval = setInterval(() => {
            stepCount++;

            let nextIndex;

            if (takingShortcut && current === 7) {
                // Enter Shortcut S1 (30)
                nextIndex = 30;
                onShortcutPath = true; // Mark as on path
                takingShortcut = false; // Consumed the trigger
            } else if (onShortcutPath) {
                // Moving inside Shortcut (30 -> 35)
                if (current === 35) {
                    // Exit Shortcut -> Tile 17 (Index 16)
                    nextIndex = 16;
                    onShortcutPath = false;
                } else {
                    nextIndex = current + 1;
                }
            } else {
                // Normal Path (0-29)
                nextIndex = (current + 1) % 30;
            }

            console.log(`Step ${stepCount}: ${current} -> ${nextIndex}`);

            set({ currentPosition: nextIndex, isShortcut: onShortcutPath });
            current = nextIndex;

            if (stepCount >= steps) {
                clearInterval(interval);
                set({ isPlaying: true, isRolling: false });

                // After finishing movement, check if landed on entrance for NEXT turn
                if (current === 7) {
                    console.log("Landed on Tile 8 (Entrance). Next turn will take shortcut.");
                    // No state change needed if we check currentPosition === 7 at start of next turn.
                }
            }
        }, 300);
    },

    teleportPlayer: (index: number) => set({
        currentPosition: index,
        isShortcut: index >= 30,
        isPlaying: true
    }),

    resetGame: () => set((state) => ({
        currentPosition: 0,
        isPlaying: false,
        diceValue: null,
        isRolling: false,
        isShortcut: false,
        missions: state.missions.map((m) => ({ ...m, text: '', description: '', type: 'NORMAL' }))
    })),
}));
