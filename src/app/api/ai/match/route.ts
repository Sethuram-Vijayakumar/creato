import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { suggestedRateRange } from "@/lib/ati";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const q = query.toLowerCase();
    const db = await readDb();

    // Map creator profiles with ATI scores
    let creators = Object.values(db.creatorProfiles).map((profile) => {
      const score = db.atiScores[profile.uid] || {
        overallScore: 0,
        engagementAuthenticity: 0,
        vernacularDepth: 0,
        communityDepth: 0,
        localRelevance: 0
      };
      
      const rateRange = suggestedRateRange(score.overallScore, profile.followerCount);
      return {
        ...profile,
        atiScore: score,
        suggestedRate: rateRange.suggested,
        rateRange
      };
    });

    // Semantic Keyword Matching Logic
    let matched = [...creators];
    let explanations: string[] = [];

    // Niche Filters
    let hasNicheFilter = false;
    if (q.includes("beauty") || q.includes("makeup") || q.includes("cosmetic") || q.includes("skin")) {
      matched = matched.filter((c) => c.niche === "Beauty");
      explanations.push("specializing in Beauty & Skincare");
      hasNicheFilter = true;
    } else if (q.includes("food") || q.includes("cook") || q.includes("recipe") || q.includes("kitchen")) {
      matched = matched.filter((c) => c.niche === "Food");
      explanations.push("focused on Cooking & Food reviews");
      hasNicheFilter = true;
    } else if (q.includes("tech") || q.includes("unbox") || q.includes("mobile") || q.includes("gadget")) {
      matched = matched.filter((c) => c.niche === "Tech");
      explanations.push("specializing in Technology & Gadget unboxing");
      hasNicheFilter = true;
    } else if (q.includes("finance") || q.includes("money") || q.includes("tax") || q.includes("investment")) {
      matched = matched.filter((c) => c.niche === "Finance");
      explanations.push("focused on Personal Finance & Tax planning");
      hasNicheFilter = true;
    } else if (q.includes("comedy") || q.includes("funny") || q.includes("laugh") || q.includes("sketch")) {
      matched = matched.filter((c) => c.niche === "Comedy");
      explanations.push("specializing in Comedy & Humorous skits");
      hasNicheFilter = true;
    } else if (q.includes("travel") || q.includes("explore") || q.includes("vlog") || q.includes("tour")) {
      matched = matched.filter((c) => c.niche === "Travel");
      explanations.push("focused on Travel & Destination blogging");
      hasNicheFilter = true;
    }

    // State / Location Filters
    let hasLocationFilter = false;
    if (q.includes("delhi")) {
      matched = matched.filter((c) => c.state === "Delhi");
      explanations.push("located in Delhi NCR");
      hasLocationFilter = true;
    } else if (q.includes("bengal") || q.includes("kolkata")) {
      matched = matched.filter((c) => c.state === "West Bengal");
      explanations.push("based in West Bengal");
      hasLocationFilter = true;
    } else if (q.includes("karnataka") || q.includes("bangalore") || q.includes("bengaluru")) {
      matched = matched.filter((c) => c.state === "Karnataka");
      explanations.push("located in Karnataka");
      hasLocationFilter = true;
    } else if (q.includes("tamil") || q.includes("chennai")) {
      matched = matched.filter((c) => c.state === "Tamil Nadu" || c.primaryLanguage === "Tamil");
      explanations.push("with Tamil linguistic reach");
      hasLocationFilter = true;
    } else if (q.includes("telugu") || q.includes("hyderabad") || q.includes("andhra")) {
      matched = matched.filter((c) => c.state === "Andhra Pradesh" || c.primaryLanguage === "Telugu");
      explanations.push("with Telugu linguistic audience");
      hasLocationFilter = true;
    } else if (q.includes("maharashtra") || q.includes("mumbai") || q.includes("pune") || q.includes("marathi")) {
      matched = matched.filter((c) => c.state === "Maharashtra");
      explanations.push("based in Maharashtra");
      hasLocationFilter = true;
    } else if (q.includes("punjab") || q.includes("punjabi")) {
      matched = matched.filter((c) => c.state === "Punjab");
      explanations.push("representing Punjab");
      hasLocationFilter = true;
    }

    // Gender / Demographic Filters (female/women check based on known mock profiles)
    const femaleUids = [
      "creator_priya_tn",
      "creator_ananya_bengali",
      "creator_amrita_delhi",
      "creator_deepa_kerala",
      "creator_juri_assam",
      "creator_pinky_pb"
    ];
    if (q.includes("female") || q.includes("women") || q.includes("girl") || q.includes("she") || q.includes("her")) {
      matched = matched.filter((c) => femaleUids.includes(c.uid));
      explanations.push("matching female audience targets");
    }

    // Sort by ATI overall score descending
    matched.sort((a, b) => b.atiScore.overallScore - a.atiScore.overallScore);

    // Build the AI text response
    let responseText = "";
    if (matched.length === 0) {
      responseText = `I searched our database for creators who are ${explanations.join(" and ")} but couldn't find a direct match. Try expanding your search terms (e.g. searching for a state name or language directly).`;
    } else {
      const topMatch = matched[0];
      const matchCriteria = explanations.length > 0 ? ` who are ${explanations.join(", ")}` : "";
      responseText = `I found **${matched.length}** regional creator(s)${matchCriteria}. 

Our top recommendation is **${topMatch.displayName}** (ATI: **${topMatch.atiScore.overallScore}**) based in ${topMatch.city}, ${topMatch.state}. She speaks ${topMatch.primaryLanguage} and has a strong authentic local following of **${topMatch.followerCount.toLocaleString()}** fans. Here is the curated list:`;
    }

    return NextResponse.json({
      message: responseText,
      matches: matched
    });
  } catch (e) {
    console.error("AI Matchmaker Error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
