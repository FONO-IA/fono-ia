export interface ExercisePhase {
  word: string;
  emoji: string;
  hint: string;
  instruction: string;
}

export interface ExerciseSet {
  id: string;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  difficulty: 1 | 2 | 3;
  description: string;
  phases: ExercisePhase[];
}

export const exerciseSets: ExerciseSet[] = [
  {
    id: "vogais",
    title: "Vogais",
    emoji: "🔤",
    color: "#0052CC",
    bgColor: "#EBF3FF",
    difficulty: 1,
    description: "As 5 vogais do alfabeto",
    phases: [
      { word: "A", emoji: "🍎", hint: "Como em ABACATE", instruction: "Diga a vogal!" },
      { word: "E", emoji: "🐘", hint: "Como em ELEFANTE", instruction: "Diga a vogal!" },
      { word: "I", emoji: "🌈", hint: "Como em IGUANA", instruction: "Diga a vogal!" },
      { word: "O", emoji: "🌙", hint: "Como em ONÇA", instruction: "Diga a vogal!" },
      { word: "U", emoji: "🍇", hint: "Como em UVA", instruction: "Diga a vogal!" },
    ],
  },
  {
    id: "cores",
    title: "Cores",
    emoji: "🎨",
    color: "#FFAB00",
    bgColor: "#FFFBEB",
    difficulty: 1,
    description: "Nomeie as cores do arco-íris",
    phases: [
      { word: "AZUL", emoji: "🔵", hint: "A cor do céu", instruction: "Diga a cor!" },
      { word: "VERMELHO", emoji: "🔴", hint: "A cor do fogo", instruction: "Diga a cor!" },
      { word: "VERDE", emoji: "🟢", hint: "A cor das plantas", instruction: "Diga a cor!" },
      { word: "AMARELO", emoji: "🌟", hint: "A cor do sol", instruction: "Diga a cor!" },
    ],
  },
  {
    id: "frutas",
    title: "Frutas",
    emoji: "🍓",
    color: "#FF5630",
    bgColor: "#FFF0EC",
    difficulty: 2,
    description: "Nomeie as frutas deliciosas",
    phases: [
      { word: "MAÇÃ", emoji: "🍎", hint: "Fruta vermelha e doce", instruction: "Diga a palavra!" },
      { word: "BANANA", emoji: "🍌", hint: "Fruta amarela e curva", instruction: "Diga a palavra!" },
      { word: "UVA", emoji: "🍇", hint: "Frutinha roxa", instruction: "Diga a palavra!" },
      { word: "MORANGO", emoji: "🍓", hint: "Pequena e vermelha", instruction: "Diga a palavra!" },
    ],
  },
  {
    id: "animais",
    title: "Animais",
    emoji: "🐶",
    color: "#36B37E",
    bgColor: "#ECFDF5",
    difficulty: 2,
    description: "Imite os sons dos animais",
    phases: [
      { word: "CACHORRO", emoji: "🐶", hint: "Au au!", instruction: "Diga o animal!" },
      { word: "GATO", emoji: "🐱", hint: "Miau!", instruction: "Diga o animal!" },
      { word: "VACA", emoji: "🐄", hint: "Muuuu!", instruction: "Diga o animal!" },
      { word: "SAPO", emoji: "🐸", hint: "Croac croac!", instruction: "Diga o animal!" },
    ],
  },
  {
    id: "sons-s",
    title: "Som do S",
    emoji: "🐍",
    color: "#998DD9",
    bgColor: "#F3F0FF",
    difficulty: 3,
    description: "Pratique o som da letra S",
    phases: [
      { word: "SOL", emoji: "☀️", hint: "Brilha de dia", instruction: "Diga a palavra!" },
      { word: "SAPATO", emoji: "👟", hint: "Você usa nos pés", instruction: "Diga a palavra!" },
      { word: "SUCO", emoji: "🥤", hint: "Bebida de fruta", instruction: "Diga a palavra!" },
      { word: "SORVETE", emoji: "🍦", hint: "Doce gelado", instruction: "Diga a palavra!" },
    ],
  },
  {
    id: "sons-r",
    title: "Som do R",
    emoji: "🚀",
    color: "#FF7452",
    bgColor: "#FFF0EC",
    difficulty: 3,
    description: "Pratique o som da letra R",
    phases: [
      { word: "RATO", emoji: "🐭", hint: "Pequeno e cinza", instruction: "Diga a palavra!" },
      { word: "ROSA", emoji: "🌹", hint: "Flor cheirosa", instruction: "Diga a palavra!" },
      { word: "RODA", emoji: "🎡", hint: "É redonda e gira", instruction: "Diga a palavra!" },
      { word: "RELÓGIO", emoji: "⏰", hint: "Mostra as horas", instruction: "Diga a palavra!" },
    ],
  },
];

export const childPatients = [
  { id: "lucas", name: "Lucas", lastName: "Mendes", emoji: "🦁", color: "#4C9AFF", bg: "#EBF3FF", pin: "1234" },
  { id: "ana", name: "Ana", lastName: "Beatriz", emoji: "🦋", color: "#FF7452", bg: "#FFF0EC", pin: "2345" },
  { id: "pedro", name: "Pedro", lastName: "Oliveira", emoji: "🐸", color: "#36B37E", bg: "#ECFDF5", pin: "3456" },
  { id: "sofia", name: "Sofia", lastName: "Ribeiro", emoji: "⭐", color: "#998DD9", bg: "#F3F0FF", pin: "4567" },
  { id: "gabriel", name: "Gabriel", lastName: "Santos", emoji: "🚀", color: "#FFAB00", bg: "#FFFBEB", pin: "5678" },
];
