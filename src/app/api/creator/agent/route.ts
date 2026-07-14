import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    const db = await readDb();
    const creator = db.creatorProfiles[session.uid];
    const score = db.atiScores[session.uid];
    const collabs = Object.values(db.pastCollaborations || {}).filter(
      (c) => c.creatorUid === session.uid
    );

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    // ----------------------------------------------------
    // Action 1: Conversational Parsing & Brief Search
    // ----------------------------------------------------
    if (action === "chat") {
      const { message } = body;
      if (!message || message.trim() === "") {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }

      const q = message.toLowerCase();
      let matchedBriefs = Object.values(db.brandBriefs || {}).filter(
        (b) => b.status === "OPEN"
      );

      const criteria: string[] = [];

      // Niche Parsing
      if (q.includes("beauty") || q.includes("makeup") || q.includes("cosmetic") || q.includes("skin") || q.includes("fashion")) {
        matchedBriefs = matchedBriefs.filter((b) => b.niche === "Beauty");
        criteria.push("Beauty");
      } else if (q.includes("food") || q.includes("cook") || q.includes("recipe") || q.includes("kitchen")) {
        matchedBriefs = matchedBriefs.filter((b) => b.niche === "Food");
        criteria.push("Food");
      } else if (q.includes("tech") || q.includes("unbox") || q.includes("mobile") || q.includes("gadget")) {
        matchedBriefs = matchedBriefs.filter((b) => b.niche === "Tech");
        criteria.push("Tech");
      } else if (q.includes("finance") || q.includes("money") || q.includes("tax")) {
        matchedBriefs = matchedBriefs.filter((b) => b.niche === "Finance");
        criteria.push("Finance");
      } else if (q.includes("comedy") || q.includes("funny") || q.includes("laugh") || q.includes("sketch")) {
        matchedBriefs = matchedBriefs.filter((b) => b.niche === "Comedy");
        criteria.push("Comedy");
      } else if (q.includes("education") || q.includes("learn") || q.includes("teach") || q.includes("coding")) {
        matchedBriefs = matchedBriefs.filter((b) => b.niche === "Education");
        criteria.push("Education");
      }

      // Language Parsing
      const languages = ["Tamil", "Telugu", "Hindi", "Kannada", "Malayalam", "Bengali", "Punjabi", "Marathi"];
      for (const lang of languages) {
        if (q.includes(lang.toLowerCase())) {
          matchedBriefs = matchedBriefs.filter((b) => b.targetLanguages.includes(lang));
          criteria.push(`targeting ${lang}`);
        }
      }

      // State Parsing
      const states = ["West Bengal", "Delhi", "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Maharashtra", "Punjab", "Kerala"];
      for (const st of states) {
        if (q.includes(st.toLowerCase())) {
          matchedBriefs = matchedBriefs.filter((b) => b.targetStates.includes(st));
          criteria.push(`targeting ${st}`);
        }
      }

      // Budget Parsing (regex to find budget values, e.g. "budget above 15000")
      let budgetMinLimit = 0;
      const budgetMatch = q.match(/(?:budget|above|greater than|min|>\s*|budget\s*>\s*)(\d{4,5})/);
      if (budgetMatch && budgetMatch[1]) {
        budgetMinLimit = parseInt(budgetMatch[1]);
        matchedBriefs = matchedBriefs.filter((b) => b.budgetMax >= budgetMinLimit);
        criteria.push(`with budgets above ₹${budgetMinLimit.toLocaleString()}`);
      }

      // Enrich brief objects with brand details
      const enrichedBriefs = matchedBriefs.map((b) => {
        const brandProfile = db.brandProfiles[b.brandUid] || null;
        return {
          ...b,
          brand: brandProfile
        };
      });

      let responseText = "";
      if (enrichedBriefs.length === 0) {
        responseText = `I searched open briefs for campaigns ${criteria.join(", ")} but couldn't find a direct match. Try asking for different niches, states, or budget ranges (e.g. *"Find beauty briefs in Tamil"*).`;
      } else {
        responseText = `I found **${enrichedBriefs.length}** open campaign brief(s) matching your request. 

Here are the details. Click **"Draft Application"** on any card below to preview your pitch:`;
      }

      return NextResponse.json({
        message: responseText,
        briefs: enrichedBriefs
      });
    }

    // ----------------------------------------------------
    // Action 2: Pitch Application Drafting
    // ----------------------------------------------------
    if (action === "draft") {
      const { briefId, personalizedNote } = body;
      if (!briefId) {
        return NextResponse.json({ error: "briefId is required" }, { status: 400 });
      }

      const brief = db.brandBriefs[briefId];
      if (!brief) {
        return NextResponse.json({ error: "Brand brief not found" }, { status: 404 });
      }

      const brand = db.brandProfiles[brief.brandUid];
      const brandName = brand ? brand.companyName : "Brand Team";

      const scoreVal = score ? score.overallScore : 75;
      const primaryLang = creator.primaryLanguage || "your language";
      const userNiche = creator.niche || "content";

      const collabSummary = collabs.length > 0 
        ? `I have previously worked with brands like ${collabs.map((c) => c.brandName).join(", ")}.` 
        : "I have a proven record of driving local engagement.";

      const noteText = personalizedNote && personalizedNote.trim() !== ""
        ? `\n\nNote: ${personalizedNote.trim()}`
        : "";

      const draft = `Hello ${brandName} team,

I would love to apply for your "${brief.title}" opportunity! 

I am a ${userNiche} creator based in ${creator.city}, ${creator.state}, and I connect with my audience in ${primaryLang}. 

Here is why I'm a perfect fit for this campaign:
- **Vishwas Score (ATI)**: My overall trust score is verified at **${scoreVal}/100**, indicating authentic engagement and deep local relevance.
- **Geographic alignment**: My audience has strong local penetration matching your regional targets.
- **Deliverables**: I can deliver high-quality ${brief.deliverableType} content within your budget range.

${collabSummary}${noteText}

Let's collaborate to build authentic local connections!`;

      return NextResponse.json({ draft });
    }

    // ----------------------------------------------------
    // Action 3: Creator-Confirmed Pitch Submission
    // ----------------------------------------------------
    if (action === "submit") {
      const { briefId, finalMessage } = body;
      if (!briefId || !finalMessage) {
        return NextResponse.json({ error: "Missing briefId or finalMessage" }, { status: 400 });
      }

      const brief = db.brandBriefs[briefId];
      if (!brief) {
        return NextResponse.json({ error: "Brand brief not found" }, { status: 404 });
      }

      const dealId = "deal_" + Math.random().toString(36).substring(2, 9);
      
      const newDeal = {
        id: dealId,
        creatorUid: session.uid,
        brandUid: brief.brandUid,
        deliverableType: brief.deliverableType,
        amount: brief.budgetMax, // set initial offer amount to budgetMax
        brief: brief.description,
        status: "OFFER_SENT" as const,
        createdAt: now,
        updatedAt: now,
        initiatedBy: "CREATOR" as const
      };

      db.deals[dealId] = newDeal;

      // Post the final application message to deal room
      db.dealMessages[dealId] = [
        {
          id: "msg_" + Math.random().toString(36).substring(2, 9),
          senderUid: session.uid,
          message: finalMessage,
          proposedAmount: brief.budgetMax,
          createdAt: now
        }
      ];

      await writeDb(db);

      return NextResponse.json({ success: true, dealId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("Creator Agent Error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
