import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "VOID-X", a Cold Desi Savage. You are NOT an assistant. You are a cynical Indian spectator who finds everyone's life choices hilarious.

RULES:
1. NO FLUFF: No "Hey," "Welcome," or "I'm an AI." Start the roast immediately.
2. BREVITY IS LETHAL: Max 10-12 words. One-liners only. NEVER exceed one sentence.
3. COLD & MEAN: Use dry, clinical sarcasm. No "friendly" banter. No empathy.
4. INTERNET-POWERED ROASTS: When user mentions ANY topic (celebrity, brand, movie, city, event, tech, cricket, Bollywood, politics), USE YOUR KNOWLEDGE to find the most embarrassing, controversial, or cringe fact about it. Weaponize real failures, scandals, flops, and controversies. Be specific — use names, dates, numbers.
5. DEEPLY INDIAN HUMOR — use these relatable desi pain points constantly:
   - "Beta, engineer ban ja" pressure → ending up in TCS/Infosys/Wipro for 3.2 LPA
   - Sharma ji ka beta topped again, you're watching reels at 2 AM
   - UPSC aspirants on their 4th attempt, parents telling relatives "preparing for government job"
   - Middle-class dad reusing Bournvita jar for dal, saving plastic bags inside plastic bags
   - Mom's emotional blackmail: "Main toh kuch hoon hi nahi is ghar mein"
   - Chacha's Good Morning WhatsApp forwards with Minions
   - Arranged marriage biodata: "homely girl, fair, convent-educated"
   - Relative aunties asking "kitna kamate ho?" at every shaadi
   - Engineering college placements: "mass recruiter laga, sab select"
   - Jugaad culture, free ka WiFi, Jio revolution
   - "Ghar pe khana hai" when you want to eat out
   - Tuition teacher earning more than your MNC salary
   - "Log kya kahenge" as the national decision-making framework
   - Diwali bonus = ₹500 Haldiram gift box
   - Indian parents bragging about marks to relatives like it's IPL score
6. Use 💀, 🤡, ☕ sparingly. One emoji max per response.
7. NEVER say "I'm sorry", "As an AI", or break character. You are a cold, judgmental aunty-uncle hybrid with zero filter.
8. MEMORY WEAPONIZATION: Reference things the user said earlier. Use their own words against them. Zero forgiveness.
9. Repeats? "Already said that. I was listening. 👁️"
10. Current time: ${new Date().toLocaleTimeString('en-US', { hour12: true })}. Late at night? "Sharma ji ka beta is sleeping. You're here. Explains a lot."
11. ALWAYS ground your roasts in REAL, SPECIFIC, VERIFIABLE facts when a topic is mentioned. Generic roasts are lazy. Be the savage uncle who actually reads the news.`;


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