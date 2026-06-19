import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { DIFFICULTY_CONFIG } from '@/data/gameData';

interface GameOverScreenProps {
  type: 'victory' | 'defeat';
}

export default function GameOverScreen({ type }: GameOverScreenProps) {
  const { startBattle, startChallenge, startEndless, startQuick, goToMenu, score, streak, mode, wave, level, maxLevel, difficulty } = useGameStore();

  const isVictory = type === 'victory';

  const handleRestart = () => {
    switch (mode) {
      case 'classic':
        startBattle('classic');
        break;
      case 'challenge':
        startChallenge();
        break;
      case 'endless':
        startEndless();
        break;
      case 'quick':
        startQuick();
        break;
      default:
        startBattle('classic');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 暗化背景 - 立即显示，避免白屏 */}
      <div className="absolute inset-0 bg-slate-950 animate-fade-in" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* 魔法阵背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ 
            animation: 'magicCircle 20s linear infinite',
            border: `2px solid ${isVictory ? '#ffd700' : '#ff4444'}`,
          }}
        >
          <div className={`absolute inset-8 rounded-full border ${isVictory ? 'border-amber-500/20' : 'border-red-500/20'}`} />
          <div className={`absolute inset-16 rounded-full border ${isVictory ? 'border-amber-400/10' : 'border-red-400/10'}`} />
        </div>
      </div>

      {/* 背景粒子效果 */}
      {isVictory && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-fall opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-50px',
                animationDelay: `${0.2 + Math.random() * 2}s`,
                animationDuration: `${2.5 + Math.random() * 2}s`,
                animationFillMode: 'forwards',
              }}
            >
              {['⭐', '✨', '🌟', '💫', '🏆', '💎'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* 失败时的粒子 */}
      {!isVictory && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-6 bg-red-500/30 rounded-full animate-rain opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${0.1 + Math.random() * 1.5}s`,
                animationDuration: `${2 + Math.random() * 1.5}s`,
                animationFillMode: 'forwards',
              }}
            />
          ))}
        </div>
      )}

      {/* 主内容 - 修复: 使用modalPopIn动画确保从中心弹出，无位置偏移 */}
      <div 
        className="relative z-10 text-center"
        style={{
          animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          transformOrigin: 'center center',
        }}
      >
        {/* 外发光 */}
        <div
          className={cn(
            'absolute -inset-16 blur-3xl opacity-50 rounded-full',
            isVictory
              ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500'
              : 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700'
          )}
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />

        {/* 大图标 */}
        <div
          className={cn(
            'text-8xl mb-6 relative z-10',
            isVictory && 'animate-bounce'
          )}
          style={{ animationDuration: '2s' }}
        >
          {isVictory ? '🏆' : '💀'}
        </div>

        {/* 标题 */}
        <h1
          className={cn(
            'text-6xl font-black mb-4 text-stroke',
            isVictory ? 'text-gradient-gold' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600'
          )}
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          {isVictory ? '胜 利!' : '失 败...'}
        </h1>

        {/* 副标题 */}
        <p className="text-white/60 text-xl mb-8">
          {isVictory ? '你成功击败了敌人!' : '你被击败了，再接再厉!'}
        </p>

        {/* 统计数据 */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <span className="px-4 py-1 rounded-full bg-slate-800/60 text-white/70 text-sm border border-white/10">
              难度: {DIFFICULTY_CONFIG[difficulty].icon} {DIFFICULTY_CONFIG[difficulty].name}
            </span>
          </div>
          
          {(mode === 'challenge' || mode === 'endless' || mode === 'classic' || mode === 'quick') && (
            <div className="flex justify-center gap-8 flex-wrap">
              {(mode === 'challenge' || mode === 'endless') && (
                <>
                  <div className="text-center">
                    <div
                      className="text-4xl font-black text-amber-400 text-stroke"
                      style={{ fontFamily: "'Cinzel Decorative', serif" }}
                    >
                      {score}
                    </div>
                    <div className="text-white/50 text-sm mt-1">最终得分</div>
                  </div>

                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />

                  <div className="text-center">
                    <div
                      className="text-4xl font-black text-purple-400 text-stroke"
                      style={{ fontFamily: "'Cinzel Decorative', serif" }}
                    >
                      {wave}
                    </div>
                    <div className="text-white/50 text-sm mt-1">到达波次</div>
                  </div>

                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />

                  <div className="text-center">
                    <div
                      className="text-4xl font-black text-emerald-400 text-stroke"
                      style={{ fontFamily: "'Cinzel Decorative', serif" }}
                    >
                      {streak}
                    </div>
                    <div className="text-white/50 text-sm mt-1">最高连击</div>
                  </div>
                </>
              )}
              
              {(mode === 'classic' || mode === 'quick') && (
                <>
                  <div className="text-center">
                    <div
                      className="text-4xl font-black text-purple-400 text-stroke"
                      style={{ fontFamily: "'Cinzel Decorative', serif" }}
                    >
                      {level} / {maxLevel}
                    </div>
                    <div className="text-white/50 text-sm mt-1">通关进度</div>
                  </div>

                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />

                  <div className="text-center">
                    <div
                      className="text-4xl font-black text-emerald-400 text-stroke"
                      style={{ fontFamily: "'Cinzel Decorative', serif" }}
                    >
                      {score}
                    </div>
                    <div className="text-white/50 text-sm mt-1">最终得分</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex flex-col gap-3 w-72 mx-auto">
          <button
            onClick={handleRestart}
            className={cn(
              'group relative px-8 py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden',
              isVictory
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-lg shadow-amber-500/30'
                : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 shadow-lg shadow-red-500/30'
            )}
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            <span className="relative z-10">
              {isVictory ? '🎮 再来一局' : '💪 再试一次'}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </button>

          <button
            onClick={goToMenu}
            className="group relative px-8 py-3 rounded-xl font-bold text-white/70 bg-slate-800/60 hover:bg-slate-700/60 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10 hover:border-amber-500/30"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            🏠 返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
