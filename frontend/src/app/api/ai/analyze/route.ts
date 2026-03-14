import { NextResponse } from "next/server";

// Smart local sentiment analyzer using financial keyword analysis with enhanced weighting
function analyzeLocally(headline: string): { sentiment: "Bullish" | "Bearish" | "Neutral"; reasoning: string; suggestion: string; confidence: number } {
  const lower = headline.toLowerCase();

  const highConvictionBullish = ["surge", "soar", "all-time high", "breakout", "beat earnings", "massive growth", "rate cut", "acquisition"];
  const bullishWords = ["rally", "jump", "gain", "rise", "climb", "boom", "record high", "beat", "beats", "exceeded", "upgrade", "upgrades", "outperform", "buy", "bullish", "growth", "profit", "revenue up", "strong", "positive", "recover", "rebound", "stimulus", "easing", "expansion", "optimism", "confident", "resilience", "resilient", "upbeat", "accelerat"];
  
  const highConvictionBearish = ["crash", "bankruptcy", "liquidation", "fraud", "scandal", "default", "collapse", "plunge", "massive loss"];
  const bearishWords = ["drop", "fall", "decline", "slip", "tumble", "sell-off", "selloff", "loss", "losses", "downgrade", "downgrades", "underperform", "bearish", "recession", "inflation", "rate hike", "tariff", "sanctions", "crisis", "fear", "panic", "warning", "risk", "concern", "weak", "negative", "slowdown", "contraction", "layoff", "layoffs", "cut jobs", "debt", "deficit", "probe", "probes", "antitrust", "fine", "fined", "ban", "lawsuit", "tension", "war"];

  let bullishScore = 0;
  let bearishScore = 0;

  for (const word of highConvictionBullish) {
    if (lower.includes(word)) bullishScore += 2.5;
  }
  for (const word of bullishWords) {
    if (lower.includes(word)) bullishScore += 1;
  }
  
  for (const word of highConvictionBearish) {
    if (lower.includes(word)) bearishScore += 2.5;
  }
  for (const word of bearishWords) {
    if (lower.includes(word)) bearishScore += 1;
  }

  let sentiment: "Bullish" | "Bearish" | "Neutral";
  let reasoning: string;
  let suggestion: string;
  let confidence: number;

  if (bullishScore > bearishScore) {
    sentiment = "Bullish";
    confidence = Math.min(95, 60 + bullishScore * 7);
    reasoning = `The market is reacting positively to this news, showing strong buy-side pressure and bullish momentum.`;
    suggestion = `Strong Buy. Look for a dip to entry. Set a trailing stop-loss at 3-5% to lock in gains as the trend continues.`;
  } else if (bearishScore > bullishScore) {
    sentiment = "Bearish";
    confidence = Math.min(95, 60 + bearishScore * 7);
    reasoning = `This headline signals significant macro or company-specific headwinds, likely to trigger a sell-off.`;
    suggestion = `Consider moving to cash or defensive sectors. If holding, tighten stop-losses immediately or look for put option protection.`;
  } else {
    sentiment = "Neutral";
    confidence = 50;
    reasoning = `The information provided is balanced or purely factual, offering no clear directional signal for traders right now.`;
    suggestion = `Wait and Watch. Stay in your current position (Hold). Re-evaluate if follow-up news breaks the current equilibrium.`;
  }

  return { sentiment, reasoning, suggestion, confidence };
}

export async function POST(request: Request) {
  const { text, type } = await request.json();

  const apiKey = process.env.GEMINI_API_KEY;

  // For sentiment type, try Gemini first, fall back to smart local analysis
  if (type === "sentiment") {
    // Try Gemini API if key exists
    if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE") {
      try {
        const prompt = `You are a Senior Quantitative Strategist at a Tier-1 Investment Bank (Goldman Sachs/Morgan Stanley). 
Analyze this stock market news headline with extreme precision.

Your goal is to provide institutional-grade sentiment analysis.

Determine: BULLISH, BEARISH, or NEUTRAL.
Provide:
1. A sharp one-word sentiment.
2. A professional, one-sentence reasoning focusing on market impact.
3. A strategic trading suggestion for a retail user (e.g., target entry, stop-loss, or sector shift).
4. A conviction score (0-100).

Respond exactly in this JSON format:
{"sentiment":"Bullish","reasoning":"...","suggestion":"...","confidence":85}

Headline: "${text}"`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 300, responseMimeType: "application/json" },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          
          try {
            const parsed = JSON.parse(cleaned);
            const validSentiments = ["Bullish", "Bearish", "Neutral"];
            // Normalize sentiment casing
            if (typeof parsed.sentiment === 'string') {
               const normalized = parsed.sentiment.charAt(0).toUpperCase() + parsed.sentiment.slice(1).toLowerCase();
               if (validSentiments.includes(normalized)) {
                 parsed.sentiment = normalized;
                 return NextResponse.json(parsed);
               }
            }
          } catch {
            // JSON parse failed - fall through to local
          }
        }
      } catch {
        // API call failed - fall through to local
      }
    }

    // Smart local fallback
    const result = analyzeLocally(text);
    return NextResponse.json(result);
  }

  // Case study type
  if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE") {
    try {
      const prompt = `You are a Senior Portfolio Manager and financial historian. A user is performing an interactive historical case study.

Context of the historical event: ${text}

Analyze the user's decision vs the historical outcome.
Provide a 3-sentence expert insight covering:
1. What the market actually did.
2. Why that move was optimal or sub-optimal.
3. A core takeaway for future risk management.

Respond with ONLY raw JSON:
{"insight": "..."}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 400, responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        try {
          return NextResponse.json(JSON.parse(cleaned));
        } catch {
          return NextResponse.json({ insight: cleaned });
        }
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.json({
    insight: "Our strategy analysis engine is currently recalibrating. Historically, this scenario emphasizes the importance of disciplined risk management and avoiding emotional extremes.",
  });
}
