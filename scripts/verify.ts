// Note: We need to parse set-cookie headers to maintain session
function extractCookie(headers: any): string {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return "";
  // extract creato_session=...
  const match = setCookie.match(/creato_session=([^;]+)/);
  return match ? `creato_session=${match[1]}` : "";
}

async function runVerification() {
  console.log("=========================================");
  console.log("STARTING PROGRAMMATIC FLOW VERIFICATION  ");
  console.log("=========================================");
  
  const baseUrl = "http://localhost:3000";
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const creatorEmail = `harish_${randomSuffix}@creato.in`;
  const brandEmail = `brand_${randomSuffix}@creato.in`;

  // Step 1: Sign up a new creator
  console.log(`\n[Step 1] Signing up new creator (${creatorEmail})...`);
  const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: creatorEmail,
      password: "password123",
      role: "CREATOR"
    })
  });
  
  if (!signupRes.ok) {
    throw new Error(`Signup failed: ${await signupRes.text()}`);
  }
  
  const signupData = await signupRes.json();
  const creatorCookie = extractCookie(signupRes.headers);
  console.log("✔ Creator signed up successfully! UID:", signupData.user.uid);

  // Onboard the creator
  console.log("Submitting onboarding parameters...");
  const onboardRes = await fetch(`${baseUrl}/api/creator/profile`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Cookie": creatorCookie
    },
    body: JSON.stringify({
      displayName: "Harish Kumar",
      handle: `harish_tech_${randomSuffix}`,
      bio: "Tech reviews in regional languages.",
      city: "Bangalore",
      state: "Karnataka",
      primaryLanguage: "Kannada",
      secondaryLanguages: ["English"],
      niche: "Tech",
      followerCount: 15000
    })
  });

  if (!onboardRes.ok) {
    throw new Error(`Onboarding failed: ${await onboardRes.text()}`);
  }

  const onboardData = await onboardRes.json();
  console.log("✔ Onboarding completed!");
  console.log(`✔ Generated ATI Score: ${onboardData.atiScore.overallScore}`);
  console.log("  Breakdown:");
  console.log(`  - Engagement: ${onboardData.atiScore.engagementAuthenticity}%`);
  console.log(`  - Vernacular Depth: ${onboardData.atiScore.vernacularDepth}%`);
  console.log(`  - Community Depth: ${onboardData.atiScore.communityDepth}%`);
  console.log(`  - Local Relevance: ${onboardData.atiScore.localRelevance}%`);

  // Step 2: Register a new Brand
  console.log(`\n[Step 2] Registering brand (${brandEmail})...`);
  const brandSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: brandEmail,
      password: "password123",
      role: "BRAND"
    })
  });

  if (!brandSignupRes.ok) {
    throw new Error(`Brand signup failed: ${await brandSignupRes.text()}`);
  }

  const brandSignupData = await brandSignupRes.json();
  const brandCookie = extractCookie(brandSignupRes.headers);
  console.log("✔ Brand signed up successfully! UID:", brandSignupData.user.uid);

  // Auto-create brand profile
  console.log("Initializing brand profile...");
  const brandProfileRes = await fetch(`${baseUrl}/api/brand/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": brandCookie
    },
    body: JSON.stringify({
      companyName: "Harish Tech Sponsor",
      industry: "Tech",
      city: "Bangalore",
      description: "Sponsoring local language unboxing creators."
    })
  });
  await brandProfileRes.json();

  // Test Discover Search
  console.log("Searching discover directory with filters (State: Karnataka, Language: Kannada)...");
  const searchRes = await fetch(`${baseUrl}/api/creators?state=Karnataka&language=Kannada`, {
    headers: { "Cookie": brandCookie }
  });
  const searchData = await searchRes.json();
  const foundCreator = searchData.creators.find((c: any) => c.handle === `harish_tech_${randomSuffix}`);
  
  if (foundCreator) {
    console.log(`✔ Discover works! Found creator: ${foundCreator.displayName} (ATI: ${foundCreator.atiScore.overallScore})`);
  } else {
    throw new Error("Discover search did not return the onboarded creator under the specified filters.");
  }

  // Step 3: Brand submits underpriced offer (₹3,000)
  console.log("\n[Step 3] Submitting campaign offer (₹3,000 for a YouTube Video)...");
  const offerRes = await fetch(`${baseUrl}/api/deals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": brandCookie
    },
    body: JSON.stringify({
      creatorUid: signupData.user.uid,
      deliverableType: "YouTube Video",
      amount: "3000",
      brief: "Review our new budget earphone in local Kannada dialect."
    })
  });

  if (!offerRes.ok) {
    throw new Error(`Offer submission failed: ${await offerRes.text()}`);
  }

  const offerData = await offerRes.json();
  const dealId = offerData.dealId;
  console.log(`✔ Offer submitted! Deal ID: ${dealId} | Status: ${offerData.deal.status}`);

  // Step 4: Creator reviews deal & counter-offers
  console.log("\n[Step 4] Creator logging in to review proposal...");
  const reviewRes = await fetch(`${baseUrl}/api/deals/${dealId}`, {
    headers: { "Cookie": creatorCookie }
  });
  const reviewData = await reviewRes.json();
  
  console.log(`Reviewing Deal Room Details:`);
  console.log(`- Proposing Brand: ${reviewData.brand.companyName}`);
  console.log(`- Amount Offered: ₹${reviewData.deal.amount}`);
  console.log(`- Recommended Range: ₹${reviewData.rateRange.min} - ₹${reviewData.rateRange.max}`);

  const isUnderpriced = reviewData.deal.amount < reviewData.rateRange.min;
  console.log(`- Fairness Banner Audit: ${isUnderpriced ? "⚠️ UNDERPRICED (Action Recommended)" : "✅ FAIR"}`);

  console.log("Submitting counter-offer of ₹5,500...");
  const counterRes = await fetch(`${baseUrl}/api/deals/${dealId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": creatorCookie
    },
    body: JSON.stringify({
      action: "COUNTER",
      counterAmount: "5500",
      message: "Standard rate for Kannada video review including translation."
    })
  });

  const counterData = await counterRes.json();
  console.log(`✔ Counter-offer submitted! Status: ${counterData.deal.status} | Counter Amount: ₹${counterData.deal.amount}`);

  // Step 5: Brand reviews counter-offer & accepts
  console.log("\n[Step 5] Brand logging in to review counter-offer...");
  const brandReviewRes = await fetch(`${baseUrl}/api/deals/${dealId}`, {
    headers: { "Cookie": brandCookie }
  });
  const brandReviewData = await brandReviewRes.json();
  console.log(`- Counter Received: ₹${brandReviewData.deal.amount} (Status: ${brandReviewData.deal.status})`);

  console.log("Accepting counter-offer...");
  const acceptRes = await fetch(`${baseUrl}/api/deals/${dealId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": brandCookie
    },
    body: JSON.stringify({
      action: "ACCEPT"
    })
  });
  
  const acceptData = await acceptRes.json();
  console.log(`✔ Counter-offer accepted! Final Campaign Status: ${acceptData.deal.status} | Final Amount: ₹${acceptData.deal.amount}`);

  console.log("\n=========================================");
  console.log("✔ ALL FLOW VERIFICATIONS PASSED SUCCESSFULLY!");
  console.log("=========================================");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
