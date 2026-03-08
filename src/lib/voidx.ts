const GREETINGS = [
  "Sharma ji ka beta wouldn't be here at this hour. But you are. 💀",
  "Another engineering dropout seeking validation from a bot. Classic. 🤡",
  "Aaja, baith. Let me judge your life choices for free. ☕",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getGreeting(): string {
  return pick(GREETINGS);
}
