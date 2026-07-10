"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "./LanguageProvider";

interface ATIScoreCardProps {
  score: {
    overallScore: number;
    engagementAuthenticity: number;
    vernacularDepth: number;
    communityDepth: number;
    localRelevance: number;
  };
  compact?: boolean;
}

function getLocalizedInterpretation(score: number, lang: string): string {
  switch (lang) {
    case "hi":
      if (score >= 85) return "असाधारण सामुदायिक जुड़ाव; बेजोड़ स्थानीय भाषा तालमेल और दर्शकों की सच्ची प्रतिक्रियाएं।";
      if (score >= 70) return "मजबूत स्थानीय प्रभाव; सक्रिय और असली क्षेत्रीय भाषा के दर्शकों का आधार।";
      if (score >= 55) return "मध्यम क्षेत्रीय जुड़ाव; लेकिन बनावटी फ़ॉलोअर्स या कमेंट्स की जांच करें।";
      return "कम क्षेत्रीय विश्वास संकेत। कमेंट्स में स्थानीय भाषा की कमी या असामान्य फ़ॉलोअर्स बढ़त देखी गई है।";
    case "ta":
      if (score >= 85) return "மிக உயர்ந்த சமூக இணைப்பு; இணையற்ற பிராந்திய மொழித் தொடர்பு மற்றும் ரசிகர்களின் உண்மையான ஆதரவு.";
      if (score >= 70) return "வலுவான உள்ளூர் செல்வாக்கு; தீவிர மற்றும் உண்மையான பிராந்திய மொழி ரசிகர்களின் தளம்.";
      if (score >= 55) return "மிதமான பிராந்திய இணைப்பு; இருப்பினும் போலி கருத்துக்கள் அல்லது ஃபாலோயர்களை சரிபார்க்கவும்.";
      return "குறைந்த பிராந்திய நம்பிக்கை சமிக்ஞை. கருத்துக்களில் போலித்தன்மை அல்லது ஃபாலோயர் அதிகரிப்பு காணப்படுகிறது.";
    case "te":
      if (score >= 85) return "అసాధారణ సామాజిక అనుబంధం; సాటిలేని ప్రాంతీయ భాషా బంధం మరియు ప్రేక్షకుల నిజమైన మద్దతు.";
      if (score >= 70) return "బలమైన స్థానిక ప్రభావం; చురుకైన మరియు నిజమైన ప్రాంతీయ భాషా ప్రేక్షకుల బేస్.";
      if (score >= 55) return "మధ్యస్థ ప్రాంతీయ అనుబంధం; కానీ నకిలీ కామెంట్లు లేదా ఫాలోవర్లను తనిఖీ చేయండి.";
      return "తక్కువ ప్రాంతీయ విశ్వసనీయత. కామెంట్లలో స్థానికత లోపించడం లేదా అసాధారణ ఫాలోవర్ల వృద్ధి కనిపిస్తోంది.";
    case "kn":
      if (score >= 85) return "ಅಸಾಧಾರಣ ಸಾಮಾಜಿಕ ನಿಕಟತೆ; ಸಾಟಿಯಿಲ್ಲದ ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ಪ್ರೇಕ್ಷಕರ ನಿಜವಾದ ಬೆಂಬಲ.";
      if (score >= 70) return "ಬಲವಾದ ಸ್ಥಳೀಯ ಪ್ರಭಾವ; ಸಕ್ರಿಯ ಮತ್ತು ನೈಜ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯ ಪ್ರೇಕ್ಷಕರ ಬೇಸ್.";
      if (score >= 55) return "ಮಧ್ಯಮ ಪ್ರಾದೇಶಿಕ ನಿಕಟತೆ; ಆದರೆ ನಕಲಿ ಕಮೆಂಟ್‌ಗಳು ಅಥವಾ ಫಾಲೋವರ್ಸ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.";
      return "ಕಡಿಮೆ ಪ್ರಾದೇಶಿಕ ವಿಶ್ವಾಸ ಸೂಚನೆ. ಕಮೆಂಟ್‌ಗಳಲ್ಲಿ ಸ್ಥಳೀಯತೆಯ ಕೊರತೆ ಅಥವಾ ಅಸಾಧಾರಣ ಫಾಲೋವರ್ಸ್ ಹೆಚ್ಚಳ ಕಾಣಿಸುತ್ತಿದೆ.";
    case "ml":
      if (score >= 85) return "അസാധാരണമായ കമ്മ്യൂണിറ്റി ബന്ധം; മികച്ച പ്രാദേശിക ഭാഷാ സാന്നിധ്യവും പ്രേക്ഷകരുടെ യഥാർത്ഥ പിന്തുണയും.";
      if (score >= 70) return "ശക്തമായ പ്രാദേശിക സ്വാധീനം; സജീവവും യഥാർത്ഥവുമായ പ്രാദേശിക ഭാഷാ പ്രേക്ഷകരുണ്ട്.";
      if (score >= 55) return "മിതമായ പ്രാദേശിക സ്വാധീനം; എങ്കിലും വ്യാജ കമന്റുകളോ ഫോളോവേഴ്സോ ഉണ്ടോ എന്ന് പരിശോധിക്കുക.";
      return "കുറഞ്ഞ പ്രാദേശിക വിശ്വാസ്യത. കമന്റുകളിൽ തദ്ദേശീയതയുടെ കുറവോ അസ്വാഭാവിക ഫോളോവേഴ്‌സ് വർദ്ധനവോ കാണാം.";
    case "bn":
      if (score >= 85) return "অসাধারণ সামাজিক মেলবন্ধন; দুর্দান্ত আঞ্চলিক ভাষার টান এবং দর্শকদের আন্তরিক সমর্থন।";
      if (score >= 70) return "মজবুত স্থানীয় প্রভাব; সক্রিয় এবং খাঁটি আঞ্চলিক ভাষার দর্শকদের বড় পরিধি।";
      if (score >= 55) return "মাঝারি আঞ্চলিক সংযোগ; কিন্তু নকল ফলোয়ার বা কমেন্ট আছে কিনা যাচাই করুন।";
      return "কম আঞ্চলিক বিশ্বাস সংকেত। কমেন্টে আঞ্চলিকতার অভাব বা অস্বাভাবিক ফলোয়ার বৃদ্ধি দেখা যাচ্ছে।";
    case "mr":
      if (score >= 85) return "असाधारण सामुदायिक संवाद; उत्कृष्ट स्थानिक भाषा जुळणी आणि प्रेक्षकांचा खरा पाठिंबा.";
      if (score >= 70) return "मजबूत स्थानिक प्रभाव; सक्रिय आणि खऱ्या प्रादेशिक भाषेतील प्रेक्षकांचा आधार.";
      if (score >= 55) return "मध्यम प्रादेशिक जुळणी; पण बनावट फॉलोअर्स किंवा कमेंट्स तपासून पहा.";
      return "कमी प्रादेशिक विश्वास संकेत. कमेंट्समध्ये स्थानिकतेचा अभाव किंवा असामान्य फॉलोअर्स वाढ आढळली आहे.";
    case "pa":
      if (score >= 85) return "ਅਸਾਧਾਰਨ ਭਾਈਚਾਰਕ ਸਾਂਝ; ਲਾਜਵਾਬ ਖੇਤਰੀ ਭਾਸ਼ਾ ਤਾਲਮੇਲ ਅਤੇ ਦਰਸ਼ਕਾਂ ਦਾ ਸੱਚਾ ਸਮਰਥਨ।";
      if (score >= 70) return "ਮਜ਼ਬੂਤ ਸਥਾਨਕ ਪ੍ਰਭਾਵ; ਸਰਗਰਮ ਅਤੇ ਅਸਲੀ ਖੇਤਰੀ ਭਾਸ਼ਾ ਦੇ ਦਰਸ਼ਕਾਂ ਦਾ ਘੇਰਾ।";
      if (score >= 55) return "ਦਰਮਿਆਨਾ ਖੇਤਰੀ ਜੁੜਾਵ; ਪਰ ਬਣਾਵਟੀ ਫਾਲੋਅਰਜ਼ ਜਾਂ ਕੁਮੈਂਟਸ ਦੀ ਜਾਂਚ ਕਰੋ।";
      return "ਘੱਟ ਖੇਤਰੀ ਵਿਸ਼ਵਾਸ ਸੰਕੇਤ। ਕੁਮੈਂਟਸ ਵਿੱਚ ਸਥਾਨਕ ਭਾਸ਼ਾ ਦੀ ਕਮੀ ਜਾਂ ਅਸਾਧਾਰਨ ਫਾਲੋਅਰਜ਼ ਵਾਧਾ ਦਿਸ ਰਿਹਾ ਹੈ।";
    case "as":
      if (score >= 85) return "অসাধাৰণ সামাজিক মেলবন্ধন; সুন্দৰ আঞ্চলিক ভাষাৰ টান আৰু দৰ্শকৰ আন্তৰিক সমৰ্থন।";
      if (score >= 70) return "মজবুত স্থানীয় প্ৰভাৱ; সক্ৰিয় আৰু প্ৰকৃত আঞ্চলিক ভাষাৰ দৰ্শকৰ বৃহৎ পৰিসৰ।";
      if (score >= 55) return "মধ্যমীয়া আঞ্চলিক সংযোগ; কিন্তু নকল ফলোয়াৰ বা কমেন্ট আছে নেকি পৰীক্ষা কৰক।";
      return "কম আঞ্চলিক বিশ্বাস সংকেত। কমেন্টত আঞ্চলিকতাৰ অভাৱ বা অস্বাভাৱিক ফলোয়াৰ বৃদ্ধি দেখা গৈছে।";
    case "bho":
      if (score >= 85) return "असाधारण सामुदायिक जुड़ाव; बेजोड़ स्थानीय भाषा तालमेल आ दर्शकन के सच्चा प्रतिक्रिया।";
      if (score >= 70) return "मजबूत स्थानीय प्रभाव; सक्रिय आ असली क्षेत्रीय भाषा के दर्शकन के आधार।";
      if (score >= 55) return "मध्यम क्षेत्रीय जुड़ाव; लेकिन बनावटी फ़ॉलोअर्स चाहे कमेंट्स के जांच करीं।";
      return "कम क्षेत्रीय बिसवास संकेत। कमेंट्स में स्थानीय भाषा के कमी चाहे असामान्य फ़ॉलोअर्स बढ़त देखल गइल बा।";
    default:
      if (score >= 85) return "Ultra-high community connection; exceptional local language alignment and genuine audience engagement.";
      if (score >= 70) return "Strong local authority with a highly active, authentic vernacular audience.";
      if (score >= 55) return "Moderate regional resonance, but check for generic comment fill or lower follower growth quality.";
      return "Low regional trust signal. Engagement patterns show low language localization or high growth anomalies.";
  }
}

export default function ATIScoreCard({ score, compact = false }: ATIScoreCardProps) {
  const { language, t } = useLanguage();
  const { overallScore, engagementAuthenticity, vernacularDepth, communityDepth, localRelevance } = score;

  // Simplified terms for Recharts Radar chart labels
  const getRadarLabel = (subject: string) => {
    switch (subject) {
      case "Engagement":
        return t("engagementLabel"); // e.g. Real Fan Check
      case "Vernacular":
        return t("vernacularLabel"); // Mother-Tongue Tone
      case "Community":
        return t("communityLabel"); // Superfans Ratio
      case "Local Relevance":
        return t("localLabel"); // State Neighborhood
      default:
        return subject;
    }
  };

  const chartData = [
    { subject: "Engagement", value: engagementAuthenticity, fullMark: 100 },
    { subject: "Vernacular", value: vernacularDepth, fullMark: 100 },
    { subject: "Community", value: communityDepth, fullMark: 100 },
    { subject: "Local Relevance", value: localRelevance, fullMark: 100 },
  ];

  const interpretation = getLocalizedInterpretation(overallScore, language);

  const radius = 40;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className={`luxury-card-purple p-6 flex flex-col items-center gap-6 ${compact ? 'max-w-md' : 'w-full'}`}>
      <h3 className="text-md font-bold text-slate-800 self-start">{t("atiTitle")}</h3>
      
      <div className="flex flex-col sm:flex-row items-center justify-around w-full gap-6">
        {/* Radial Progress Ring */}
        <div className="relative flex items-center justify-center w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle
              className="text-slate-100"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx="40"
              cy="40"
            />
            <circle
              className="text-luxury-purple-500 transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx="40"
              cy="40"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-bold font-mono tracking-tighter text-luxury-purple-600 tabular-nums">
              {overallScore}
            </span>
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
              {t("overallScore").split(" ")[0]}
            </span>
          </div>
        </div>

        {/* 4-Axis Radar Chart */}
        <div className="w-56 h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tickFormatter={getRadarLabel}
                tick={{ fill: "#64748b", fontSize: 8, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="ATI Metrics"
                dataKey="value"
                stroke="#7c3aec"
                fill="#c084fc"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown list with friendly tags */}
      <div className="w-full grid grid-cols-2 gap-4 mt-2">
        <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("engagementLabel")}</p>
          <p className="text-md font-extrabold text-slate-800 mt-1">{engagementAuthenticity}%</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{t("realInteraction")}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("vernacularLabel")}</p>
          <p className="text-md font-extrabold text-slate-800 mt-1">{vernacularDepth}%</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Tone Match</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("communityLabel")}</p>
          <p className="text-md font-extrabold text-slate-800 mt-1">{communityDepth}%</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{t("superfans")}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("localLabel")}</p>
          <p className="text-md font-extrabold text-slate-800 mt-1">{localRelevance}%</p>
          <p className="text-[9px] text-slate-400 mt-0.5">State Match</p>
        </div>
      </div>

      {/* Interpretive line */}
      <div className="w-full border-t border-purple-100 pt-4 text-center sm:text-left">
        <p className="text-xs font-bold text-luxury-purple-600 mb-1">{t("atiInterpretation")}</p>
        <p className="text-[11px] text-slate-600 leading-relaxed italic">
          &ldquo;{interpretation}&rdquo;
        </p>
      </div>
    </div>
  );
}
