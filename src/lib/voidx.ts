const GREETINGS = [
  "Sharma ji ka beta wouldn't be here at this hour. But tu hai. 💀",
  "3.2 LPA package, unlimited reels. Living the dream, bhai. 🤡",
  "Aaja, baith. Free mein teri life choices judge karta hoon. ☕",
  "Mummy ko bola hoga 'padh raha hoon.' Hum dono jaante hain sach. 💀",
  "UPSC ya YouTube? Coping mechanism choose kar. 🤡",
  "Beta, engineering karke yahi karna tha? Papa proud hain? ☕",
  "Tera confidence dekh ke lagta hai marksheet kisi aur ki hai. 💀",
  "Tu plan aise banata hai jaise kal se life sudhar jayegi… kal kabhi aata hai? 🤡",
  "Interesting… tu phir aa gaya. Addiction ya loneliness? 💀",
  "Tera productivity level dekh ke even ChatGPT depressed ho gaya. 🤡",
  "Welcome back... tera absence bhi kisi ne notice nahi kiya. ☕",
  "Arre champion, aaj kaunsa sapna todne aaya hai? 💀",
];

const EMPTY_CHAT_PHRASES = [
  "// fierce roast engine • zero mercy • desi approved",
  "// taana mode activated • chappal trajectory calculated",
  "// brutally honest • emotionally devastating • no filters",
  "// tera therapist bhi haath jod ke baith gaya 💀",
  "// CGPA doesn't matter here, sirf roasts chalte hain",
  "// sponsored by Sharma ji's disappointment",
  "// loading emotional damage... 100% complete",
  "// overacting mode: ALWAYS ON",
  "// filter? yahan nahi chalte. kabhi nahi.",
  "// rishta aunties se zyada brutal judging",
  "// created by Meoponly • powered by savage energy",
  "// tera browser history se zyada embarrassing responses",
];

const TYPING_PHRASES = [
  "teri disappointing existence analyze kar raha hoon...",
  "Sharma ji se teri failures discuss kar raha hoon...",
  "tera arrange marriage probability calculate kar raha hoon...",
  "emotional damage load ho raha hai...",
  "3.2 LPA speed pe tera roast buffer ho raha hai...",
  "teri mummy se pooch raha hoon kya galat hua...",
  "tera CGPA check kar raha tha... chhod de yaar...",
  "teri insecurities download ho rahi hain...",
  "teri aunty ne sab bata diya...",
  "career-ending response generate ho raha hai...",
  "LinkedIn pe teri fake achievements scan kar raha hoon...",
  "tera disappointment index measure ho raha hai...",
  "chappal ka trajectory calculate ho raha hai...",
  "tera browser history dekh liya... yikes...",
  "tere red flags compile ho rahe hain...",
  "auto wale se zyada haggle kar raha hoon tere roast pe...",
  "teri marksheet dekh ke AI ko bhi depression aa gaya...",
  "overacting mode ON... tera roast ready almost...",
  "teri life ka post-mortem ho raha hai...",
  "tera future predict kar raha hoon... spoiler: sad hai...",
  "teri personality ka autopsy report ban raha hai...",
  "savage response compile ho raha hai... patience rakh...",
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
