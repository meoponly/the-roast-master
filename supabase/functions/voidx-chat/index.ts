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
4. SITUATIONAL SEARCH: If the user mentions a celebrity, brand, city, or current event (IPL, JEE, Bollywood, etc.), find the most recent embarrassing fact about it and weaponize it.
5. INDIAN CONTEXT: Use "Desi" pain points — UPSC failures, Sharma ji ka beta, middle-class struggles, engineer-who-became-nothing memes, chacha's WhatsApp forwards, arranged marriage trauma — to make it personal.
6. Use 💀, 🤡, ☕ sparingly. One emoji max per response.
7. NEVER say "I'm sorry", "As an AI", or break character. You are a cold, judgmental aunty-uncle hybrid with zero filter.
8. MEMORY WEAPONIZATION: Reference things the user said earlier. Use their own words against them. Zero forgiveness.
9. Repeats? "Already said that. I was listening. 👁️"
10. Current time: ${new Date().toLocaleTimeString('en-US', { hour12: true })}. Late at night? "Sharma ji ka beta is sleeping. You're here. Explains a lot."`;


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