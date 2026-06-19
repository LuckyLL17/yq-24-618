import { useGameStore } from '@/store/gameStore';
import ElementCard from './ElementCard';
import CharacterDisplay from './CharacterDisplay';
import ComboEffect from './ComboEffect';
import ManaCrystals from './ManaCrystals';
import { findCombo, ELEMENTS, CATEGORY_NAMES, CATEGORY_COLORS, getComboWithLevel } from '@/data/gameData';
import { cn } from '@/lib/utils';
import type { Card, Player } from '@/types/game';

interface PlayerPanelProps {
  playerNum: 1 | 2;
  player: Player;
  isCurrentTurn: boolean;
  isShaking: boolean;
  isReversed?: boolean;
  onCardClick: (card: Card) => void;
  onPlay: () => void;
  getComboCooldown: (comboId: string) => number;
  isComboOnCooldown: (comboId: string) => boolean;
  getCurrentComboLevel: (comboId: string) => number;
  isAnimating: boolean;
}

function PlayerPanel({
  playerNum,
  player,
  isCurrentTurn,
  isShaking,
  isReversed = false,
  onCardClick,
  onPlay,
  getComboCooldown,
  isComboOnCooldown,
  getCurrentComboLevel,
  isAnimating,
}: PlayerPanelProps) {
  const selectedCards = player.selectedCards;

  const previewCombo = selectedCards.length === 2
    ? findCombo(selectedCards[0].element, selectedCards[1].element)
    : null;

  const previewLevel = previewCombo ? getCurrentComboLevel(previewCombo.id) : 1;
  const previewCooldown = previewCombo ? getComboCooldown(previewCombo.id) : 0;
  const effectivePreviewCombo = previewCombo ? getComboWithLevel(previewCombo, previewLevel) : null;
  const onCooldown = previewCombo ? isComboOnCooldown(previewCombo.id) : false;

  const canPlay = selectedCards.length === 2 && previewCombo && !isAnimating && !onCooldown && isCurrentTurn;

  const handleCardClick = (card: Card) => {
    if (!isCurrentTurn || isAnimating) return;
    onCardClick(card);
  };

  const playerColor = playerNum === 1 ? 'from-blue-600/20 to-cyan-60/20' : 'from-red-600/20 to-orange-600/20';
  const playerGlow = playerNum === 1 ? 'shadow-cyan-500/30' : 'shadow-orange-500/30';
  const playerBorder = playerNum === 1 ? 'border-cyan-500/40' : 'border-orange-500/40';
  const playerText = playerNum === 1 ? 'text-cyan-400' : 'text-orange-400';

  return (
    <div className={cn(
      'flex-1 flex flex-col relative overflow-hidden',
      isReversed && 'flex-col-reverse',
      isCurrentTurn && 'ring-2 ring-inset',
      isCurrentTurn && playerNum === 1 && 'ring-cyan-400/50',
      isCurrentTurn && playerNum === 2 && 'ring-orange-400/50',
    )}>
      <div className={cn(
        'absolute inset-0 bg-gradient-to-b',
        playerColor,
        'pointer-events-none',
      )} />

      <div className="relative z-10 flex items-center justify-between px-4 py-2 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm',
            playerNum === 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-red-600',
          )}>
            P{playerNum}
          </div>
          <div>
            <div className={cn('font-bold', playerText)} style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              {player.name || `玩家 ${playerNum}`}
            </div>
            <div className="text-xs text-white/50">
              牌库: {player.deck.length}
            </div>
          </div>
        </div>

        {isCurrentTurn && (
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-bold animate-pulse',
            playerNum === 1 ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'bg-orange-500/30 text-orange-300 border border-orange-400/50',
          )}>
            ⚔️ 当前回合
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
        <div className={cn(
          'platform rounded-xl px-8 py-3',
          playerGlow,
          isShaking && 'animate-shake',
        )}>
          <CharacterDisplay
            character={player}
            isPlayer
            isShaking={isShaking}
            size="md"
          />
        </div>
        {/* 法力水晶展示 */}
        <div className={cn(
          'mt-2 z-10',
          isReversed && 'mt-0 mb-2'
        )}>
          <ManaCrystals current={player.mana} max={player.maxMana} size="sm" />
        </div>
      </div>

      <div className="relative z-10 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-3 pb-3">
        {previewCombo && selectedCards.length === 2 && (
          <div className="text-center mb-2">
            <div className={cn(
              'inline-flex items-center gap-2 px-4 py-1 rounded-full border text-sm',
              onCooldown
                ? 'bg-slate-800/70 border-slate-500/40'
                : cn('bg-purple-900/70 border-purple-400/40', playerBorder),
            )}>
              <span className="text-sm">{ELEMENTS[previewCombo.elements[0]].icon}</span>
              <span className="text-amber-400">+</span>
              <span className="text-sm">{ELEMENTS[previewCombo.elements[1]].icon}</span>
              <span className="text-white/60 mx-0.5">=</span>
              <span className={cn(
                'font-bold',
                onCooldown ? 'text-slate-400' : 'text-gradient-gold'
              )} style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.8rem' }}>
                {previewCombo.name}
              </span>
              {onCooldown && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-500/80 text-white">
                  冷却 {previewCooldown}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 mb-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={cn(
                'w-14 h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300',
                selectedCards[i]
                  ? cn('border-amber-400/60 bg-amber-400/10 scale-105', playerBorder)
                  : 'border-white/10 bg-white/5'
              )}
            >
              {selectedCards[i] ? (
                <div className="text-2xl animate-pulse">
                  {ELEMENTS[selectedCards[i].element].icon}
                </div>
              ) : (
                <span className="text-white/20 text-xl">?</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center items-end mb-2 px-2">
          <div className="flex items-end">
            {player.hand.map((card, index) => {
              const isSelected = selectedCards.find((c) => c.id === card.id);
              const totalCards = player.hand.length;
              const middleIndex = (totalCards - 1) / 2;
              const rotation = (index - middleIndex) * 3;
              const yOffset = Math.abs(index - middleIndex) * 3;

              const selectedManaCost = selectedCards.reduce((sum, c) => sum + c.manaCost, 0);
              const remainingMana = player.mana - selectedManaCost;
              const wouldExceedMana = !isSelected && card.manaCost > remainingMana;

              return (
                <div
                  key={card.id}
                  className="transition-all duration-300 -ml-3 first:ml-0"
                  style={{
                    transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                    transformOrigin: 'bottom center',
                    zIndex: isSelected ? 20 : index,
                  }}
                >
                  <ElementCard
                    card={card}
                    isSelected={!!isSelected}
                    onClick={() => handleCardClick(card)}
                    disabled={!isCurrentTurn || isAnimating}
                    insufficientMana={wouldExceedMana}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onPlay}
            disabled={!canPlay}
            className={cn(
              'px-10 py-2 rounded-lg font-bold text-sm transition-all duration-300',
              'border',
              canPlay
                ? cn(
                    'text-white hover:scale-105 active:scale-95 shadow-lg',
                    playerNum === 1
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 border-cyan-300/50 shadow-cyan-500/40 hover:shadow-cyan-500/60'
                      : 'bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 border-orange-300/50 shadow-orange-500/40 hover:shadow-orange-500/60',
                  )
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
            )}
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {selectedCards.length === 0
              ? '选择两张卡牌'
              : selectedCards.length === 1
              ? '再选一张'
              : !previewCombo
              ? '无效组合'
              : onCooldown
              ? `冷却中 (${previewCooldown})`
              : `释放 ${previewCombo.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DuoBattleScene() {
  const {
    player,
    player2,
    turn,
    currentDuoPlayer,
    duoLayout,
    playerShaking,
    player2Shaking,
    isAnimating,
    showComboEffect,
    currentCombo,
    goToMenu,
    duoSelectCard,
    duoDeselectCard,
    duoPlaySelectedCards,
    duoIsComboOnCooldown,
    duoGetComboCooldown,
    duoGetCurrentComboLevel,
    setDuoLayout,
    duoWinner,
    phase,
  } = useGameStore();

  const handleCardClick = (playerNum: 1 | 2, card: Card) => {
    const targetPlayer = playerNum === 1 ? player : player2;
    if (!targetPlayer) return;
    
    if (targetPlayer.selectedCards.find((c) => c.id === card.id)) {
      duoDeselectCard(playerNum, card.id);
    } else {
      duoSelectCard(playerNum, card);
    }
  };

  const handlePlay = (playerNum: 1 | 2) => {
    duoPlaySelectedCards(playerNum);
  };

  if (!player2) return null;

  const isHorizontal = duoLayout === 'horizontal';

  return (
    <div className={cn(
      'min-h-screen w-full flex relative overflow-hidden battle-ground',
      isHorizontal ? 'flex-row' : 'flex-col',
    )}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
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

      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-orange-500/20 blur-xl rounded-full" />
          <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-full px-6 py-2 border border-amber-500/30">
            <div className="text-center">
              <div className="text-xs text-white/50">回合</div>
              <div className="text-xl font-black text-amber-400 text-stroke" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                {turn}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        <button
          onClick={goToMenu}
          className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-amber-500/30 text-sm"
        >
          ← 返回菜单
        </button>

        <button
          onClick={() => setDuoLayout(isHorizontal ? 'vertical' : 'horizontal')}
          className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-amber-500/30 text-sm flex items-center gap-2"
        >
          {isHorizontal ? '⬍ 上下分屏' : '⬌ 左右分屏'}
        </button>
      </div>

      <PlayerPanel
        playerNum={1}
        player={player}
        isCurrentTurn={currentDuoPlayer === 1}
        isShaking={playerShaking}
        isReversed={!isHorizontal}
        onCardClick={(card) => handleCardClick(1, card)}
        onPlay={() => handlePlay(1)}
        getComboCooldown={(id) => duoGetComboCooldown(1, id)}
        isComboOnCooldown={(id) => duoIsComboOnCooldown(1, id)}
        getCurrentComboLevel={(id) => duoGetCurrentComboLevel(1, id)}
        isAnimating={isAnimating}
      />

      {isHorizontal ? (
        <div className="relative w-1 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-sm">
              VS
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-sm">
              VS
            </div>
          </div>
        </div>
      )}

      <PlayerPanel
        playerNum={2}
        player={player2}
        isCurrentTurn={currentDuoPlayer === 2}
        isShaking={player2Shaking}
        isReversed={isHorizontal}
        onCardClick={(card) => handleCardClick(2, card)}
        onPlay={() => handlePlay(2)}
        getComboCooldown={(id) => duoGetComboCooldown(2, id)}
        isComboOnCooldown={(id) => duoIsComboOnCooldown(2, id)}
        getCurrentComboLevel={(id) => duoGetCurrentComboLevel(2, id)}
        isAnimating={isAnimating}
      />

      {currentCombo && (
        <ComboEffect
          combo={currentCombo}
          show={showComboEffect}
          level={1}
        />
      )}

      {duoWinner && phase === 'victory' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />
          {/* 修复: 使用modalPopIn动画替代animate-rise，确保从中心弹出 */}
          <div 
            className="relative z-10 text-center"
            style={{
              animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              transformOrigin: 'center center',
            }}
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-5xl font-black text-gradient-gold mb-4" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              玩家 {duoWinner} 获胜!
            </h2>
            <p className="text-white/60 mb-8">
              共进行了 {turn} 回合
            </p>
            <button
              onClick={goToMenu}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-orange-500/40 border-2 border-amber-300/50"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              返回主菜单
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
