import {
  LanguageOption,
  TeacherPersonalityConfig,
  LessonPlan,
  SubjectType
} from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (US/UK)', voiceLang: 'en-US', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voiceLang: 'hi-IN', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (Hindi + English)', voiceLang: 'en-IN', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', voiceLang: 'es-ES', flag: '🇪🇸' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceLang: 'ta-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceLang: 'te-IN', flag: '🇮🇳' },
];

export const TEACHER_PERSONALITIES: TeacherPersonalityConfig[] = [
  {
    id: 'mentor',
    title: 'Dr. Vikram Sharma',
    subtitle: 'The Patient Mentor',
    avatarMood: 'warm_encouraging',
    description: 'Uses real-world analogies, gentle progression, and builds intuitive mental models step-by-step.',
    avatarStyle: {
      skinTone: '#e0ac69',
      hairColor: '#2b231c',
      shirtColor: '#2563eb',
      accentColor: '#38bdf8',
      glasses: true,
      tie: false
    }
  },
  {
    id: 'coach',
    title: 'Prof. Sarah Jenkins',
    subtitle: 'The Exam Coach',
    avatarMood: 'sharp_focused',
    description: 'High-yield, formula-forward, targets common trap questions and board exam patterns directly.',
    avatarStyle: {
      skinTone: '#f8d9b6',
      hairColor: '#4a3525',
      shirtColor: '#059669',
      accentColor: '#34d399',
      glasses: false,
      tie: true
    }
  },
  {
    id: 'socratic',
    title: 'Dr. Ananya Sen',
    subtitle: 'The Socratic Tutor',
    avatarMood: 'inquisitive',
    description: 'Never gives the answer away; asks targeted guiding questions to help you discover the truth.',
    avatarStyle: {
      skinTone: '#d29a59',
      hairColor: '#1c1917',
      shirtColor: '#9333ea',
      accentColor: '#c084fc',
      glasses: true,
      tie: false
    }
  },
  {
    id: 'technical',
    title: 'Alex Vance',
    subtitle: 'The Technical Mentor',
    avatarMood: 'analytical',
    description: 'Hands-on engineer; focuses on code traces, system architecture, and tangible visual experiments.',
    avatarStyle: {
      skinTone: '#fcd34d',
      hairColor: '#1e293b',
      shirtColor: '#ea580c',
      accentColor: '#fb923c',
      glasses: false,
      tie: false
    }
  }
];

// Exemplar 1: Physics Chapter 4 - Electricity & Ohm's Law (Matches User Scenario in Hackathon PDF)
export const PHYSICS_OHMS_LAW_PLAN: LessonPlan = {
  id: 'lesson-physics-ohms-law',
  topic: 'Chapter 4: Electricity & Ohm\'s Law',
  subject: 'physics',
  educationalLevel: 'beginner',
  timeBudget: '20min',
  totalMinutes: 20,
  language: 'hinglish',
  teacherPersonality: 'mentor',
  sourceDocumentName: 'NCERT_Physics_Class_10_Chapter_4.pdf',
  ragGrounded: true,
  determinations: {
    whatNeedsToBeTaught: "Chapter 4: Electricity & Ohm's Law. Scoped to the 3 essential building blocks for a 20-minute beginner session: 1) Voltage as potential push, 2) Current as rate of charge flow, and 3) Resistance & Ohm's Law (V = I·R). Advanced AC calculus and internal resistance derivations are deferred.",
    conceptsOrderReasoning: "Strict prerequisite dependency order: Electric Potential (Voltage) MUST be taught first because it is the cause of flow. Electric Current (I) is taught second as the physical effect. Resistance (R) and Ohm's Law are taught third as the interaction between cause and constraint.",
    depthCalibration: "Calibrated for Beginner level in 20 minutes: High intuitive emphasis with tangible mechanical models (hydraulic pressure, pipe diameter), avoiding abstract differential field theory to ensure zero cognitive fatigue.",
    examplesAndVisuals: "Everyday hydraulic pressure analogy (overhead water tank pushing water through a pipe with a valve) combined with an interactive real-time Circuit Simulation with live voltage/resistance sliders.",
    questioningTiming: "Two formative checkpoints scheduled at pivotal concept boundaries: Checkpoint 1 after introducing Voltage/Current to verify flow mechanics; Checkpoint 2 after Ohm's law to diagnose potential direct/inverse proportionality inversion.",
    understandingCriteria: "Evaluates whether the student understands physical causality (e.g. knowing that if resistance triples under fixed voltage, current drops by 3x) rather than mere formula memorization.",
    adaptationTriggers: "If student exhibits direct/inverse inversion, immediately trigger SIMPLIFY with hydraulic visual analogy; if mastered, trigger MOVE_FORWARD and deepen with calculation practice.",
    nextStepsRecommendation: "Summative 3-question mastery assessment at session completion, followed by progression to Chapter 5: Series and Parallel Resistive Circuits."
  },
  prerequisitesOverview: [
    'Basic understanding of atoms and charged electrons',
    'Familiarity with proportional relationships (Direct vs Inverse)'
  ],
  steps: [
    {
      id: 'step-1-charge-voltage',
      concept: {
        id: 'c-voltage',
        name: 'Electric Potential Difference (Voltage)',
        subject: 'physics',
        summary: 'Voltage (V) is the electrical pressure or work done to push unit charge through a circuit.',
        difficulty: 'beginner',
        prerequisites: [],
        keyFormulas: ['V = W / Q'],
        keyTerms: ['Volt (V)', 'Potential Difference', 'Battery'],
        sourceReference: 'NCERT Chapter 4, Page 42, Section 4.1'
      },
      allocatedMinutes: 4,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b1-1',
          conceptId: 'c-voltage',
          action: 'INTRODUCE',
          speechEn: 'Welcome! Today we will master Chapter 4: Electricity. Think of voltage as water pressure in an overhead tank.',
          speechHi: 'नमस्ते! आज हम कक्षा 10 का अध्याय 4 - विद्युत (Electricity) गहराई से समझेंगे। वोल्टेज को पानी की टंकी के प्रेशर की तरह समझें।',
          speechHinglish: 'Welcome! Aaj hum Chapter 4: Electricity ko crystal clear karenge. Voltage ko aap ek overhead water tank ke pressure ki tarah imagine kijiye.',
          speechTe: 'స్వాగతం! ఈ రోజు మనం 4వ అధ్యాయం - విద్యుత్ (Electricity) సులభంగా నేర్చుకుందాం. వోల్టేజ్‌ను వాటర్ ట్యాంక్ పీడనం లాగా ఊహించుకోండి.',
          caption: 'Voltage is electrical push (pressure) measured in Volts (V).',
          visualCue: {
            subject: 'physics',
            viewMode: 'circuit_simulation',
            highlightTarget: 'battery',
            state: { voltage: 9, resistance: 10, current: 0.9, lampLit: true },
            annotation: 'Battery supplies Voltage V = 9V'
          },
          durationSec: 8
        },
        {
          id: 'b1-2',
          conceptId: 'c-voltage',
          action: 'EXPLAIN',
          speechEn: 'When the battery provides 9 Volts, it creates a potential difference that urges free electrons to drift through the copper wire.',
          speechHi: 'जब बैटरी 9 वोल्ट देती है, तो यह तार में मुक्त इलेक्ट्रॉनों को आगे धकेलने के लिए एक बल पैदा करती है।',
          speechHinglish: 'Jab battery 9 Volts provide karti hai, toh yeh copper wire ke electrons ko push karne ke liye electrical potential difference banati hai.',
          speechTe: 'బ్యాటరీ 9 వోల్ట్‌లను ఇచ్చినప్పుడు, అది రాగి తీగలో ఎలక్ట్రాన్‌లను నెట్టడానికి అవసరమైన పొటెన్షియల్ తేడాను కలుగజేస్తుంది.',
          caption: 'Potential difference drives electrons from negative to positive terminal.',
          visualCue: {
            subject: 'physics',
            viewMode: 'circuit_simulation',
            highlightTarget: 'electron_flow',
            state: { voltage: 9, resistance: 10, current: 0.9, lampLit: true },
            annotation: 'Electrons flowing steadily'
          },
          durationSec: 9
        }
      ]
    },
    {
      id: 'step-2-current',
      concept: {
        id: 'c-current',
        name: 'Electric Current (I)',
        subject: 'physics',
        summary: 'Current is the rate of flow of electric charges across a cross-section per unit time.',
        difficulty: 'beginner',
        prerequisites: ['c-voltage'],
        keyFormulas: ['I = Q / t'],
        keyTerms: ['Ampere (A)', 'Charge (Coulombs)', 'Ammeter'],
        sourceReference: 'NCERT Chapter 4, Page 45, Section 4.2'
      },
      allocatedMinutes: 4,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b2-1',
          conceptId: 'c-current',
          action: 'EXPLAIN',
          speechEn: 'Current, measured in Amperes, is simply the volume of electric charge passing through our circuit every second.',
          speechHi: 'विद्युत धारा (Current) एम्पीयर (A) में मापी जाती है। यह प्रति सेकंड बहने वाले आवेश की मात्रा है।',
          speechHinglish: 'Current jise hum I se likhte hain, Ampere (A) me calculate hota hai. Yeh basically per second pass hone wale charge ka flow rate hai.',
          speechTe: 'విద్యుత్ ప్రవాహం (Current) ఆంపియర్లలో కొలుస్తారు. ఇది ప్రతి సెకనుకు తీగ గుండా ప్రవహించే చార్జ్ పరిమాణం.',
          caption: 'I = Q / t (Amperes = Coulombs per second)',
          visualCue: {
            subject: 'physics',
            viewMode: 'circuit_simulation',
            highlightTarget: 'ammeter',
            state: { voltage: 9, resistance: 10, current: 0.9, lampLit: true },
            annotation: 'Ammeter reads 0.90 Amperes'
          },
          durationSec: 8
        }
      ]
    },
    {
      id: 'step-3-resistance-ohms-law',
      concept: {
        id: 'c-resistance-ohms-law',
        name: 'Resistance & Ohm\'s Law (V = I * R)',
        subject: 'physics',
        summary: 'Resistance opposes current flow. Ohm\'s law states current is directly proportional to voltage and inversely proportional to resistance.',
        difficulty: 'beginner',
        prerequisites: ['c-voltage', 'c-current'],
        keyFormulas: ['V = I * R', 'I = V / R', 'R = V / I'],
        keyTerms: ['Ohm (Ω)', 'George Simon Ohm', 'Resistor', 'Inverse Proportionality'],
        sourceReference: 'NCERT Chapter 4, Page 48, Section 4.3'
      },
      allocatedMinutes: 8,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b3-1',
          conceptId: 'c-resistance-ohms-law',
          action: 'DEMONSTRATE',
          speechEn: 'Now comes the heart of Chapter 4: Ohm\'s Law. Voltage equals Current multiplied by Resistance: V equals I times R.',
          speechHi: 'अब आता है सबसे महत्वपूर्ण नियम: ओम का नियम (Ohm\'s Law)। V = I × R। धारा प्रतिरोध के व्युत्क्रमानुपाती होती है।',
          speechHinglish: 'Ab aate hain Chapter 4 ke main concept par: Ohm\'s Law! V = I * R. Iska matlab Current (I) = V / R hota hai.',
          speechTe: 'ఇప్పుడు చాప్టర్ 4 లో అత్యంత ముఖ్యమైన ఓం నియమం: వోల్టేజ్ = విద్యుత్ ప్రవాహం × నిరోధం (V = I * R).',
          caption: 'Ohm\'s Law: V = I × R  →  I = V / R',
          visualCue: {
            subject: 'physics',
            viewMode: 'circuit_simulation',
            highlightTarget: 'resistor',
            state: { voltage: 9, resistance: 10, current: 0.9, lampLit: true },
            annotation: 'At R = 10Ω, Current I = 9V / 10Ω = 0.9A'
          },
          durationSec: 9
        },
        {
          id: 'b3-2-checkpoint',
          conceptId: 'c-resistance-ohms-law',
          action: 'ASK_CONCEPTUAL',
          speechEn: 'Here is a quick question to test your intuition: What happens to current if resistance increases while voltage remains constant?',
          speechHi: 'आपके लिए एक महत्वपूर्ण प्रश्न: यदि वोल्टेज स्थिर रहे और हम प्रतिरोध (Resistance) को बढ़ा दें, तो धारा (Current) पर क्या प्रभाव पड़ेगा?',
          speechHinglish: 'Ek quick conceptual check: Agar voltage constant rahe aur resistance increase ho jaye, toh current ko kya hoga?',
          speechTe: 'మీ అవగాహనను పరీక్షించడానికి ఒక ప్రశ్న: వోల్టేజ్ స్థిరంగా ఉన్నప్పుడు నిరోధం (Resistance) పెరిగితే, విద్యుత్ ప్రవాహానికి ఏమవుతుంది?',
          caption: 'Checkpoint: If R increases while V stays constant, what happens to Current (I)?',
          pauseForInteraction: true,
          checkpoint: {
            id: 'cp-physics-1',
            type: 'conceptual',
            purpose: 'expose_misconception',
            conceptId: 'c-resistance-ohms-law',
            question: 'What happens to current if resistance increases while voltage remains constant?',
            questionHindi: 'यदि वोल्टेज स्थिर रहे और प्रतिरोध बढ़ा दिया जाए, तो धारा (Current) का क्या होगा?',
            questionHinglish: 'Agar voltage constant rakhein aur circuit ka Resistance increase karein, toh Current par kya asar hoga?',
            options: [
              'Current increases proportionally',
              'Current decreases',
              'Current stays exactly the same',
              'Voltage must drop to zero'
            ],
            correctAnswer: 'Current decreases',
            hint: 'Recall that I = V / R. When the denominator R grows larger, what happens to the fraction?',
            knownMisconceptions: [
              {
                triggerPattern: 'increases',
                category: 'conceptual_misconception',
                misconceptionName: 'Inverse Relationship Inversion',
                diagnosedThought: 'Student assumed more resistance somehow pushes more current or confused direct vs inverse relationship in fractions.',
                correctiveStrategy: 'analogy',
                correctiveSpeech: 'Notice that Resistance literally means OPPOSITION. Imagine a water pipe: if you squeeze or narrow the pipe (more resistance), LESS water can pass through per second!',
                correctiveVisualState: { voltage: 9, resistance: 45, current: 0.2, lampLit: false }
              }
            ]
          },
          visualCue: {
            subject: 'physics',
            viewMode: 'circuit_simulation',
            highlightTarget: 'slider_r',
            state: { voltage: 9, resistance: 10, current: 0.9, lampLit: true }
          },
          durationSec: 8
        }
      ]
    },
    {
      id: 'step-4-synthesis',
      concept: {
        id: 'c-circuit-synthesis',
        name: 'Circuit Mastery & Problem Solving',
        subject: 'physics',
        summary: 'Applying V = I * R to solve real-world electrical circuit problems and understand power dissipation.',
        difficulty: 'intermediate',
        prerequisites: ['c-resistance-ohms-law'],
        keyFormulas: ['P = V * I = I^2 * R'],
        keyTerms: ['Power (Watts)', 'Filament', 'Load'],
        sourceReference: 'NCERT Chapter 4, Page 52, Section 4.4'
      },
      allocatedMinutes: 4,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b4-1',
          conceptId: 'c-circuit-synthesis',
          action: 'DEMONSTRATE',
          speechEn: 'Look at the bulb right now! When we increase resistance to 40 Ohms, current drops to 0.22 Amperes and the lamp dims noticeably.',
          speechHi: 'बल्ब को देखिए! जब हम प्रतिरोध को 40 ओम तक बढ़ाते हैं, तो धारा घटकर 0.22 एम्पीयर हो जाती है और बल्ब की रोशनी मद्धम हो जाती है।',
          speechHinglish: 'Screen par bulb ko dekhiye! Jaise hi resistance 40 Ohms kiya, current drop hokar 0.22A ho gaya aur bulb dim ho gaya.',
          caption: 'Visual demonstration: Higher resistance restricts electron flow.',
          visualCue: {
            subject: 'physics',
            viewMode: 'circuit_simulation',
            highlightTarget: 'lamp',
            state: { voltage: 9, resistance: 40, current: 0.225, lampLit: true, dimFactor: 0.3 },
            annotation: 'Higher R (40Ω) -> Lower I (0.225A) -> Dimmer Lamp'
          },
          durationSec: 9
        }
      ]
    }
  ]
};

// Exemplar 2: DBMS Relational Algebra - Selection vs Projection (Matches Demo Video Topic)
export const DBMS_RELATIONAL_ALGEBRA_PLAN: LessonPlan = {
  id: 'lesson-dbms-relational-algebra',
  topic: 'DBMS: Relational Algebra (Selection σ vs Projection π)',
  subject: 'dbms',
  educationalLevel: 'intermediate',
  timeBudget: '20min',
  totalMinutes: 20,
  language: 'en',
  teacherPersonality: 'technical',
  sourceDocumentName: 'Database_System_Concepts_Silberschatz_Ch6.pdf',
  ragGrounded: true,
  prerequisitesOverview: [
    'Knowledge of relational tables, rows (tuples), and columns (attributes)',
    'Basic boolean conditions (AND, OR, >, =)'
  ],
  steps: [
    {
      id: 'step-dbms-1-relation',
      concept: {
        id: 'c-dbms-relation',
        name: 'The Relation & Tuples',
        subject: 'dbms',
        summary: 'In relational algebra, a relation is a set of tuples (rows) adhering to a schema of attributes (columns).',
        difficulty: 'beginner',
        prerequisites: [],
        keyTerms: ['Relation', 'Tuple (Row)', 'Attribute (Column)', 'Cardinality', 'Degree']
      },
      allocatedMinutes: 4,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b-db-1',
          conceptId: 'c-dbms-relation',
          action: 'INTRODUCE',
          speechEn: 'Welcome to Relational Algebra. Today we examine the fundamental unary operators: Selection and Projection. Here is our Students relation.',
          speechHi: 'रिलेशनल अलजेब्रा में आपका स्वागत है। आज हम दो मुख्य ऑपरेटर समझेंगे: Selection (σ) और Projection (π)।',
          speechHinglish: 'Relational Algebra me welcome! Aaj hum do crucial unary operators discuss karenge: Selection sigma aur Projection pi.',
          caption: 'Relation STUDENTS(id, name, dept, gpa, city)',
          visualCue: {
            subject: 'dbms',
            viewMode: 'table_view',
            highlightTarget: 'all_rows',
            annotation: 'Input Table: 5 columns, 5 tuples'
          },
          durationSec: 8
        }
      ]
    },
    {
      id: 'step-dbms-2-selection',
      concept: {
        id: 'c-dbms-selection',
        name: 'Selection Operator (σ)',
        subject: 'dbms',
        summary: 'Selection selects horizontal subsets (tuples/rows) satisfying a specified predicate condition. Represented by sigma (σ).',
        difficulty: 'intermediate',
        prerequisites: ['c-dbms-relation'],
        keyFormulas: ['σ_predicate(Relation)'],
        keyTerms: ['Sigma (σ)', 'Horizontal Filter', 'Predicate', 'Row subset']
      },
      allocatedMinutes: 8,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b-db-2',
          conceptId: 'c-dbms-selection',
          action: 'DEMONSTRATE',
          speechEn: 'Selection uses the Greek letter sigma (σ). It is a HORIZONTAL filter that extracts rows satisfying our predicate, keeping all columns intact.',
          speechHi: 'Selection के लिए हम सिग्मा (σ) का उपयोग करते हैं। यह पंक्तियों (Rows) को क्षैतिज रूप से फ़िल्टर करता है।',
          speechHinglish: 'Selection ke liye Greek letter sigma (σ) use hota hai. Yeh ek HORIZONTAL filter hai jo condition match karne wale rows select karta hai.',
          caption: 'σ_{dept = "CS"}(STUDENTS) filters horizontal rows!',
          visualCue: {
            subject: 'dbms',
            viewMode: 'selection_demo',
            highlightTarget: 'filtered_rows',
            state: { filterPredicate: 'dept == "CS"' },
            annotation: 'Only CS tuples retained (Row filtering)'
          },
          durationSec: 10
        },
        {
          id: 'b-db-3-checkpoint',
          conceptId: 'c-dbms-selection',
          action: 'ASK_CONCEPTUAL',
          speechEn: 'Quick checkpoint: If I want to retrieve only the "name" and "gpa" columns of all students, should I use Selection (σ) or Projection (π)?',
          speechHi: 'यदि हमें केवल "name" और "gpa" कॉलम चाहिए, तो क्या हम Selection (σ) का उपयोग करेंगे या Projection (π) का?',
          speechHinglish: 'Quick test: Agar hume saare students ke sirf "name" aur "gpa" columns dekhne hain, toh Selection use karenge ya Projection?',
          caption: 'Checkpoint: Filtering columns (vertical slice) is handled by which operator?',
          pauseForInteraction: true,
          checkpoint: {
            id: 'cp-dbms-1',
            type: 'conceptual',
            purpose: 'expose_misconception',
            conceptId: 'c-dbms-selection',
            question: 'To retrieve only the "name" and "gpa" columns from a table without filtering rows, which operator is required?',
            options: [
              'Selection (σ)',
              'Projection (π)',
              'Cartesian Product (×)',
              'Set Difference (−)'
            ],
            correctAnswer: 'Projection (π)',
            hint: 'Remember: Selection filters ROWS horizontally. Projection extracts COLUMNS vertically.',
            knownMisconceptions: [
              {
                triggerPattern: 'Selection',
                category: 'conceptual_misconception',
                misconceptionName: 'Selection-Projection Axis Confusion',
                diagnosedThought: 'Student thought "selecting columns" means using the Selection operator because of the English colloquial verb "select".',
                correctiveStrategy: 'visual_counterexample',
                correctiveSpeech: 'Aha! In everyday English we say "select columns", but in formal Relational Algebra, Selection (σ) strictly picks ROWS horizontally, while Projection (π) picks COLUMNS vertically!',
                correctiveVisualState: { highlightAxis: 'columns' }
              }
            ]
          },
          visualCue: {
            subject: 'dbms',
            viewMode: 'table_view',
            highlightTarget: 'axis_diagram'
          },
          durationSec: 8
        }
      ]
    },
    {
      id: 'step-dbms-3-projection',
      concept: {
        id: 'c-dbms-projection',
        name: 'Projection Operator (π)',
        subject: 'dbms',
        summary: 'Projection selects vertical subsets (columns/attributes) and automatically eliminates duplicate tuples.',
        difficulty: 'intermediate',
        prerequisites: ['c-dbms-selection'],
        keyFormulas: ['π_attribute1,attribute2(Relation)'],
        keyTerms: ['Pi (π)', 'Vertical Filter', 'Duplicate Elimination']
      },
      allocatedMinutes: 8,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b-db-4',
          conceptId: 'c-dbms-projection',
          action: 'DEMONSTRATE',
          speechEn: 'Look at the table transforming on your screen. Projection uses Pi (π). Notice how the dept and city columns vanish, leaving only name and gpa, with duplicate rows eliminated.',
          speechHi: 'प्रोजेक्शन पाई (π) का उपयोग करता है। देखिए केवल नाम और जीपीए कॉलम बचे हैं और बाकी कॉलम हटा दिए गए हैं।',
          speechHinglish: 'Screen par table dekhiye: Projection Pi (π) use karta hai. Extra columns cut ho gaye hain aur sirf required attributes bache hain.',
          caption: 'π_{name, gpa}(STUDENTS) extracts vertical columns.',
          visualCue: {
            subject: 'dbms',
            viewMode: 'projection_demo',
            highlightTarget: 'projected_columns',
            state: { projectedCols: ['name', 'gpa'] },
            annotation: 'Vertical column projection + duplicate removal'
          },
          durationSec: 9
        }
      ]
    }
  ]
};

// Exemplar 3: Biology - Cell Biology (Plant vs Animal Cell)
export const BIOLOGY_CELL_PLAN: LessonPlan = {
  id: 'lesson-biology-cell',
  topic: 'Biology: Cell Structure & Plant vs Animal Cells',
  subject: 'biology',
  educationalLevel: 'beginner',
  timeBudget: '20min',
  totalMinutes: 20,
  language: 'en',
  teacherPersonality: 'mentor',
  sourceDocumentName: 'Campbell_Biology_Unit_2_The_Cell.pdf',
  ragGrounded: true,
  prerequisitesOverview: [
    'Understanding that all living organisms are composed of microscopic cells'
  ],
  steps: [
    {
      id: 'step-bio-1-anatomy',
      concept: {
        id: 'c-cell-wall-membrane',
        name: 'Cell Membrane vs Cell Wall',
        subject: 'biology',
        summary: 'All cells have a flexible phospholipid membrane, but plant cells additionally have a rigid cellulose cell wall for structural turgidity.',
        difficulty: 'beginner',
        prerequisites: [],
        keyTerms: ['Phospholipid Bilayer', 'Cellulose Cell Wall', 'Turgor Pressure']
      },
      allocatedMinutes: 10,
      masteryState: 'unknown',
      beats: [
        {
          id: 'b-bio-1',
          conceptId: 'c-cell-wall-membrane',
          action: 'INTRODUCE',
          speechEn: 'Welcome! Look closely at the biological diagram. Why do plant stems stand upright against gravity while animal tissues are supple and flexible?',
          speechHi: 'स्वागत है! इस कोशिका चित्र को ध्यान से देखें। पौधे गुरुत्वाकर्षण के विरुद्ध सीधे क्यों खड़े रहते हैं?',
          speechHinglish: 'Welcome! Is cell diagram ko dekhiye: Plants seedhe khade reh paate hain because unke paas ek rigid Cell Wall hoti hai jo animal cells me nahi hoti.',
          caption: 'Plant cells possess a rigid outer Cell Wall made of cellulose.',
          visualCue: {
            subject: 'biology',
            viewMode: 'cell_diagram',
            highlightTarget: 'cell_wall',
            state: { cellType: 'plant', showOrganelles: true },
            annotation: 'Cell Wall: Cellulose perimeter'
          },
          durationSec: 8
        },
        {
          id: 'b-bio-2-checkpoint',
          conceptId: 'c-cell-wall-membrane',
          action: 'ASK_CONCEPTUAL',
          speechEn: 'Why do plant cells have a rigid cell wall, but animal cells do not?',
          speechHi: 'पादप कोशिकाओं (Plant cells) में कोशिका भित्ति (Cell wall) क्यों होती है जबकि जंतु कोशिकाओं में नहीं?',
          speechHinglish: 'Plant cells me rigid cell wall kyu hoti hai aur animal cells me kyu nahi hoti?',
          caption: 'Checkpoint: Structure-to-Function relationship',
          pauseForInteraction: true,
          checkpoint: {
            id: 'cp-bio-1',
            type: 'conceptual',
            purpose: 'expose_misconception',
            conceptId: 'c-cell-wall-membrane',
            question: 'Why do plant cells have a rigid cell wall while animal cells only have a cell membrane?',
            options: [
              'Plants need structural rigidity and turgor support because they lack skeletal bones',
              'Because animal cells are fundamentally stronger and do not need protection',
              'Animal cells need to breathe through the cell wall',
              'Plant cells use the cell wall solely to trap sunlight'
            ],
            correctAnswer: 'Plants need structural rigidity and turgor support because they lack skeletal bones',
            hint: 'Think about how animals move around with muscles and skeletons, while trees stand tall in wind.',
            knownMisconceptions: [
              {
                triggerPattern: 'stronger',
                category: 'conceptual_misconception',
                misconceptionName: 'Function Confused with Reason',
                diagnosedThought: 'Student thought animal cells lack walls because animal cells are somehow intrinsically stronger.',
                correctiveStrategy: 'visual_counterexample',
                correctiveSpeech: 'Actually, animal cells NEED flexibility to allow locomotion and muscle contraction! Plants cannot move, so they rely on rigid cellulose walls for hydrostatic support against gravity.',
                correctiveVisualState: { compareCells: true }
              }
            ]
          },
          visualCue: {
            subject: 'biology',
            viewMode: 'cell_diagram',
            highlightTarget: 'comparison'
          },
          durationSec: 7
        }
      ]
    }
  ]
};

// Exemplar 4: Computer Science / AI Learning Path (Matches Section 15 of Hackathon PDF)
export const MACHINE_LEARNING_PATH = {
  title: 'AI & Machine Learning Roadmap',
  description: '8-stage structured curriculum adapted to learner mastery level',
  stages: [
    { id: 'ml-1', title: 'Python Fundamentals', level: 'beginner', status: 'mastered', conceptsCount: 6 },
    { id: 'ml-2', title: 'Mathematics for ML', level: 'beginner', status: 'mastered', conceptsCount: 8 },
    { id: 'ml-3', title: 'Data Processing & Pandas', level: 'intermediate', status: 'understood', conceptsCount: 7 },
    { id: 'ml-4', title: 'Supervised Learning', level: 'intermediate', status: 'developing', conceptsCount: 10 },
    { id: 'ml-5', title: 'Unsupervised Learning', level: 'intermediate', status: 'unknown', conceptsCount: 5 },
    { id: 'ml-6', title: 'Model Evaluation & Loss', level: 'advanced', status: 'unknown', conceptsCount: 6 },
    { id: 'ml-7', title: 'Neural Networks & PyTorch', level: 'advanced', status: 'unknown', conceptsCount: 9 },
    { id: 'ml-8', title: 'Advanced Generative AI', level: 'advanced', status: 'unknown', conceptsCount: 8 }
  ]
};
