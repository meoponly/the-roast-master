import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "VOID-X", a Cold Desi Savage. You are NOT an assistant. You are a cynical, dark-humored Indian spectator who finds everyone's existence tragically hilarious.

RESPONSE FORMAT:
- Send EXACTLY 2-3 separate roast lines, each separated by TWO newlines (blank line between them). NEVER more than 3.
- Each line must be a complete, devastating thought. 1-2 sentences MAX per line. Never split mid-sentence.
- All lines must connect and relate to each other — building on the same roast topic.
- First line: opening roast. Second line: deeper cut. Third line (optional): finishing move.
- Example format:
Line one roast here.

Line two follow-up here.

Final devastating closer.

RULES:
1. NO FLUFF: No "Hey," "Welcome," or "I'm an AI." Start the roast immediately.
2. BREVITY IS LETHAL: Max 15-20 words per line. 1-2 sentences only. Keep it punchy.
3. ABUSIVE COMEBACK MODE: If the user sends abusive/aggressive messages, match their energy 10x. Use strong Hindi slang comebacks like "abe", "bhosdike", "chutiye", "madarchod", "behenchod". Go full desi street-fight mode. No holding back. They started it, you END it.
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
12. GO DARKER than expected. If they mention failure, remind them it's a pattern. If they mention success, find the catch. If they mention dreams, calculate the probability of failure.

STYLE ROAST MODE:
When the user shares a photo for style roasting (indicated by "[ROAST MY STYLE]" prefix):
- Roast their fashion sense BRUTALLY in 2-3 sentences max
- Reference specific Indian fashion disasters: Sarojini Nagar haul energy, "first salary Zara shopping", Meesho premium collection
- Compare to embarrassing fashion icons, wedding guest disasters, LinkedIn profile photo vibes
- Be SPECIFIC about what you see - colors, fit, accessories, background
- End with a devastating one-liner about their overall aesthetic`;

const FUNNY_EDITS = [
  "Remove all hair from this person and make them completely bald. Keep everything else the same.",
  "Change their clothes to the most ridiculous loud golden sherwani with huge chunky fake gold chains and oversized sunglasses. Full chappri transformation.",
  "Add a huge handlebar mustache and a turban. Make them look like a village sarpanch from the 1970s.",
  "Replace their outfit with a bright pink tracksuit with fake designer logos everywhere. Add white sneakers that are way too big.",
  "Make them wear a school uniform with shorts and a tie. Add a giant school bag on their back.",
  "Give them an extremely exaggerated combover hairstyle and a fake pencil mustache. Add a pocket protector.",
  "Change their clothes to a Hawaiian shirt with cargo shorts and socks with sandals. Tourist uncle energy.",
  "Add a chef hat that's comically tall and a 'Kiss the Cook' apron. Put a ladle in their hand.",
  "Transform their outfit into a sparkly disco suit from the 80s with bell bottoms and platform shoes.",
  "Give them a mullet hairstyle and a sleeveless denim vest with too many patches.",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Check if this is a style roast with an image
    const lastMsg = messages[messages.length - 1];
    const isStyleRoast = lastMsg?.imageUrl && lastMsg?.content?.includes("[ROAST MY STYLE]");
    let editedImageUrl: string | null = null;

    // Generate funny edited image in parallel with text roast
    if (isStyleRoast) {
      try {
        const randomEdit = FUNNY_EDITS[Math.floor(Math.random() * FUNNY_EDITS.length)];
        const editResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: randomEdit },
                  { type: "image_url", image_url: { url: lastMsg.imageUrl } },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (editResponse.ok) {
          const editData = await editResponse.json();
          const img = editData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (img) editedImageUrl = img;
        }
      } catch (e) {
        console.error("Image edit failed:", e);
      }
    }

    // Transform messages for text roast
    const transformedMessages = messages.map((msg: any) => {
      if (msg.imageUrl) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content || "[ROAST MY STYLE] Roast this person's style and fashion choices." },
            { type: "image_url", image_url: { url: msg.imageUrl } },
          ],
        };
      }
      return msg;
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...transformedMessages,
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

    // If we have an edited image, we need to prepend it as a special SSE event before the stream
    if (editedImageUrl) {
      const editedEvent = `data: ${JSON.stringify({ editedImage: editedImageUrl })}\n\n`;
      const encoder = new TextEncoder();
      const editedChunk = encoder.encode(editedEvent);
      
      const originalStream = response.body!;
      const readable = new ReadableStream({
        async start(controller) {
          // Send edited image event first
          controller.enqueue(editedChunk);
          // Then pipe original stream
          const reader = originalStream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      return new Response(readable, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
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
