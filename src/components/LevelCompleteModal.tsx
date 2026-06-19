import { useGameStore } from '@/store/gameStore';
import { DIFFICULTY_CONFIG, CLASSIC_LEVELS, QUICK_LEVELS, createEnemy, ENEMIES, ELEMENTS, RARITY_NAMES } from '@/data/gameData';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function LevelCompleteModal() {
  const {
    showLevelComplete,
    levelEssenceReward,
    level,
    maxLevel,
    mode,
    difficulty,
    proceedToNextLevel,
    hideLevelCompleteScreen,
    levelCardReward,
  } = useGameStore();

  const [countdown, setCountdown] = useState(5);

  const levels = mode === 'quick' ? QUICK_LEVELS : CLASSIC_LEVELS;
  const nextLevelIndex = level;
  const hasNextLevel = nextLevelIndex < levels.length;

  let nextEnemy = null;
  if (hasNextLevel) {
    const nextLevelData = levels[nextLevelIndex];
    const enemyData = ENEMIES[nextLevelData.enemyIndex % ENEMIES.length];
    const diffConfig = DIFFICULTY_CONFIG[difficulty];
    const levelMultiplier = 1 + nextLevelIndex * 0.15;
    
    nextEnemy = {
      name: enemyData.name,
      image: enemyData.image,
      avatarType: enemyData.avatarType,
      maxHp: Math.floor(enemyData.maxHp * diffConfig.enemyHpMultiplier * levelMultiplier),
      attackPower: Math.floor(enemyData.attackPower * diffConfig.enemyAttackMultiplier * levelMultiplier),
      tier: enemyData.tier || 'common',
      isBoss: enemyData.isBoss,
      level: enemyData.level,
    };
  }

  useEffect(() => {
    if (showLevelComplete && hasNextLevel) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            proceedToNextLevel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showLevelComplete, hasNextLevel, proceedToNextLevel]);

  if (!showLevelComplete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ 
            animation: 'magicCircle 20s linear infinite',
            border: '2px solid #ffd700',
          }}
        >
          <div className="absolute inset-8 rounded-full border border-amber-500/20" />
          <div className="absolute inset-16 rounded-full border border-amber-400/10" />
        </div>
      </div>

      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-fall opacity-0"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-50px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            animationFillMode: 'forwards',
          }}
        >
          {['⭐', '✨', '🌟', '💫', '💎'][Math.floor(Math.random() * 5)]}
        </div>
      ))}

      <div className="relative z-10 text-center animate-zoom-in max-w-md w-full mx-4">
        <div
          className="absolute -inset-8 blur-3xl opacity-40 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />

        <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-3xl border-2 border-amber-500/40 p-8 shadow-2xl">
          <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '1.5s' }}>
            🎉
          </div>

          <h2
            className="text-4xl font-black text-gradient-gold mb-2"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            关卡完成!
          </h2>
          
          <p className="text-white/60 mb-6">
            第 {level} / {maxLevel} 关
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-purple-500/30">
            <div className="text-sm text-white/60 mb-2">本关获得精华奖励</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">💎</span>
              <span className="text-4xl font-black text-purple-300" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                +{levelEssenceReward}
              </span>
            </div>
          </div>

          {levelCardReward && (
            <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 rounded-2xl p-5 mb-6 border border-emerald-500/40 animate-pulse-slow">
              <div className="text-sm text-emerald-300 mb-3 font-semibold">🎴 获得新卡牌！</div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-20 rounded-xl bg-slate-800/70 border-2 border-amber-400/50 flex flex-col items-center justify-center shadow-lg shadow-amber-500/20">
                  <div className="text-2xl mb-1">{ELEMENTS[levelCardReward.element].icon}</div>
                  <div className="text-[10px] font-bold text-white text-center px-1 truncate w-full">
                    {levelCardReward.name}
                  </div>
                  <div className={cn(
                    'text-[9px] font-semibold mt-0.5',
                    levelCardReward.rarity === 'legendary' ? 'text-amber-400' :
                    levelCardReward.rarity === 'epic' ? 'text-purple-400' :
                    levelCardReward.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                  )}>
                    {RARITY_NAMES[levelCardReward.rarity]}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">
                    {levelCardReward.name}
                  </div>
                  <div className={cn(
                    'text-sm font-semibold',
                    levelCardReward.rarity === 'legendary' ? 'text-amber-400' :
                    levelCardReward.rarity === 'epic' ? 'text-purple-400' :
                    levelCardReward.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                  )}>
                    {RARITY_NAMES[levelCardReward.rarity]}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {levelCardReward.description}
                  </div>
                  <div className="text-xs text-amber-300 mt-1">
                    ⚔️ 威力: {levelCardReward.power}
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasNextLevel && nextEnemy && (
            <div className="mb-6">
              <div className="text-sm text-white/60 mb-3">下一关敌人</div>
              <div className={cn(
                'relative overflow-hidden rounded-2xl p-4 border',
                nextEnemy.isBoss 
                  ? 'bg-gradient-to-br from-red-900/40 via-orange-900/40 to-red-900/40 border-red-500/40'
                  : 'bg-slate-800/50 border-slate-600/30'
              )}>
                {nextEnemy.isBoss && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-xs font-bold">
                    BOSS
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-3xl',
                    nextEnemy.isBoss 
                      ? 'bg-gradient-to-br from-red-600 to-orange-700'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800'
                  )}>
                    {nextEnemy.image}
                  </div>
                  
                  <div className="text-left flex-1">
                    <div className="font-bold text-white text-lg" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                      {nextEnemy.name}
                    </div>
                    <div className="flex gap-4 text-sm mt-1">
                      <span className="text-red-400">❤️ {nextEnemy.maxHp}</span>
                      <span className="text-orange-400">⚔️ {nextEnemy.attackPower}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      等级 {nextEnemy.level} · {nextEnemy.tier === 'boss' ? 'Boss' : nextEnemy.tier === 'elite' ? '精英' : '普通'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={proceedToNextLevel}
              className="group relative px-8 py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-lg shadow-amber-500/30"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>⚔️ 继续挑战</span>
                {hasNextLevel && countdown > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">
                    {countdown}s
                  </span>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 pointer-events-none" />
            </button>

            <button
              onClick={hideLevelCompleteScreen}
              className="px-8 py-3 rounded-xl font-bold text-white/70 bg-slate-800/60 hover:bg-slate-700/60 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10 hover:border-amber-500/30"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              查看战利品
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
