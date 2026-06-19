import { useGameStore } from '@/store/gameStore';
import { ELEMENTS, COMBOS, CATEGORY_NAMES, CATEGORY_COLORS, DIFFICULTY_CONFIG, CLASSIC_LEVELS, QUICK_LEVELS } from '@/data/gameData';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { GameMode, Difficulty } from '@/types/game';
import { getBattleSaveInfo } from '@/lib/gameSave';

export default function MainMenu() {
  const { 
    startBattle, startChallenge, startEndless, startQuick, toggleDailyQuests, dailyQuests, 
    continueGame, hasSave, toggleShop, elementEssence, isTutorialCompleted, startTutorial, 
    toggleMyCards, getCollectionStats, startDuo, toggleCollection,
    currentAccount, toggleAccountManager, toggleSaveManager
  } = useGameStore();
  const [showCodex, setShowCodex] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [saveInfo, setSaveInfo] = useState<ReturnType<typeof getBattleSaveInfo>>(null);

  useEffect(() => {
    setSaveInfo(getBattleSaveInfo());
  }, []);

  const modeNames: Record<GameMode, string> = {
    classic: '经典对战',
    challenge: '挑战模式',
    endless: '无尽模式',
    quick: '快速对战',
    duo: '双人对战',
  };

  const handleContinue = () => {
    const success = continueGame();
    if (success) {
      setSaveInfo(null);
    }
  };

  const gameModes = [
    {
      id: 'classic',
      name: '经典对战',
      description: '与AI对手进行一场完整的卡牌对决',
      icon: '⚔️',
      color: 'from-blue-600 via-purple-600 to-blue-600',
      glow: 'shadow-blue-500/30',
      levels: CLASSIC_LEVELS.length,
    },
    {
      id: 'challenge',
      name: '挑战模式',
      description: '多关卡Boss挑战，击败越来越强的敌人',
      icon: '🏆',
      color: 'from-amber-500 via-orange-500 to-red-500',
      glow: 'shadow-orange-500/30',
      levels: '∞',
    },
    {
      id: 'duo',
      name: '双人对战',
      description: '本地双人对战，两名玩家轮流操作',
      icon: '👥',
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      glow: 'shadow-emerald-500/30',
      levels: '本地',
    },
    {
      id: 'endless',
      name: '无尽模式',
      description: '无限波次敌人，看看你能坚持多久',
      icon: '♾️',
      color: 'from-purple-600 via-pink-600 to-purple-600',
      glow: 'shadow-purple-500/30',
      levels: '∞',
    },
    {
      id: 'quick',
      name: '快速对战',
      description: '简化规则，3分钟一局，适合碎片时间',
      icon: '⚡',
      color: 'from-cyan-500 via-teal-500 to-emerald-500',
      glow: 'shadow-cyan-500/30',
      levels: QUICK_LEVELS.length,
    },
  ];

  const difficulties = Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => ({
    id: key as Difficulty,
    ...config,
  }));

  const handleModeSelect = (mode: GameMode) => {
    if (mode === 'duo') {
      startDuo();
      return;
    }
    setSelectedMode(mode);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    if (!selectedMode) return;
    
    switch (selectedMode) {
      case 'classic':
        startBattle('classic', difficulty);
        break;
      case 'challenge':
        startChallenge(difficulty);
        break;
      case 'endless':
        startEndless(difficulty);
        break;
      case 'quick':
        startQuick(difficulty);
        break;
    }
  };

  const handleBack = () => {
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden battle-ground">
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* 装饰性大元素 - 修复: 添加 pointer-events-none，避免装饰元素拦截鼠标事件
          导致模式按钮 hover 状态闪烁、按钮无法点击的问题 */}
      <div className="absolute top-16 left-16 text-7xl animate-float-slow opacity-20 pointer-events-none select-none">🔥</div>
      <div className="absolute top-32 right-24 text-6xl animate-float-slow opacity-20 pointer-events-none select-none" style={{ animationDelay: '1s' }}>💧</div>
      <div className="absolute bottom-40 left-24 text-8xl animate-float-slow opacity-20 pointer-events-none select-none" style={{ animationDelay: '0.5s' }}>🌍</div>
      <div className="absolute bottom-24 right-16 text-7xl animate-float-slow opacity-20 pointer-events-none select-none" style={{ animationDelay: '1.5s' }}>🌪️</div>

      {/* 魔法阵背景 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="w-[800px] h-[800px] rounded-full opacity-10 border-4 border-current text-amber-400"
          style={{ animation: 'magicCircle 30s linear infinite' }}
        >
          <div className="absolute inset-12 rounded-full border-2 border-current opacity-60" />
          <div className="absolute inset-24 rounded-full border border-current opacity-40" />
          <div className="absolute inset-36 rounded-full border border-current opacity-20" />
          
          {/* 四元素位置 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl">🔥</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-4xl">🌍</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl">💧</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl">🌪️</div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          {/* 四元素图标排列 */}
          <div className="flex justify-center gap-6 mb-6">
            {Object.values(ELEMENTS).map((el, i) => (
              <div
                key={i}
                className="relative"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/40 shadow-lg"
                  style={{ 
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  {el.icon}
                </div>
                <div 
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${el.gradient} blur-lg opacity-40 -z-10`}
                  style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                />
              </div>
            ))}
          </div>

          {/* 游戏标题 */}
          <h1
            className="text-6xl font-black text-gradient-gold mb-3"
            style={{ 
              fontFamily: "'Cinzel Decorative', serif",
              textShadow: '0 0 60px rgba(251, 191, 36, 0.4)',
            }}
          >
            元素对决
          </h1>
          
          <p className="text-lg text-white/60 tracking-[0.5em] mb-2">ELEMENTAL DUELS</p>
          <p className="text-amber-400/70 text-sm tracking-wider">两两搭配 · 释放组合技 · 策略对决</p>
        </div>

        {/* 难度选择界面 */}
        {selectedMode ? (
          <div className="animate-rise">
            <div className="text-center mb-6">
              <button
                onClick={handleBack}
                className="mb-4 px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-amber-500/30 flex items-center gap-2 mx-auto"
              >
                ← 返回模式选择
              </button>
              <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                选择难度
              </h2>
              <p className="text-white/60">
                {gameModes.find(m => m.id === selectedMode)?.name} · 共 {gameModes.find(m => m.id === selectedMode)?.levels} 关
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              {difficulties.map((diff, index) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => handleDifficultySelect(diff.id)}
                  className="group relative rounded-2xl text-left bg-transparent border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 修复: 缩放放在内部 wrapper 上，button 命中区不变；装饰层全部 pointer-events-none */}
                  <div className="relative overflow-hidden rounded-2xl p-5 transition-transform duration-300 ease-out group-hover:scale-[1.03] group-active:scale-[0.97]">
                    {/* 背景渐变 */}
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${diff.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* 光泽效果 */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />

                    {/* 边框 */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/30" />

                    {/* 内容 */}
                    <div className="pointer-events-none relative z-10">
                      <div className="text-4xl mb-2">{diff.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                        {diff.name}
                      </h3>
                      <p className="text-white/70 text-sm mb-3">{diff.description}</p>
                      <div className="text-xs text-white/60 space-y-1">
                        <div>敌人生命: ×{diff.enemyHpMultiplier}</div>
                        <div>敌人攻击: ×{diff.enemyAttackMultiplier}</div>
                        <div>玩家生命: ×{diff.playerHpMultiplier}</div>
                        <div>精华获取: ×{diff.essenceMultiplier}</div>
                      </div>
                    </div>
                  </div>

                  {/* 修复: 外发光独立放到缩放 wrapper 之外，避免命中区抖动 */}
                  <div className={`pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br ${diff.color} blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 继续游戏按钮 */}
            {saveInfo && (
              <div className="w-full max-w-2xl mb-4 animate-rise">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="group relative w-full rounded-2xl text-left bg-transparent border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                >
                  {/* 修复: 缩放放在内部 wrapper 上，button 命中区不变 */}
                  <div className="relative overflow-hidden rounded-2xl p-4 transition-transform duration-300 ease-out group-hover:scale-[1.02] group-active:scale-[0.98]">
                    {/* 背景渐变 */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* 光泽效果 */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60" />

                    {/* 边框 */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/40" />

                    {/* 内容 */}
                    <div className="pointer-events-none relative z-10 flex items-center gap-4">
                      <div className="text-4xl">💾</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                          继续游戏
                        </h3>
                        <p className="text-white/70 text-sm">
                          {modeNames[saveInfo.mode]} · 第 {saveInfo.level} 关 · 第 {saveInfo.wave} 波
                        </p>
                      </div>
                      <div className="text-white/60 text-sm">
                        {new Date(saveInfo.savedAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 修复: 外发光独立放到缩放 wrapper 之外 */}
                  <div className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                </button>
              </div>
            )}

            {/* 游戏模式选择 */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-6">
              {gameModes.map((mode, index) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeSelect(mode.id as GameMode)}
                  className="group relative rounded-2xl text-left bg-transparent border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 修复: 缩放效果改放在内部 wrapper 上，button 自身不再 transform，
                      避免 hover:scale-105 时按钮边界移动导致鼠标在 button 边缘"跌出/跌入"
                      引发的 hover 状态反复切换（透明遮罩闪烁）。
                      同时所有装饰层都加 pointer-events-none，确保只有 button 接收事件。 */}
                  <div className="relative overflow-hidden rounded-2xl p-5 transition-transform duration-300 ease-out group-hover:scale-[1.03] group-active:scale-[0.97]">
                    {/* 背景渐变 */}
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${mode.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

                    {/* 光泽效果 */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />

                    {/* 边框 */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/30" />

                    {/* 内容 */}
                    <div className="pointer-events-none relative z-10">
                      <div className="text-4xl mb-2">{mode.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                        {mode.name}
                      </h3>
                      <p className="text-white/70 text-sm">{mode.description}</p>
                      <div className="mt-2 text-xs text-white/60">
                        关卡数: {mode.levels}
                      </div>
                    </div>
                  </div>

                  {/* 修复: 外发光放到 button 自身、缩放 wrapper 之外，
                      避免 -inset-1 与缩放叠加时改变命中区。pointer-events-none 防止事件拦截。 */}
                  <div className={`pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br ${mode.color} blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                </button>
              ))}
            </div>

            {/* 账号信息 */}
            {currentAccount && (
              <div className="w-full max-w-2xl mb-4">
                <button
                  onClick={toggleAccountManager}
                  className="group w-full overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-amber-500/40 transition-colors duration-300" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="text-4xl">{currentAccount.avatar}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                        {currentAccount.name}
                      </h3>
                      <p className="text-white/50 text-xs">
                        最近游玩: {new Date(currentAccount.lastPlayedAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1">
                        💎 {elementEssence}
                      </span>
                      <span className="text-white/40 text-sm">切换账号 →</span>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* 功能按钮 */}
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={toggleAccountManager}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500/30 to-blue-500/30 hover:from-sky-500/50 hover:to-blue-500/50 text-white/80 hover:text-white transition-all duration-300 border border-sky-500/30 hover:border-sky-400/50 flex items-center gap-2 relative"
              >
                <span>👤</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>账号</span>
                {currentAccount && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-300 text-xs font-bold">
                    {currentAccount.avatar}
                  </span>
                )}
              </button>
              <button
                onClick={toggleSaveManager}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500/30 to-purple-500/30 hover:from-violet-500/50 hover:to-purple-500/50 text-white/80 hover:text-white transition-all duration-300 border border-violet-500/30 hover:border-violet-400/50 flex items-center gap-2 relative"
              >
                <span>💾</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>存档</span>
              </button>
              <button
                onClick={toggleShop}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500/50 hover:to-orange-500/50 text-white/80 hover:text-white transition-all duration-300 border border-amber-500/30 hover:border-amber-400/50 flex items-center gap-2 relative"
              >
                <span>🏪</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>商店</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                  💎 {elementEssence}
                </span>
              </button>
              <button
                onClick={toggleMyCards}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 hover:from-emerald-500/50 hover:to-cyan-500/50 text-white/80 hover:text-white transition-all duration-300 border border-emerald-500/30 hover:border-emerald-400/50 flex items-center gap-2 relative"
              >
                <span>🃏</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>我的卡牌</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold">
                  {getCollectionStats().unique} 种
                </span>
              </button>
              <button
                onClick={toggleCollection}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-yellow-500/30 hover:from-amber-500/50 hover:to-yellow-500/50 text-white/80 hover:text-white transition-all duration-300 border border-amber-500/30 hover:border-amber-400/50 flex items-center gap-2 relative"
              >
                <span>🏛️</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>卡牌收藏</span>
              </button>
              <button
                onClick={toggleDailyQuests}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-white/80 hover:text-white transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 flex items-center gap-2 relative"
              >
                <span>📜</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>每日任务</span>
                {dailyQuests.quests.some(q => q.completed && !q.claimed) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                    !
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowCodex(!showCodex)}
                className="px-6 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-amber-500/30 flex items-center gap-2"
              >
                <span>📖</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>组合技图鉴</span>
              </button>
              <button
                onClick={() => {
                  startTutorial();
                  startBattle('classic', 'easy');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/50 hover:to-teal-500/50 text-white/80 hover:text-white transition-all duration-300 border border-emerald-500/30 hover:border-emerald-400/50 flex items-center gap-2"
              >
                <span>🎓</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>新手教程</span>
              </button>
            </div>
          </>
        )}

        {/* 组合技图鉴展开 */}
        {showCodex && (
          <div className="mt-6 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 max-w-4xl w-full border border-amber-500/20 animate-rise max-h-[70vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-amber-400 mb-4 text-center" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              ✨ 元素组合技 ✨
            </h3>

            <div className="mb-5 p-4 rounded-xl bg-slate-800/50 border border-white/10">
              <h4 className="text-sm font-bold text-amber-300 mb-3">📖 效果类型说明</h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-orange-400 font-bold">🔥 灼烧</span>
                  <p className="text-white/50 mt-1">每回合持续伤害</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-cyan-300 font-bold">❄️ 冻结</span>
                  <p className="text-white/50 mt-1">跳过敌人行动</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-green-400 font-bold">☠️ 中毒</span>
                  <p className="text-white/50 mt-1">持续毒素伤害</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-yellow-300 font-bold">💫 眩晕</span>
                  <p className="text-white/50 mt-1">无法行动</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-green-400 font-bold">💚 治疗</span>
                  <p className="text-white/50 mt-1">恢复生命值</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-amber-300 font-bold">🛡️ 护盾</span>
                  <p className="text-white/50 mt-1">抵挡伤害</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-blue-400 font-bold">🃏 抽牌</span>
                  <p className="text-white/50 mt-1">抽取更多卡牌</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-pink-400 font-bold">🩸 吸血</span>
                  <p className="text-white/50 mt-1">伤害转生命</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-orange-400 font-bold">🌵 反伤</span>
                  <p className="text-white/50 mt-1">反弹敌人攻击</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-cyan-400 font-bold">💠 吸收</span>
                  <p className="text-white/50 mt-1">伤害转护盾</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-red-400 font-bold">💔 虚弱</span>
                  <p className="text-white/50 mt-1">降低敌人攻击</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-700/40">
                  <span className="text-yellow-400 font-bold">💪 强化</span>
                  <p className="text-white/50 mt-1">提升自身攻击</p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/60">技能类型：</span>
              {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                <span
                  key={key}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-semibold bg-slate-700/60',
                    CATEGORY_COLORS[key]
                  )}
                >
                  {name}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {COMBOS.map((combo) => (
                <div
                  key={combo.id}
                  className="group relative p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 border border-white/5 hover:border-amber-500/30 cursor-default"
                >
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-2xl">{ELEMENTS[combo.elements[0]].icon}</span>
                    <span className="text-amber-400 text-sm">+</span>
                    <span className="text-2xl">{ELEMENTS[combo.elements[1]].icon}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                      {combo.name}
                    </div>
                    <div className={cn(
                      'text-xs font-semibold mb-1',
                      CATEGORY_COLORS[combo.category]
                    )}>
                      {CATEGORY_NAMES[combo.category]}
                    </div>
                    <div className="text-xs text-red-400 font-bold">
                      ⚔️ {combo.damage} 伤害
                    </div>
                    {combo.effect && (
                      <div className="text-xs text-purple-400 mt-0.5">
                        ✨ {combo.effect === 'burn' && '灼烧'}
                        {combo.effect === 'freeze' && '冻结'}
                        {combo.effect === 'poison' && '中毒'}
                        {combo.effect === 'stun' && '眩晕'}
                        {combo.effect === 'heal' && '治疗'}
                        {combo.effect === 'shield' && '护盾'}
                        {combo.effect === 'draw' && '抽牌'}
                        {combo.effect === 'lifesteal' && '吸血'}
                        {combo.effect === 'thorns' && '反伤'}
                        {combo.effect === 'absorb' && '吸收'}
                        {combo.effect === 'weakness' && '虚弱'}
                        {combo.effect === 'strength' && '强化'}
                        {combo.effectValue !== undefined && ` ${combo.effectValue}`}
                      </div>
                    )}
                    <div className="text-xs text-amber-400/80 mt-0.5">
                      ⏱️ 冷却 {combo.cooldown} 回合
                    </div>
                    {combo.canUpgrade && (
                      <div className="text-xs text-green-400 mt-0.5">
                        ⬆️ 可升级
                      </div>
                    )}
                  </div>
                  
                  {/* 稀有度指示 */}
                  <div className={cn(
                    'absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white/30',
                    combo.rarity === 'common' && 'bg-gray-500',
                    combo.rarity === 'rare' && 'bg-blue-500',
                    combo.rarity === 'epic' && 'bg-purple-500',
                    combo.rarity === 'legendary' && 'bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse',
                  )} title={combo.rarity} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-8 text-white/30 text-sm">
          选择两张元素卡牌 → 组合释放强力技能 → 击败对手
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}
