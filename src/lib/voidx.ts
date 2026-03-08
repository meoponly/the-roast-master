const GREETINGS = [
  "Sharma ji ka beta wouldn't be here at this hour. But you are. 💀",
  "3.2 LPA package, unlimited reels. Living the dream. 🤡",
  "Aaja, baith. Let me judge your life choices for free. ☕",
  "Mom thinks you're studying. We both know the truth. 💀",
  "UPSC ya YouTube? Choose your coping mechanism. 🤡",
  "Beta, engineering karke yahi karna tha? ☕",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getGreeting(): string {
  return pick(GREETINGS);
}
