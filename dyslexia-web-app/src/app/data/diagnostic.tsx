// Each subtype for specific tasks
export type ElisionQuestion = {
  word: string;
  syllables: string[];
  remove: string;
  answer: string;
};

export type PhonemeIsolationQuestion = {
  word: string;
  position: string;
  answer: string;
};

export type BlendingQuestion = {
  parts: string[];
  answer: string;
};

export type SoundMatchingQuestion = {
  target: string;
  choices: string[];
  answer: string;
};

export type MemoryDigitsQuestion = {
  digits: number[];
  answer: number[];
};

export type NonwordRepetitionQuestion = {
  nonword: string;
  answer: string;
};

export type RapidSymbolicQuestion = {
  items: string[];
  answer: string[];
};

export type RapidNonSymbolicQuestion = {
  items: string[];
  answer: string[];
};

// Question group union
export type QuestionGroup =
  | { type: "elision"; questions: ElisionQuestion[] }
  | { type: "phoneme_isolation"; questions: PhonemeIsolationQuestion[] }
  | { type: "blending_words"; questions: BlendingQuestion[] }
  | { type: "blending_nonwords"; questions: BlendingQuestion[] }
  | { type: "sound_matching"; questions: SoundMatchingQuestion[] }
  | { type: "memory_for_digits"; questions: MemoryDigitsQuestion[] }
  | { type: "nonword_repetition"; questions: NonwordRepetitionQuestion[] }
  | { type: "rapid_symbolic_naming"; questions: RapidSymbolicQuestion[] }
  | {
      type: "rapid_non_symbolic_naming";
      questions: RapidNonSymbolicQuestion[];
    };

// The actual questions
const diagnosticQuestions: QuestionGroup[] = [
  // ELISION
  {
    type: "elision",
    questions: [
      {
        word: "cowboy",
        syllables: ["cow", "boy"],
        remove: "cow",
        answer: "boy",
      },
      {
        word: "brainstorming",
        syllables: ["brain", "storm", "ing"],
        remove: "ing",
        answer: "brainstorm",
      },
      {
        word: "cowboy",
        syllables: ["cow", "boy"],
        remove: "boy",
        answer: "cow",
      },
      {
        word: "brainstorming",
        syllables: ["brain", "storm", "ing"],
        remove: "storm",
        answer: "braining",
      },
      {
        word: "banana",
        syllables: ["ba", "na", "na"],
        remove: "ba",
        answer: "nana",
      },
      {
        word: "helicopter",
        syllables: ["hel", "i", "cop", "ter"],
        remove: "ter",
        answer: "helicop",
      },
      {
        word: "helicopter",
        syllables: ["hel", "i", "cop", "ter"],
        remove: "cop",
        answer: "heliter",
      },
      {
        word: "elephant",
        syllables: ["el", "e", "phant"],
        remove: "phant",
        answer: "ele",
      },
      {
        word: "elephant",
        syllables: ["el", "e", "phant"],
        remove: "el",
        answer: "ephant",
      },
    ],
  },
  // PHONEME ISOLATION
  {
    type: "phoneme_isolation",
    questions: [
      { word: "cat", position: "first", answer: "c" },
      { word: "dog", position: "last", answer: "g" },
      { word: "ship", position: "first", answer: "sh" },
      { word: "ship", position: "last", answer: "p" },
      { word: "frog", position: "second", answer: "r" },
      { word: "tree", position: "first", answer: "t" },
      { word: "smile", position: "first", answer: "s" },
      { word: "smile", position: "third", answer: "i" },
      { word: "clock", position: "last", answer: "k" },
      { word: "plane", position: "second", answer: "l" },
    ],
  },
  // BLENDING WORDS
  {
    type: "blending_words",
    questions: [
      { parts: ["m", "oo", "se"], answer: "moose" },
      { parts: ["c", "a", "t"], answer: "cat" },
      { parts: ["b", "oo", "k"], answer: "book" },
      { parts: ["f", "l", "y"], answer: "fly" },
      { parts: ["sh", "ip"], answer: "ship" },
      { parts: ["st", "ar"], answer: "star" },
      { parts: ["b", "r", "ain"], answer: "brain" },
      { parts: ["th", "ing"], answer: "thing" },
      { parts: ["p", "l", "a", "ne"], answer: "plane" },
      { parts: ["tr", "ai", "n"], answer: "train" },
    ],
  },
  // BLENDING NONWORDS
  {
    type: "blending_nonwords",
    questions: [
      { parts: ["gl", "up"], answer: "glup" },
      { parts: ["tr", "ob"], answer: "trob" },
      { parts: ["sn", "ick"], answer: "snick" },
      { parts: ["bl", "op"], answer: "blop" },
      { parts: ["dr", "en"], answer: "dren" },
      { parts: ["fr", "ak"], answer: "frak" },
      { parts: ["pl", "en"], answer: "plen" },
      { parts: ["kr", "ot"], answer: "krot" },
      { parts: ["sn", "or"], answer: "snor" },
      { parts: ["gl", "em"], answer: "glem" },
    ],
  },
  // SOUND MATCHING
  {
    type: "sound_matching",
    questions: [
      { target: "cat", choices: ["car", "dog", "pen"], answer: "car" },
      { target: "book", choices: ["ball", "tree", "hat"], answer: "ball" },
      { target: "sun", choices: ["sand", "run", "pot"], answer: "sand" },
      { target: "fish", choices: ["fun", "fin", "cat"], answer: "fin" },
      { target: "pen", choices: ["pet", "pan", "pin"], answer: "pet" },
      { target: "tree", choices: ["train", "try", "trap"], answer: "train" },
      { target: "dog", choices: ["dig", "dot", "bag"], answer: "dig" },
      { target: "hat", choices: ["hit", "hot", "hop"], answer: "hit" },
      { target: "car", choices: ["cat", "cap", "cab"], answer: "cat" },
      { target: "ball", choices: ["bat", "ban", "bag"], answer: "bat" },
    ],
  },
  // MEMORY FOR DIGITS
  {
    type: "memory_for_digits",
    questions: [
      { digits: [2, 5, 7], answer: [2, 5, 7] },
      { digits: [1, 4, 9, 3], answer: [1, 4, 9, 3] },
      { digits: [6, 8, 2, 0, 5], answer: [6, 8, 2, 0, 5] },
      { digits: [3, 1, 4, 1, 5, 9], answer: [3, 1, 4, 1, 5, 9] },
      { digits: [7, 2, 8, 4, 6, 0, 3], answer: [7, 2, 8, 4, 6, 0, 3] },
      { digits: [5, 9, 1, 2, 3, 7, 8, 6], answer: [5, 9, 1, 2, 3, 7, 8, 6] },
      {
        digits: [0, 2, 4, 6, 8, 1, 3, 5, 7],
        answer: [0, 2, 4, 6, 8, 1, 3, 5, 7],
      },
      {
        digits: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
        answer: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
      },
      {
        digits: [1, 3, 5, 7, 9, 2, 4, 6, 8, 0],
        answer: [1, 3, 5, 7, 9, 2, 4, 6, 8, 0],
      },
      {
        digits: [2, 4, 6, 8, 0, 1, 3, 5, 7, 9],
        answer: [2, 4, 6, 8, 0, 1, 3, 5, 7, 9],
      },
    ],
  },
  // NONWORD REPETITION
  {
    type: "nonword_repetition",
    questions: [
      { nonword: "blap", answer: "blap" },
      { nonword: "trenk", answer: "trenk" },
      { nonword: "snorble", answer: "snorble" },
      { nonword: "glimpo", answer: "glimpo" },
      { nonword: "frandor", answer: "frandor" },
      { nonword: "plimble", answer: "plimble" },
      { nonword: "kranop", answer: "kranop" },
      { nonword: "snorple", answer: "snorple" },
      { nonword: "glonker", answer: "glonker" },
      { nonword: "trumble", answer: "trumble" },
    ],
  },
  // RAPID SYMBOLIC NAMING
  {
    type: "rapid_symbolic_naming",
    questions: [
      { items: ["A", "B", "C", "D"], answer: ["A", "B", "C", "D"] },
      { items: ["E", "F", "G", "H", "I"], answer: ["E", "F", "G", "H", "I"] },
      {
        items: ["J", "K", "L", "M", "N", "O"],
        answer: ["J", "K", "L", "M", "N", "O"],
      },
      {
        items: ["P", "Q", "R", "S", "T", "U", "V"],
        answer: ["P", "Q", "R", "S", "T", "U", "V"],
      },
      { items: ["W", "X", "Y", "Z"], answer: ["W", "X", "Y", "Z"] },
      { items: ["1", "2", "3", "4"], answer: ["1", "2", "3", "4"] },
      { items: ["5", "6", "7", "8", "9"], answer: ["5", "6", "7", "8", "9"] },
      { items: ["0", "1", "2", "3"], answer: ["0", "1", "2", "3"] },
      { items: ["4", "5", "6", "7"], answer: ["4", "5", "6", "7"] },
      { items: ["8", "9", "0"], answer: ["8", "9", "0"] },
    ],
  },
  // RAPID NON-SYMBOLIC NAMING
  {
    type: "rapid_non_symbolic_naming",
    questions: [
      { items: ["red", "blue", "green"], answer: ["red", "blue", "green"] },
      { items: ["cat", "dog", "fish"], answer: ["cat", "dog", "fish"] },
      {
        items: ["yellow", "purple", "orange"],
        answer: ["yellow", "purple", "orange"],
      },
      { items: ["bird", "frog", "cow"], answer: ["bird", "frog", "cow"] },
      { items: ["pink", "black", "white"], answer: ["pink", "black", "white"] },
      {
        items: ["apple", "banana", "grape"],
        answer: ["apple", "banana", "grape"],
      },
      { items: ["green", "brown", "gray"], answer: ["green", "brown", "gray"] },
      { items: ["lion", "tiger", "bear"], answer: ["lion", "tiger", "bear"] },
      { items: ["blue", "red", "yellow"], answer: ["blue", "red", "yellow"] },
      { items: ["car", "bike", "bus"], answer: ["car", "bike", "bus"] },
    ],
  },
];

export default diagnosticQuestions;
