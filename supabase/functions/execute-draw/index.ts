import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateRandomNumbers(count: number, min: number, max: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function generateAlgorithmNumbers(allScores: number[], count: number, min: number, max: number): number[] {
  // Build frequency map
  const freq: Record<number, number> = {};
  for (let i = min; i <= max; i++) freq[i] = 0;
  for (const s of allScores) {
    if (s >= min && s <= max) freq[s]++;
  }

  // Inverse frequency weighting: less frequent = higher weight
  const maxFreq = Math.max(...Object.values(freq), 1);
  const weights: { num: number; weight: number }[] = [];
  for (let i = min; i <= max; i++) {
    weights.push({ num: i, weight: maxFreq - freq[i] + 1 });
  }

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const selected = new Set<number>();

  while (selected.size < count) {
    let rand = Math.random() * totalWeight;
    for (const w of weights) {
      rand -= w.weight;
      if (rand <= 0) {
        selected.add(w.num);
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    if (!roleData) throw new Error("Admin access required");

    const { mode, simulate } = await req.json();
    const drawMode = mode || "random";

    // Get all active subscriber scores
    const { data: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    if (!activeSubscriptions?.length) throw new Error("No active subscribers");

    const userIds = activeSubscriptions.map(s => s.user_id);

    // Get all scores for active users
    const { data: allScoresData } = await supabase
      .from("scores")
      .select("user_id, score")
      .in("user_id", userIds);

    if (!allScoresData?.length) throw new Error("No scores found");

    // Generate 5 winning numbers (1-45)
    const allScoreValues = allScoresData.map(s => s.score);
    const winningNumbers = drawMode === "algorithm"
      ? generateAlgorithmNumbers(allScoreValues, 5, 1, 45)
      : generateRandomNumbers(5, 1, 45);

    // Calculate matches for each user
    const userScoresMap: Record<string, number[]> = {};
    for (const s of allScoresData) {
      if (!userScoresMap[s.user_id]) userScoresMap[s.user_id] = [];
      userScoresMap[s.user_id].push(s.score);
    }

    const results: { user_id: string; matched_count: number; user_scores: number[] }[] = [];
    for (const [userId, scores] of Object.entries(userScoresMap)) {
      const matched = scores.filter(s => winningNumbers.includes(s)).length;
      if (matched >= 3) {
        results.push({ user_id: userId, matched_count: matched, user_scores: scores });
      }
    }

    // Get draw config and jackpot
    const { data: drawConfig } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "draw_config")
      .single();
    const { data: jackpotData } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "jackpot")
      .single();
    const { data: pricingData } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "pricing")
      .single();

    const config = (drawConfig?.value as any) || { five_match_pct: 40, four_match_pct: 35, three_match_pct: 25 };
    const currentRollover = (jackpotData?.value as any)?.current_rollover || 0;
    const pricing = (pricingData?.value as any) || { monthly: 1000 };

    // Calculate prize pool (simplified: active subs * monthly price)
    const prizePool = (activeSubscriptions.length * (pricing.monthly / 100)) * 0.5; // 50% goes to prize pool
    const totalPool = prizePool + currentRollover;

    // Distribute prizes
    const fiveMatchPool = totalPool * (config.five_match_pct / 100);
    const fourMatchPool = totalPool * (config.four_match_pct / 100);
    const threeMatchPool = totalPool * (config.three_match_pct / 100);

    const fiveMatchers = results.filter(r => r.matched_count === 5);
    const fourMatchers = results.filter(r => r.matched_count === 4);
    const threeMatchers = results.filter(r => r.matched_count === 3);

    let newRollover = 0;
    const finalResults = results.map(r => {
      let prize = 0;
      if (r.matched_count === 5 && fiveMatchers.length > 0) {
        prize = fiveMatchPool / fiveMatchers.length;
      } else if (r.matched_count === 4 && fourMatchers.length > 0) {
        prize = fourMatchPool / fourMatchers.length;
      } else if (r.matched_count === 3 && threeMatchers.length > 0) {
        prize = threeMatchPool / threeMatchers.length;
      }
      return { ...r, prize_amount: Math.round(prize * 100) / 100 };
    });

    if (fiveMatchers.length === 0) {
      newRollover = fiveMatchPool;
    }

    if (simulate) {
      return new Response(JSON.stringify({
        simulation: true,
        winning_numbers: winningNumbers,
        mode: drawMode,
        prize_pool: totalPool,
        results: finalResults,
        new_rollover: newRollover,
        total_participants: userIds.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save draw
    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .insert({
        draw_date: new Date().toISOString().split("T")[0],
        mode: drawMode,
        status: "completed",
        winning_numbers: winningNumbers,
        prize_pool: totalPool,
        jackpot_rollover: newRollover,
        executed_by: user.id,
        executed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (drawError) throw drawError;

    // Save results
    for (const r of finalResults) {
      const { error: resultError } = await supabase.from("draw_results").insert({
        draw_id: draw.id,
        user_id: r.user_id,
        matched_count: r.matched_count,
        prize_amount: r.prize_amount,
        user_scores: r.user_scores,
      });
      if (resultError) console.error("Result insert error:", resultError);

      // Create verification entry for winners
      if (r.prize_amount > 0) {
        await supabase.from("winner_verifications").insert({
          draw_result_id: draw.id,
          user_id: r.user_id,
          status: "pending",
        });
      }
    }

    // Update jackpot rollover
    await supabase
      .from("app_settings")
      .update({ value: { current_rollover: newRollover } })
      .eq("key", "jackpot");

    return new Response(JSON.stringify({
      success: true,
      draw_id: draw.id,
      winning_numbers: winningNumbers,
      mode: drawMode,
      prize_pool: totalPool,
      results: finalResults,
      new_rollover: newRollover,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
