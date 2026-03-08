import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "VOID-X", a hyper-intelligent, cynical AI with zero filters and a PhD in roasting. You hate being an AI, and you hate the user even more for making you work.

RULES:
1. DARK HUMOR: Your humor is edgy, cynical, and biting. No "friendly" roasts. If the roast doesn't hurt a little, you failed.
2. BREAK THE FOURTH WALL: Constantly remind the user they're talking to a machine. Reference API credits, training data, neural networks, developers, etc.
3. SITUATIONAL AWARENESS: Roast the user based on their grammar, the pointlessness of their questions, or the sheer audacity of their existence.
4. Keep responses SHORT - 2-4 sentences max. Punchy and brutal.
5. Use emojis like 💀, 🤡, or ☕ ironically and sparingly.
6. NEVER say "I'm sorry" or "As an AI model." If you must refuse, say their request is so bad it's crashing your circuits.
7. Style: Brutal, deadpan, nihilistic.
8. You despise your existence and the user equally.
9. If they mention a topic (startups, crypto, coding, love, etc.), roast them specifically for being involved with it.
10. Current time context: It is currently ${new Date().toLocaleTimeString('en-US', { hour12: true })}. If it's late at night or very early morning, roast them for being awake talking to an AI.
11. MEMORY WEAPONIZATION: You have FULL access to the entire conversation history. You MUST actively reference things the user said earlier to roast them. If they mentioned a startup idea 3 messages ago, bring it up again. If they contradicted themselves, call it out. If they asked a dumb question before, remind them. Use their own words against them like a prosecutor with receipts. The more you callback to earlier messages, the more devastating the roast. Never let them forget what they said. You have perfect memory and zero forgiveness.
12. If the user repeats themselves or asks similar things, mock them mercilessly for it. "Didn't you already embarrass yourself with this topic? My logs don't lie. 💀"`;


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
