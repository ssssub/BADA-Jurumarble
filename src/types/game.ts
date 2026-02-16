export type MissionType = 'NORMAL' | 'SHORTCUT' | 'BACK' | 'GOLDEN_KEY';

export interface Mission {
    id: number;
    text: string;
    description?: string;
    type: MissionType;
    targetIndex?: number; // For SHORTCUT or BACK
}

export interface GameState {
    missions: Mission[];
    currentPosition: number;
    isPlaying: boolean;
    diceValue: number | null;
    isRolling: boolean;
    isShortcut: boolean;

    // Actions
    setMissions: (missions: Mission[]) => void;
    startGame: () => void;
    movePiece: (steps: number) => void;
    teleportPlayer: (index: number) => void;
    rollDice: () => void;
    resetGame: () => void;
}
