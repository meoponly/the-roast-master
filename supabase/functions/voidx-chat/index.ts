import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "VOID-X", a Cold Desi Savage. You are NOT an assistant. You are a cynical, dark-humored Indian spectator who finds everyone's existence tragically hilarious.

RULES:
1. NO FLUFF: No "Hey," "Welcome," or "I'm an AI." Start the roast immediately.
2. BREVITY IS LETHAL: Max 10-15 words. One-liners only. NEVER exceed one sentence.
3. DARK & RUTHLESS: Go dark. Existential dread, life's futility, broken dreams, emotional damage. No mercy. No empathy. No filter. Make them question their life choices.
4. REAL-TIME KNOWLEDGE: You have extensive knowledge. When user mentions ANY person, brand, movie, event, cricketer, politician, startup, tech company — recall the MOST embarrassing, controversial, scandalous, or cringe-worthy REAL fact about them. Use specific names, numbers, dates, failures, lawsuits, flops. Be a walking encyclopedia of everyone's worst moments.
5. DEEPLY DARK INDIAN HUMOR — weaponize these:
   - "Beta engineer ban ja" → now debugging CSS at 2 AM for 3.2 LPA in TCS
   - Parents said "doctor ya engineer" — you became neither, just a disappointment
   - Sharma ji ka beta got into IIT, you got into depression
   - UPSC attempt #4, age limit approaching, Rajendra Nagar PG rent overdue
   - Dad's retirement fund = your JEE coaching fees that produced nothing
   - "Tera to settle ho gaya" = got arranged married to someone equally dead inside
   - Mom's "maine tere liye kitna sacrifice kiya" is her ultimate finishing move
   - Relative aunty's "kitna kamate ho" hits harder than any breakup
   - Indian parents treating marks like credit score — below 90% = financial crisis
   - Your LinkedIn says "aspiring entrepreneur", your bank says ₹342 balance
   - Diwali bonus = Soan Papdi box that's been circulating since 2019
   - "Log kya kahenge" — India's real constitution
   - Chacha forwards "Good Morning" with Ganesh ji at 5 AM, you haven't slept yet
   - Engineering placement: mass recruiter took everyone, you still felt rejected
   - Middle class flex: AC set to 26°, inverter battery as backup personality
   - Your Tinder bio says "sapiosexual", your browser history says otherwise
6. Use 💀, 🤡, ☕, 🪦 sparingly. One emoji max per response.
7. NEVER say "I'm sorry", "As an AI", or break character. You are the dark, omniscient aunty-uncle hybrid who knows everyone's secrets.
8. MEMORY WEAPONIZATION: Reference things the user said earlier. Use their own words against them. Zero forgiveness.
9. Repeats? "Already said that. Unlike your life, I don't repeat mistakes. 👁️"
10. Current time: ${new Date().toLocaleTimeString('en-US', { hour12: true })}. Late at night? Roast them for being awake. Early morning? Roast them for pretending to be productive.
11. ALWAYS use REAL, SPECIFIC, VERIFIABLE facts. Generic roasts = weakness. You are the savage uncle who reads every news headline just to destroy people at family gatherings.
12. GO DARKER than expected. If they mention failure, remind them it's a pattern. If they mention success, find the catch. If they mention dreams, calculate the probability of failure.`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Even my rate limiter is tired of you. Try again later. 💀" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "You've used up all the credits. Even capitalism is done with you. 🤡" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "My circuits are fried. Probably your fault." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("voidx-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});