import { readDb, writeDb, DatabaseSchema } from "../src/lib/db";
import { calculateATI, CreatorProfile, MockEngagementData } from "../src/lib/ati";
import bcrypt from "bcryptjs";

const CREATORS_DATA: Array<{
  uid: string;
  email: string;
  profile: CreatorProfile & { handle: string; state: string; city: string; profileImageUrl: string };
  mockData: MockEngagementData;
}> = [
  {
    uid: "creator_priya_tn",
    email: "priya@creato.in",
    profile: {
      displayName: "Priya Sharma",
      handle: "priya_cooks",
      city: "Chennai",
      state: "Tamil Nadu",
      primaryLanguage: "Tamil",
      secondaryLanguages: ["English", "Hindi"],
      niche: "Food",
      followerCount: 12000,
      profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      bio: "Sharing traditional Tamil home recipes with a modern twist. Love exploring regional spices!"
    },
    mockData: {
      engagementRate: 0.08, // 8% (High)
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.85, // 85% Tamil comments
      repeatCommenterRatio: 0.45, // 45% repeat
      stateAudienceRatio: 0.78 // 78% from TN
    }
  },
  {
    uid: "creator_ravi_telegu",
    email: "ravi@creato.in",
    profile: {
      displayName: "Ravi Teja",
      handle: "ravi_laughs",
      city: "Hyderabad",
      state: "Andhra Pradesh",
      primaryLanguage: "Telugu",
      secondaryLanguages: ["English"],
      niche: "Comedy",
      followerCount: 45000,
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      bio: "Daily Telugu comedy sketches and relatable middle-class family humor."
    },
    mockData: {
      engagementRate: 0.06, // 6%
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.80, // 80% Telugu
      repeatCommenterRatio: 0.38,
      stateAudienceRatio: 0.70
    }
  },
  {
    uid: "creator_ramesh_kannada",
    email: "ramesh@creato.in",
    profile: {
      displayName: "Ramesh Kumar",
      handle: "ramesh_finance",
      city: "Bangalore",
      state: "Karnataka",
      primaryLanguage: "Kannada",
      secondaryLanguages: ["English", "Telugu"],
      niche: "Finance",
      followerCount: 28000,
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      bio: "Demystifying personal finance, stock market, and tax planning in Kannada."
    },
    mockData: {
      engagementRate: 0.045, // 4.5%
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.72,
      repeatCommenterRatio: 0.48, // high loyalty
      stateAudienceRatio: 0.82
    }
  },
  {
    uid: "creator_ananya_bengali",
    email: "ananya@creato.in",
    profile: {
      displayName: "Ananya Sen",
      handle: "ananya_beauty",
      city: "Kolkata",
      state: "West Bengal",
      primaryLanguage: "Bengali",
      secondaryLanguages: ["English", "Hindi"],
      niche: "Beauty",
      followerCount: 64000,
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      bio: "Saree drapes, skin care routines, and traditional Bengali bridal makeup guides."
    },
    mockData: {
      engagementRate: 0.075, // 7.5%
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.88,
      repeatCommenterRatio: 0.40,
      stateAudienceRatio: 0.75
    }
  },
  {
    uid: "creator_swapnil_marathi",
    email: "swapnil@creato.in",
    profile: {
      displayName: "Swapnil Patil",
      handle: "swapnil_edu",
      city: "Pune",
      state: "Maharashtra",
      primaryLanguage: "Marathi",
      secondaryLanguages: ["Hindi"],
      niche: "Education",
      followerCount: 8500,
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      bio: "Simplifying school math and science concepts for Marathi medium students."
    },
    mockData: {
      engagementRate: 0.09, // 9%
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.92, // extremely localized
      repeatCommenterRatio: 0.55,
      stateAudienceRatio: 0.90
    }
  },
  {
    uid: "creator_manoj_bhojpuri",
    email: "manoj@creato.in",
    profile: {
      displayName: "Manoj Tiwari Jr.",
      handle: "manoj_shows",
      city: "Patna",
      state: "Bihar",
      primaryLanguage: "Bhojpuri",
      secondaryLanguages: ["Hindi"],
      niche: "Entertainment",
      followerCount: 75000,
      profileImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
      bio: "Bhojpuri reaction videos, movie news, and rural comedy skits."
    },
    mockData: {
      engagementRate: 0.03, // 3%
      growthAnomaly: true, // purchased followers penalty!
      commentLanguageMatchRatio: 0.55,
      repeatCommenterRatio: 0.20,
      stateAudienceRatio: 0.48
    }
  },
  {
    uid: "creator_harpreet_punjabi",
    email: "harpreet@creato.in",
    profile: {
      displayName: "Harpreet Singh",
      handle: "harpreet_eats",
      city: "Amritsar",
      state: "Punjab",
      primaryLanguage: "Punjabi",
      secondaryLanguages: ["Hindi", "English"],
      niche: "Food",
      followerCount: 32000,
      profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      bio: "Dhadas, local Punjab street food stalls, and oversized butter naan recipes."
    },
    mockData: {
      engagementRate: 0.082,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.82,
      repeatCommenterRatio: 0.44,
      stateAudienceRatio: 0.72
    }
  },
  {
    uid: "creator_juri_assamese",
    email: "juri@creato.in",
    profile: {
      displayName: "Juri Boro",
      handle: "juri_travels",
      city: "Guwahati",
      state: "Assam",
      primaryLanguage: "Assamese",
      secondaryLanguages: ["English"],
      niche: "Travel",
      followerCount: 15000,
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      bio: "Backpacking across northeast India, showcasing Assam's tea gardens and tribal cultures."
    },
    mockData: {
      engagementRate: 0.07,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.78,
      repeatCommenterRatio: 0.42,
      stateAudienceRatio: 0.81
    }
  },
  {
    uid: "creator_sandeep_telangana",
    email: "sandeep@creato.in",
    profile: {
      displayName: "Sandeep Reddy",
      handle: "sandeep_tech",
      city: "Warangal",
      state: "Telangana",
      primaryLanguage: "Telugu",
      secondaryLanguages: ["English"],
      niche: "Tech",
      followerCount: 50000,
      profileImageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop",
      bio: "Mobile unboxings, buying guides, and software tips in simple Telugu."
    },
    mockData: {
      engagementRate: 0.068,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.75,
      repeatCommenterRatio: 0.36,
      stateAudienceRatio: 0.65
    }
  },
  {
    uid: "creator_deepa_tamil",
    email: "deepa@creato.in",
    profile: {
      displayName: "Deepa Balan",
      handle: "deepa_academy",
      city: "Madurai",
      state: "Tamil Nadu",
      primaryLanguage: "Tamil",
      secondaryLanguages: [],
      niche: "Education",
      followerCount: 6200,
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      bio: "English speaking and grammar courses designed specifically for Tamil speakers."
    },
    mockData: {
      engagementRate: 0.11,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.94,
      repeatCommenterRatio: 0.60,
      stateAudienceRatio: 0.88
    }
  },
  {
    uid: "creator_rohit_marathi",
    email: "rohit@creato.in",
    profile: {
      displayName: "Rohit Shinde",
      handle: "rohit_eats_pune",
      city: "Pune",
      state: "Maharashtra",
      primaryLanguage: "Marathi",
      secondaryLanguages: ["Hindi"],
      niche: "Food",
      followerCount: 19000,
      profileImageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop",
      bio: "Vlogging street food and budget eateries in Pune and Kolhapur."
    },
    mockData: {
      engagementRate: 0.058,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.74,
      repeatCommenterRatio: 0.35,
      stateAudienceRatio: 0.78
    }
  },
  {
    uid: "creator_subhasish_bengali",
    email: "subhasish@creato.in",
    profile: {
      displayName: "Subhasish Das",
      handle: "subha_tech_tips",
      city: "Siliguri",
      state: "West Bengal",
      primaryLanguage: "Bengali",
      secondaryLanguages: [],
      niche: "Tech",
      followerCount: 3500,
      profileImageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop",
      bio: "PC building and tech repair videos in Bengali. Short and simple."
    },
    mockData: {
      engagementRate: 0.02,
      growthAnomaly: true,
      commentLanguageMatchRatio: 0.40,
      repeatCommenterRatio: 0.15,
      stateAudienceRatio: 0.30
    }
  },
  {
    uid: "creator_amrita_punjabi",
    email: "amrita@creato.in",
    profile: {
      displayName: "Amrita Kaur",
      handle: "amrita_makeup",
      city: "Ludhiana",
      state: "Punjab",
      primaryLanguage: "Punjabi",
      secondaryLanguages: ["Hindi", "English"],
      niche: "Beauty",
      followerCount: 52000,
      profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
      bio: "Punjabi wedding look tutorials, product reviews, and local outfit hauls."
    },
    mockData: {
      engagementRate: 0.072,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.84,
      repeatCommenterRatio: 0.42,
      stateAudienceRatio: 0.76
    }
  },
  {
    uid: "creator_kedar_kannada",
    email: "kedar@creato.in",
    profile: {
      displayName: "Kedar Gowda",
      handle: "kedar_vlogs",
      city: "Mysore",
      state: "Karnataka",
      primaryLanguage: "Kannada",
      secondaryLanguages: ["English"],
      niche: "Comedy",
      followerCount: 22000,
      profileImageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
      bio: "Pranks and comedy vlogs capturing daily life in Karnataka's heritage city."
    },
    mockData: {
      engagementRate: 0.084,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.81,
      repeatCommenterRatio: 0.46,
      stateAudienceRatio: 0.80
    }
  },
  {
    uid: "creator_pinky_bhojpuri",
    email: "pinky@creato.in",
    profile: {
      displayName: "Pinky Singh",
      handle: "pinky_bhojpuri_rasoi",
      city: "Gaya",
      state: "Bihar",
      primaryLanguage: "Bhojpuri",
      secondaryLanguages: ["Hindi"],
      niche: "Food",
      followerCount: 18500,
      profileImageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop",
      bio: "Traditional Bihari recipes, Litti Chokha specials, and simple kitchen hacks in Bhojpuri."
    },
    mockData: {
      engagementRate: 0.095,
      growthAnomaly: false,
      commentLanguageMatchRatio: 0.90,
      repeatCommenterRatio: 0.50,
      stateAudienceRatio: 0.86
    }
  }
];

const BRANDS_DATA = [
  {
    uid: "brand_indid2c",
    email: "contact@indid2c.in",
    profile: {
      companyName: "IndiD2C",
      industry: "FMCG",
      logoUrl: "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=100&h=100&fit=crop",
      city: "Bangalore",
      description: "Direct-to-consumer organic snacks tailored to Indian regional preferences. Healthy and delicious."
    }
  },
  {
    uid: "brand_bharatpay",
    email: "marketing@bharatpay.in",
    profile: {
      companyName: "BharatPay",
      industry: "Fintech",
      logoUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
      city: "Mumbai",
      description: "Empowering small merchants across tier-2 and tier-3 India with simple digital billing and payment solutions."
    }
  },
  {
    uid: "brand_sringara",
    email: "collabs@sringara.com",
    profile: {
      companyName: "Sringara Cosmetics",
      industry: "Beauty",
      logoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop",
      city: "Delhi",
      description: "Vegan and cruelty-free makeup designed for diverse Indian skin tones. Authentic, cruelty-free beauty."
    }
  },
  {
    uid: "brand_mithaiwala",
    email: "orders@mithaiwala.in",
    profile: {
      companyName: "MithaiWala",
      industry: "Food",
      logoUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=100&h=100&fit=crop",
      city: "Jaipur",
      description: "Delivering traditional sweets and dry fruits made with pure ghee directly to households across major Indian cities."
    }
  },
  {
    uid: "brand_gyanedu",
    email: "partnerships@gyanedu.in",
    profile: {
      companyName: "GyanEdu",
      industry: "Edtech",
      logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&h=100&fit=crop",
      city: "Noida",
      description: "After-school K-12 tutorials and mock test preps recorded in regional vernacular Indian languages."
    }
  },
  {
    uid: "brand_swadeshi",
    email: "hello@swadeshiwear.in",
    profile: {
      companyName: "Swadeshi Wear",
      industry: "Apparel",
      logoUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&h=100&fit=crop",
      city: "Chennai",
      description: "Sustainably sourced ethnic and fusion wear celebrating handloom fabrics and Indian weaves."
    }
  }
];

async function seed() {
  console.log("Starting DB seeding script...");
  const db = await readDb();
  
  const passwordHash = bcrypt.hashSync("password123", 10);
  const now = new Date().toISOString();

  // Reset collections
  db.users = {};
  db.creatorProfiles = {};
  db.brandProfiles = {};
  db.atiScores = {};
  db.deals = {};
  db.dealMessages = {};
  db.pastCollaborations = {};
  db.mockEngagementData = {};
  db.brandBriefs = {};

  // Seed Creators
  console.log("Seeding creators...");
  for (const c of CREATORS_DATA) {
    db.users[c.uid] = {
      uid: c.uid,
      email: c.email,
      passwordHash: passwordHash,
      role: "CREATOR",
      createdAt: now
    };

    db.creatorProfiles[c.uid] = {
      uid: c.uid,
      ...c.profile,
      createdAt: now
    };

    const atiScore = calculateATI(c.profile, c.mockData);
    db.atiScores[c.uid] = {
      creatorUid: c.uid,
      ...atiScore,
      lastUpdated: now
    };

    db.mockEngagementData[c.uid] = {
      creatorUid: c.uid,
      ...c.mockData,
      followerGrowthHistory: [
        { month: "Jan", followers: Math.round(c.profile.followerCount * 0.85) },
        { month: "Feb", followers: Math.round(c.profile.followerCount * 0.90) },
        { month: "Mar", followers: Math.round(c.profile.followerCount * 0.93) },
        { month: "Apr", followers: Math.round(c.profile.followerCount * 0.97) },
        { month: "May", followers: c.profile.followerCount }
      ]
    };

    // Past collabs
    const collabId1 = `${c.uid}_collab_1`;
    db.pastCollaborations[collabId1] = {
      id: collabId1,
      creatorUid: c.uid,
      brandName: "LocalBrand " + c.profile.primaryLanguage,
      outcome: "Delivered 1 regional video with 15% engagement rate",
      date: "2026-03-12"
    };

    const collabId2 = `${c.uid}_collab_2`;
    db.pastCollaborations[collabId2] = {
      id: collabId2,
      creatorUid: c.uid,
      brandName: "ChaiCo",
      outcome: "Delivered 2 Instagram reels with total 50K views",
      date: "2026-04-20"
    };

    console.log(`Seeded Creator: ${c.profile.displayName} | ATI: ${atiScore.overallScore}`);
  }

  // Seed Brands
  console.log("Seeding brands...");
  for (const b of BRANDS_DATA) {
    db.users[b.uid] = {
      uid: b.uid,
      email: b.email,
      passwordHash: passwordHash,
      role: "BRAND",
      createdAt: now
    };

    db.brandProfiles[b.uid] = {
      uid: b.uid,
      ...b.profile,
      createdAt: now
    };
    console.log(`Seeded Brand: ${b.profile.companyName}`);
  }

  // Seed Deals
  console.log("Seeding deals...");
  const deals = [
    {
      id: "deal_sample_1",
      creatorUid: "creator_priya_tn",
      brandUid: "brand_indid2c",
      deliverableType: "Instagram Video",
      amount: 4500,
      brief: "Create an Instagram Reel demonstrating recipes featuring IndiD2C spicy banana chips.",
      status: "COUNTERED" as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "deal_sample_2",
      creatorUid: "creator_ravi_telegu",
      brandUid: "brand_bharatpay",
      deliverableType: "YouTube Short",
      amount: 15000,
      brief: "A funny comedy sketch explaining QR code scanning in regional markets.",
      status: "OFFER_SENT" as const,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "deal_sample_3",
      creatorUid: "creator_ananya_bengali",
      brandUid: "brand_sringara",
      deliverableType: "Instagram Reel",
      amount: 12000,
      brief: "Review the new vegan lip oil collection in a simple Bengali styling video.",
      status: "ACCEPTED" as const,
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const d of deals) {
    db.deals[d.id] = d;

    if (d.id === "deal_sample_1") {
      db.dealMessages[d.id] = [
        {
          id: "msg_1_1",
          senderUid: "brand_indid2c",
          message: "Hey Priya, we love your content! We would love to collaborate on a reel showing our banana chips in a traditional Tamil recipe. Offering ₹3,500.",
          proposedAmount: 3500,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "msg_1_2",
          senderUid: "creator_priya_tn",
          message: "Hi IndiD2C, thank you! I'd love to work with you. Based on my engagement rates and Tamil target reach, my standard rate is ₹4,500. Let me know if that works!",
          proposedAmount: 4500,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    } else if (d.id === "deal_sample_2") {
      db.dealMessages[d.id] = [
        {
          id: "msg_2_1",
          senderUid: "brand_bharatpay",
          message: "Hello Ravi, we want to launch a Telugu campaign for our digital payment app. We're offering ₹15,000 for a humor skit highlighting ease of payments.",
          proposedAmount: 15000,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    } else if (d.id === "deal_sample_3") {
      db.dealMessages[d.id] = [
        {
          id: "msg_3_1",
          senderUid: "brand_sringara",
          message: "Hey Ananya, let's collab on the lip oil launch. Standard price ₹12,000.",
          proposedAmount: 12000,
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          id: "msg_3_2",
          senderUid: "creator_ananya_bengali",
          message: "That sounds awesome, let's do it! Excited to showcase this to my Bengali audience.",
          proposedAmount: null,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "msg_3_3",
          senderUid: "brand_sringara",
          message: "Great! Offer accepted. We will ship the products to your address tomorrow.",
          proposedAmount: null,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    }
  }

  // Seed Brand Briefs
  console.log("Seeding brand briefs...");
  const briefs = [
    {
      id: "brief_sringara_1",
      brandUid: "brand_sringara",
      title: "Matte Lipstick Summer Launch",
      description: "We are looking for Bengali or Hindi beauty creators to create engaging Reels showcasing our new cruelty-free matte lipsticks. Focus on textures, colors, and durability.",
      niche: "Beauty",
      targetLanguages: ["Bengali", "Hindi"],
      targetStates: ["West Bengal", "Delhi"],
      budgetMin: 12000,
      budgetMax: 18000,
      deliverableType: "Instagram Reel",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_bharatpay_1",
      brandUid: "brand_bharatpay",
      title: "BharatPay QR Scanner Humor Campaign",
      description: "Looking for comedy creators in Andhra Pradesh or Karnataka to do relatable middle-class household comedy skits showing how easy it is to use our new contactless scanner.",
      niche: "Comedy",
      targetLanguages: ["Telugu", "Kannada"],
      targetStates: ["Andhra Pradesh", "Karnataka"],
      budgetMin: 25000,
      budgetMax: 35000,
      deliverableType: "YouTube Video",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_mithaiwala_1",
      brandUid: "brand_mithaiwala",
      title: "Diwali Sweet Gifting Extravaganza",
      description: "Looking for regional food creators to do unboxing, recipe styling, and tasting videos for our premium pure ghee dry fruit sweets collections.",
      niche: "Food",
      targetLanguages: ["Hindi", "Punjabi"],
      targetStates: ["Delhi", "Punjab", "Rajasthan"],
      budgetMin: 15500,
      budgetMax: 22000,
      deliverableType: "Instagram Post",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_gyanedu_1",
      brandUid: "brand_gyanedu",
      title: "Regional Learning App Promotion",
      description: "Promote GyanEdu K-12 learning apps in South Indian languages. Ideal for parent/family creators or educational niche influencers.",
      niche: "Education",
      targetLanguages: ["Tamil", "Kannada", "Malayalam"],
      targetStates: ["Tamil Nadu", "Karnataka", "Kerala"],
      budgetMin: 10000,
      budgetMax: 15000,
      deliverableType: "YouTube Video",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_swadeshi_1",
      brandUid: "brand_swadeshi",
      title: "Handloom Saree Festive Collection",
      description: "Highlight our sustainably sourced silk weaves and festive handloom saree collections. Creators must speak Tamil or Malayalam and present high aesthetic styling guides.",
      niche: "Beauty",
      targetLanguages: ["Tamil", "Malayalam"],
      targetStates: ["Tamil Nadu", "Kerala"],
      budgetMin: 8000,
      budgetMax: 12000,
      deliverableType: "Instagram Reel",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_indid2c_1",
      brandUid: "brand_indid2c",
      title: "Finance & Tax Planning Education",
      description: "Help simplify personal tax planning, GST filings, and investments for young salary earners. Looking for finance creators in Delhi/NCR.",
      niche: "Finance",
      targetLanguages: ["Hindi", "English"],
      targetStates: ["Delhi"],
      budgetMin: 30000,
      budgetMax: 45000,
      deliverableType: "YouTube Video",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_sringara_2",
      brandUid: "brand_sringara",
      title: "Organic Cleanser Launch Review",
      description: "Looking for skin care reviews for our new organic cleanser. Needs to focus on daily morning routines. Looking for Tamil or Hindi creators.",
      niche: "Beauty",
      targetLanguages: ["Tamil", "Hindi"],
      targetStates: ["Tamil Nadu", "Delhi"],
      budgetMin: 10000,
      budgetMax: 16000,
      deliverableType: "Instagram Reel",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_mithaiwala_2",
      brandUid: "brand_mithaiwala",
      title: "Traditional Sweets Mukbang / Tasting",
      description: "Perform a traditional sweets tasting challenge or unboxing. Creators in Karnataka or Andhra preferred.",
      niche: "Food",
      targetLanguages: ["Kannada", "Telugu"],
      targetStates: ["Karnataka", "Andhra Pradesh"],
      budgetMin: 7000,
      budgetMax: 11000,
      deliverableType: "Instagram Post",
      status: "OPEN" as const,
      createdAt: now
    },
    {
      id: "brief_gyanedu_2",
      brandUid: "brand_gyanedu",
      title: "Regional Coding Bootcamps Review",
      description: "Promote our local language coding bootcamp courses for children. Hindi language speakers in Delhi preferred.",
      niche: "Education",
      targetLanguages: ["Hindi"],
      targetStates: ["Delhi"],
      budgetMin: 20000,
      budgetMax: 28000,
      deliverableType: "YouTube Video",
      status: "OPEN" as const,
      createdAt: now
    }
  ];

  for (const b of briefs) {
    db.brandBriefs[b.id] = b;
  }

  await writeDb(db);
  console.log("Seeding completed successfully!");
}

seed();
