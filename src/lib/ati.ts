export interface CreatorProfile {
  displayName: string;
  handle: string;
  city: string;
  state: string;
  primaryLanguage: string;
  secondaryLanguages: string[];
  niche: string;
  followerCount: number;
  bio: string;
}

export interface MockEngagementData {
  engagementRate: number; // e.g., 0.06 for 6%
  growthAnomaly: boolean; // true if bot-like follower spikes
  commentLanguageMatchRatio: number; // e.g., 0.82 for 82% match
  repeatCommenterRatio: number; // e.g., 0.45 for 45% repeat commenters
  stateAudienceRatio: number; // e.g., 0.75 for 75% state geo-matches
}

export interface ATIScore {
  overallScore: number;
  engagementAuthenticity: number;
  vernacularDepth: number;
  communityDepth: number;
  localRelevance: number;
}

/**
 * Calculates the Audience Trust Index (ATI) based on profile and mock engagement data.
 */
export function calculateATI(profile: CreatorProfile, mockData: MockEngagementData): ATIScore {
  // 1. Engagement Authenticity (35%): Based on engagement rate, penalized heavily if growth anomaly is flagged
  // Standard healthy engagement is around 3-8%. Let's scale engagement rate: 6% or higher gets 100.
  const rawAuthenticity = Math.min(100, mockData.engagementRate * 1250); // e.g. 0.08 * 1250 = 100
  const engagementAuthenticity = Math.round(
    mockData.growthAnomaly ? rawAuthenticity * 0.5 : rawAuthenticity
  );

  // 2. Vernacular Depth (25%): % of comments matching primary language
  const vernacularDepth = Math.round(mockData.commentLanguageMatchRatio * 100);

  // 3. Community Depth (20%): repeat commenter ratio (scaled so 50%+ repeat comments get 100)
  const communityDepth = Math.round(Math.min(100, mockData.repeatCommenterRatio * 200));

  // 4. Local Relevance (20%): state match ratio
  const localRelevance = Math.round(mockData.stateAudienceRatio * 100);

  // Overall Weighted Score
  const overallScore = Math.round(
    engagementAuthenticity * 0.35 +
    vernacularDepth * 0.25 +
    communityDepth * 0.20 +
    localRelevance * 0.20
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    engagementAuthenticity: Math.min(100, Math.max(0, engagementAuthenticity)),
    vernacularDepth: Math.min(100, Math.max(0, vernacularDepth)),
    communityDepth: Math.min(100, Math.max(0, communityDepth)),
    localRelevance: Math.min(100, Math.max(0, localRelevance)),
  };
}

/**
 * Suggests a price range in INR (₹) for a standard campaign post/video.
 */
export function suggestedRateRange(atiScore: number, followerCount: number) {
  // Base rate of ₹0.30 per follower for a standard campaign
  const baseRate = followerCount * 0.30;
  
  // Multiplier from ATI (a score of 50 -> 0.75x, 90 -> 1.8x, etc.)
  const multiplier = 0.3 + (atiScore / 100) * 1.7;
  
  const targetRate = Math.round(baseRate * multiplier);
  
  // Create a 15% range around the target rate
  const minRate = Math.round(targetRate * 0.85);
  const maxRate = Math.round(targetRate * 1.15);

  return {
    min: Math.max(500, minRate),
    max: Math.max(1000, maxRate),
    suggested: Math.max(800, targetRate),
    multiplier: parseFloat(multiplier.toFixed(2))
  };
}

/**
 * Returns plain-English interpretive text for the ATI score.
 */
export function getATIInterpretation(score: number): string {
  if (score >= 85) {
    return "Ultra-high community connection; exceptional local language alignment and genuine audience engagement.";
  } else if (score >= 70) {
    return "Strong local authority with a highly active, authentic vernacular audience.";
  } else if (score >= 55) {
    return "Moderate regional resonance, but check for generic comment fill or lower follower growth quality.";
  } else {
    return "Low regional trust signal. Engagement patterns show low language localization or high growth anomalies.";
  }
}
