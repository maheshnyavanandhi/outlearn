export interface OpeningSpeechParams {
  topic: string;
  learningObjective?: string;
  studentInstruction?: string;
  teacherPersonality?: string; // 'mentor' | 'coach' | 'socratic'
  educationalLevel?: string;
  language?: string;
}

export interface PersonalizedOpeningResult {
  speechEn: string;
  speechHi: string;
  speechHinglish: string;
  speechTe: string;
}

export function generatePersonalizedOpeningSpeech(params: OpeningSpeechParams): PersonalizedOpeningResult {
  const {
    topic,
    learningObjective,
    studentInstruction,
    teacherPersonality = 'mentor',
    educationalLevel = 'beginner'
  } = params;

  // Derive stated goal cleanly
  const rawGoal = (learningObjective || studentInstruction || '').trim();
  const goalClean = rawGoal && rawGoal.length > 3
    ? rawGoal.replace(/^i want to /i, '').replace(/^i need to /i, '').replace(/^goal:?/i, '').trim()
    : `master the core principles of ${topic}`;

  const levelStr = (educationalLevel || 'beginner').toLowerCase();

  if (teacherPersonality === 'coach') {
    return {
      speechEn: `Welcome! To reach your target—${goalClean}—we're zeroing in on the highest-yield mechanisms and core formulas of ${topic}. I'm Prof. Sarah Jenkins, and we'll focus directly on the key relationships that define exam mastery.`,
      speechHi: `नमस्ते! आपके लक्ष्य—${goalClean}—को पूरा करने के लिए, मैं प्रो. सारा जेन्किन्स, सीधे ${topic} के सबसे महत्वपूर्ण सिद्धांतों और सूत्रों पर ध्यान केंद्रित करूंगी।`,
      speechHinglish: `Welcome! Main hoon Prof. Sarah Jenkins. Aapka target hai: ${goalClean}. Hum direct ${topic} ke high-yield formulas aur exam patterns par focus karenge taaki zero confusion rahe.`,
      speechTe: `స్వాగతం! మీ లక్ష్యం—${goalClean}—సాధించడానికి, నేను ప్రొఫెసర్ సారా జెంకిన్స్, నేరుగా ${topic} యొక్క అత్యంత కీలకమైన సూత్రాలపై దృష్టి పెడతాను.`
    };
  }

  if (teacherPersonality === 'socratic') {
    return {
      speechEn: `Hello! You've set out to ${goalClean}. I'm Dr. Ananya Sen, and instead of giving you formulas, let me ask: what actually drives this behavior in ${topic} when conditions change?`,
      speechHi: `नमस्ते! आपने बताया कि आपका लक्ष्य है: ${goalClean}। मैं हूँ डॉ. अनन्या सेन। आइए ${topic} को एक बुनियादी सवाल से टटोलना शुरू करते हैं।`,
      speechHinglish: `Hello! Main hoon Dr. Ananya Sen. Aapka goal hai: ${goalClean}. Aaiye ${topic} ko ratne ke bajaye ek fundamental question se discover karte hain.`,
      speechTe: `నమస్తే! మీ లక్ష్యం: ${goalClean}. నేను డాక్టర్ అనన్య సేన్. ఒక ప్రాథమిక ప్రశ్నతో ${topic} ను అన్వేషించడం ప్రారంభిద్దాం.`
    };
  }

  // Default: 'mentor' (Dr. Vikram Sharma)
  return {
    speechEn: `Hello! I saw that your primary goal today is to ${goalClean}. I'm Dr. Vikram Sharma, and together we'll build a clear, intuitive mental model of ${topic} at the ${levelStr} level step-by-step.`,
    speechHi: `नमस्ते! मैंने देखा कि आज आपका मुख्य लक्ष्य है: ${goalClean}। मैं हूँ डॉ. विक्रम शर्मा, और हम मिलकर ${topic} को चरण-दर-चरण आसानी से समझेंगे।`,
    speechHinglish: `Hello! Main hoon Dr. Vikram Sharma. Aapka main goal hai: ${goalClean}. Milkar ${topic} ke visual intuition ko step-by-step samjhenge.`,
    speechTe: `నమస్తే! ఈ రోజు మీ ముఖ్యమైన లక్ష్యం: ${goalClean}. నేను డాక్టర్ విక్రమ్ శర్మ, మనం కలిసి ${topic} పై స్పష్టమైన అవగాహనను నిర్మిద్దాం.`
  };
}
