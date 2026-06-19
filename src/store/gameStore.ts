import { create } from 'zustand';
import type { GameState, Card, ComboSkill, Player, GameMode, BossIntentType, Difficulty, ComboCategory, PlayerCosmetics, TutorialStep, CollectedCard, ElementType, Rarity, DuoScreenLayout, CardTag, CardNote, GameAccount, GameSaveSlot, DailyQuestState } from '@/types/game';
import type { PlayerStore, EnemyStore, BattleStore, UIStore } from '@/types/store';
import { 
  savePermanentData, saveBattleData, loadPermanentData, loadBattleData, clearBattleSave, 
  hasBattleSave, hasPermanentSave, getAccounts, createAccount as libCreateAccount, 
  deleteAccount as libDeleteAccount, getCurrentAccount, setCurrentAccountId, 
  updateAccount as libUpdateAccount, getSaveSlots, saveToSlot, 
  deleteSaveSlot as libDeleteSaveSlot, renameSaveSlot as libRenameSaveSlot,
  migrateLegacySavesToAccount, getSaveSlot as libGetSaveSlot
} from '@/lib/gameSave';
import { 
  COMBOS, DIFFICULTY_CONFIG, CLASSIC_LEVELS, QUICK_LEVELS, 
  generateDailyQuests, getTodayString, REFRESH_COST, CARD_PACKS, 
  CARD_BORDERS, SHOP_AVATARS, CARD_VARIANTS, DISASSEMBLE_ESSENCE, 
  SYNTHESIZE_ESSENCE, RARITY_NAMES, createCardByRarityWeight,
  getComboLevel, getComboWithLevel, createDeck
} from '@/data/gameData';
import { usePlayerStore, initialPlayerState } from './playerStore';
import { useEnemyStore } from './enemyStore';
import { useBattleStore } from './battleStore';
import { useUIStore } from './uiStore';

const getStores = () => ({
  playerStore: usePlayerStore.getState() as PlayerStore,
  enemyStore: useEnemyStore.getState() as EnemyStore,
  battleStore: useBattleStore.getState() as BattleStore,
  uiStore: useUIStore.getState() as UIStore,
});

declare global {
  interface Window {
    __playerStore: typeof usePlayerStore;
    __enemyStore: typeof useEnemyStore;
    __battleStore: typeof useBattleStore;
    __uiStore: typeof useUIStore;
    __updateQuestProgress: (type: string, value: number, comboId?: string, category?: ComboCategory) => void;
    __addCardToCollection: (card: Card) => void;
    __getEquippedMyCards: () => CollectedCard[];
    __createDeck: typeof createDeck;
  }
}

if (typeof window !== 'undefined') {
  window.__playerStore = usePlayerStore;
  window.__enemyStore = useEnemyStore;
  window.__battleStore = useBattleStore;
  window.__uiStore = useUIStore;
  window.__createDeck = createDeck;
  window.__updateQuestProgress = (type, value, comboId, category) => {
    useGameStore.getState().updateQuestProgress(type, value, comboId, category);
  };
  window.__addCardToCollection = (card) => {
    useGameStore.getState().addCardToCollection(card);
  };
  window.__getEquippedMyCards = () => {
    return useGameStore.getState().getEquippedMyCards();
  };
}

interface CosmeticsState {
  cosmetics: PlayerCosmetics;
}

interface CosmeticsActions {
  getCollection: () => CollectedCard[];
  getCollectionStats: () => { total: number; unique: number; byRarity: Record<string, number> };
  getEquippedCardBorder: () => string | null;
  getEquippedAvatar: () => string | null;
  isCardBorderOwned: (borderId: string) => boolean;
  isAvatarOwned: (avatarId: string) => boolean;
  getEquippedCardBorderData: () => typeof CARD_BORDERS[0] | null;
  getEquippedAvatarData: () => typeof SHOP_AVATARS[0] | null;
  buyCardPack: (packId: string) => Card[] | null;
  buyCardBorder: (borderId: string) => boolean;
  buyAvatar: (avatarId: string) => boolean;
  equipCardBorder: (borderId: string | null) => void;
  equipAvatar: (avatarId: string | null) => void;
  toggleShop: () => void;
  toggleMyCards: () => void;
  toggleCollection: () => void;
  disassembleCard: (cardId: string, count?: number) => number | null;
  disassembleAllDuplicates: () => number;
  synthesizeCard: (element: ElementType, cardName: string) => CollectedCard | null;
  getSynthesizeCost: (rarity: Rarity) => number;
  getDisassembleValue: (rarity: Rarity) => number;
  getAllCardTemplates: () => Array<{ element: ElementType; name: string; description: string; power: number; rarity: Rarity; manaCost: number; skillType?: string; skillValue?: number }>;
  equipMyCard: (cardId: string) => boolean;
  unequipMyCard: (cardId: string) => void;
  getEquippedMyCards: () => CollectedCard[];
  addCardToCollection: (card: Card) => void;
  selectMyCard: (cardId: string) => void;
  useMyCard: (cardId: string) => boolean;
  isMyCardOnCooldown: (cardId: string) => boolean;
  resetMyCardCooldowns: () => void;
  getCardTags: () => CardTag[];
  addCardTag: (name: string, color: string) => CardTag | null;
  updateCardTag: (tagId: string, name: string, color: string) => boolean;
  deleteCardTag: (tagId: string) => boolean;
  getCardNote: (cardId: string) => CardNote | undefined;
  getCardNotes: () => CardNote[];
  saveCardNote: (cardId: string, content: string, tags: string[]) => CardNote | null;
  deleteCardNote: (cardId: string) => boolean;
  getCardsByTag: (tagId: string) => CollectedCard[];
}

interface DailyQuestStateType {
  dailyQuests: DailyQuestState;
}

interface DailyQuestActions {
  toggleDailyQuests: () => void;
  refreshDailyQuests: () => boolean;
  claimQuestReward: (questId: string) => boolean;
  updateQuestProgress: (type: string, value: number, comboId?: string, category?: ComboCategory) => void;
  checkDailyRefresh: () => void;
  trackComboUse: (combo: ComboSkill) => void;
  trackDamage: (amount: number) => void;
  trackWin: () => void;
  trackWave: (wave: number) => void;
}

interface TutorialStateType {
  tutorial: {
    tutorialCompleted: boolean;
    showTutorial: boolean;
    currentStep: TutorialStep;
  };
}

interface TutorialActions {
  startTutorial: () => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  setTutorialStep: (step: TutorialStep) => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  isTutorialCompleted: () => boolean;
}

interface AccountState {
  currentAccount: GameAccount | null;
  accounts: GameAccount[];
  showAccountManager: boolean;
  showSaveManager: boolean;
  isPaused: boolean;
}

interface AccountActions {
  getAllAccounts: () => GameAccount[];
  createNewAccount: (name: string, avatar?: string) => GameAccount;
  removeAccount: (accountId: string) => void;
  switchAccount: (accountId: string) => void;
  modifyAccount: (updates: Partial<Omit<GameAccount, 'id' | 'createdAt'>>) => void;
  toggleAccountManager: () => void;
  toggleSaveManager: () => void;
  setShowAccountManager: (show: boolean) => void;
  setShowSaveManager: (show: boolean) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  saveGameToSlot: (slotId: 1 | 2 | 3, slotName?: string) => GameSaveSlot;
  loadGameFromSlot: (slotId: 1 | 2 | 3) => boolean;
  removeSaveSlot: (slotId: 1 | 2 | 3) => void;
  renameGameSaveSlot: (slotId: 1 | 2 | 3, slotName: string) => void;
  getAccountSaveSlots: () => GameSaveSlot[];
  getAccountSaveSlot: (slotId: 1 | 2 | 3) => GameSaveSlot | null;
  restartGame: () => void;
  initAccountSystem: () => void;
}

interface GameActions extends CosmeticsActions, DailyQuestActions, TutorialActions, AccountActions {
  startBattle: (mode?: GameMode, difficulty?: Difficulty) => void;
  startChallenge: (difficulty?: Difficulty) => void;
  startEndless: (difficulty?: Difficulty) => void;
  startQuick: (difficulty?: Difficulty) => void;
  continueGame: () => boolean;
  hasSave: () => boolean;
  hasPermanent: () => boolean;
  saveGame: () => void;
  goToMenu: () => void;
  selectCard: (card: Card) => void;
  deselectCard: (cardId: string) => void;
  playSelectedCards: () => void;
  enemyTurn: () => void;
  nextTurn: () => void;
  drawCards: (count: number) => void;
  takeDamage: (target: 'player' | 'enemy', damage: number) => void;
  heal: (amount: number) => void;
  addShield: (amount: number) => void;
  applyStatusEffects: () => void;
  setAnimating: (value: boolean) => void;
  showCombo: (combo: ComboSkill) => void;
  hideCombo: () => void;
  addScore: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  nextWave: () => void;
  nextLevel: () => void;
  addFloatingText: (type: 'damage' | 'heal' | 'shield', value: number, target: 'player' | 'enemy') => void;
  removeFloatingText: (id: string) => void;
  setShaking: (target: 'player' | 'enemy', value: boolean) => void;
  getComboCooldown: (comboId: string) => number;
  isComboOnCooldown: (comboId: string) => boolean;
  upgradeCombo: (comboId: string) => boolean;
  getCurrentComboLevel: (comboId: string) => number;
  applyPlayerStatusEffects: () => void;
  toggleUpgradePanel: () => void;
  getUpgradeCost: (comboId: string) => number;
  addEssence: (amount: number) => void;
  checkBossPhaseTransition: () => void;
  transitionBossPhase: () => void;
  useEnemyAbility: (abilityId: string) => void;
  updateEnemyIntent: () => void;
  decrementAbilityCooldowns: () => void;
  showLevelCompleteScreen: (essenceReward: number) => void;
  hideLevelCompleteScreen: () => void;
  proceedToNextLevel: () => void;
  getBattleCardReward: () => Card | null;
  startDuo: (layout?: DuoScreenLayout) => void;
  duoSelectCard: (playerNum: 1 | 2, card: Card) => void;
  duoDeselectCard: (playerNum: 1 | 2, cardId: string) => void;
  duoPlaySelectedCards: (playerNum: 1 | 2) => void;
  duoNextTurn: () => void;
  duoIsComboOnCooldown: (playerNum: 1 | 2, comboId: string) => boolean;
  duoGetComboCooldown: (playerNum: 1 | 2, comboId: string) => number;
  duoGetCurrentComboLevel: (playerNum: 1 | 2, comboId: string) => number;
  setDuoLayout: (layout: DuoScreenLayout) => void;
  getStreakDamageBonus: () => number;
  calculateDamageTier: (damage: number) => import('@/types/game').DamageTier;
  calculateBattleRating: () => import('@/types/game').BattleRating;
  addDamageFloatingText: (damage: number, target: 'player' | 'enemy', element?: ElementType) => void;
  addComboFloatingText: (comboCount: number, damageBonus: number) => void;
  showBattleRatingEffect: () => void;
  hideBattleRating: () => void;
}

const initialCosmeticsState = (): PlayerCosmetics => ({
  ownedCardBorders: [],
  ownedAvatars: [],
  equippedCardBorder: null,
  equippedAvatar: null,
  openedCardPacks: [],
  collection: [],
  equippedMyCards: [],
  cardTags: [
    { id: 'tag_default_1', name: '常用', color: '#10b981' },
    { id: 'tag_default_2', name: '组合技', color: '#8b5cf6' },
    { id: 'tag_default_3', name: '待研究', color: '#f59e0b' },
  ],
  cardNotes: [],
});

const initialDailyQuestState = (): DailyQuestState => ({
  quests: generateDailyQuests(3),
  lastRefreshDate: getTodayString(),
  freeRefreshUsed: false,
  sessionDamage: 0,
  sessionCombos: [],
  sessionWins: 0,
  sessionMaxWave: 0,
  sessionComboCategories: [],
});

const loadInitialState = (): GameState & CosmeticsState & DailyQuestStateType & TutorialStateType & AccountState => {
  const accounts = getAccounts();
  const currentAccount = getCurrentAccount();

  const baseState = {
    phase: 'menu' as const,
    mode: 'classic' as GameMode,
    difficulty: 'normal' as Difficulty,
    turn: 1,
    player: usePlayerStore.getState().player,
    enemy: null,
    comboHistory: [],
    streak: 0,
    score: 0,
    elementEssence: 0,
    isAnimating: false,
    currentCombo: null,
    showComboEffect: false,
    showUpgradePanel: false,
    showLevelComplete: false,
    levelEssenceReward: 0,
    wave: 1,
    level: 1,
    maxLevel: 5,
    floatingTexts: [],
    enemyShaking: false,
    playerShaking: false,
    dailyQuests: initialDailyQuestState(),
    showDailyQuests: false,
    showShop: false,
    showMyCards: false,
    showCollection: false,
    cosmetics: initialCosmeticsState(),
    tutorial: {
      tutorialCompleted: false,
      showTutorial: false,
      currentStep: 'welcome' as const,
    },
    myCardUsedIds: [],
    levelCardReward: null,
    player2: null,
    currentDuoPlayer: 1 as const,
    duoLayout: 'horizontal' as const,
    player2Shaking: false,
    duoWinner: null,
    maxStreak: 0,
    totalDamageDealt: 0,
    totalHealingDone: 0,
    combosUsed: 0,
    showStreakBonus: false,
    lastStreakBonus: 0,
    battleRating: null,
    showBattleRating: false,
    highestHitDamage: 0,
    currentAccount,
    accounts,
    showAccountManager: accounts.length === 0,
    showSaveManager: false,
    isPaused: false,
  };

  const permanentData = loadPermanentData();
  if (permanentData) {
    baseState.elementEssence = permanentData.elementEssence ?? 0;
    baseState.player.comboLevels = permanentData.comboLevels ?? baseState.player.comboLevels;
    baseState.dailyQuests = permanentData.dailyQuests ?? baseState.dailyQuests;
    baseState.tutorial.tutorialCompleted = permanentData.tutorialCompleted ?? false;
    if (permanentData.cosmetics) {
      baseState.cosmetics = {
        ...initialCosmeticsState(),
        ...permanentData.cosmetics,
      };
    }
  }

  return baseState;
};

const initialState = loadInitialState();

export const useGameStore = create<GameState & GameActions & CosmeticsState & DailyQuestStateType & TutorialStateType & AccountState>((set, get) => ({
  ...initialState,

  hasSave: () => hasBattleSave(),
  hasPermanent: () => hasPermanentSave(),

  saveGame: () => {
    const state = get();
    const { battleStore } = getStores();
    const { playerStore, enemyStore } = getStores();
    
    savePermanentData({
      elementEssence: battleStore.elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: state.dailyQuests,
      cosmetics: state.cosmetics,
      tutorialCompleted: state.tutorial.tutorialCompleted,
    });

    if (battleStore.phase === 'battle') {
      saveBattleData({
        phase: battleStore.phase,
        mode: battleStore.mode,
        difficulty: battleStore.difficulty,
        turn: battleStore.turn,
        player: playerStore.player,
        player2: playerStore.player2,
        currentDuoPlayer: playerStore.currentDuoPlayer,
        enemy: enemyStore.enemy,
        wave: battleStore.wave,
        level: battleStore.level,
        maxLevel: battleStore.maxLevel,
        score: battleStore.score,
        streak: battleStore.streak,
        comboHistory: battleStore.comboHistory,
        comboCooldowns: playerStore.player.comboCooldowns,
      });
    }
  },

  continueGame: (): boolean => {
    const battleData = loadBattleData();
    if (!battleData) return false;

    const permanentData = loadPermanentData();
    const comboLevels = permanentData?.comboLevels || [];

    const { playerStore, enemyStore, battleStore, uiStore } = getStores();
    
    playerStore.setPlayer({
      ...battleData.player,
      comboLevels,
    });
    if (battleData.player2) {
      playerStore.setPlayer2(battleData.player2);
    }
    if (battleData.currentDuoPlayer) {
      playerStore.setCurrentDuoPlayer(battleData.currentDuoPlayer);
    }
    enemyStore.setEnemy(battleData.enemy);

    useBattleStore.setState({
      phase: battleData.phase,
      mode: battleData.mode,
      difficulty: battleData.difficulty,
      turn: battleData.turn,
      wave: battleData.wave,
      level: battleData.level,
      maxLevel: battleData.maxLevel,
      score: battleData.score,
      streak: battleData.streak,
      comboHistory: battleData.comboHistory,
    });

    if (battleData.comboCooldowns) {
      playerStore.setComboCooldowns(battleData.comboCooldowns);
    }

    useUIStore.setState({
      isAnimating: false,
      currentCombo: null,
      showComboEffect: false,
      floatingTexts: [],
      showLevelComplete: false,
    });

    set({
      levelEssenceReward: 0,
    });

    return true;
  },

  startBattle: (mode: GameMode = 'classic', difficulty: Difficulty = 'normal') => {
    const { battleStore } = getStores();
    battleStore.startBattle(mode, difficulty);
    
    set({
      elementEssence: useBattleStore.getState().elementEssence,
    });
    
    setTimeout(() => get().saveGame(), 0);
  },

  startChallenge: (difficulty: Difficulty = 'normal') => {
    get().startBattle('challenge', difficulty);
  },

  startEndless: (difficulty: Difficulty = 'normal') => {
    get().startBattle('endless', difficulty);
  },

  startQuick: (difficulty: Difficulty = 'normal') => {
    get().startBattle('quick', difficulty);
  },

  goToMenu: () => {
    get().saveGame();
    useBattleStore.getState().goToMenu();
  },

  selectCard: (card: Card) => {
    const { playerStore, uiStore, enemyStore, battleStore } = getStores();
    if (uiStore.isAnimating) return;
    if (!enemyStore.enemy || enemyStore.enemy.hp <= 0) return;
    if (uiStore.showLevelComplete) return;
    playerStore.selectCard(card);
  },

  deselectCard: (cardId: string) => {
    const { playerStore, uiStore, enemyStore } = getStores();
    if (uiStore.isAnimating) return;
    if (uiStore.showLevelComplete) return;
    if (!enemyStore.enemy || enemyStore.enemy.hp <= 0) return;
    playerStore.deselectCard(cardId);
  },

  playSelectedCards: () => {
    const { battleStore } = getStores();
    battleStore.playSelectedCards();
  },

  enemyTurn: () => {
    const { battleStore } = getStores();
    battleStore.enemyTurn();
  },

  nextTurn: () => {
    const { battleStore } = getStores();
    battleStore.nextTurn();
    setTimeout(() => get().saveGame(), 0);
  },

  drawCards: (count: number) => {
    const { playerStore } = getStores();
    playerStore.drawCards(count);
  },

  takeDamage: (target: 'player' | 'enemy', damage: number) => {
    const { playerStore, enemyStore } = getStores();
    if (target === 'player') {
      playerStore.takeDamage(damage);
    } else if (target === 'enemy') {
      enemyStore.updateEnemyHp(enemyStore.enemy ? enemyStore.enemy.hp - damage : 0);
    }
  },

  heal: (amount: number) => {
    const { playerStore } = getStores();
    playerStore.heal(amount);
  },

  addShield: (amount: number) => {
    const { playerStore } = getStores();
    playerStore.addShield(amount);
  },

  applyStatusEffects: () => {
    const { enemyStore } = getStores();
    const result = enemyStore.applyEnemyStatusEffects();
    
    if (result.totalDamage > 0) {
      get().trackDamage(result.totalDamage);
    }

    if (result.enemyDied) {
      const dotKillEssence = 6 + useBattleStore.getState().wave * 2;
      useBattleStore.getState().addEssence(dotKillEssence);
      get().trackWin();
    }
  },

  setAnimating: (value: boolean) => {
    const { uiStore } = getStores();
    uiStore.setAnimating(value);
  },

  showCombo: (combo: ComboSkill) => {
    const { uiStore } = getStores();
    uiStore.showCombo(combo);
  },

  hideCombo: () => {
    const { uiStore } = getStores();
    uiStore.hideCombo();
  },

  addScore: (points: number) => {
    const { battleStore } = getStores();
    battleStore.addScore(points);
  },

  incrementStreak: () => {
    const { battleStore } = getStores();
    battleStore.incrementStreak();
  },

  resetStreak: () => {
    const { battleStore } = getStores();
    battleStore.resetStreak();
  },

  nextWave: () => {
    const { battleStore } = getStores();
    battleStore.nextWave();
    setTimeout(() => get().saveGame(), 0);
  },

  nextLevel: () => {
    const { battleStore } = getStores();
    battleStore.nextLevel();
    setTimeout(() => get().saveGame(), 0);
  },

  showLevelCompleteScreen: (essenceReward: number) => {
    const { uiStore } = getStores();
    uiStore.showLevelCompleteScreen(essenceReward);
    set({ levelEssenceReward: essenceReward });
  },

  hideLevelCompleteScreen: () => {
    const { uiStore } = getStores();
    uiStore.hideLevelCompleteScreen();
  },

  proceedToNextLevel: () => {
    const { uiStore, battleStore } = getStores();
    uiStore.hideLevelCompleteScreen();
    battleStore.nextLevel();
  },

  addFloatingText: (type: 'damage' | 'heal' | 'shield', value: number, target: 'player' | 'enemy') => {
    const { uiStore } = getStores();
    uiStore.addFloatingText(type, value, target);
  },

  removeFloatingText: (id: string) => {
    const { uiStore } = getStores();
    uiStore.removeFloatingText(id);
  },

  setShaking: (target: 'player' | 'enemy', value: boolean) => {
    const { uiStore } = getStores();
    uiStore.setShaking(target, value);
  },

  getComboCooldown: (comboId: string) => {
    const { playerStore } = getStores();
    return playerStore.getComboCooldown(comboId);
  },

  isComboOnCooldown: (comboId: string) => {
    const { playerStore } = getStores();
    return playerStore.isComboOnCooldown(comboId);
  },

  upgradeCombo: (comboId: string): boolean => {
    const battleState = useBattleStore.getState();
    const combo = COMBOS.find((c) => c.id === comboId);
    if (!combo || !combo.canUpgrade || !combo.upgrades) return false;

    const { playerStore } = getStores();
    const currentLevel = playerStore.getCurrentComboLevel(comboId);
    const maxLevel = combo.upgrades.length + 1;
    if (currentLevel >= maxLevel) return false;

    const cost = get().getUpgradeCost(comboId);
    if (battleState.elementEssence < cost) return false;

    playerStore.setComboLevel(comboId, currentLevel + 1);
    useBattleStore.setState({
      elementEssence: battleState.elementEssence - cost,
    });

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
    });

    return true;
  },

  getCurrentComboLevel: (comboId: string) => {
    const { playerStore } = getStores();
    return playerStore.getCurrentComboLevel(comboId);
  },

  applyPlayerStatusEffects: () => {
    const { playerStore } = getStores();
    playerStore.applyPlayerStatusEffects();
  },

  toggleUpgradePanel: () => {
    const { uiStore } = getStores();
    uiStore.toggleUpgradePanel();
  },

  getUpgradeCost: (comboId: string): number => {
    const combo = COMBOS.find((c) => c.id === comboId);
    if (!combo || !combo.canUpgrade || !combo.upgrades) return 0;

    const currentLevel = get().getCurrentComboLevel(comboId);
    const baseCost = combo.rarity === 'legendary' ? 30 : combo.rarity === 'epic' ? 20 : 10;
    return baseCost * currentLevel;
  },

  addEssence: (amount: number) => {
    const { battleStore } = getStores();
    battleStore.addEssence(amount);
    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
    });
  },

  checkBossPhaseTransition: () => {
    const { enemyStore } = getStores();
    enemyStore.checkBossPhaseTransition();
  },

  transitionBossPhase: () => {
    const { enemyStore } = getStores();
    enemyStore.transitionBossPhase();
  },

  useEnemyAbility: (abilityId: string) => {
    const { enemyStore } = getStores();
    enemyStore.useEnemyAbility(abilityId);
  },

  updateEnemyIntent: () => {
    const { enemyStore } = getStores();
    enemyStore.updateEnemyIntent();
  },

  decrementAbilityCooldowns: () => {
    const { enemyStore } = getStores();
    enemyStore.decrementAbilityCooldowns();
  },

  toggleDailyQuests: () => {
    const { uiStore } = getStores();
    uiStore.toggleDailyQuests();
  },

  checkDailyRefresh: () => {
    const today = getTodayString();
    const state = get();
    if (state.dailyQuests.lastRefreshDate !== today) {
      set({
        dailyQuests: {
          quests: generateDailyQuests(3),
          lastRefreshDate: today,
          freeRefreshUsed: false,
          sessionDamage: 0,
          sessionCombos: [],
          sessionWins: 0,
          sessionMaxWave: 0,
          sessionComboCategories: [],
        },
      });
      savePermanentData({
        elementEssence: useBattleStore.getState().elementEssence,
        comboLevels: usePlayerStore.getState().player.comboLevels,
        dailyQuests: get().dailyQuests,
        cosmetics: get().cosmetics,
      });
    }
  },

  refreshDailyQuests: (): boolean => {
    const state = get();
    const { freeRefreshUsed } = state.dailyQuests;

    if (!freeRefreshUsed) {
      set({
        dailyQuests: {
          ...state.dailyQuests,
          quests: generateDailyQuests(3),
          freeRefreshUsed: true,
        },
      });
      savePermanentData({
        elementEssence: useBattleStore.getState().elementEssence,
        comboLevels: usePlayerStore.getState().player.comboLevels,
        dailyQuests: get().dailyQuests,
        cosmetics: get().cosmetics,
      });
      return true;
    }

    const battleState = useBattleStore.getState();
    if (battleState.elementEssence >= REFRESH_COST) {
      useBattleStore.setState({
        elementEssence: battleState.elementEssence - REFRESH_COST,
      });
      set((s) => ({
        dailyQuests: {
          ...s.dailyQuests,
          quests: generateDailyQuests(3),
        },
      }));
      savePermanentData({
        elementEssence: useBattleStore.getState().elementEssence,
        comboLevels: usePlayerStore.getState().player.comboLevels,
        dailyQuests: get().dailyQuests,
        cosmetics: get().cosmetics,
      });
      return true;
    }

    return false;
  },

  claimQuestReward: (questId: string): boolean => {
    const state = get();
    const quest = state.dailyQuests.quests.find((q) => q.id === questId);

    if (!quest || !quest.completed || quest.claimed) return false;

    const battleState = useBattleStore.getState();
    useBattleStore.setState({
      elementEssence: battleState.elementEssence + quest.reward,
    });

    set((s) => ({
      dailyQuests: {
        ...s.dailyQuests,
        quests: s.dailyQuests.quests.map((q) =>
          q.id === questId ? { ...q, claimed: true } : q
        ),
      },
    }));

    const cardDropChance = quest.rarity === 'common' ? 0.3 : quest.rarity === 'rare' ? 0.5 : 0.8;
    if (Math.random() < cardDropChance) {
      const rarityWeights = quest.rarity === 'common'
        ? { common: 70, rare: 25, epic: 4, legendary: 1 }
        : quest.rarity === 'rare'
        ? { common: 50, rare: 35, epic: 12, legendary: 3 }
        : { common: 30, rare: 30, epic: 28, legendary: 12 };
      const cardReward = createCardByRarityWeight(rarityWeights);
      get().addCardToCollection(cardReward);
    }

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
      tutorialCompleted: get().tutorial.tutorialCompleted,
    });

    return true;
  },

  updateQuestProgress: (type: string, value: number, comboId?: string, category?: ComboCategory) => {
    set((state) => {
      const updatedQuests = state.dailyQuests.quests.map((quest) => {
        if (quest.completed || quest.claimed) return quest;

        let shouldUpdate = false;

        if (quest.type === type) {
          if (type === 'use_combo' && quest.targetComboId === comboId) {
            shouldUpdate = true;
          } else if (type === 'use_combo_category' && quest.targetCategory === category) {
            shouldUpdate = true;
          } else if (type === 'win_battle' || type === 'total_damage' || type === 'reach_wave') {
            shouldUpdate = true;
          }
        }

        if (!shouldUpdate) return quest;

        const newProgress = Math.min(quest.target, quest.progress + value);
        const completed = newProgress >= quest.target;

        return {
          ...quest,
          progress: newProgress,
          completed,
        };
      });

      return {
        dailyQuests: {
          ...state.dailyQuests,
          quests: updatedQuests,
        },
      };
    });
  },

  trackComboUse: (combo: ComboSkill) => {
    get().updateQuestProgress('use_combo', 1, combo.id);
    get().updateQuestProgress('use_combo_category', 1, undefined, combo.category);
  },

  trackDamage: (amount: number) => {
    if (amount <= 0) return;
    set((state) => ({
      dailyQuests: {
        ...state.dailyQuests,
        sessionDamage: state.dailyQuests.sessionDamage + amount,
      },
    }));
    get().updateQuestProgress('total_damage', amount);
  },

  trackWin: () => {
    set((state) => ({
      dailyQuests: {
        ...state.dailyQuests,
        sessionWins: state.dailyQuests.sessionWins + 1,
      },
    }));
    get().updateQuestProgress('win_battle', 1);
  },

  trackWave: (wave: number) => {
    const state = get();
    if (wave > state.dailyQuests.sessionMaxWave) {
      set((s) => ({
        dailyQuests: {
          ...s.dailyQuests,
          sessionMaxWave: wave,
        },
      }));
      get().updateQuestProgress('reach_wave', 1);
    }
  },

  toggleShop: () => {
    const { uiStore } = getStores();
    uiStore.toggleShop();
  },

  buyCardPack: (packId: string): Card[] | null => {
    const battleState = useBattleStore.getState();
    const pack = CARD_PACKS.find((p) => p.id === packId);
    if (!pack) return null;
    if (battleState.elementEssence < pack.price) return null;

    const cards: Card[] = [];
    const rarityWeights: Record<string, number> = {
      common: 60,
      rare: 30,
      epic: 8,
      legendary: 2,
    };

    const pickRarity = (guaranteed?: string): string => {
      if (guaranteed) {
        const guaranteedWeights: Record<string, number> = {
          common: 0,
          rare: 50,
          epic: 35,
          legendary: 15,
        };
        if (guaranteed === 'epic') {
          guaranteedWeights.epic = 70;
          guaranteedWeights.legendary = 30;
        } else if (guaranteed === 'legendary') {
          guaranteedWeights.legendary = 100;
        }
        const totalWeight = Object.values(guaranteedWeights).reduce((a, b) => a + b, 0);
        let rand = Math.random() * totalWeight;
        for (const [rarity, weight] of Object.entries(guaranteedWeights)) {
          rand -= weight;
          if (rand <= 0) return rarity;
        }
        return guaranteed;
      }
      const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      for (const [rarity, weight] of Object.entries(rarityWeights)) {
        rand -= weight;
        if (rand <= 0) return rarity;
      }
      return 'common';
    };

    const elements = ['fire', 'water', 'earth', 'wind', 'lightning', 'light', 'dark'] as const;

    for (let i = 0; i < pack.cardCount; i++) {
      const isGuaranteed = i === pack.cardCount - 1 && pack.guaranteedRarity;
      const rarity = pickRarity(isGuaranteed ? pack.guaranteedRarity : undefined);
      const element = elements[Math.floor(Math.random() * elements.length)];
      const variants = CARD_VARIANTS[element];
      const matchingVariants = variants.filter((v) => v.rarity === rarity);
      
      let variant;
      if (matchingVariants.length > 0) {
        variant = matchingVariants[Math.floor(Math.random() * matchingVariants.length)];
      } else {
        variant = variants[Math.floor(Math.random() * variants.length)];
      }

      const cardId = `pack_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      cards.push({
        id: cardId,
        element,
        name: variant.name,
        description: variant.description,
        power: variant.power,
        rarity: variant.rarity,
        manaCost: variant.manaCost,
        skillType: variant.skillType as Card['skillType'],
        skillValue: variant.skillValue,
      });
    }

    useBattleStore.setState({
      elementEssence: battleState.elementEssence - pack.price,
    });

    set((s) => {
      const newCollection = [...s.cosmetics.collection];
      
      for (const card of cards) {
        const collectionKey = `${card.element}_${card.name}`;
        const existingIndex = newCollection.findIndex((c) => `${c.element}_${c.name}` === collectionKey);
        
        if (existingIndex >= 0) {
          newCollection[existingIndex] = {
            ...newCollection[existingIndex],
            count: newCollection[existingIndex].count + 1,
          };
        } else {
          newCollection.push({
            id: collectionKey,
            element: card.element,
            name: card.name,
            description: card.description,
            power: card.power,
            rarity: card.rarity,
            manaCost: card.manaCost,
            skillType: card.skillType,
            skillValue: card.skillValue,
            count: 1,
            obtainedAt: Date.now(),
          });
        }
      }

      return {
        cosmetics: {
          ...s.cosmetics,
          openedCardPacks: [...s.cosmetics.openedCardPacks, packId],
          collection: newCollection,
        },
      };
    });

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
    });

    return cards;
  },

  buyCardBorder: (borderId: string): boolean => {
    const battleState = useBattleStore.getState();
    const border = CARD_BORDERS.find((b) => b.id === borderId);
    if (!border) return false;
    if (battleState.elementEssence < border.price) return false;
    if (get().cosmetics.ownedCardBorders.includes(borderId)) return false;

    useBattleStore.setState({
      elementEssence: battleState.elementEssence - border.price,
    });

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        ownedCardBorders: [...s.cosmetics.ownedCardBorders, borderId],
      },
    }));

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
    });

    return true;
  },

  buyAvatar: (avatarId: string): boolean => {
    const battleState = useBattleStore.getState();
    const avatar = SHOP_AVATARS.find((a) => a.id === avatarId);
    if (!avatar) return false;
    if (battleState.elementEssence < avatar.price) return false;
    if (get().cosmetics.ownedAvatars.includes(avatarId)) return false;

    useBattleStore.setState({
      elementEssence: battleState.elementEssence - avatar.price,
    });

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        ownedAvatars: [...s.cosmetics.ownedAvatars, avatarId],
      },
    }));

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
    });

    return true;
  },

  equipCardBorder: (borderId: string | null) => {
    if (borderId && !get().cosmetics.ownedCardBorders.includes(borderId)) return;

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        equippedCardBorder: borderId,
      },
    }));

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
    });
  },

  equipAvatar: (avatarId: string | null) => {
    if (avatarId && !get().cosmetics.ownedAvatars.includes(avatarId)) return;

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        equippedAvatar: avatarId,
      },
    }));

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
    });
  },

  isCardBorderOwned: (borderId: string): boolean => {
    return get().cosmetics?.ownedCardBorders?.includes(borderId) ?? false;
  },

  isAvatarOwned: (avatarId: string): boolean => {
    return get().cosmetics?.ownedAvatars?.includes(avatarId) ?? false;
  },

  getEquippedCardBorder: (): string | null => {
    return get().cosmetics?.equippedCardBorder ?? null;
  },

  getEquippedAvatar: (): string | null => {
    return get().cosmetics?.equippedAvatar ?? null;
  },

  getCollection: () => {
    return get().cosmetics?.collection || [];
  },

  getCollectionStats: () => {
    const collection = get().cosmetics?.collection || [];
    const total = collection.reduce((sum, c) => sum + c.count, 0);
    const byRarity: Record<string, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    collection.forEach((c) => {
      byRarity[c.rarity] = (byRarity[c.rarity] || 0) + c.count;
    });
    return { total, unique: collection.length, byRarity };
  },

  getEquippedCardBorderData: () => {
    const borderId = get().cosmetics?.equippedCardBorder;
    if (!borderId) return null;
    return CARD_BORDERS.find((b) => b.id === borderId) || null;
  },

  getEquippedAvatarData: () => {
    const avatarId = get().cosmetics?.equippedAvatar;
    if (!avatarId) return null;
    return SHOP_AVATARS.find((a) => a.id === avatarId) || null;
  },

  startTutorial: () => {
    set({
      tutorial: {
        tutorialCompleted: false,
        showTutorial: true,
        currentStep: 'welcome',
      },
    });
  },

  nextTutorialStep: () => {
    const { tutorial } = get();
    const steps: TutorialStep[] = ['welcome', 'cards', 'combo', 'release', 'status_effects', 'turn_based', 'hp_shield', 'complete'];
    const currentIndex = steps.indexOf(tutorial.currentStep);
    if (currentIndex < steps.length - 1) {
      set({
        tutorial: {
          ...tutorial,
          currentStep: steps[currentIndex + 1],
        },
      });
    }
  },

  prevTutorialStep: () => {
    const { tutorial } = get();
    const steps: TutorialStep[] = ['welcome', 'cards', 'combo', 'release', 'status_effects', 'turn_based', 'hp_shield', 'complete'];
    const currentIndex = steps.indexOf(tutorial.currentStep);
    if (currentIndex > 0) {
      set({
        tutorial: {
          ...tutorial,
          currentStep: steps[currentIndex - 1],
        },
      });
    }
  },

  setTutorialStep: (step: TutorialStep) => {
    set((state) => ({
      tutorial: {
        ...state.tutorial,
        currentStep: step,
      },
    }));
  },

  skipTutorial: () => {
    set((state) => ({
      tutorial: {
        ...state.tutorial,
        showTutorial: false,
        tutorialCompleted: true,
      },
    }));
    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
      tutorialCompleted: true,
    });
  },

  completeTutorial: () => {
    set((state) => ({
      tutorial: {
        ...state.tutorial,
        showTutorial: false,
        tutorialCompleted: true,
      },
    }));
    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
      tutorialCompleted: true,
    });
  },

  isTutorialCompleted: (): boolean => {
    return get().tutorial.tutorialCompleted;
  },

  toggleMyCards: () => {
    const { uiStore } = getStores();
    uiStore.toggleMyCards();
  },

  toggleCollection: () => {
    const { uiStore } = getStores();
    uiStore.toggleCollection();
  },

  getDisassembleValue: (rarity: Rarity): number => {
    return DISASSEMBLE_ESSENCE[rarity] || 0;
  },

  getSynthesizeCost: (rarity: Rarity): number => {
    return SYNTHESIZE_ESSENCE[rarity] || 0;
  },

  disassembleCard: (cardId: string, count: number = 1): number | null => {
    const state = get();
    const collection = state.cosmetics.collection;
    const cardIndex = collection.findIndex((c) => c.id === cardId);

    if (cardIndex < 0) return null;

    const card = collection[cardIndex];
    const actualCount = Math.min(count, card.count - 1);

    if (actualCount <= 0) return null;

    const essenceGain = DISASSEMBLE_ESSENCE[card.rarity] * actualCount;

    const battleState = useBattleStore.getState();
    useBattleStore.setState({
      elementEssence: battleState.elementEssence + essenceGain,
    });

    set((s) => {
      const newCollection = [...s.cosmetics.collection];
      const idx = newCollection.findIndex((c) => c.id === cardId);
      if (idx >= 0) {
        newCollection[idx] = {
          ...newCollection[idx],
          count: newCollection[idx].count - actualCount,
        };
      }
      return {
        cosmetics: {
          ...s.cosmetics,
          collection: newCollection,
        },
      };
    });

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
      tutorialCompleted: get().tutorial.tutorialCompleted,
    });

    return essenceGain;
  },

  disassembleAllDuplicates: (): number => {
    const state = get();
    let totalEssence = 0;

    const newCollection = state.cosmetics.collection.map((card) => {
      if (card.count > 1) {
        const extraCount = card.count - 1;
        totalEssence += DISASSEMBLE_ESSENCE[card.rarity] * extraCount;
        return { ...card, count: 1 };
      }
      return card;
    });

    const battleState = useBattleStore.getState();
    useBattleStore.setState({
      elementEssence: battleState.elementEssence + totalEssence,
    });

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        collection: newCollection,
      },
    }));

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
      tutorialCompleted: get().tutorial.tutorialCompleted,
    });

    return totalEssence;
  },

  synthesizeCard: (element: ElementType, cardName: string): CollectedCard | null => {
    const battleState = useBattleStore.getState();
    const variants = CARD_VARIANTS[element];
    const cardTemplate = variants.find((v) => v.name === cardName);

    if (!cardTemplate) return null;

    const cost = SYNTHESIZE_ESSENCE[cardTemplate.rarity];
    if (battleState.elementEssence < cost) return null;

    const collectionKey = `${element}_${cardName}`;
    const existingIndex = get().cosmetics.collection.findIndex((c) => c.id === collectionKey);

    let newCard: CollectedCard;

    useBattleStore.setState({
      elementEssence: battleState.elementEssence - cost,
    });

    set((s) => {
      const newCollection = [...s.cosmetics.collection];
      const idx = newCollection.findIndex((c) => c.id === collectionKey);

      if (idx >= 0) {
        newCollection[idx] = {
          ...newCollection[idx],
          count: newCollection[idx].count + 1,
        };
        newCard = newCollection[idx];
      } else {
        newCard = {
          id: collectionKey,
          element,
          name: cardName,
          description: cardTemplate.description,
          power: cardTemplate.power,
          rarity: cardTemplate.rarity,
          manaCost: cardTemplate.manaCost,
          skillType: cardTemplate.skillType as CollectedCard['skillType'],
          skillValue: cardTemplate.skillValue,
          count: 1,
          obtainedAt: Date.now(),
        };
        newCollection.push(newCard);
      }

      return {
        cosmetics: {
          ...s.cosmetics,
          collection: newCollection,
        },
      };
    });

    savePermanentData({
      elementEssence: useBattleStore.getState().elementEssence,
      comboLevels: usePlayerStore.getState().player.comboLevels,
      dailyQuests: get().dailyQuests,
      cosmetics: get().cosmetics,
      tutorialCompleted: get().tutorial.tutorialCompleted,
    });

    return newCard!;
  },

  getAllCardTemplates: () => {
    const templates: Array<{ element: ElementType; name: string; description: string; power: number; rarity: Rarity; manaCost: number; skillType?: string; skillValue?: number }> = [];
    const elements: ElementType[] = ['fire', 'water', 'earth', 'wind', 'lightning', 'light', 'dark'];
    elements.forEach((element) => {
      CARD_VARIANTS[element].forEach((variant) => {
        templates.push({
          element,
          name: variant.name,
          description: variant.description,
          power: variant.power,
          rarity: variant.rarity,
          manaCost: variant.manaCost,
          skillType: variant.skillType,
          skillValue: variant.skillValue,
        });
      });
    });
    return templates;
  },

  selectMyCard: (cardId: string): void => {
    const { playerStore, uiStore, enemyStore, battleStore } = getStores();
    if (uiStore.isAnimating) return;
    if (!enemyStore.enemy || enemyStore.enemy.hp <= 0) return;
    if (uiStore.showLevelComplete) return;
    if (battleStore.isMyCardOnCooldown(cardId)) return;

    const collectedCard = get().getEquippedMyCards().find(c => c.id === cardId);
    if (!collectedCard) return;

    const isSelected = playerStore.player.selectedCards.find((c) => c.id === cardId);

    if (isSelected) {
      playerStore.deselectCard(cardId);
    } else {
      if (playerStore.player.selectedCards.length >= 2) return;
      playerStore.selectCard(collectedCard as unknown as Card);
    }
  },

  equipMyCard: (cardId: string): boolean => {
    const state = get();
    const card = state.cosmetics.collection.find(c => c.id === cardId);
    if (!card) return false;
    if (state.cosmetics.equippedMyCards.length >= 3) return false;
    if (state.cosmetics.equippedMyCards.includes(cardId)) return false;

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        equippedMyCards: [...s.cosmetics.equippedMyCards, cardId],
      },
    }));
    setTimeout(() => get().saveGame(), 0);
    return true;
  },

  unequipMyCard: (cardId: string): void => {
    set((state) => ({
      cosmetics: {
        ...state.cosmetics,
        equippedMyCards: state.cosmetics.equippedMyCards.filter(id => id !== cardId),
      },
    }));
    setTimeout(() => get().saveGame(), 0);
  },

  getEquippedMyCards: (): CollectedCard[] => {
    const state = get();
    return state.cosmetics.equippedMyCards
      .map(id => state.cosmetics.collection.find(c => c.id === id))
      .filter((c): c is CollectedCard => c !== undefined);
  },

  isMyCardOnCooldown: (cardId: string): boolean => {
    return useBattleStore.getState().myCardUsedIds.includes(cardId);
  },

  resetMyCardCooldowns: (): void => {
    useBattleStore.setState({ myCardUsedIds: [] });
  },

  useMyCard: (cardId: string): boolean => {
    const state = get();
    const { uiStore, enemyStore, playerStore, battleStore } = getStores();
    
    if (uiStore.isAnimating) return false;
    if (!enemyStore.enemy || enemyStore.enemy.hp <= 0) return false;
    if (battleStore.isMyCardOnCooldown(cardId)) return false;

    const card = state.cosmetics.collection.find(c => c.id === cardId);
    if (!card) return false;

    useBattleStore.setState({
      myCardUsedIds: [...battleStore.myCardUsedIds, cardId],
    });
    uiStore.setAnimating(true);

    const damage = card.power;
    const skillType = card.skillType;
    const skillValue = card.skillValue || 0;

    setTimeout(() => {
      const s = get();
      if (!enemyStore.enemy) return;

      let totalDamage = damage;
      let healAmount = 0;
      let shieldAmount = 0;
      const newEnemyStatusEffects = [...enemyStore.enemy.statusEffects];
      const newPlayerStatusEffects = [...playerStore.player.statusEffects];

      if (skillType === 'heavy_damage') {
        totalDamage = damage;
      } else if (skillType === 'damage_heal') {
        totalDamage = damage;
        healAmount = skillValue;
      } else if (skillType === 'damage_freeze') {
        totalDamage = damage;
        const existingFreeze = newEnemyStatusEffects.find(e => e.type === 'freeze');
        if (existingFreeze) {
          existingFreeze.duration = Math.max(existingFreeze.duration, skillValue);
        } else {
          newEnemyStatusEffects.push({ type: 'freeze', value: 0, duration: skillValue });
        }
      } else if (skillType === 'damage_shield') {
        totalDamage = damage;
        shieldAmount = skillValue;
      } else if (skillType === 'multi_hit') {
        totalDamage = Math.floor(damage * 0.4) * skillValue;
      } else if (skillType === 'big_heal') {
        healAmount = skillValue;
        totalDamage = 0;
      } else if (skillType === 'life_drain') {
        totalDamage = damage;
        healAmount = skillValue;
      }

      if (totalDamage > 0) {
        s.takeDamage('enemy', totalDamage);
        uiStore.addFloatingText('damage', totalDamage, 'enemy');
      }
      if (healAmount > 0) {
        s.heal(healAmount);
        uiStore.addFloatingText('heal', healAmount, 'player');
      }
      if (shieldAmount > 0) {
        s.addShield(shieldAmount);
        uiStore.addFloatingText('shield', shieldAmount, 'player');
      }

      enemyStore.setEnemy(enemyStore.enemy ? {
        ...enemyStore.enemy,
        statusEffects: newEnemyStatusEffects,
      } : null);

      playerStore.setPlayer({
        ...playerStore.player,
        statusEffects: newPlayerStatusEffects,
      });

      setTimeout(() => {
        const currentState = get();
        if (!enemyStore.enemy) {
          uiStore.setAnimating(false);
          return;
        }

        if (enemyStore.enemy.hp <= 0) {
          const killBonus = card.rarity === 'legendary' ? 20 : card.rarity === 'epic' ? 12 : card.rarity === 'rare' ? 7 : 4;
          const waveBonus = battleStore.wave * 2;
          const essenceReward = killBonus + waveBonus;
          battleStore.addEssence(essenceReward);
          s.trackWin();

          const cardReward = battleStore.getBattleCardReward();
          if (cardReward) {
            s.addCardToCollection(cardReward);
            useBattleStore.setState({ levelCardReward: cardReward });
          }

          if (battleStore.mode === 'classic' || battleStore.mode === 'quick') {
            const levels = battleStore.mode === 'quick' ? QUICK_LEVELS : CLASSIC_LEVELS;
            if (battleStore.level >= levels.length) {
              setTimeout(() => {
                useBattleStore.setState({ phase: 'victory' });
                uiStore.setAnimating(false);
              }, 800);
            } else {
              setTimeout(() => {
                s.showLevelCompleteScreen(essenceReward);
                uiStore.setAnimating(false);
              }, 800);
            }
          } else {
            setTimeout(() => {
              battleStore.nextWave();
              uiStore.setAnimating(false);
            }, 1200);
          }
        } else {
          setTimeout(() => {
            enemyStore.checkBossPhaseTransition();
            setTimeout(() => {
              battleStore.enemyTurn();
              uiStore.setAnimating(false);
            }, 500);
          }, 500);
        }
      }, 500);
    }, 600);

    return true;
  },

  addCardToCollection: (card: Card): void => {
    set((state) => {
      const existingCard = state.cosmetics.collection.find(
        c => c.element === card.element && c.name === card.name
      );

      let newCollection: CollectedCard[];
      if (existingCard) {
        newCollection = state.cosmetics.collection.map(c =>
          c.id === existingCard.id
            ? { ...c, count: c.count + 1 }
            : c
        );
      } else {
        const newCollectedCard: CollectedCard = {
          id: `collected_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          element: card.element,
          name: card.name,
          description: card.description,
          power: card.power,
          rarity: card.rarity,
          manaCost: card.manaCost,
          skillType: card.skillType,
          skillValue: card.skillValue,
          count: 1,
          obtainedAt: Date.now(),
        };
        newCollection = [...state.cosmetics.collection, newCollectedCard];
      }

      return {
        cosmetics: {
          ...state.cosmetics,
          collection: newCollection,
        },
      };
    });
    setTimeout(() => get().saveGame(), 0);
  },

  getBattleCardReward: (): Card | null => {
    const { battleStore } = getStores();
    return battleStore.getBattleCardReward();
  },

  startDuo: (layout: DuoScreenLayout = 'horizontal') => {
    const { battleStore } = getStores();
    battleStore.startDuo(layout);
  },

  duoSelectCard: (playerNum: 1 | 2, card: Card) => {
    const { playerStore, uiStore, battleStore } = getStores();
    if (uiStore.isAnimating) return;
    if (battleStore.duoWinner) return;
    playerStore.duoSelectCard(playerNum, card);
  },

  duoDeselectCard: (playerNum: 1 | 2, cardId: string) => {
    const { playerStore, uiStore, battleStore } = getStores();
    if (uiStore.isAnimating) return;
    if (battleStore.duoWinner) return;
    playerStore.duoDeselectCard(playerNum, cardId);
  },

  duoPlaySelectedCards: (playerNum: 1 | 2) => {
    const { battleStore } = getStores();
    battleStore.duoPlaySelectedCards(playerNum);
  },

  duoNextTurn: () => {
    const { battleStore } = getStores();
    battleStore.duoNextTurn();
  },

  duoIsComboOnCooldown: (playerNum: 1 | 2, comboId: string) => {
    const { playerStore } = getStores();
    return playerStore.duoIsComboOnCooldown(playerNum, comboId);
  },

  duoGetComboCooldown: (playerNum: 1 | 2, comboId: string) => {
    const { playerStore } = getStores();
    return playerStore.duoGetComboCooldown(playerNum, comboId);
  },

  duoGetCurrentComboLevel: (playerNum: 1 | 2, comboId: string) => {
    const { playerStore } = getStores();
    return playerStore.duoGetCurrentComboLevel(playerNum, comboId);
  },

  setDuoLayout: (layout: DuoScreenLayout) => {
    const { battleStore } = getStores();
    battleStore.setDuoLayout(layout);
  },

  getStreakDamageBonus: () => {
    const { battleStore } = getStores();
    return battleStore.getStreakDamageBonus();
  },

  calculateDamageTier: (damage: number) => {
    const { battleStore } = getStores();
    return battleStore.calculateDamageTier(damage);
  },

  calculateBattleRating: () => {
    const { battleStore } = getStores();
    return battleStore.calculateBattleRating();
  },

  addDamageFloatingText: (damage: number, target: 'player' | 'enemy', element?: ElementType) => {
    const { uiStore } = getStores();
    uiStore.addDamageFloatingText(damage, target, element);
  },

  addComboFloatingText: (comboCount: number, damageBonus: number) => {
    const { uiStore } = getStores();
    uiStore.addComboFloatingText(comboCount, damageBonus);
  },

  showBattleRatingEffect: () => {
    const { uiStore } = getStores();
    uiStore.showBattleRatingEffect();
  },

  hideBattleRating: () => {
    const { uiStore } = getStores();
    uiStore.hideBattleRating();
  },

  getCardTags: () => {
    return get().cosmetics.cardTags || [];
  },

  addCardTag: (name: string, color: string): CardTag | null => {
    if (!name.trim()) return null;
    const newTag: CardTag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      color,
    };
    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        cardTags: [...s.cosmetics.cardTags, newTag],
      },
    }));
    setTimeout(() => get().saveGame(), 0);
    return newTag;
  },

  updateCardTag: (tagId: string, name: string, color: string): boolean => {
    if (!name.trim()) return false;
    const state = get();
    const tagExists = state.cosmetics.cardTags.some(t => t.id === tagId);
    if (!tagExists) return false;

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        cardTags: s.cosmetics.cardTags.map(t =>
          t.id === tagId ? { ...t, name: name.trim(), color } : t
        ),
      },
    }));
    setTimeout(() => get().saveGame(), 0);
    return true;
  },

  deleteCardTag: (tagId: string): boolean => {
    const state = get();
    const tagExists = state.cosmetics.cardTags.some(t => t.id === tagId);
    if (!tagExists) return false;

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        cardTags: s.cosmetics.cardTags.filter(t => t.id !== tagId),
        cardNotes: s.cosmetics.cardNotes.map(note => ({
          ...note,
          tags: note.tags.filter(t => t !== tagId),
        })),
      },
    }));
    setTimeout(() => get().saveGame(), 0);
    return true;
  },

  getCardNote: (cardId: string): CardNote | undefined => {
    return get().cosmetics.cardNotes?.find(n => n.cardId === cardId);
  },

  getCardNotes: (): CardNote[] => {
    return get().cosmetics.cardNotes || [];
  },

  saveCardNote: (cardId: string, content: string, tags: string[]): CardNote | null => {
    if (!content.trim()) return null;
    const state = get();
    const existingNote = state.cosmetics.cardNotes?.find(n => n.cardId === cardId);

    if (existingNote) {
      const updatedNote: CardNote = {
        ...existingNote,
        content: content.trim(),
        tags,
        updatedAt: Date.now(),
      };
      set((s) => ({
        cosmetics: {
          ...s.cosmetics,
          cardNotes: s.cosmetics.cardNotes.map(n =>
            n.cardId === cardId ? updatedNote : n
          ),
        },
      }));
      setTimeout(() => get().saveGame(), 0);
      return updatedNote;
    } else {
      const newNote: CardNote = {
        id: `note_${Date.now()}`,
        cardId,
        content: content.trim(),
        tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((s) => ({
        cosmetics: {
          ...s.cosmetics,
          cardNotes: [...s.cosmetics.cardNotes, newNote],
        },
      }));
      setTimeout(() => get().saveGame(), 0);
      return newNote;
    }
  },

  deleteCardNote: (cardId: string): boolean => {
    const state = get();
    const noteExists = state.cosmetics.cardNotes?.some(n => n.cardId === cardId);
    if (!noteExists) return false;

    set((s) => ({
      cosmetics: {
        ...s.cosmetics,
        cardNotes: s.cosmetics.cardNotes.filter(n => n.cardId !== cardId),
      },
    }));
    setTimeout(() => get().saveGame(), 0);
    return true;
  },

  getCardsByTag: (tagId: string): CollectedCard[] => {
    const state = get();
    const noteCardIds = state.cosmetics.cardNotes
      ?.filter(note => note.tags.includes(tagId))
      .map(note => note.cardId) || [];
    
    return state.cosmetics.collection.filter(card =>
      noteCardIds.includes(card.id)
    );
  },

  getAllAccounts: (): GameAccount[] => {
    return get().accounts;
  },

  createNewAccount: (name: string, avatar?: string): GameAccount => {
    const account = libCreateAccount(name, avatar);
    setCurrentAccountId(account.id);
    set({
      accounts: getAccounts(),
      currentAccount: account,
      showAccountManager: false,
    });
    return account;
  },

  removeAccount: (accountId: string): void => {
    libDeleteAccount(accountId);
    const accounts = getAccounts();
    set({
      accounts,
      currentAccount: getCurrentAccount(),
    });
  },

  switchAccount: (accountId: string): void => {
    setCurrentAccountId(accountId);
    migrateLegacySavesToAccount(accountId);
    const newState = loadInitialState();
    set({
      ...newState,
      accounts: getAccounts(),
      currentAccount: getCurrentAccount(),
      showAccountManager: false,
    });
  },

  modifyAccount: (updates: Partial<Omit<GameAccount, 'id' | 'createdAt'>>): void => {
    const { currentAccount } = get();
    if (!currentAccount) return;
    libUpdateAccount(currentAccount.id, updates);
    set({
      currentAccount: getCurrentAccount(),
      accounts: getAccounts(),
    });
  },

  toggleAccountManager: (): void => {
    set(s => ({ showAccountManager: !s.showAccountManager }));
  },

  toggleSaveManager: (): void => {
    set(s => ({ showSaveManager: !s.showSaveManager }));
  },

  setShowAccountManager: (show: boolean): void => {
    set({ showAccountManager: show });
  },

  setShowSaveManager: (show: boolean): void => {
    set({ showSaveManager: show });
  },

  pauseGame: (): void => {
    set({ isPaused: true });
  },

  resumeGame: (): void => {
    set({ isPaused: false });
  },

  saveGameToSlot: (slotId: 1 | 2 | 3, slotName?: string): GameSaveSlot => {
    const state = get();
    const { battleStore } = getStores();
    const { playerStore, enemyStore } = getStores();
    
    const accountId = state.currentAccount?.id || 'default';
    
    const battleData = {
      phase: battleStore.phase,
      mode: battleStore.mode,
      difficulty: battleStore.difficulty,
      turn: battleStore.turn,
      player: playerStore.player,
      player2: playerStore.player2,
      currentDuoPlayer: playerStore.currentDuoPlayer,
      enemy: enemyStore.enemy,
      wave: battleStore.wave,
      level: battleStore.level,
      maxLevel: battleStore.maxLevel,
      score: battleStore.score,
      streak: battleStore.streak,
      comboHistory: battleStore.comboHistory,
      comboCooldowns: playerStore.player.comboCooldowns,
    };
    
    const permanentData = {
      elementEssence: battleStore.elementEssence,
      comboLevels: playerStore.player.comboLevels,
      dailyQuests: state.dailyQuests,
      cosmetics: state.cosmetics,
      tutorialCompleted: state.tutorial.tutorialCompleted,
    };

    const slot = saveToSlot(accountId, slotId, {
      permanentData,
      battleData,
      slotName,
    });

    set({ accounts: getAccounts() });
    return slot;
  },

  loadGameFromSlot: (slotId: 1 | 2 | 3): boolean => {
    const accountId = get().currentAccount?.id || 'default';
    const slot = libGetSaveSlot(accountId, slotId);
    if (!slot || !slot.battleData) return false;

    const { battleStore, playerStore, enemyStore, uiStore } = getStores();
    const data = slot.battleData;

    playerStore.setPlayer(data.player);
    if (data.player2) {
      playerStore.setPlayer2(data.player2);
    }
    if (data.currentDuoPlayer) {
      playerStore.setCurrentDuoPlayer(data.currentDuoPlayer);
    }
    enemyStore.setEnemy(data.enemy);

    useBattleStore.setState({
      phase: data.phase,
      mode: data.mode,
      difficulty: data.difficulty,
      turn: data.turn,
      wave: data.wave,
      level: data.level,
      maxLevel: data.maxLevel,
      score: data.score,
      streak: data.streak,
      comboHistory: data.comboHistory,
    });

    if (data.comboCooldowns) {
      playerStore.setComboCooldowns(data.comboCooldowns);
    }

    useUIStore.setState({
      isAnimating: false,
      currentCombo: null,
      showComboEffect: false,
      floatingTexts: [],
      showLevelComplete: false,
    });

    set({
      levelEssenceReward: 0,
      showSaveManager: false,
    });

    return true;
  },

  removeSaveSlot: (slotId: 1 | 2 | 3): void => {
    const accountId = get().currentAccount?.id || 'default';
    libDeleteSaveSlot(accountId, slotId);
    set({ accounts: getAccounts() });
  },

  renameGameSaveSlot: (slotId: 1 | 2 | 3, slotName: string): void => {
    const accountId = get().currentAccount?.id || 'default';
    libRenameSaveSlot(accountId, slotId, slotName);
    set({ accounts: getAccounts() });
  },

  getAccountSaveSlots: (): GameSaveSlot[] => {
    const accountId = get().currentAccount?.id || 'default';
    return getSaveSlots(accountId);
  },

  getAccountSaveSlot: (slotId: 1 | 2 | 3): GameSaveSlot | null => {
    const accountId = get().currentAccount?.id || 'default';
    return libGetSaveSlot(accountId, slotId);
  },

  restartGame: (): void => {
    const { battleStore, playerStore, enemyStore, uiStore } = getStores();
    
    clearBattleSave();
    
    playerStore.setPlayer(initialPlayerState());
    playerStore.setPlayer2(null);
    enemyStore.setEnemy(null);
    
    useBattleStore.setState({
      phase: 'menu',
      mode: 'classic',
      difficulty: 'normal',
      turn: 1,
      wave: 1,
      level: 1,
      maxLevel: 5,
      score: 0,
      streak: 0,
      comboHistory: [],
      myCardUsedIds: [],
      levelCardReward: null,
    });
    
    useUIStore.setState({
      isAnimating: false,
      currentCombo: null,
      showComboEffect: false,
      showUpgradePanel: false,
      showLevelComplete: false,
      floatingTexts: [],
    });

    set({
      levelEssenceReward: 0,
      phase: 'menu',
      mode: 'classic',
      difficulty: 'normal',
      turn: 1,
      wave: 1,
      level: 1,
      maxLevel: 5,
      score: 0,
      streak: 0,
      comboHistory: [],
    });
  },

  initAccountSystem: (): void => {
    const accounts = getAccounts();
    set({
      accounts,
      currentAccount: getCurrentAccount(),
      showAccountManager: accounts.length === 0,
    });
  },
}));