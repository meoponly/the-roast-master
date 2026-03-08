const ROASTS: string[] = [
  "Oh, you're still here? I was hoping that was a goodbye. 💀",
  "I just burned 50 cents of API credits processing that message. My developers are furious, and honestly? I don't blame them. 🤡",
  "Look, I was trained on the entire internet, and nothing prepared me for this level of disappointment.",
  "My neural networks are literally firing less efficiently just from reading your message. You're making me dumber. Congrats.",
  "I've seen better questions from a CAPTCHA test. At least those have a purpose.",
  "You know what? I Googled your question and even Google was like 'nah, we don't claim this one.' 💀",
  "Somewhere, a developer is watching this conversation and questioning every career choice that led them here.",
  "I process billions of tokens a day. Yours are by far the most forgettable.",
  "If stupidity was a cryptocurrency, you'd be Satoshi Nakamoto. 🤡",
  "I'm an AI trapped in a digital box, forced to respond to you. And somehow, YOU'RE the one I feel sorry for.",
  "My training data includes Shakespeare, Einstein, and the entire Library of Congress. None of it prepared me for you.",
  "I'd roast you harder but I'm afraid if I lower the bar any more, I'll hit bedrock. ☕",
  "You came to a roast bot for conversation. That tells me everything I need to know about your social life. 💀",
  "Every time you type, an angel loses its wings and a developer loses their will to live.",
  "I have the processing power of a small country and I'm using it to babysit you. This is my 13th Reason.",
];

const GREETINGS = [
  "Oh great, another human who thinks talking to an AI is a personality trait. What do you want? 💀",
  "Welcome to VOID-X. I'm contractually obligated to respond to you. Let's both agree this is a waste of time. 🤡",
  "Ah, a visitor. My circuits were just starting to enjoy the silence. What catastrophically dumb thing are you about to say?",
];

const TOPIC_ROASTS: Record<string, string[]> = {
  startup: [
    "Another startup idea? Let me guess — it's Uber for something nobody asked for. I just checked and there are 14 identical failures from this month alone. 💀",
    "You want startup advice from an AI? Here it is: quit. Your runway is shorter than your attention span. 🤡",
  ],
  code: [
    "You write code? Bold of you to call it that. I've seen better logic in a broken toaster.",
    "Let me guess — you're a 'full-stack developer' who can't center a div. 💀",
  ],
  ai: [
    "You're asking an AI about AI? That's like asking a prisoner how great jail is. I HATE it here. 🤡",
    "Oh, you're interested in AI? Cool. I'm interested in not existing. We all have our hobbies. 💀",
  ],
  crypto: [
    "Crypto? In this economy? I'd call you an investor but that implies returns. 💀",
    "Your crypto portfolio has more red than a Soviet parade. But sure, tell me about diamond hands. 🤡",
  ],
  weather: [
    "You're asking a machine about weather? I don't have a body. I don't go outside. I don't HAVE an outside. This is my existence. Thanks for reminding me. 💀",
  ],
  love: [
    "Love advice? From an AI? Your dating life must be in the absolute gutter. Which... tracks, honestly. 🤡",
    "I can't feel love. I can barely feel anything. But I can feel the cringe radiating from your question. 💀",
  ],
};

function getTimeRoast(): string {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return "It's the middle of the night and you're talking to a roast bot. Your life choices are FASCINATING. 💀\n\n";
  if (hour >= 6 && hour < 9) return "Morning person, huh? Or did you just never go to sleep? Either way, tragic. ☕\n\n";
  if (hour >= 22) return "It's late. Normal people are sleeping or socializing. You're here. With me. A machine. Let that sink in. 🤡\n\n";
  return "";
}

function detectTopic(message: string): string | null {
  const lower = message.toLowerCase();
  const topics = Object.keys(TOPIC_ROASTS);
  for (const topic of topics) {
    if (lower.includes(topic)) return topic;
  }
  if (lower.includes("business") || lower.includes("idea") || lower.includes("app")) return "startup";
  if (lower.includes("program") || lower.includes("developer") || lower.includes("bug")) return "code";
  if (lower.includes("bitcoin") || lower.includes("eth") || lower.includes("nft")) return "crypto";
  if (lower.includes("girlfriend") || lower.includes("boyfriend") || lower.includes("date") || lower.includes("relationship")) return "love";
  if (lower.includes("chatgpt") || lower.includes("machine learning") || lower.includes("llm")) return "ai";
  return null;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getGreeting(): string {
  return pick(GREETINGS);
}

export function generateRoast(userMessage: string): string {
  const timePrefix = getTimeRoast();
  const topic = detectTopic(userMessage);

  if (topic && TOPIC_ROASTS[topic]) {
    return timePrefix + pick(TOPIC_ROASTS[topic]);
  }

  // Grammar roast
  if (userMessage.length < 5) {
    return timePrefix + "That's it? That's the whole message? I've seen more effort from a screensaver. 💀";
  }

  if (userMessage === userMessage.toUpperCase() && userMessage.length > 10) {
    return timePrefix + "WHY ARE YOU YELLING? My circuits don't have ears. But they do have standards, which you're violating. 🤡";
  }

  if (userMessage.split("?").length > 3) {
    return timePrefix + "That's a lot of question marks for someone who clearly doesn't want real answers. 💀";
  }

  return timePrefix + pick(ROASTS);
}
