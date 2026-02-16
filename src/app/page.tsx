'use client';

import GameBoard from '@/components/GameBoard';
import { useGameStore } from '@/store/useGameStore';
import DevTools from '@/components/DevTools';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shuffle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Default Drinking Game Missions (Main Board 0-29)
const DEFAULT_MISSIONS = [
  "다같이 원샷!", "내 오른쪽 사람 마시기", "랜덤 게임", "베스킨라빈스 31", "눈치게임",
  "훈민정음", "손병호 게임", "진실게임", "전화 걸어서 '사랑해' 듣기", "러브샷",
  "3분간 영어 금지", "물 한 잔 마시기 (쉬어가기)", "내가 마시기", "다같이 짠!", "흑기사/흑장미 소환",
  "파트너 지정하기", "노래 한 소절 부르기", "성대모사", "애교 보여주기", "엉덩이로 이름 쓰기",
  "왼쪽 사람 마시기", "맞은편 사람 마시기", "이번 턴 면제", "주사위 1+1", "지목하여 마시기",
  "왕 게임 (왕이 시키는대로)", "업다운 게임", "소주 뚜껑 치기", "폭탄 돌리기", "지목하여 원샷"
];

// Special Missions for Shortcuts (30-35) - Used if DB is insufficient
const SPECIAL_SHORTCUT_MISSIONS = [
  { title: "지옥의 러브샷", description: "옆 사람과 찐하게 러브샷 (거부 불가)" },
  { title: "흑기사 소환권", description: "원하는 사람에게 벌주 넘기기" },
  { title: "랜덤게임 지옥", description: "절대 끝나지 않는 랜덤게임" },
  { title: "폭탄주 제조가", description: "테이블에 있는 술로 폭탄주 제조" },
  { title: "다같이 원샷", description: "지름길 기념, 모두 함께 짠!" },
  { title: "탈출 성공!", description: "지름길 통과 축하! (벌주 면제)" }
];

export default function Home() {
  const { missions, setMissions, isPlaying, startGame } = useGameStore();
  const [inputs, setInputs] = useState<string[]>(Array(36).fill(''));
  const [descriptions, setDescriptions] = useState<string[]>(Array(36).fill('')); // Parallel state for descriptions
  const [toast, setToast] = useState<string | null>(null);

  // Sync inputs with store on mount
  useEffect(() => {
    const filledTitles = Array(36).fill('').map((_, i) => missions[i]?.text || '');
    const filleddescs = Array(36).fill('').map((_, i) => missions[i]?.description || '');
    setInputs(filledTitles);
    setDescriptions(filleddescs);
  }, []);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleAutoFill = async () => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();

      let dbGames: { title: string, description: string }[] = [];
      if (Array.isArray(data)) {
        // Map DB data. Handle missing descriptions.
        dbGames = data.map((g: any) => ({
          title: g.title,
          description: g.description || ''
        }));
        console.log(`Successfully loaded ${dbGames.length} games from DB`);
      }

      const newInputs = [...inputs];
      const newDescriptions = [...descriptions];
      const usedTitles = new Set(newInputs.filter(t => t.trim() !== ''));

      let filledCount = 0;
      let dbUsedCount = 0;

      // Pool Preparation
      // 1. DB Pool
      let dbPool = dbGames.filter(m => !usedTitles.has(m.title));
      dbPool.sort(() => Math.random() - 0.5);

      // 2. Default Pool (Main Board)
      let defaultPool = DEFAULT_MISSIONS.filter(m => !usedTitles.has(m)).sort(() => Math.random() - 0.5);

      // 3. Special Shortcut Pool
      let shortcutPool = [...SPECIAL_SHORTCUT_MISSIONS].sort(() => Math.random() - 0.5);

      let dbIndex = 0;
      let defaultIndex = 0;
      let shortcutIndex = 0;

      for (let i = 0; i < 36; i++) {
        // Only fill empty slots
        if (newInputs[i].trim() === '') {
          let title = '';
          let desc = '';
          let source = 'DEFAULT';

          // Strategy:
          // Always prioritize DB pool first for ANY slot.
          if (dbIndex < dbPool.length) {
            title = dbPool[dbIndex].title;
            desc = dbPool[dbIndex].description;
            dbIndex++;
            source = 'DB';
            dbUsedCount++;
          } else {
            // If DB ran out, check if Shortcut or Main
            if (i >= 30) {
              // Shortcut: Use Special Pool
              const sMission = shortcutPool[shortcutIndex % shortcutPool.length];
              title = sMission.title;
              desc = sMission.description;
              shortcutIndex++;
            } else {
              // Main: Use Default Pool
              if (defaultIndex < defaultPool.length) {
                title = defaultPool[defaultIndex];
                desc = ''; // Default missions have no description
                defaultIndex++;
              } else {
                title = "마시기"; // Ultimate fallback
                desc = "";
              }
            }
          }

          newInputs[i] = title;
          newDescriptions[i] = desc;
          usedTitles.add(title);
          filledCount++;
        }
      }

      setInputs(newInputs);
      setDescriptions(newDescriptions);

      if (filledCount > 0) {
        setToast(`${filledCount}칸 채움! (DB: ${dbUsedCount}, 기본: ${filledCount - dbUsedCount})`);
      } else {
        setToast(`빈 칸이 없습니다.`);
      }
      setTimeout(() => setToast(null), 3000);

    } catch (e) {
      console.error(e);
      setToast("오류 발생: DB 연결 확인 필요");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleStart = () => {
    const newMissions = inputs.map((text, i) => ({
      id: i,
      text: text || "쉬어가기",
      description: descriptions[i] || '',
      type: (i >= 30 && i <= 35) ? 'SHORTCUT' : 'NORMAL' as any,
      targetIndex: undefined
    }));

    // @ts-ignore
    setMissions(newMissions);
    startGame();
  };

  if (isPlaying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
        <GameBoard />
        <DevTools />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-8 gap-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-cyan-400 px-6 py-3 rounded-full shadow-lg border border-cyan-500/30 flex items-center gap-2 font-bold whitespace-nowrap"
          >
            <span>✨</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-48 h-48 md:w-64 md:h-64 neon-box-blue rounded-full p-4 bg-black/30 backdrop-blur-sm">
          <Image
            src="/logo.png"
            alt="BADA Logo"
            fill
            className="object-contain p-4 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            priority
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 neon-text-blue">
          BADA
        </h1>
        <p className="text-xl text-slate-400">Custom Drinking Board Game</p>
      </motion.div>

      {/* Controls */}
      <div className="flex gap-4 w-full justify-center">
        <button
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 text-cyan-400 font-bold"
        >
          <Shuffle size={20} />
          Auto Fill
        </button>
        <button
          onClick={handleStart}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all text-white font-bold neon-box-blue"
        >
          <Play size={20} />
          Game Start
        </button>
      </div>

      {/* Mission Input Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-3 w-full">
        {inputs.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="relative group"
          >
            <span className={`absolute -top-2 -left-2 w-max px-2 h-6 flex items-center justify-center border rounded-full text-xs z-10 
              ${i >= 30 ? 'bg-yellow-900 border-yellow-500 text-yellow-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
              {i >= 30 ? `Shortcut ${i - 29}` : i + 1}
            </span>
            <textarea
              value={text}
              onChange={(e) => handleInputChange(i, e.target.value)}
              placeholder={i >= 30 ? `Shortcut Mission ${i - 29}` : `Mission ${i + 1}`}
              className={`w-full h-24 p-3 rounded-lg bg-slate-900/50 border focus:ring-1 transition-all resize-none text-sm text-center flex items-center justify-center pt-6
                ${i >= 30 ? 'border-yellow-700 focus:border-yellow-400 focus:ring-yellow-400' : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-400'}
              `}
            />
          </motion.div>
        ))}
      </div>
    </main>
  );
}
