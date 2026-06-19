import type { GameState, Player, Enemy, DailyQuestState, GameMode, Difficulty, PlayerCosmetics, GameAccount, GameSaveSlot } from '@/types/game';

const STORAGE_ACCOUNTS = 'elemental_duels_accounts';
const STORAGE_CURRENT_ACCOUNT = 'elemental_duels_current_account';
const STORAGE_SAVE_SLOTS_PREFIX = 'elemental_duels_saves_';

const STORAGE_KEY_PERMANENT = 'elemental_duels_permanent_save';
const STORAGE_KEY_BATTLE = 'elemental_duels_battle_save';

export interface PermanentSaveData {
  elementEssence: number;
  comboLevels: Player['comboLevels'];
  dailyQuests: DailyQuestState;
  cosmetics: PlayerCosmetics;
  tutorialCompleted?: boolean;
  savedAt: number;
}

export interface BattleSaveData {
  phase: GameState['phase'];
  mode: GameMode;
  difficulty: Difficulty;
  turn: number;
  player: Player;
  // 修复: 双人模式下需要同时保存 player2 与当前回合玩家，
  // 否则 saveBattleData 仅保存单玩家状态，双人对战进度会丢失。
  player2: Player | null;
  currentDuoPlayer: 1 | 2;
  enemy: Enemy | null;
  wave: number;
  level: number;
  maxLevel: number;
  score: number;
  streak: number;
  comboHistory: GameState['comboHistory'];
  savedAt: number;
}

const DEFAULT_AVATARS = ['🗡️', '🛡️', '🔮', '⚔️', '🏹', '🧙', '🦸', '🦹', '👸', '🤴', '👾', '🤖'];

export const generateAccountId = (): string => {
  return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getAccounts = (): GameAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS);
    if (!raw) return [];
    return JSON.parse(raw) as GameAccount[];
  } catch (e) {
    console.error('Failed to get accounts:', e);
    return [];
  }
};

export const saveAccounts = (accounts: GameAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts:', e);
  }
};

export const getCurrentAccountId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_CURRENT_ACCOUNT);
  } catch (e) {
    console.error('Failed to get current account:', e);
    return null;
  }
};

export const setCurrentAccountId = (accountId: string | null): void => {
  try {
    if (accountId) {
      localStorage.setItem(STORAGE_CURRENT_ACCOUNT, accountId);
      const accounts = getAccounts();
      const updated = accounts.map(acc => 
        acc.id === accountId ? { ...acc, lastPlayedAt: Date.now() } : acc
      );
      saveAccounts(updated);
    } else {
      localStorage.removeItem(STORAGE_CURRENT_ACCOUNT);
    }
  } catch (e) {
    console.error('Failed to set current account:', e);
  }
};

export const getCurrentAccount = (): GameAccount | null => {
  const accountId = getCurrentAccountId();
  if (!accountId) return null;
  const accounts = getAccounts();
  return accounts.find(acc => acc.id === accountId) || null;
};

export const createAccount = (name: string, avatar?: string): GameAccount => {
  const accounts = getAccounts();
  const usedAvatars = accounts.map(a => a.avatar);
  const availableAvatars = DEFAULT_AVATARS.filter(a => !usedAvatars.includes(a));
  const selectedAvatar = avatar || (availableAvatars.length > 0 ? availableAvatars[0] : DEFAULT_AVATARS[0]);

  const newAccount: GameAccount = {
    id: generateAccountId(),
    name: name.trim() || `玩家 ${accounts.length + 1}`,
    avatar: selectedAvatar,
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
  };

  accounts.push(newAccount);
  saveAccounts(accounts);
  setCurrentAccountId(newAccount.id);

  return newAccount;
};

export const deleteAccount = (accountId: string): void => {
  const accounts = getAccounts().filter(acc => acc.id !== accountId);
  saveAccounts(accounts);
  localStorage.removeItem(`${STORAGE_SAVE_SLOTS_PREFIX}${accountId}`);

  const currentId = getCurrentAccountId();
  if (currentId === accountId) {
    if (accounts.length > 0) {
      setCurrentAccountId(accounts[0].id);
    } else {
      setCurrentAccountId(null);
    }
  }
};

export const updateAccount = (accountId: string, updates: Partial<Omit<GameAccount, 'id' | 'createdAt'>>): void => {
  const accounts = getAccounts();
  const index = accounts.findIndex(acc => acc.id === accountId);
  if (index >= 0) {
    accounts[index] = { ...accounts[index], ...updates };
    saveAccounts(accounts);
  }
};

const getSlotsStorageKey = (accountId: string): string => {
  return `${STORAGE_SAVE_SLOTS_PREFIX}${accountId}`;
};

export const getSaveSlots = (accountId: string): GameSaveSlot[] => {
  try {
    const raw = localStorage.getItem(getSlotsStorageKey(accountId));
    if (!raw) return [];
    return JSON.parse(raw) as GameSaveSlot[];
  } catch (e) {
    console.error('Failed to get save slots:', e);
    return [];
  }
};

export const saveSlots = (accountId: string, slots: GameSaveSlot[]): void => {
  try {
    localStorage.setItem(getSlotsStorageKey(accountId), JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to save slots:', e);
  }
};

export const getSaveSlot = (accountId: string, slotId: 1 | 2 | 3): GameSaveSlot | null => {
  const slots = getSaveSlots(accountId);
  return slots.find(s => s.slotId === slotId) || null;
};

export const saveToSlot = (
  accountId: string,
  slotId: 1 | 2 | 3,
  data: {
    permanentData: GameSaveSlot['permanentData'];
    battleData: GameSaveSlot['battleData'];
    slotName?: string;
  }
): GameSaveSlot => {
  const slots = getSaveSlots(accountId);
  const existingIndex = slots.findIndex(s => s.slotId === slotId);

  const defaultNames: Record<1 | 2 | 3, string> = {
    1: '存档 1',
    2: '存档 2',
    3: '存档 3',
  };

  const existingSlot = existingIndex >= 0 ? slots[existingIndex] : null;

  const newSlot: GameSaveSlot = {
    slotId,
    accountId,
    slotName: data.slotName || existingSlot?.slotName || defaultNames[slotId],
    permanentData: data.permanentData,
    battleData: data.battleData,
    savedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    slots[existingIndex] = newSlot;
  } else {
    slots.push(newSlot);
  }

  saveSlots(accountId, slots);
  updateAccount(accountId, { lastPlayedAt: Date.now() });

  return newSlot;
};

export const deleteSaveSlot = (accountId: string, slotId: 1 | 2 | 3): void => {
  const slots = getSaveSlots(accountId).filter(s => s.slotId !== slotId);
  saveSlots(accountId, slots);
};

export const renameSaveSlot = (accountId: string, slotId: 1 | 2 | 3, slotName: string): void => {
  const slots = getSaveSlots(accountId);
  const index = slots.findIndex(s => s.slotId === slotId);
  if (index >= 0) {
    slots[index] = { ...slots[index], slotName: slotName.trim() || `存档 ${slotId}` };
    saveSlots(accountId, slots);
  }
};

export const hasPermanentSave = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY_PERMANENT) !== null;
  } catch {
    return false;
  }
};

export const hasBattleSave = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY_BATTLE) !== null;
  } catch {
    return false;
  }
};

export const savePermanentData = (data: Omit<PermanentSaveData, 'savedAt'>): void => {
  try {
    const saveData: PermanentSaveData = {
      ...data,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_PERMANENT, JSON.stringify(saveData));
  } catch (e) {
    console.error('Failed to save permanent data:', e);
  }
};

export const loadPermanentData = (): PermanentSaveData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERMANENT);
    if (!raw) return null;
    return JSON.parse(raw) as PermanentSaveData;
  } catch (e) {
    console.error('Failed to load permanent data:', e);
    return null;
  }
};

export const saveBattleData = (data: Omit<BattleSaveData, 'savedAt'>): void => {
  try {
    const saveData: BattleSaveData = {
      ...data,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_BATTLE, JSON.stringify(saveData));
  } catch (e) {
    console.error('Failed to save battle data:', e);
  }
};

export const loadBattleData = (): BattleSaveData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BATTLE);
    if (!raw) return null;
    return JSON.parse(raw) as BattleSaveData;
  } catch (e) {
    console.error('Failed to load battle data:', e);
    return null;
  }
};

export const clearBattleSave = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_BATTLE);
  } catch (e) {
    console.error('Failed to clear battle save:', e);
  }
};

export const clearAllSaves = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_PERMANENT);
    localStorage.removeItem(STORAGE_KEY_BATTLE);
  } catch (e) {
    console.error('Failed to clear saves:', e);
  }
};

export const getBattleSaveInfo = (): { mode: GameMode; level: number; wave: number; savedAt: number } | null => {
  const data = loadBattleData();
  if (!data) return null;
  return {
    mode: data.mode,
    level: data.level,
    wave: data.wave,
    savedAt: data.savedAt,
  };
};

export const migrateLegacySavesToAccount = (accountId: string): void => {
  const permanentData = loadPermanentData();
  const battleData = loadBattleData();

  if (permanentData || battleData) {
    const slots = getSaveSlots(accountId);
    if (slots.length === 0) {
      saveToSlot(accountId, 1, {
        permanentData: permanentData ? {
          elementEssence: permanentData.elementEssence,
          comboLevels: permanentData.comboLevels,
          dailyQuests: permanentData.dailyQuests,
          cosmetics: permanentData.cosmetics,
          tutorialCompleted: permanentData.tutorialCompleted,
        } : {
          elementEssence: 0,
          comboLevels: [],
          dailyQuests: {
            quests: [],
            lastRefreshDate: '',
            freeRefreshUsed: false,
            sessionDamage: 0,
            sessionCombos: [],
            sessionWins: 0,
            sessionMaxWave: 0,
            sessionComboCategories: [],
          },
          cosmetics: {
            ownedCardBorders: [],
            ownedAvatars: [],
            equippedCardBorder: null,
            equippedAvatar: null,
            openedCardPacks: [],
            collection: [],
            equippedMyCards: [],
            cardTags: [],
            cardNotes: [],
          },
          tutorialCompleted: false,
        },
        battleData: battleData ? {
          phase: battleData.phase,
          mode: battleData.mode,
          difficulty: battleData.difficulty,
          turn: battleData.turn,
          player: battleData.player,
          // 修复: BattleSaveData 现已包含 player2 / currentDuoPlayer，无需再用 any 兜底
          player2: battleData.player2 ?? null,
          currentDuoPlayer: battleData.currentDuoPlayer ?? 1,
          enemy: battleData.enemy,
          wave: battleData.wave,
          level: battleData.level,
          maxLevel: battleData.maxLevel,
          score: battleData.score,
          streak: battleData.streak,
          comboHistory: battleData.comboHistory,
          comboCooldowns: (battleData as unknown as { comboCooldowns?: Player['comboCooldowns'] }).comboCooldowns || [],
        } : null,
        slotName: '自动迁移存档',
      });
    }
  }
};

export const getAvailableAvatars = (): string[] => {
  return [...DEFAULT_AVATARS];
};
