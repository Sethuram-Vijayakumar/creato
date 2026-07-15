import fs from "fs";
import path from "path";

const translationsPath = path.join(process.cwd(), "src/lib/translations.ts");

const replacements = [
  // Hindi, Bhojpuri & general Devnagari
  { target: /विश्वास स्कोर/g, replacement: "क्रिएटो स्कोर" },
  { target: /विश्वास इंडेक्स/g, replacement: "क्रिएटो स्कोर" },
  { target: /कुल विश्वास स्कोर/g, replacement: "कुल क्रिएटो स्कोर" },
  { target: /विश्वास इंडेक्स \(ATI रेटिंग\)/g, replacement: "क्रिएटो स्कोर (ATI रेटिंग)" },

  // Tamil
  { target: /விஸ்வாஸ் மதிப்பெண்/g, replacement: "கிரியேட்டோ ஸ்கோர்" },
  { target: /விஸ்வாஸ் மதிப்பெண்ணைக்/g, replacement: "கிரியேட்டோ ஸ்கோரைக்" },
  { target: /ஒட்டுமொத்த விஸ்வாஸ் மதிப்பெண்/g, replacement: "ஒட்டுமொத்த கிரியேட்டோ ஸ்கோர்" },
  { target: /விஸ்வாஸ் குறியீடு/g, replacement: "கிரியேட்டோ ஸ்கோர்" },
  { target: /விஸ்வாஸ் மதிப்பெண்ணின்/g, replacement: "கிரியேட்டோ ஸ்கோரின்" },

  // Telugu
  { target: /విశ్వాస్ స్కోర్/g, replacement: "క్రియేటో స్కోరు" },
  { target: /విశ్వాస్ స్కోరును/g, replacement: "క్రియేటో స్కోరును" },
  { target: /మొత్తం విశ్వాస్ స్కోరు/g, replacement: "మొత్తం క్రియేటో స్కోరు" },
  { target: /విశ్వాస్ ఇండెక్స్/g, replacement: "క్రియేటో స్కోరు" },
  { target: /విశ్వాస్ స్కోరు/g, replacement: "క్రియేటో స్కోరు" },

  // Kannada
  { target: /ವಿಶ್ವಾಸ್ ಸ್ಕೋರ್/g, replacement: "ಕ್ರಿಯೇಟೋ ಸ್ಕೋರ್" },
  { target: /ವಿಶ್ವಾಸ್ ಸೂಚ್ಯಂಕ/g, replacement: "ಕ್ರಿಯೇಟೋ ಸ್ಕೋರ್" },
  { target: /ಒಟ್ಟು ವಿಶ್ವಾಸ್ ಸ್ಕೋರ್/g, replacement: "ಒಟ್ಟು ಕ್ರಿಯೇಟೋ ಸ್कೋರ್" },
  { target: /ವಿಶ್ವಾಸ್ ಸ್ಕೋರ್ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ/g, replacement: "ಕ್ರಿಯೇಟೋ ಸ್ಕೋರ್ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ" },
  // Fix minor typo in Kannada string
  { target: /ವಿಶ್ವಾಸ್ ಸೂಚ್ಯಂಕ \(ನಂಬಿಕೆಯ ರೇಟಿಂಗ್\)/g, replacement: "ಕ್ರಿಯೇಟೋ ಸ್ಕೋರ್" },

  // Malayalam
  { target: /വിശ്വാസ് സ്കോർ/g, replacement: "ക്രിയേറ്റോ സ്കോർ" },
  { target: /വിശ്വാസ് ഇൻഡക്സ്/g, replacement: "ക്രിയേറ്റോ സ്കോർ" },
  { target: /മൊത്തം വിശ്വാസ് സ്കോർ/g, replacement: "മൊത്തം ക്രിയേറ്റോ സ്കോർ" },
  { target: /വിശ്വാസ് ഇൻഡക്സ് \(വിശ്വാസ്യത റേറ്റിംഗ്\)/g, replacement: "ക്രിയേറ്റോ സ്കോർ" },

  // Bengali
  { target: /বিশ্বাস স্কোর/g, replacement: "ক্রিয়েটো স্কোর" },
  { target: /বিশ্বাস ইনডেক্স/g, replacement: "ক্রিয়েটো স্কোর" },
  { target: /মোট বিশ্বাস স্কোর/g, replacement: "মোট ক্রিয়েটো স্কোর" },
  { target: /বিশ্বাস ইনডেক্স \(ATI রেটিং\)/g, replacement: "ক্রিয়েটো স্কোর (ATI রেটিং)" },

  // Marathi
  { target: /विश्वास निर्देशांक/g, replacement: "क्रिएटॉ स्कोर" },
  { target: /एकूण विश्वास स्कोर/g, replacement: "एकूण क्रिएटॉ स्कोर" },
  { target: /विश्वास निर्देशांक \(ATI रेटिंग\)/g, replacement: "क्रिएटॉ स्कोर" },

  // Assamese
  { target: /विश्वास स्क'ৰ/g, replacement: "ক্ৰিয়েটো স্ক'ৰ" },
  { target: /विश्वास स्क’ৰ/g, replacement: "ক্ৰিয়েটো স্ক'ৰ" },
  { target: /মুঠ বিশ্বাস স্ক’ৰ/g, replacement: "মুঠ ক্ৰিয়েটো স্ক'ৰ" },
  { target: /विश्वास সূচাংক/g, replacement: "ক্ৰিয়েটো স্ক'ৰ" },
  { target: /विश्वास সূচাংক \(ATI ৰেটিং\)/g, replacement: "ক্ৰিয়েটো স্ক'ৰ" }
];

let content = fs.readFileSync(translationsPath, "utf8");

replacements.forEach(({ target, replacement }) => {
  content = content.replace(target, replacement);
});

fs.writeFileSync(translationsPath, content, "utf8");
console.log("Renamed 'Vishwas' translations to 'Creato' translations in translations.ts successfully!");
