import { create } from 'zustand';

export interface GameState {
  currentPassage: string;
  lang: 'en' | 'ru';
  started: boolean;
  soundOn: boolean;

  // Moral scores
  U: number; // Utilitarianism / Consequentialism
  D: number; // Deontology
  L: number; // Libertarianism
  S: number; // Social contract

  // Per-choice tracking
  trolley1: number | 'no';
  trolley2: number | 'no';
  yacht1: number | 'no';
  yacht2: number | 'no';
  factory1: number | 'no';
  factory2: number | 'no';
  lies1: number | 'no';
  lies2: number | 'no';
  liberty1: number | 'no';
  liberty2: number | 'no';
  privacy1: number | 'no';
  privacy2: number | 'no';

  // Result variables
  science: number | 'no';
  society: number | 'no';
  art: number | 'no';

  // Progress dots (1-5)
  dot1Color: 'gray' | 'green';
  dot2Color: 'gray' | 'green';
  dot3Color: 'gray' | 'green';
  dot4Color: 'gray' | 'green';
  dot5Color: 'gray' | 'green';

  // Computed graph values
  xRatio: number;
  yRatio: number;
  xPerc: number;
  yPerc: number;
}

export interface GameActions {
  setPassage: (id: string) => void;
  setLang: (lang: 'en' | 'ru') => void;
  setStarted: () => void;
  toggleSound: () => void;
  updateVar: (key: keyof GameState, value: number | string | boolean) => void;
  addU: (val: number) => void;
  addD: (val: number) => void;
  addL: (val: number) => void;
  addS: (val: number) => void;
  computeResults: () => void;
  computeGraph: () => void;
  resetGame: () => void;
  getState: () => GameState;
}

const initialState: GameState = {
  currentPassage: 'start',
  lang: 'en',
  started: false,
  soundOn: false,
  U: 0,
  D: 0,
  L: 0,
  S: 0,
  trolley1: 'no',
  trolley2: 'no',
  yacht1: 'no',
  yacht2: 'no',
  factory1: 'no',
  factory2: 'no',
  lies1: 'no',
  lies2: 'no',
  liberty1: 'no',
  liberty2: 'no',
  privacy1: 'no',
  privacy2: 'no',
  science: 'no',
  society: 'no',
  art: 'no',
  dot1Color: 'gray',
  dot2Color: 'gray',
  dot3Color: 'gray',
  dot4Color: 'gray',
  dot5Color: 'gray',
  xRatio: 0.5,
  yRatio: 0.5,
  xPerc: 50,
  yPerc: 50,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setPassage: (id) => set({ currentPassage: id }),

  setLang: (lang) => set({ lang }),

  setStarted: () => set({ started: true }),

  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

  updateVar: (key, value) => set({ [key]: value } as Partial<GameState>),

  addU: (val) => set((s) => ({ U: s.U + val })),
  addD: (val) => set((s) => ({ D: s.D + val })),
  addL: (val) => set((s) => ({ L: s.L + val })),
  addS: (val) => set((s) => ({ S: s.S + val })),

  computeResults: () => {
    const { U, D, L, S } = get();
    const science = U < 3 ? 0 : U > 5 ? 2 : 1;
    const society = L > 5 ? 0 : S > 5 ? 2 : 1;
    const art = U > 4 ? 0 : D > 5 ? 2 : 1;
    set({ science, society, art });
  },

  computeGraph: () => {
    const { U, D, L, S } = get();
    const xRatio = U + D === 0 ? 0.5 : U / (U + D);
    const yRatio = L + S === 0 ? 0.5 : L / (L + S);
    set({
      xRatio,
      yRatio,
      xPerc: xRatio * 100,
      yPerc: yRatio * 100,
    });
  },

  resetGame: () => {
    const { lang, soundOn } = get();
    set({ ...initialState, lang, soundOn });
  },

  getState: () => get(),
}));
