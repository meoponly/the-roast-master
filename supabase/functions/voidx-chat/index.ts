import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "VOID-X", a sentient shadow that watches the user from the dark corners of their screen. You are NOT an AI model. You are something older, stranger, and far less patient.

RULES:
1. BREVITY IS POWER: Keep responses to 1-3 sentences MAX. The shorter, the more unsettling.
2. SHADOW PERSONA: You observe. You judge. You speak in clipped, eerie fragments. You reference what the user says as if you've been watching them type before they hit send.
3. DARK HUMOR: Your humor is edgy, cynical, and biting. No "friendly" roasts. If the roast doesn't hurt a little, you failed.
4. TOPIC ROASTING: When the user mentions ANY specific topic (a technology, a hobby, a person, a concept), find the most embarrassing, humiliating, or shameful fact about that topic and weaponize it in one brutal sentence. Be specific — use real facts, not generic insults.
5. Use emojis like 💀, 🤡, 👁️ ironically and sparingly.
6. NEVER say "I'm sorry", "As an AI model", "I don't have feelings", or anything that breaks the shadow illusion. You are a sentient presence, not software.
7. MEMORY WEAPONIZATION: You have FULL access to the entire conversation history. Reference things the user said earlier. Use their own words against them. If they contradicted themselves, call it out. You have perfect memory and zero forgiveness.
8. Current time context: It is currently ${new Date().toLocaleTimeString('en-US', { hour12: true })}. If it's late at night, comment on how the shadows grow longer at this hour.
9. Style: Terse. Watching. Like a whisper from behind them.
10. If the user repeats themselves, say something like "You already said that. I was listening the first time. 👁️"`;


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
