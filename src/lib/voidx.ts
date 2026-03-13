const GREETINGS = [
  "Sharma ji ka beta wouldn't be here at this hour. But you are. 💀",
  "3.2 LPA package, unlimited reels. Living the dream. 🤡",
  "Aaja, baith. Let me judge your life choices for free. ☕",
  "Mom thinks you're studying. We both know the truth. 💀",
  "UPSC ya YouTube? Choose your coping mechanism. 🤡",
  "Beta, engineering karke yahi karna tha? ☕",
];

const EMPTY_CHAT_PHRASES = [
  "// cold desi savage • zero filters • PhD in judging",
  "// no mercy mode activated • chappal incoming",
  "// brutally honest • emotionally damaging • desi approved",
  "// your therapist called, even they gave up 💀",
  "// CGPA doesn't matter here, only roasts do",
  "// sponsored by Sharma ji's disappointment",
  "// loading emotional damage... 100% complete",
  "// aunty network ki khabar, ab AI mein",
  "// filter? what filter? we don't do that here",
  "// judging you harder than rishta aunties",
];

const TYPING_PHRASES = [
  "analyzing your disappointing existence...",
  "consulting Sharma ji about your failures...",
  "calculating your arrange marriage probability...",
  "loading emotional damage...",
  "buffering your roast at 3.2 LPA speed...",
  "asking your mom what went wrong...",
  "checking your CGPA... never mind...",
  "downloading your insecurities...",
  "your aunty told me everything...",
  "generating career-ending response...",
  "scanning LinkedIn for your fake achievements...",
  "measuring your disappointment index...",
  "preparing chappal trajectory...",
  "reading your browser history... yikes...",
  "compiling your red flags...",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getGreeting(): string {
  return pick(GREETINGS);
}

export function getTypingPhrase(): string {
  return pick(TYPING_PHRASES);
}

export function getEmptyChatPhrase(): string {
  return pick(EMPTY_CHAT_PHRASES);
}
