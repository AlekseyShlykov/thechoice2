import type { GameState, GameActions } from '../store/gameStore';
import { track, submitToGoogleSheets } from '../utils/analytics';

export interface Choice {
  textKey: string;
  action: (store: GameState & GameActions) => void;
}

export interface Passage {
  id: string;
  textKey: string;
  image?: string;
  isHtml?: boolean;
  choices: Choice[];
  onEnter?: (store: GameState & GameActions) => void;
  stage?: number;
}

function goto(store: GameState & GameActions, id: string) {
  store.setPassage(id);
}

export const passages: Record<string, Passage> = {
  // ============ START ============
  start: {
    id: 'start',
    textKey: 'start.text',
    choices: [
      {
        textKey: 'start.playNow',
        action: (s) => {
          track('choice_made', { passage: 'Start', choice_id: 'play_now', lang: s.lang });
          goto(s, 'intro');
        },
      },
    ],
    onEnter: (s) => {
      if (!s.started) {
        s.setStarted();
        track('game_start', { passage: 'Start' });
      }
    },
  },

  // ============ INTRO ============
  intro: {
    id: 'intro',
    textKey: 'intro.text',
    image: 'assets/ai.png',
    onEnter: (s) => {
      s.updateVar('dot1Color', 'green');
    },
    choices: [
      {
        textKey: 'intro.choice_whatIsMoralDilemma',
        action: (s) => goto(s, 'trolley'),
      },
      {
        textKey: 'intro.choice_wantToStart',
        action: (s) => {
          s.updateVar('dot1Color', 'green');
          goto(s, 'rezedaIntro');
        },
      },
    ],
  },

  // ============ TROLLEY TUTORIAL ============
  trolley: {
    id: 'trolley',
    textKey: 'trolley.intro',
    image: 'assets/trolley1.png',
    choices: [
      { textKey: 'trolley.whatIsIt', action: (s) => goto(s, 'trolley2') },
      { textKey: 'trolley.iHeardAboutIt', action: (s) => goto(s, 'trolley2') },
    ],
  },

  trolley2: {
    id: 'trolley2',
    textKey: 'trolley2.text',
    image: 'assets/trolley1.png',
    choices: [
      {
        textKey: 'trolley2.choice_makeTurn',
        action: (s) => {
          s.updateVar('trolley1', 1);
          goto(s, 'makeTurn');
        },
      },
      {
        textKey: 'trolley2.choice_stayOnCourse',
        action: (s) => {
          s.updateVar('trolley1', 0);
          goto(s, 'stayOnCourse');
        },
      },
    ],
  },

  makeTurn: {
    id: 'makeTurn',
    textKey: 'makeTurn.text',
    image: 'assets/trolley1.png',
    choices: [
      { textKey: 'makeTurn.butWhy', action: (s) => goto(s, 'butWhy') },
      { textKey: 'makeTurn.whatOtherTypes', action: (s) => goto(s, 'whatOtherTypes') },
    ],
  },

  stayOnCourse: {
    id: 'stayOnCourse',
    textKey: 'stayOnCourse.text',
    image: 'assets/trolley1.png',
    choices: [
      { textKey: 'stayOnCourse.butWhy', action: (s) => goto(s, 'butWhy') },
      { textKey: 'stayOnCourse.whatOtherTypes', action: (s) => goto(s, 'whatOtherTypes') },
    ],
  },

  butWhy: {
    id: 'butWhy',
    textKey: 'butWhy.text',
    image: 'assets/trolley1.png',
    choices: [
      { textKey: 'butWhy.tellMe', action: (s) => goto(s, 'tellMeAboutIt') },
    ],
  },

  whatOtherTypes: {
    id: 'whatOtherTypes',
    textKey: 'whatOtherTypes.text',
    image: 'assets/trolley1.png',
    choices: [
      { textKey: 'whatOtherTypes.tellMe', action: (s) => goto(s, 'tellMeAboutIt') },
    ],
  },

  tellMeAboutIt: {
    id: 'tellMeAboutIt',
    textKey: 'tellMeAboutIt.text',
    image: 'assets/trolley2.png',
    choices: [
      {
        textKey: 'tellMeAboutIt.pushPerson',
        action: (s) => {
          s.updateVar('trolley2', 1);
          goto(s, 'pushPerson');
        },
      },
      {
        textKey: 'tellMeAboutIt.doNothing',
        action: (s) => {
          s.updateVar('trolley2', 0);
          goto(s, 'doNothingTrolley');
        },
      },
    ],
  },

  pushPerson: {
    id: 'pushPerson',
    textKey: 'pushPerson.text',
    image: 'assets/trolley2.png',
    choices: [
      { textKey: 'pushPerson.whatDidTheySay', action: (s) => goto(s, 'whatDidTheySay') },
    ],
  },

  doNothingTrolley: {
    id: 'doNothingTrolley',
    textKey: 'doNothingTrolley.text',
    image: 'assets/trolley2.png',
    choices: [
      { textKey: 'doNothingTrolley.imJustObserver', action: (s) => goto(s, 'imJustAnObserver') },
      { textKey: 'doNothingTrolley.cantKillHuman', action: (s) => goto(s, 'iCantKillAHuman') },
    ],
  },

  whatDidTheySay: {
    id: 'whatDidTheySay',
    textKey: 'whatDidTheySay.text',
    image: 'assets/trolley2.png',
    choices: [
      { textKey: 'whatDidTheySay.theyAreThemIAmMe', action: (s) => goto(s, 'theyAreThemIAmMe') },
    ],
  },

  theyAreThemIAmMe: {
    id: 'theyAreThemIAmMe',
    textKey: 'theyAreThemIAmMe.text',
    image: 'assets/trolley2.png',
    onEnter: (s) => {
      s.updateVar('dot1Color', 'green');
    },
    choices: [
      {
        textKey: 'theyAreThemIAmMe.letsStart',
        action: (s) => {
          track('tutorial_complete', { passage: 'theyAreThemIAmMe' });
          goto(s, 'rezedaIntro');
        },
      },
    ],
  },

  imJustAnObserver: {
    id: 'imJustAnObserver',
    textKey: 'imJustAnObserver.text',
    image: 'assets/trolley2.png',
    onEnter: (s) => {
      s.updateVar('dot1Color', 'green');
    },
    choices: [
      {
        textKey: 'imJustAnObserver.letsStart',
        action: (s) => {
          track('tutorial_complete', { passage: 'imJustAnObserver' });
          goto(s, 'rezedaIntro');
        },
      },
    ],
  },

  iCantKillAHuman: {
    id: 'iCantKillAHuman',
    textKey: 'iCantKillAHuman.text',
    image: 'assets/trolley2.png',
    onEnter: (s) => {
      s.updateVar('dot1Color', 'green');
    },
    choices: [
      {
        textKey: 'iCantKillAHuman.letsStart',
        action: (s) => {
          track('tutorial_complete', { passage: 'iCantKillAHuman' });
          goto(s, 'rezedaIntro');
        },
      },
    ],
  },

  // ============ YACHT / REZEDA ============
  rezedaIntro: {
    id: 'rezedaIntro',
    textKey: 'rezedaIntro.text',
    image: 'assets/yacht1.png',
    choices: [
      { textKey: 'rezedaIntro.letsBegin', action: (s) => goto(s, 'rezeda') },
    ],
  },

  rezeda: {
    id: 'rezeda',
    textKey: 'rezeda.intro',
    image: 'assets/yacht1.png',
    choices: [
      { textKey: 'rezeda.nightmare', action: (s) => goto(s, 'rezeda2') },
      { textKey: 'rezeda.atLeast', action: (s) => goto(s, 'rezeda2') },
    ],
  },

  rezeda2: {
    id: 'rezeda2',
    textKey: 'rezeda2.text',
    image: 'assets/yacht1.png',
    choices: [
      { textKey: 'rezeda2.keepWaiting', action: (s) => goto(s, 'keepWaiting') },
      { textKey: 'rezeda2.catchFish', action: (s) => goto(s, 'catchFish') },
    ],
  },

  keepWaiting: {
    id: 'keepWaiting',
    textKey: 'keepWaiting.text',
    image: 'assets/yacht1.png',
    choices: [
      { textKey: 'keepWaiting.searchFood', action: (s) => goto(s, 'nothing') },
      { textKey: 'keepWaiting.waitShip', action: (s) => goto(s, 'nothing') },
      { textKey: 'keepWaiting.whatOptions', action: (s) => goto(s, 'whatOptions') },
    ],
  },

  catchFish: {
    id: 'catchFish',
    textKey: 'catchFish.text',
    image: 'assets/yacht1.png',
    choices: [
      { textKey: 'catchFish.searchFood', action: (s) => goto(s, 'nothing') },
      { textKey: 'catchFish.waitShip', action: (s) => goto(s, 'nothing') },
      { textKey: 'catchFish.whatOptions', action: (s) => goto(s, 'whatOptions') },
    ],
  },

  nothing: {
    id: 'nothing',
    textKey: 'nothing.text',
    image: 'assets/yacht1.png',
    choices: [
      { textKey: 'nothing.whatsNext', action: (s) => goto(s, 'whatOptions') },
    ],
  },

  whatOptions: {
    id: 'whatOptions',
    textKey: 'whatOptions.text',
    image: 'assets/yacht1.png',
    choices: [
      {
        textKey: 'whatOptions.agree',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'agree');
        },
      },
      { textKey: 'whatOptions.refuse', action: (s) => goto(s, 'refuse') },
    ],
  },

  refuse: {
    id: 'refuse',
    textKey: 'refuse.text',
    image: 'assets/yacht1.png',
    choices: [
      {
        textKey: 'refuse.moreAcceptable',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'moreAcceptable');
        },
      },
      { textKey: 'refuse.notAcceptable', action: (s) => goto(s, 'notAcceptable') },
    ],
  },

  agree: {
    id: 'agree',
    textKey: 'agree.text',
    image: 'assets/yacht1.png',
    choices: [
      {
        textKey: 'agree.moreAcceptable',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'moreAcceptable');
        },
      },
      { textKey: 'agree.notAcceptable', action: (s) => goto(s, 'notAcceptable') },
    ],
  },

  moreAcceptable: {
    id: 'moreAcceptable',
    textKey: 'moreAcceptable.text',
    image: 'assets/yacht1.png',
    choices: [
      {
        textKey: 'moreAcceptable.murderIsMurder',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'murderIsMurder');
        },
      },
      { textKey: 'moreAcceptable.onlyAcceptable', action: (s) => goto(s, 'onlyAcceptable') },
    ],
  },

  notAcceptable: {
    id: 'notAcceptable',
    textKey: 'notAcceptable.text',
    image: 'assets/yacht1.png',
    choices: [
      { textKey: 'notAcceptable.onlyAcceptable', action: (s) => goto(s, 'onlyAcceptable') },
      {
        textKey: 'notAcceptable.murderIsMurder',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'murderIsMurder');
        },
      },
    ],
  },

  murderIsMurder: {
    id: 'murderIsMurder',
    textKey: 'murderIsMurder.text',
    image: 'assets/yacht1.png',
    choices: [
      {
        textKey: 'murderIsMurder.horrible',
        action: (s) => {
          s.addU(0.5);
          goto(s, 'horrible');
        },
      },
      {
        textKey: 'murderIsMurder.wouldntEat',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'wouldntEat');
        },
      },
    ],
  },

  onlyAcceptable: {
    id: 'onlyAcceptable',
    textKey: 'onlyAcceptable.text',
    image: 'assets/yacht1.png',
    choices: [
      {
        textKey: 'onlyAcceptable.horrible',
        action: (s) => {
          s.addU(0.5);
          goto(s, 'horrible');
        },
      },
      {
        textKey: 'onlyAcceptable.wouldntEat',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'wouldntEat');
        },
      },
    ],
  },

  wouldntEat: {
    id: 'wouldntEat',
    textKey: 'wouldntEat.text',
    image: 'assets/yacht2.png',
    choices: [
      { textKey: 'wouldntEat.whatsNext', action: (s) => goto(s, 'whatsNext2') },
    ],
  },

  horrible: {
    id: 'horrible',
    textKey: 'horrible.text',
    image: 'assets/yacht2.png',
    choices: [
      { textKey: 'horrible.whatsNext', action: (s) => goto(s, 'whatsNext2') },
    ],
  },

  whatsNext2: {
    id: 'whatsNext2',
    textKey: 'whatsNext2.text',
    image: 'assets/yacht2.png',
    choices: [
      {
        textKey: 'whatsNext2.guilty',
        action: (s) => {
          s.addS(1);
          s.updateVar('yacht1', 1);
          goto(s, 'moral');
        },
      },
      {
        textKey: 'whatsNext2.notGuilty',
        action: (s) => {
          s.addL(1);
          s.updateVar('yacht1', 0);
          goto(s, 'moral');
        },
      },
    ],
  },

  // ============ MORAL ============
  moral: {
    id: 'moral',
    textKey: 'moral.text',
    image: 'assets/yacht2.png',
    choices: [
      {
        textKey: 'moral.contradicts',
        action: (s) => {
          s.addD(1);
          s.updateVar('yacht2', 1);
          goto(s, 'moral2');
        },
      },
      {
        textKey: 'moral.doesNotContradict',
        action: (s) => {
          s.addU(1.5);
          s.updateVar('yacht2', 0);
          goto(s, 'moral2');
        },
      },
    ],
  },

  moral2: {
    id: 'moral2',
    textKey: 'moral2.text',
    image: 'assets/yacht2.png',
    choices: [
      { textKey: 'moral2.whatAreThey', action: (s) => goto(s, 'whatAreThey') },
    ],
  },

  whatAreThey: {
    id: 'whatAreThey',
    textKey: 'whatAreThey.text',
    image: 'assets/yacht2.png',
    choices: [
      { textKey: 'whatAreThey.whatsSecond', action: (s) => goto(s, 'secondOne') },
    ],
  },

  secondOne: {
    id: 'secondOne',
    textKey: 'secondOne.text',
    image: 'assets/yacht2.png',
    choices: [
      { textKey: 'secondOne.interesting', action: (s) => goto(s, 'interesting') },
    ],
  },

  interesting: {
    id: 'interesting',
    textKey: 'interesting.text',
    image: 'assets/yacht2.png',
    choices: [
      {
        textKey: 'interesting.consequentialism',
        action: (s) => {
          s.addU(1);
          goto(s, 'ready1');
        },
      },
      {
        textKey: 'interesting.deontology',
        action: (s) => {
          s.addD(1);
          goto(s, 'ready1');
        },
      },
    ],
  },

  ready1: {
    id: 'ready1',
    textKey: 'ready1.text',
    image: 'assets/yacht2.png',
    onEnter: (s) => {
      s.updateVar('dot2Color', 'green');
    },
    choices: [
      {
        textKey: 'ready1.letsTry',
        action: (s) => {
          track('stage1_complete', { passage: 'ready1' });
          goto(s, 'factory');
        },
      },
    ],
  },

  // ============ FACTORY ============
  factory: {
    id: 'factory',
    textKey: 'factory.intro',
    image: 'assets/factory1.png',
    choices: [
      { textKey: 'factory.great', action: (s) => goto(s, 'factoryGreat') },
    ],
  },

  factoryGreat: {
    id: 'factoryGreat',
    textKey: 'factory.great_text',
    image: 'assets/factory1.png',
    choices: [
      { textKey: 'factory.howOften', action: (s) => goto(s, 'factory2') },
      { textKey: 'factory.terrible', action: (s) => goto(s, 'factory2') },
    ],
  },

  factory2: {
    id: 'factory2',
    textKey: 'factory2.text',
    image: 'assets/factory1.png',
    choices: [
      { textKey: 'factory.priceless', action: (s) => goto(s, 'factoryPriceless') },
    ],
  },

  factoryPriceless: {
    id: 'factoryPriceless',
    textKey: 'factory.priceless_text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'factory.disagree', action: (s) => goto(s, 'factoryDisagree') },
    ],
  },

  factoryDisagree: {
    id: 'factoryDisagree',
    textKey: 'factory.disagree_text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'factory.inhumane', action: (s) => goto(s, 'factoryInhumane') },
    ],
  },

  factoryInhumane: {
    id: 'factoryInhumane',
    textKey: 'factory.inhumane_text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'factory.otherOptions', action: (s) => goto(s, 'factoryOtherOptions') },
    ],
  },

  factoryOtherOptions: {
    id: 'factoryOtherOptions',
    textKey: 'factory.otherOptions_text',
    image: 'assets/factory2.png',
    choices: [
      {
        textKey: 'factory.acceptable',
        action: (s) => {
          s.addU(1);
          s.updateVar('factory1', 1);
          goto(s, 'factory3');
        },
      },
      {
        textKey: 'factory.notAcceptable2',
        action: (s) => {
          s.addD(1);
          s.updateVar('factory1', 0);
          goto(s, 'factory3');
        },
      },
    ],
  },

  factory3: {
    id: 'factory3',
    textKey: 'factory3.text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'factory3.ofCourse', action: (s) => goto(s, 'factoryDecision') },
    ],
  },

  factoryDecision: {
    id: 'factoryDecision',
    textKey: 'factory3.decision_text',
    image: 'assets/factory2.png',
    choices: [
      {
        textKey: 'factory3.installProtection',
        action: (s) => {
          s.addS(0.5);
          s.updateVar('factory2', 1);
          goto(s, 'installProtection');
        },
      },
      {
        textKey: 'factory3.doNothing',
        action: (s) => {
          s.addL(0.5);
          s.addU(0.5);
          s.updateVar('factory2', 0);
          goto(s, 'doNothingFactory');
        },
      },
    ],
  },

  installProtection: {
    id: 'installProtection',
    textKey: 'installProtection.text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'installProtection.hmm', action: (s) => goto(s, 'factoryHmm') },
    ],
  },

  factoryHmm: {
    id: 'factoryHmm',
    textKey: 'factoryHmm.text',
    image: 'assets/factory2.png',
    choices: [
      {
        textKey: 'factoryHmm.shouldnt',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'factory4');
        },
      },
      { textKey: 'factoryHmm.definitelyShould', action: (s) => goto(s, 'factory4') },
    ],
  },

  factory4: {
    id: 'factory4',
    textKey: 'factory4.text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'factory4.whatPhilosophers', action: (s) => goto(s, 'utilitarianism') },
    ],
  },

  doNothingFactory: {
    id: 'doNothingFactory',
    textKey: 'doNothing.text',
    image: 'assets/factory2.png',
    choices: [
      {
        textKey: 'doNothing.yesAgree',
        action: (s) => {
          s.addU(0.5);
          goto(s, 'factory5');
        },
      },
      { textKey: 'doNothing.stillDoubtful', action: (s) => goto(s, 'factory5') },
    ],
  },

  factory5: {
    id: 'factory5',
    textKey: 'factory5.text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'factory5.hm', action: (s) => goto(s, 'factoryHm') },
    ],
  },

  factoryHm: {
    id: 'factoryHm',
    textKey: 'factoryHm.text',
    image: 'assets/factory2.png',
    choices: [
      { textKey: 'factoryHm.whatPhilosophers', action: (s) => goto(s, 'utilitarianism') },
    ],
  },

  // ============ UTILITARIANISM ============
  utilitarianism: {
    id: 'utilitarianism',
    textKey: 'utilitarianism.text',
    image: 'assets/factory2.png',
    onEnter: (s) => {
      s.updateVar('dot3Color', 'green');
    },
    choices: [
      {
        textKey: 'utilitarianism.imIn',
        action: (s) => {
          track('stage2_complete', { passage: 'utilitarianism' });
          goto(s, 'deontologyIntro');
        },
      },
    ],
  },

  // ============ DEONTOLOGY ============
  deontologyIntro: {
    id: 'deontologyIntro',
    textKey: 'deontology.intro',
    image: 'assets/deontology1.png',
    choices: [
      { textKey: 'deontology.helloKant', action: (s) => goto(s, 'helloKant') },
    ],
  },

  helloKant: {
    id: 'helloKant',
    textKey: 'deontology.helloKant_text',
    image: 'assets/deontology1.png',
    choices: [
      { textKey: 'deontology.letsBegin', action: (s) => goto(s, 'deontology2') },
      { textKey: 'deontology.weCanHandle', action: (s) => goto(s, 'deontology2') },
    ],
  },

  deontology2: {
    id: 'deontology2',
    textKey: 'deontology2.text',
    image: 'assets/deontology1.png',
    choices: [
      {
        textKey: 'deontology2.choice1',
        action: (s) => goto(s, 'deontology3'),
      },
      {
        textKey: 'deontology2.choice2',
        action: (s) => {
          s.addU(0.5);
          goto(s, 'deontology3');
        },
      },
    ],
  },

  deontology3: {
    id: 'deontology3',
    textKey: 'deontology3.text',
    image: 'assets/deontology1.png',
    choices: [
      { textKey: 'deontology3.lifeAndDeath', action: (s) => goto(s, 'lifeAndDeath') },
    ],
  },

  lifeAndDeath: {
    id: 'lifeAndDeath',
    textKey: 'lifeAndDeath.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'lifeAndDeath.makesSense',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'thatMakesSense');
        },
      },
      {
        textKey: 'lifeAndDeath.moralityVsLife',
        action: (s) => goto(s, 'moralityVsLife'),
      },
    ],
  },

  thatMakesSense: {
    id: 'thatMakesSense',
    textKey: 'thatMakesSense.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'thatMakesSense.lieToSave',
        action: (s) => {
          s.addU(1);
          goto(s, 'lieToSave');
        },
      },
      {
        textKey: 'thatMakesSense.cantNeverLie',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'cantNeverLie');
        },
      },
    ],
  },

  moralityVsLife: {
    id: 'moralityVsLife',
    textKey: 'moralityVsLife.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'moralityVsLife.lieToSave',
        action: (s) => {
          s.addU(1);
          goto(s, 'lieToSave');
        },
      },
      {
        textKey: 'moralityVsLife.cantNeverLie',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'cantNeverLie');
        },
      },
    ],
  },

  cantNeverLie: {
    id: 'cantNeverLie',
    textKey: 'cantNeverLie.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'cantNeverLie.algorithm',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'deontology4');
        },
      },
      {
        textKey: 'cantNeverLie.dontUnderstand',
        action: (s) => goto(s, 'deontology4'),
      },
    ],
  },

  lieToSave: {
    id: 'lieToSave',
    textKey: 'lieToSave.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'lieToSave.algorithm',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'deontology4');
        },
      },
      {
        textKey: 'lieToSave.dontUnderstand',
        action: (s) => goto(s, 'deontology4'),
      },
    ],
  },

  deontology4: {
    id: 'deontology4',
    textKey: 'deontology4.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'deontology4.yesMakesSense',
        action: (s) => {
          s.addD(1);
          s.updateVar('lies1', 1);
          goto(s, 'yesThatMakesSense');
        },
      },
      {
        textKey: 'deontology4.stillDisagree',
        action: (s) => {
          s.addU(0.5);
          s.updateVar('lies1', 0);
          goto(s, 'stillDisagreeLies');
        },
      },
    ],
  },

  yesThatMakesSense: {
    id: 'yesThatMakesSense',
    textKey: 'yesThatMakesSense.text',
    image: 'assets/deontology2.png',
    choices: [
      { textKey: 'yesThatMakesSense.moreOptions', action: (s) => goto(s, 'moreOptions') },
    ],
  },

  stillDisagreeLies: {
    id: 'stillDisagreeLies',
    textKey: 'stillDisagreeLies.text',
    image: 'assets/deontology2.png',
    choices: [
      { textKey: 'stillDisagreeLies.sameResult', action: (s) => goto(s, 'deontology5') },
      { textKey: 'stillDisagreeLies.tellMore', action: (s) => goto(s, 'deontology5') },
    ],
  },

  deontology5: {
    id: 'deontology5',
    textKey: 'deontology5.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'deontology5.lieForGood',
        action: (s) => {
          s.addU(0.5);
          goto(s, 'deontology6');
        },
      },
      {
        textKey: 'deontology5.lieIsLie',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'deontology6');
        },
      },
    ],
  },

  deontology6: {
    id: 'deontology6',
    textKey: 'deontology6.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'deontology6.differentThings',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'deontology7');
        },
      },
      {
        textKey: 'deontology6.sameThings',
        action: (s) => {
          s.addU(0.5);
          goto(s, 'deontology7');
        },
      },
    ],
  },

  deontology7: {
    id: 'deontology7',
    textKey: 'deontology7.text',
    image: 'assets/deontology2.png',
    choices: [
      { textKey: 'deontology7.moreOptions', action: (s) => goto(s, 'moreOptions') },
    ],
  },

  moreOptions: {
    id: 'moreOptions',
    textKey: 'moreOptions.text',
    image: 'assets/deontology2.png',
    choices: [
      { textKey: 'moreOptions.remember', action: (s) => goto(s, 'deontology8') },
      { textKey: 'moreOptions.inPractice', action: (s) => goto(s, 'deontology8') },
    ],
  },

  deontology8: {
    id: 'deontology8',
    textKey: 'deontology8.text',
    image: 'assets/deontology2.png',
    choices: [
      { textKey: 'deontology8.understand', action: (s) => goto(s, 'deontology9') },
      { textKey: 'deontology8.needToThink', action: (s) => goto(s, 'deontology9') },
    ],
  },

  deontology9: {
    id: 'deontology9',
    textKey: 'deontology9.text',
    image: 'assets/deontology2.png',
    choices: [
      {
        textKey: 'deontology9.agreeWithKant',
        action: (s) => {
          s.addD(1);
          s.updateVar('lies2', 1);
          goto(s, 'deontology10');
        },
      },
      {
        textKey: 'deontology9.preferUtilitarian',
        action: (s) => {
          s.addU(0.5);
          s.updateVar('lies2', 0);
          goto(s, 'deontology10');
        },
      },
    ],
  },

  deontology10: {
    id: 'deontology10',
    textKey: 'deontology10.text',
    image: 'assets/deontology2.png',
    onEnter: (s) => {
      s.updateVar('dot4Color', 'green');
    },
    choices: [
      {
        textKey: 'deontology10.letsDoIt',
        action: (s) => {
          track('stage3_complete', { passage: 'deontology10' });
          goto(s, 'libertarian');
        },
      },
    ],
  },

  // ============ LIBERTARIAN ============
  libertarian: {
    id: 'libertarian',
    textKey: 'libertarian.intro',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'libertarian.letsGive', action: (s) => goto(s, 'libertarian2') },
      { textKey: 'libertarian.whatsTheDifficulty', action: (s) => goto(s, 'libertarian2') },
    ],
  },

  libertarian2: {
    id: 'libertarian2',
    textKey: 'libertarian2.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'libertarian2.noContradiction', action: (s) => goto(s, 'libertarian3') },
      { textKey: 'libertarian2.somethingToThink', action: (s) => goto(s, 'libertarian3') },
    ],
  },

  libertarian3: {
    id: 'libertarian3',
    textKey: 'libertarian3.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'libertarian3.shouldntPayMore',
        action: (s) => {
          s.addL(1);
          s.updateVar('liberty1', 1);
          goto(s, 'shouldntPayMore');
        },
      },
      {
        textKey: 'libertarian3.taxesPayment',
        action: (s) => {
          s.addS(1);
          s.updateVar('liberty1', 0);
          goto(s, 'taxesPayment');
        },
      },
    ],
  },

  shouldntPayMore: {
    id: 'shouldntPayMore',
    textKey: 'shouldntPayMore.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'shouldntPayMore.notBecauseOfMe', action: (s) => goto(s, 'libertarian15') },
      { textKey: 'shouldntPayMore.worldIsUnfair', action: (s) => goto(s, 'libertarian15') },
      { textKey: 'shouldntPayMore.agreePayMore', action: (s) => goto(s, 'agreePayMore') },
    ],
  },

  taxesPayment: {
    id: 'taxesPayment',
    textKey: 'taxesPayment.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'taxesPayment.yeahThatsMe', action: (s) => goto(s, 'libertarian4') },
    ],
  },

  agreePayMore: {
    id: 'agreePayMore',
    textKey: 'agreePayMore.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'agreePayMore.earnedThanks',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'libertarian5');
        },
      },
      {
        textKey: 'agreePayMore.everyonesChoice',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian6');
        },
      },
    ],
  },

  libertarian4: {
    id: 'libertarian4',
    textKey: 'libertarian4.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'libertarian4.earnedThanks',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'libertarian5');
        },
      },
      {
        textKey: 'libertarian4.everyonesChoice',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian6');
        },
      },
    ],
  },

  libertarian15: {
    id: 'libertarian15',
    textKey: 'libertarian15.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'libertarian15.canChoose',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian16');
        },
      },
      {
        textKey: 'libertarian15.onlyOneTalent',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'libertarian16');
        },
      },
      {
        textKey: 'libertarian15.agreeRichPayMore',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'agreeRichPayMore');
        },
      },
    ],
  },

  agreeRichPayMore: {
    id: 'agreeRichPayMore',
    textKey: 'agreeRichPayMore.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'agreeRichPayMore.hm', action: (s) => goto(s, 'libertarian7') },
    ],
  },

  libertarian16: {
    id: 'libertarian16',
    textKey: 'libertarian16.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'libertarian16.hm', action: (s) => goto(s, 'libertarian7') },
    ],
  },

  libertarian5: {
    id: 'libertarian5',
    textKey: 'libertarian5.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'libertarian5.betterForSociety',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'betterForSociety');
        },
      },
      {
        textKey: 'libertarian5.seemsUnfair',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian7');
        },
      },
    ],
  },

  libertarian6: {
    id: 'libertarian6',
    textKey: 'libertarian6.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'libertarian6.betterForSociety',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'betterForSociety');
        },
      },
      {
        textKey: 'libertarian6.seemsUnfair',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian7');
        },
      },
    ],
  },

  betterForSociety: {
    id: 'betterForSociety',
    textKey: 'betterForSociety.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'betterForSociety.diffTaxesTheft', action: (s) => goto(s, 'libertarian17') },
      { textKey: 'betterForSociety.taxesUnnecessary', action: (s) => goto(s, 'libertarian17') },
    ],
  },

  libertarian17: {
    id: 'libertarian17',
    textKey: 'libertarian17.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'libertarian17.minimalGreat',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian8');
        },
      },
      {
        textKey: 'libertarian17.strongerState',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'libertarian8');
        },
      },
      { textKey: 'libertarian17.disagreeWithThem', action: (s) => goto(s, 'libertarian8') },
    ],
  },

  libertarian7: {
    id: 'libertarian7',
    textKey: 'libertarian7.text',
    image: 'assets/taxes1.png',
    choices: [
      {
        textKey: 'libertarian7.stateNoRight',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'stateNoRight');
        },
      },
      {
        textKey: 'libertarian7.notDemocracy',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'libertarian9');
        },
      },
      {
        textKey: 'libertarian7.soundsLogical',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'libertarian19');
        },
      },
    ],
  },

  stateNoRight: {
    id: 'stateNoRight',
    textKey: 'stateNoRight.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'stateNoRight.disagreeWithThem', action: (s) => goto(s, 'libertarian8') },
      { textKey: 'stateNoRight.minimalGreat', action: (s) => goto(s, 'libertarian8') },
      { textKey: 'stateNoRight.strongerState', action: (s) => goto(s, 'libertarian8') },
    ],
  },

  libertarian19: {
    id: 'libertarian19',
    textKey: 'libertarian19.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'libertarian19.getIt', action: (s) => goto(s, 'libertarian8') },
    ],
  },

  libertarian9: {
    id: 'libertarian9',
    textKey: 'libertarian9.text',
    image: 'assets/taxes1.png',
    choices: [
      { textKey: 'libertarian9.great', action: (s) => goto(s, 'libertarian8') },
    ],
  },

  libertarian8: {
    id: 'libertarian8',
    textKey: 'libertarian8.text',
    image: 'assets/taxes2.png',
    choices: [
      { textKey: 'libertarian8.noContradiction', action: (s) => goto(s, 'libertarian10') },
      { textKey: 'libertarian8.toughChoice', action: (s) => goto(s, 'libertarian10') },
    ],
  },

  libertarian10: {
    id: 'libertarian10',
    textKey: 'libertarian10.text',
    image: 'assets/taxes2.png',
    choices: [
      {
        textKey: 'libertarian10.talentAboveAll',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian11');
        },
      },
      {
        textKey: 'libertarian10.balanceNeeded',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'libertarian11');
        },
      },
      {
        textKey: 'libertarian10.equalOpportunities',
        action: (s) => goto(s, 'libertarian11'),
      },
    ],
  },

  libertarian11: {
    id: 'libertarian11',
    textKey: 'libertarian11.text',
    image: 'assets/taxes2.png',
    choices: [
      {
        textKey: 'libertarian11.chooseOwnNorm',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'libertarian12');
        },
      },
      {
        textKey: 'libertarian11.sameNormEverywhere',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'libertarian12');
        },
      },
    ],
  },

  libertarian12: {
    id: 'libertarian12',
    textKey: 'libertarian12.text',
    image: 'assets/taxes2.png',
    choices: [
      {
        textKey: 'libertarian12.yesAbsolutely',
        action: (s) => {
          s.addL(0.5);
          s.updateVar('liberty2', 1);
          goto(s, 'libertarian13');
        },
      },
      {
        textKey: 'libertarian12.reasonableRestriction',
        action: (s) => {
          s.addS(0.5);
          s.updateVar('liberty2', 0);
          goto(s, 'libertarian13');
        },
      },
    ],
  },

  libertarian13: {
    id: 'libertarian13',
    textKey: 'libertarian13.text',
    image: 'assets/taxes2.png',
    choices: [
      { textKey: 'libertarian13.bestWay', action: (s) => goto(s, 'libertarian14') },
      { textKey: 'libertarian13.rightMoment', action: (s) => goto(s, 'libertarian14') },
    ],
  },

  libertarian14: {
    id: 'libertarian14',
    textKey: 'libertarian14.text',
    image: 'assets/taxes2.png',
    onEnter: (s) => {
      s.updateVar('dot5Color', 'green');
    },
    choices: [
      {
        textKey: 'libertarian14.letsFinish',
        action: (s) => {
          track('stage4_complete', { passage: 'libertarian14' });
          goto(s, 'privacy');
        },
      },
    ],
  },

  // ============ PRIVACY ============
  privacy: {
    id: 'privacy',
    textKey: 'privacy.intro',
    image: 'assets/privacy1.png',
    choices: [
      { textKey: 'privacy.letsStart', action: (s) => goto(s, 'privacyStart') },
    ],
  },

  privacyStart: {
    id: 'privacyStart',
    textKey: 'privacyStart.text',
    image: 'assets/privacy1.png',
    choices: [
      { textKey: 'privacyStart.horrible', action: (s) => goto(s, 'privacy2') },
      { textKey: 'privacyStart.getIt', action: (s) => goto(s, 'privacy2') },
    ],
  },

  privacy2: {
    id: 'privacy2',
    textKey: 'privacy2.text',
    image: 'assets/privacy1.png',
    choices: [
      {
        textKey: 'privacy2.yesSave',
        action: (s) => {
          s.addU(0.5);
          s.updateVar('privacy1', 1);
          goto(s, 'yesSavePrivacy');
        },
      },
      {
        textKey: 'privacy2.endUpTorturing',
        action: (s) => {
          s.addD(0.5);
          s.updateVar('privacy1', 0);
          goto(s, 'endUpTorturing');
        },
      },
    ],
  },

  yesSavePrivacy: {
    id: 'yesSavePrivacy',
    textKey: 'yesSavePrivacy.text',
    image: 'assets/privacy1.png',
    choices: [
      { textKey: 'yesSavePrivacy.madeHisChoice', action: (s) => goto(s, 'privacy3') },
      { textKey: 'yesSavePrivacy.shouldntGoDown', action: (s) => goto(s, 'privacy3') },
    ],
  },

  endUpTorturing: {
    id: 'endUpTorturing',
    textKey: 'endUpTorturing.text',
    image: 'assets/privacy1.png',
    choices: [
      {
        textKey: 'endUpTorturing.tortureUnacceptable',
        action: (s) => {
          s.addD(0.5);
          goto(s, 'privacy10');
        },
      },
      {
        textKey: 'endUpTorturing.notIfYou',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'privacy10');
        },
      },
      {
        textKey: 'endUpTorturing.soundsReasonable',
        action: (s) => {
          s.addU(0.5);
          goto(s, 'privacy10');
        },
      },
    ],
  },

  privacy10: {
    id: 'privacy10',
    textKey: 'privacy10.text',
    image: 'assets/privacy1.png',
    choices: [
      { textKey: 'privacy10.alsoIneffective', action: (s) => goto(s, 'privacy4') },
      { textKey: 'privacy10.verifyInfo', action: (s) => goto(s, 'privacy4') },
    ],
  },

  privacy3: {
    id: 'privacy3',
    textKey: 'privacy3.text',
    image: 'assets/privacy1.png',
    choices: [
      { textKey: 'privacy3.doesntMatter', action: (s) => goto(s, 'privacy4') },
      { textKey: 'privacy3.tortureIneffective', action: (s) => goto(s, 'privacy4') },
    ],
  },

  privacy4: {
    id: 'privacy4',
    textKey: 'privacy4.text',
    image: 'assets/privacy1.png',
    choices: [
      {
        textKey: 'privacy4.yesSafer',
        action: (s) => {
          s.addS(1);
          goto(s, 'yesSafer');
        },
      },
      {
        textKey: 'privacy4.rightToPrivacy',
        action: (s) => {
          s.addL(1);
          goto(s, 'rightToPrivacy');
        },
      },
    ],
  },

  yesSafer: {
    id: 'yesSafer',
    textKey: 'yesSafer.text',
    image: 'assets/privacy2.png',
    choices: [
      { textKey: 'yesSafer.stillSafer', action: (s) => goto(s, 'privacy5') },
      { textKey: 'yesSafer.boundariesNeeded', action: (s) => goto(s, 'privacy5') },
    ],
  },

  rightToPrivacy: {
    id: 'rightToPrivacy',
    textKey: 'rightToPrivacy.text',
    image: 'assets/privacy2.png',
    choices: [
      { textKey: 'rightToPrivacy.noUnacceptable', action: (s) => goto(s, 'privacy11') },
      { textKey: 'rightToPrivacy.thinkAboutIt', action: (s) => goto(s, 'privacy11') },
    ],
  },

  privacy11: {
    id: 'privacy11',
    textKey: 'privacy11.text',
    image: 'assets/privacy2.png',
    choices: [
      { textKey: 'privacy11.soundsReasonable', action: (s) => goto(s, 'privacy12') },
      { textKey: 'privacy11.stillFreedom', action: (s) => goto(s, 'privacy12') },
    ],
  },

  privacy12: {
    id: 'privacy12',
    textKey: 'privacy12.text',
    image: 'assets/privacy2.png',
    choices: [
      {
        textKey: 'privacy12.ofCourseNot',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'privacy6');
        },
      },
      {
        textKey: 'privacy12.ifHelpsRead',
        action: (s) => {
          s.addS(1);
          goto(s, 'privacy6');
        },
      },
    ],
  },

  privacy5: {
    id: 'privacy5',
    textKey: 'privacy5.text',
    image: 'assets/privacy2.png',
    choices: [
      {
        textKey: 'privacy5.pleaseDont',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'privacy6');
        },
      },
      {
        textKey: 'privacy5.ifHelpsRead',
        action: (s) => {
          s.addS(1);
          goto(s, 'privacy6');
        },
      },
    ],
  },

  privacy6: {
    id: 'privacy6',
    textKey: 'privacy6.text',
    image: 'assets/privacy2.png',
    choices: [
      {
        textKey: 'privacy6.noProtection',
        action: (s) => {
          s.addL(0.5);
          s.updateVar('privacy2', 1);
          goto(s, 'privacy15');
        },
      },
      {
        textKey: 'privacy6.someRestrictions',
        action: (s) => {
          s.addS(0.5);
          s.updateVar('privacy2', 0);
          goto(s, 'privacy13');
        },
      },
      {
        textKey: 'privacy6.twoDifferentThings',
        action: (s) => goto(s, 'twoDifferentThings'),
      },
    ],
  },

  twoDifferentThings: {
    id: 'twoDifferentThings',
    textKey: 'twoDifferentThings.text',
    image: 'assets/privacy2.png',
    choices: [
      {
        textKey: 'twoDifferentThings.firearmsProhibited',
        action: (s) => {
          s.addS(0.5);
          s.updateVar('privacy2', 0);
          goto(s, 'privacy13');
        },
      },
      {
        textKey: 'twoDifferentThings.rightToFirearms',
        action: (s) => {
          s.addL(0.5);
          s.updateVar('privacy2', 1);
          goto(s, 'privacy15');
        },
      },
    ],
  },

  privacy15: {
    id: 'privacy15',
    textKey: 'privacy15.text',
    image: 'assets/privacy2.png',
    choices: [
      { textKey: 'privacy15.rightToProtection', action: (s) => goto(s, 'privacy14') },
      { textKey: 'privacy15.makesSense', action: (s) => goto(s, 'privacy14') },
    ],
  },

  privacy13: {
    id: 'privacy13',
    textKey: 'privacy13.text',
    image: 'assets/privacy2.png',
    choices: [
      { textKey: 'privacy13.thinkSo', action: (s) => goto(s, 'privacy7') },
      { textKey: 'privacy13.needBalance', action: (s) => goto(s, 'privacy7') },
      { textKey: 'privacy13.dontLimitRights', action: (s) => goto(s, 'privacy7') },
    ],
  },

  privacy14: {
    id: 'privacy14',
    textKey: 'privacy14.text',
    image: 'assets/privacy2.png',
    choices: [
      {
        textKey: 'privacy14.rightToWeapon',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'privacy8');
        },
      },
      {
        textKey: 'privacy14.seemsFair',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'privacy8');
        },
      },
    ],
  },

  privacy7: {
    id: 'privacy7',
    textKey: 'privacy7.text',
    image: 'assets/privacy2.png',
    choices: [
      {
        textKey: 'privacy7.rightToWeapon',
        action: (s) => {
          s.addL(0.5);
          goto(s, 'privacy8');
        },
      },
      {
        textKey: 'privacy7.seemsFair',
        action: (s) => {
          s.addS(0.5);
          goto(s, 'privacy8');
        },
      },
    ],
  },

  privacy8: {
    id: 'privacy8',
    textKey: 'privacy8.text',
    image: 'assets/privacy2.png',
    choices: [
      { textKey: 'privacy8.waitMore', action: (s) => goto(s, 'privacy9') },
      { textKey: 'privacy8.gladHelped', action: (s) => goto(s, 'privacy9') },
    ],
  },

  privacy9: {
    id: 'privacy9',
    textKey: 'privacy9.text',
    image: 'assets/privacy2.png',
    choices: [
      {
        textKey: 'privacy9.excited',
        action: (s) => {
          s.updateVar('dot5Color', 'green');
          s.computeResults();
          track('stage5_complete', { passage: 'privacy9' });
          goto(s, 'endgame');
        },
      },
    ],
  },

  // ============ ENDGAME ============
  endgame: {
    id: 'endgame',
    textKey: 'endgame.grateful',
    image: 'assets/ai.png',
    choices: [
      { textKey: 'endgame.wait', action: (s) => goto(s, 'endgame2') },
      { textKey: 'endgame.shouldHaveGuessed', action: (s) => goto(s, 'endgame2') },
      { textKey: 'endgame.knewIt', action: (s) => goto(s, 'endgame2') },
    ],
    onEnter: (s) => {
      submitToGoogleSheets({
        U: s.U, D: s.D, L: s.L, S: s.S,
        Lang: s.lang,
        trolley1: s.trolley1, trolley2: s.trolley2,
        yacht1: s.yacht1, yacht2: s.yacht2,
        factory1: s.factory1, factory2: s.factory2,
        lies1: s.lies1, lies2: s.lies2,
        liberty1: s.liberty1, liberty2: s.liberty2,
        privacy1: s.privacy1, privacy2: s.privacy2,
        science: s.science, society: s.society, art: s.art,
      });
    },
  },

  endgame2: {
    id: 'endgame2',
    textKey: 'endgame2.text',
    image: 'assets/ai.png',
    choices: [
      {
        textKey: 'endgame2.wantToKnow',
        action: (s) => {
          if (s.U < 2) goto(s, 'sciencePoor');
          else if (s.U > 5) goto(s, 'scienceGood');
          else goto(s, 'scienceAverage');
        },
      },
    ],
  },

  sciencePoor: {
    id: 'sciencePoor',
    textKey: 'sciencePoor.text',
    image: 'assets/science3.png',
    choices: [
      {
        textKey: 'sciencePoor.continue',
        action: (s) => {
          if (s.L > 5) goto(s, 'societyPoor');
          else if (s.S > 6) goto(s, 'societyGood');
          else goto(s, 'societyAverage');
        },
      },
    ],
  },

  scienceAverage: {
    id: 'scienceAverage',
    textKey: 'scienceAverage.text',
    image: 'assets/science2.png',
    choices: [
      {
        textKey: 'scienceAverage.continue',
        action: (s) => {
          if (s.L > 5) goto(s, 'societyPoor');
          else if (s.S > 6) goto(s, 'societyGood');
          else goto(s, 'societyAverage');
        },
      },
    ],
  },

  scienceGood: {
    id: 'scienceGood',
    textKey: 'scienceGood.text',
    image: 'assets/science1.png',
    choices: [
      {
        textKey: 'scienceGood.continue',
        action: (s) => {
          if (s.L > 5) goto(s, 'societyPoor');
          else if (s.S > 6) goto(s, 'societyGood');
          else goto(s, 'societyAverage');
        },
      },
    ],
  },

  societyPoor: {
    id: 'societyPoor',
    textKey: 'societyPoor.text',
    image: 'assets/society3.png',
    choices: [
      {
        textKey: 'societyPoor.continue',
        action: (s) => {
          if (s.U > 5) goto(s, 'artPoor');
          else if (s.D > 6) goto(s, 'artGood');
          else goto(s, 'artAverage');
        },
      },
    ],
  },

  societyAverage: {
    id: 'societyAverage',
    textKey: 'societyAverage.text',
    image: 'assets/society2.png',
    choices: [
      {
        textKey: 'societyAverage.continue',
        action: (s) => {
          if (s.U > 5) goto(s, 'artPoor');
          else if (s.D > 6) goto(s, 'artGood');
          else goto(s, 'artAverage');
        },
      },
    ],
  },

  societyGood: {
    id: 'societyGood',
    textKey: 'societyGood.text',
    image: 'assets/society1.png',
    choices: [
      {
        textKey: 'societyGood.continue',
        action: (s) => {
          if (s.U > 5) goto(s, 'artPoor');
          else if (s.D > 6) goto(s, 'artGood');
          else goto(s, 'artAverage');
        },
      },
    ],
  },

  artPoor: {
    id: 'artPoor',
    textKey: 'artPoor.text',
    image: 'assets/art3.png',
    choices: [
      { textKey: 'artPoor.continue', action: (s) => goto(s, 'endgame3') },
    ],
  },

  artAverage: {
    id: 'artAverage',
    textKey: 'artAverage.text',
    image: 'assets/art2.png',
    choices: [
      { textKey: 'artAverage.continue', action: (s) => goto(s, 'endgame3') },
    ],
  },

  artGood: {
    id: 'artGood',
    textKey: 'artGood.text',
    image: 'assets/art1.png',
    choices: [
      { textKey: 'artGood.continue', action: (s) => goto(s, 'endgame3') },
    ],
  },

  endgame3: {
    id: 'endgame3',
    textKey: 'endgame3.text',
    image: 'assets/ai.png',
    choices: [
      {
        textKey: 'endgame3.aboutMe',
        action: (s) => {
          s.computeGraph();
          track('result_complete', { passage: 'endgame3' });
          if (s.U >= s.D && s.L >= s.S) goto(s, 'resultUL');
          else if (s.U < s.D && s.L < s.S) goto(s, 'resultDS');
          else if (s.U < s.D && s.L >= s.S) goto(s, 'resultDL');
          else goto(s, 'resultUS');
        },
      },
    ],
  },

  // ============ RESULTS ============
  resultUL: {
    id: 'resultUL',
    textKey: 'results.UL.title',
    isHtml: true,
    choices: [
      { textKey: 'results.playAgain', action: (s) => s.resetGame() },
      { textKey: 'results.tryOtherGames', action: () => window.open('https://buildtounderstand.dev/', '_blank') },
      { textKey: 'results.credits', action: (s) => goto(s, 'credits') },
    ],
  },

  resultUS: {
    id: 'resultUS',
    textKey: 'results.US.title',
    isHtml: true,
    choices: [
      { textKey: 'results.playAgain', action: (s) => s.resetGame() },
      { textKey: 'results.tryOtherGames', action: () => window.open('https://buildtounderstand.dev/', '_blank') },
      { textKey: 'results.credits', action: (s) => goto(s, 'credits') },
    ],
  },

  resultDL: {
    id: 'resultDL',
    textKey: 'results.DL.title',
    isHtml: true,
    choices: [
      { textKey: 'results.playAgain', action: (s) => s.resetGame() },
      { textKey: 'results.tryOtherGames', action: () => window.open('https://buildtounderstand.dev/', '_blank') },
      { textKey: 'results.credits', action: (s) => goto(s, 'credits') },
    ],
  },

  resultDS: {
    id: 'resultDS',
    textKey: 'results.DS.title',
    isHtml: true,
    choices: [
      { textKey: 'results.playAgain', action: (s) => s.resetGame() },
      { textKey: 'results.tryOtherGames', action: () => window.open('https://buildtounderstand.dev/', '_blank') },
      { textKey: 'results.credits', action: (s) => goto(s, 'credits') },
    ],
  },

  // ============ CREDITS ============
  credits: {
    id: 'credits',
    textKey: 'credits.author',
    choices: [
      { textKey: 'credits.subscribeUpdates', action: () => window.open('https://buildtounderstand.substack.com/?subscribe=true', '_blank') },
      { textKey: 'credits.otherGames', action: () => window.open('https://buildtounderstand.dev', '_blank') },
      { textKey: 'credits.feedback', action: () => window.open('https://forms.gle/WxqUsMEBUeN4Y7gw5', '_blank') },
      { textKey: 'credits.harvardCourse', action: () => window.open('https://sandel.scholars.harvard.edu/justice', '_blank') },
      { textKey: 'credits.playAgain', action: (s) => s.resetGame() },
      { textKey: 'credits.supportMe', action: () => window.open('https://patreon.com/buildtounderstand', '_blank') },
    ],
  },
};
