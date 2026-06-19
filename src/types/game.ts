export type ElementType = 'fire' | 'water' | 'earth' | 'wind' | 'lightning' | 'light' | 'dark';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ComboCategory = 
  | 'attack' 
  | 'defense' 
  | 'heal' 
  | 'control' 
  | 'lifesteal' 
  | 'thorns' 
  | 'absorb' 
  | 'utility';

export type EffectType = 
  | 'burn' 
  | 'freeze' 
  | 'poison' 
  | 'stun' 
  | 'heal' 
  | 'shield' 
  | 'draw'
  | 'lifesteal'
  | 'thorns'
  | 'absorb'
  | 'weakness'
  | 'strength';

export type CardSkillType = 
  | 'heavy_damage' 
  | 'damage_heal' 
  | 'damage_freeze' 
  | 'damage_shield' 
  | 'multi_hit' 
  | 'big_heal' 
  | 'life_drain';

export interface Card {
  id: string;
  element: ElementType;
  name: string;
  description: string;
  power: number;
  rarity: Rarity;
  manaCost: number;
  skillType?: CardSkillType;
  skillValue?: number;
}

export interface ComboUpgrade {
  level: number;
  damageBonus: number;
  effectValueBonus?: number;
  effectDurationBonus?: number;
  description: string;
}

export interface ComboSkill {
  id: string;
  elements: [ElementType, ElementType];
  name: string;
  description: string;
  damage: number;
  effect?: EffectType;
  effectValue?: number;
  effectDuration?: number;
  rarity: Rarity;
  effectType: 'firestorm' | 'vinewrap' | 'steamburst' | 'sandstorm' | 'lavaeruption' | 'icestorm' | 'thunderstrike' | 'holylight' | 'shadowflame' | 'thundercloud' | 'prismbeam' | 'voidstorm' | 'earthquake' | 'divineguard' | 'shadowbind' | 'galeforce' | 'blessing' | 'darkwhisper' | 'thunderbolt' | 'solarflare' | 'abyssalvoid';
  category: ComboCategory;
  cooldown: number;
  canUpgrade: boolean;
  upgrades?: ComboUpgrade[];
}

export interface StatusEffect {
  type: EffectType;
  value: number;
  duration: number;
}

export interface ComboCooldown {
  comboId: string;
  remaining: number;
}

export interface PlayerComboState {
  comboId: string;
  level: number;
}

export type AvatarType = 
  | 'flame_imp' 
  | 'water_sprite' 
  | 'earth_golem' 
  | 'wind_spirit' 
  | 'boss_dragon'
  | 'boss_dragon_phase2'
  | 'boss_dragon_phase3'
  | 'fire_elemental'
  | 'water_elemental'
  | 'earth_elemental'
  | 'lightning_elemental'
  | 'light_elemental'
  | 'dark_elemental'
  | 'shadow_assassin'
  | 'crystal_guardian'
  | 'thunder_lord'
  | 'void_walker'
  | 'phoenix_lord'
  | 'ice_queen'
  | 'storm_titan'
  | 'boss_crystal_phase2'
  | 'boss_crystal_phase3'
  | 'boss_void_phase2'
  | 'boss_void_phase3';

export type EnemyTier = 'common' | 'elite' | 'boss';

export type BossPhase = 1 | 2 | 3;

export type SpecialAbilityType = 
  | 'enrage' 
  | 'summon_minions' 
  | 'shield_wall' 
  | 'heal_self' 
  | 'multi_attack'
  | 'element_absorb'
  | 'counter_strike'
  | 'damage_boost'
  | 'weaken_player'
  | 'lifesteal'
  | 'poison_attack'
  | 'burn_attack'
  | 'freeze_attack'
  | 'stun_attack'
  | 'thorns_aura'
  | 'regen'
  | 'shield_bash'
  | 'drain_shield'
  | 'pierce_attack'
  | 'rage_mode';

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  type: SpecialAbilityType;
  value: number;
  cooldown: number;
  currentCooldown?: number;
}

export type BossIntentType = 'attack' | 'defend' | 'buff' | 'debuff' | 'heal';

export interface BossPhaseData {
  phase: BossPhase;
  name: string;
  maxHp: number;
  attackPower: number;
  avatarType: AvatarType;
  abilities: SpecialAbility[];
  intentPattern?: BossIntentType[];
}

export interface Combatant {
  name: string;
  maxHp: number;
  hp: number;
  shield: number;
  statusEffects: StatusEffect[];
  image: string;
  avatarType?: AvatarType;
}

export interface Player extends Combatant {
  hand: Card[];
  deck: Card[];
  selectedCards: Card[];
  mana: number;
  maxMana: number;
  comboCooldowns: ComboCooldown[];
  comboLevels: PlayerComboState[];
}

export interface Enemy extends Combatant {
  attackPower: number;
  intent: BossIntentType;
  intentValue: number;
  tier: EnemyTier;
  level: number;
  isBoss?: boolean;
  bossPhase?: BossPhase;
  bossMaxPhases?: number;
  bossPhases?: BossPhaseData[];
  abilities?: SpecialAbility[];
  phaseTransitionTriggered?: boolean;
  intentPatternIndex?: number;
}

export type GameMode = 'classic' | 'challenge' | 'endless' | 'quick' | 'duo';

export type DuoScreenLayout = 'horizontal' | 'vertical';
export type GamePhase = 'menu' | 'battle' | 'victory' | 'defeat';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export type DamageTier = 'light' | 'normal' | 'heavy' | 'critical' | 'devastating';
export type BattleRating = 'S' | 'A' | 'B' | 'C' | 'D';

export interface FloatingText {
  id: string;
  value: number;
  type: 'damage' | 'heal' | 'shield' | 'combo' | 'rating';
  x: number;
  y: number;
  tier?: DamageTier;
  isCrit?: boolean;
  comboCount?: number;
  damageBonus?: number;
  rating?: string;
  element?: ElementType;
}

export type QuestType = 'use_combo' | 'win_battle' | 'total_damage' | 'reach_wave' | 'use_combo_category';

export type QuestRarity = 'common' | 'rare' | 'epic';

export interface DailyQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  rarity: QuestRarity;
  completed: boolean;
  claimed: boolean;
  targetComboId?: string;
  targetCategory?: ComboCategory;
}

export interface DailyQuestState {
  quests: DailyQuest[];
  lastRefreshDate: string;
  freeRefreshUsed: boolean;
  sessionDamage: number;
  sessionCombos: string[];
  sessionWins: number;
  sessionMaxWave: number;
  sessionComboCategories: ComboCategory[];
}

export type ShopCategory = 'card_pack' | 'card_border' | 'avatar';

export type CardPackRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CardPack {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: CardPackRarity;
  cardCount: number;
  guaranteedRarity?: CardPackRarity;
  icon: string;
  gradient: string;
}

export interface CardBorder {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: Rarity;
  borderStyle: string;
  glowColor: string;
  icon: string;
}

export interface ShopAvatar {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: Rarity;
  avatarType: AvatarType;
  icon: string;
}

export type ShopItem = CardPack | CardBorder | ShopAvatar;

export interface CardTag {
  id: string;
  name: string;
  color: string;
}

export interface CardNote {
  id: string;
  cardId: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CollectedCard {
  id: string;
  element: ElementType;
  name: string;
  description: string;
  power: number;
  rarity: Rarity;
  manaCost: number;
  count: number;
  obtainedAt: number;
  skillType?: CardSkillType;
  skillValue?: number;
}

export interface PlayerCosmetics {
  ownedCardBorders: string[];
  ownedAvatars: string[];
  equippedCardBorder: string | null;
  equippedAvatar: string | null;
  openedCardPacks: string[];
  collection: CollectedCard[];
  equippedMyCards: string[];
  cardTags: CardTag[];
  cardNotes: CardNote[];
}

export type TutorialStep = 
  | 'welcome'
  | 'cards'
  | 'combo'
  | 'release'
  | 'status_effects'
  | 'turn_based'
  | 'hp_shield'
  | 'complete';

export interface TutorialState {
  tutorialCompleted: boolean;
  showTutorial: boolean;
  currentStep: TutorialStep;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  difficulty: Difficulty;
  turn: number;
  player: Player;
  enemy: Enemy | null;
  comboHistory: ComboSkill[];
  streak: number;
  score: number;
  elementEssence: number;
  isAnimating: boolean;
  currentCombo: ComboSkill | null;
  showComboEffect: boolean;
  showUpgradePanel: boolean;
  showLevelComplete: boolean;
  levelEssenceReward: number;
  wave: number;
  level: number;
  maxLevel: number;
  floatingTexts: FloatingText[];
  enemyShaking: boolean;
  playerShaking: boolean;
  dailyQuests: DailyQuestState;
  showDailyQuests: boolean;
  showShop: boolean;
  showMyCards: boolean;
  showCollection: boolean;
  cosmetics: PlayerCosmetics;
  tutorial: TutorialState;
  myCardUsedIds: string[];
  levelCardReward: Card | null;
  player2: Player | null;
  currentDuoPlayer: 1 | 2;
  duoLayout: DuoScreenLayout;
  player2Shaking: boolean;
  duoWinner: 1 | 2 | null;
  maxStreak: number;
  totalDamageDealt: number;
  totalHealingDone: number;
  combosUsed: number;
  showStreakBonus: boolean;
  lastStreakBonus: number;
  battleRating: BattleRating | null;
  showBattleRating: boolean;
  highestHitDamage: number;
}

export interface GameAccount {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
  lastPlayedAt: number;
}

export interface GameSaveSlot {
  slotId: 1 | 2 | 3;
  accountId: string;
  slotName: string;
  permanentData: {
    elementEssence: number;
    comboLevels: Player['comboLevels'];
    dailyQuests: DailyQuestState;
    cosmetics: PlayerCosmetics;
    tutorialCompleted?: boolean;
  };
  battleData: {
    phase: GameState['phase'];
    mode: GameMode;
    difficulty: Difficulty;
    turn: number;
    player: Player;
    player2: Player | null;
    currentDuoPlayer: 1 | 2;
    enemy: Enemy | null;
    wave: number;
    level: number;
    maxLevel: number;
    score: number;
    streak: number;
    comboHistory: GameState['comboHistory'];
    comboCooldowns: Player['comboCooldowns'];
    // 修复: 添加player2的comboCooldowns字段
    player2ComboCooldowns: Player['comboCooldowns'];
  } | null;
  savedAt: number;
}
