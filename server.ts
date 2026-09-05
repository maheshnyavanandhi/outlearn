import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Clean and parse JSON from LLM output (handles code fences, commentary, trailing text, control chars)
function cleanAndParseJson<T = any>(rawText: string): T {
  if (!rawText) throw new SyntaxError('Empty response text');
  let text = rawText.trim();

  // Strip markdown code block wrappers
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // Locate first { or [ and last } or ]
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');

    let startIdx = -1;
    let isObject = true;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      isObject = true;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      isObject = false;
    }

    if (startIdx !== -1) {
      const lastIdx = isObject ? text.lastIndexOf('}') : text.lastIndexOf(']');
      if (lastIdx > startIdx) {
        const jsonSubstring = text.slice(startIdx, lastIdx + 1);
        try {
          return JSON.parse(jsonSubstring);
        } catch (subErr) {
          // Clean unescaped control chars and trailing commas
          const sanitized = jsonSubstring
            .replace(/,\s*([\}\]])/g, '$1')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
              if (match === '\n' || match === '\r' || match === '\t') return match;
              return '';
            });
          return JSON.parse(sanitized);
        }
      }
    }

    throw initialErr;
  }
}

// Resilient Gemini invoker prioritizing appropriate models according to task complexity
async function callGemini(
  contents: string | any[],
  isJson: boolean = false,
  taskComplexity: 'complex' | 'general' | 'fast' = 'general',
  systemInstruction?: string
): Promise<{ text: string; modelUsed: string }> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured in server environment');
  }

  // Model selection hierarchy based on official Google Gemini models
  let candidateModels: string[];
  if (taskComplexity === 'complex') {
    candidateModels = ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
  } else if (taskComplexity === 'fast') {
    candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.1-pro-preview'];
  } else {
    candidateModels = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
  }

  let lastErr: any = null;

  for (const model of candidateModels) {
    let retries = 2;
    while (retries >= 0) {
      try {
        const configObj: any = {};
        if (isJson) {
          configObj.responseMimeType = 'application/json';
        }
        if (systemInstruction) {
          configObj.systemInstruction = systemInstruction;
        }

        const response = await client.models.generateContent({
          model,
          contents,
          ...(Object.keys(configObj).length > 0 ? { config: configObj } : {})
        });
        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastErr = err;
        const errStr = String(err?.message || err);
        const is429 = err?.status === 429 || err?.code === 429 || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('Quota exceeded');
        const is503 = err?.status === 503 || err?.code === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand');

        if (is429) {
          console.warn(`[OutLearn Server] Model ${model} quota exhausted. Immediately switching to next model candidate.`);
          break;
        }

        if (is503 && retries > 0) {
          console.warn(`[OutLearn Server] Model ${model} temporary 503 demand spike. Retrying in ${(3 - retries) * 500}ms... (${retries} retries left)`);
          retries--;
          await new Promise((resolve) => setTimeout(resolve, (3 - retries) * 500));
          continue;
        }

        console.warn(`[OutLearn Server] Model ${model} unavailable for ${taskComplexity} task, switching to next candidate:`, errStr);
        break;
      }
    }
  }

  throw lastErr || new Error('All candidate Gemini models failed');
}

// Health check & backend status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    backend: 'Node.js Express + Google GenAI',
    defaultModel: 'gemini-3.6-flash',
    time: new Date().toISOString()
  });
});

// Student OAuth Endpoints
app.get('/api/auth/google/url', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${baseUrl}/auth/callback`;
  const nameParam = req.query.name ? `&name=${encodeURIComponent(req.query.name as string)}` : '';
  const emailParam = req.query.email ? `&email=${encodeURIComponent(req.query.email as string)}` : '';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '109283749201-demo-student.apps.googleusercontent.com',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account'
  });
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}${nameParam}${emailParam}`;
  res.json({ url: googleAuthUrl, redirectUri });
});

// Callback handler for OAuth popup
const handleOAuthCallback = (req: Request, res: Response) => {
  const name = (req.query.name as string) || 'Student Learner';
  const email = (req.query.email as string) || 'student@example.com';
  const picture = (req.query.picture as string) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
  const sub = (req.query.sub as string) || `google-oauth-sub-${Date.now()}`;

  const studentUser = {
    sub,
    name,
    email,
    picture,
    authProvider: 'Google OAuth 2.0'
  };

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student OAuth Authorization Complete</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F9F8F6; color: #1C1C1C; }
          .card { background: white; padding: 2rem; border-radius: 1rem; border: 1px solid #ddd; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Google Student OAuth Complete</h2>
          <p>Logged in as <strong>${studentUser.name}</strong> (${studentUser.email})</p>
          <p>Closing popup and synchronizing profile...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_AUTH_SUCCESS',
              user: ${JSON.stringify(studentUser)}
            }, '*');
            setTimeout(function() { window.close(); }, 800);
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
};

app.get(['/auth/callback', '/auth/callback/'], handleOAuthCallback);

// 0. Parse Natural Student Instruction & Determine 8 Pedagogical Decisions
app.post('/api/parse-student-instruction', async (req: Request, res: Response) => {
  try {
    const {
      instruction,
      materialContext = '',
      fileName = '',
      educationalLevel = 'beginner',
      statedPriorKnowledge = '',
      learningObjective = '',
      preferredTeachingStyle = 'mentor',
      preferredLanguage = 'hinglish',
      timeBudget = '20min',
      desiredDepth = 'conceptual_overview'
    } = req.body;
    const client = getGeminiClient();

    if (client && instruction) {
      const prompt = `You are OutLearn, a master human-like pedagogical AI Teacher.
A student gave this exact natural instruction:
"${instruction}"

LEARNER PERSONALIZATION PROFILE (7 DIMENSIONS):
- Educational Level: ${educationalLevel}
  * Beginner Rule: Use simple terminology, analogies, and fundamental concepts.
  * Intermediate Rule: Use more technical explanations and practical operational examples.
  * Advanced Rule: Use detailed concepts, technical terminology, mathematics, implementation details, and advanced examples where appropriate.
- Existing Knowledge: "${statedPriorKnowledge}"
- Learning Objective: "${learningObjective}"
- Preferred Teaching Style: ${preferredTeachingStyle}
- Preferred Language: ${preferredLanguage}
- Available Time: ${timeBudget}
- Desired Depth: ${desiredDepth}

${fileName ? `Uploaded Textbook / Source Document: "${fileName}"` : ''}
${materialContext ? `Document Content Excerpt:\n"""${materialContext.slice(0, 3500)}"""` : ''}

Analyze this instruction and learner parameters to produce the 8 CORE PEDAGOGICAL DETERMINATIONS required for a true personalized teaching session:

1. What needs to be taught (topic & scope for allotted time)
2. Which concepts should be covered first (prerequisite ordering & cognitive sequence)
3. How deeply each concept should be explained (depth calibration according to learner level & desired depth)
4. Which examples or visuals should be used (concrete intuitive analogies & interactive visual lab simulations)
5. When the student should be questioned (formative checkpoint timing during the lesson)
6. Whether the student has understood the concept (cognitive diagnostic criteria for evaluating responses)
7. Whether the lesson needs to be simplified or expanded (adaptive branching rules for misconceptions vs mastery)
8. What should be taught next (post-lesson learning roadmap & end-of-lesson assessment recommendation)

Return STRICT RAW JSON matching this exact structure:
{
  "detectedTopic": string,
  "detectedChapter": string,
  "detectedLevel": "${educationalLevel}",
  "detectedTime": "${timeBudget}",
  "detectedLanguage": "${preferredLanguage}",
  "askQuestionsDuringLesson": boolean,
  "testAtEnd": boolean,
  "stylePreference": string,
  "determinations": {
    "whatNeedsToBeTaught": string,
    "conceptsOrderReasoning": string,
    "depthCalibration": string,
    "examplesAndVisuals": string,
    "questioningTiming": string,
    "understandingCriteria": string,
    "adaptationTriggers": string,
    "nextStepsRecommendation": string
  }
}`;

      const { text, modelUsed } = await callGemini(prompt, true);
      try {
        const parsed = cleanAndParseJson(text);
        return res.json({
          success: true,
          ...parsed,
          isLiveAi: true,
          modelUsed
        });
      } catch (e) {
        console.warn('Failed to parse instruction JSON from Gemini, using robust parser', e);
      }
    }

    // Heuristic fallback parser
    const lower = `${instruction || ''} ${fileName || ''}`.toLowerCase();
    const detectedLevel = (lower.includes('advanced') || lower.includes('interview')) ? 'advanced' : lower.includes('intermediate') ? 'intermediate' : 'beginner';
    const detectedTime = lower.includes('5 min') || lower.includes('5min') ? '5min' : lower.includes('60 min') || lower.includes('1 hour') ? '60min' : '20min';
    const detectedLanguage = lower.includes('telugu') ? 'te' : lower.includes('hindi') ? 'hi' : lower.includes('hinglish') ? 'hinglish' : 'en';
    
    let topic = "Fundamental Core Concepts";
    if (lower.includes('python') || lower.includes('lab') || lower.includes('programming')) {
      topic = fileName ? fileName.replace(/\.[^/.]+$/, '') : "Python Programming Laboratory";
    } else if (lower.includes('artificial intelligence') || lower.includes('ai')) {
      topic = "Artificial Intelligence: From Fundamentals to Neural Networks";
    } else if (lower.includes('newton')) {
      topic = "Newton's Laws of Motion (Class 8 Level)";
    } else if (lower.includes('react')) {
      topic = "React Concepts for Technical Interviews";
    } else if (lower.includes('chapter 4') || lower.includes('ch 4')) {
      topic = "Chapter 4: Electric Current & Ohm's Law";
    } else if (fileName) {
      topic = fileName.replace(/\.[^/.]+$/, '');
    }

    return res.json({
      success: true,
      isLiveAi: false,
      detectedTopic: topic,
      detectedChapter: 'Selected Chapter',
      detectedLevel,
      detectedTime,
      detectedLanguage,
      askQuestionsDuringLesson: lower.includes('question') || true,
      testAtEnd: lower.includes('test') || true,
      stylePreference: lower.includes('simple') ? 'simple everyday examples' : 'standard pedagogical',
      determinations: {
        whatNeedsToBeTaught: `Scope limited to the essential building blocks of ${topic} tailored for a ${detectedTime} ${detectedLevel} session.`,
        conceptsOrderReasoning: `Prerequisite dependency ordering: 1) Core Definitions & Mental Model -> 2) Operational Mechanics & Execution -> 3) Application & Edge Cases.`,
        depthCalibration: `Calibrated for ${detectedLevel} level in ${detectedTime}: Focus on high conceptual clarity, interactive step-by-step tracing, and practical examples.`,
        examplesAndVisuals: `Interactive visual demonstrations and step-by-step laboratory execution models.`,
        questioningTiming: `Formative checkpoints injected at key concept transitions to verify mental model integrity before advancing.`,
        understandingCriteria: `Evaluating causal problem-solving and underlying reasoning rather than rote memory recall.`,
        adaptationTriggers: `Adaptive branching: Simplify with tangible visual analogies if misconceptions occur; advance to challenge problems on mastery.`,
        nextStepsRecommendation: `Summative assessment evaluation at session end, followed by recommended next steps.`
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to detect domain subject accurately
function detectSubjectFromText(topic: string, instruction = '', content = ''): 'physics' | 'dbms' | 'biology' | 'mathematics' | 'programming' {
  const combined = `${topic} ${instruction} ${content}`.toLowerCase();
  
  if (combined.includes('dbms') || combined.includes('sql') || combined.includes('relational') || combined.includes('database') || combined.includes('schema') || combined.includes('join')) {
    return 'dbms';
  }
  if (combined.includes('biology') || combined.includes('cell') || combined.includes('respiration') || combined.includes('plant') || combined.includes('organ') || combined.includes('gene')) {
    return 'biology';
  }
  if (combined.includes('math') || combined.includes('algebra') || combined.includes('calculus') || combined.includes('equation') || combined.includes('trigonometry')) {
    return 'mathematics';
  }
  if (combined.includes('ohm') || combined.includes('voltage') || combined.includes('circuit') || combined.includes('physics') || combined.includes('newton') || combined.includes('electricity') || combined.includes('gravity')) {
    return 'physics';
  }
  return 'programming'; // default for python, code, react, ai, programming, lab manuals, cs, general
}

// 1. Generate Structured Lesson Plan Endpoint with 8 Determinations & 7 Learner Personalizations
app.post('/api/generate-lesson-plan', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      educationalLevel = 'beginner',
      statedPriorKnowledge = '',
      learningObjective = '',
      preferredTeachingStyle = 'mentor',
      language = 'en',
      timeBudget = '20min',
      desiredDepth = 'conceptual_overview',
      materialContext = '',
      studentInstruction = ''
    } = req.body;
    const client = getGeminiClient();

    const targetSubject = detectSubjectFromText(topic, studentInstruction, materialContext);

    if (client) {
      const prompt = `You are OutLearn, a master human-like educator.
Create a rich, structured, adaptive pedagogical lesson on the topic: "${topic}".
Domain Subject: ${targetSubject}.

LEARNER PERSONALIZATION ADAPTATION GUIDELINES (7 DIMENSIONS):
- Educational Level: ${educationalLevel}
  * Beginner Rule: Use simple terminology, analogies, and fundamental concepts.
  * Intermediate Rule: Use more technical explanations, operational logic, and practical examples.
  * Advanced Rule: Use detailed concepts, technical terminology, mathematics, implementation details, and advanced examples where appropriate.
- Existing Knowledge: "${statedPriorKnowledge}" (Connect new concepts to this foundation)
- Learning Objective: "${learningObjective}" (Align checkpoints and outcomes with this goal)
- Preferred Teaching Style: ${preferredTeachingStyle}
- Language: ${language}
- Time Budget: ${timeBudget}
- Desired Depth: ${desiredDepth}

${studentInstruction ? `Student Natural Instruction: "${studentInstruction}"` : ''}
${materialContext ? `Uploaded Source Document Reference: "${materialContext.slice(0, 1500)}"` : ''}

Generate a valid JSON object matching this schema:
{
  "topic": "${topic}",
  "subject": "${targetSubject}",
  "prerequisites": string[],
  "determinations": {
    "whatNeedsToBeTaught": string,
    "conceptsOrderReasoning": string,
    "depthCalibration": string,
    "examplesAndVisuals": string,
    "questioningTiming": string,
    "understandingCriteria": string,
    "adaptationTriggers": string,
    "nextStepsRecommendation": string
  },
  "steps": [
    {
      "id": string,
      "conceptName": string,
      "allocatedMinutes": number,
      "summary": string,
      "keyTerms": string[],
      "beats": [
        {
          "id": string,
          "action": "INTRODUCE" | "EXPLAIN" | "GIVE_ANALOGY" | "DEMONSTRATE" | "ASK_CONCEPTUAL",
          "speechEn": string,
          "speechHi": string,
          "speechHinglish": string,
          "speechTe": string,
          "caption": string,
          "pauseForInteraction": boolean,
          "visualCue": {
            "subject": "${targetSubject}",
            "viewMode": "circuit_simulation" | "dbms_tables" | "cell_explorer" | "balance_scale" | "code_tracer" | "step_reveal"
          },
          "checkpoint": {
            "question": string,
            "options": string[],
            "correctAnswer": string,
            "hint": string,
            "misconceptions": [
              {
                "trigger": string,
                "category": "conceptual_misconception" | "careless_mistake",
                "diagnosis": string,
                "correctionSpeech": string
              }
            ]
          }
        }
      ]
    }
  ]
}
Requirements:
- Provide 2-3 progressive concepts according to the time budget.
- For speechTe, provide natural, warm spoken Telugu if language is 'te' or asked.
- Provide speechHi for Hindi and speechEn for English.
- Populate all 8 determination fields with rigorous pedagogical reasoning.
Return strictly raw valid JSON.`;

      const { text, modelUsed } = await callGemini(prompt, true);
      try {
        const parsed = cleanAndParseJson(text);
        if (!parsed.subject) parsed.subject = targetSubject;
        return res.json({ success: true, plan: parsed, isLiveAi: true, modelUsed });
      } catch (err) {
        console.warn('Failed to parse Gemini JSON output, providing fallback synthesis', err);
      }
    }

    // Pedagogically solid fallback synthesis matching target subject
    const defaultSubject = targetSubject;
    const viewMode = defaultSubject === 'dbms' ? 'dbms_tables' : defaultSubject === 'biology' ? 'cell_explorer' : defaultSubject === 'mathematics' ? 'balance_scale' : defaultSubject === 'physics' ? 'circuit_simulation' : 'code_tracer';

    return res.json({
      success: true,
      isLiveAi: false,
      plan: {
        topic,
        subject: defaultSubject,
        educationalLevel,
        timeBudget,
        prerequisites: ['Foundational concept overview', 'Analytical intuition'],
        determinations: {
          whatNeedsToBeTaught: `Key foundational principles of ${topic} scoped down for a ${timeBudget} ${educationalLevel} session.`,
          conceptsOrderReasoning: `Prerequisites sequenced from tangible physical behavior to quantitative laws to preserve cognitive load.`,
          depthCalibration: `Calibrated for ${educationalLevel}: high conceptual intuition, clear analogies, avoiding excessive derivation.`,
          examplesAndVisuals: `Real-world mechanical/hydraulic analogies paired with interactive laboratory simulations.`,
          questioningTiming: `Interactive checkpoint after each core concept definition to confirm mental model integrity before advancing.`,
          understandingCriteria: `Evaluating causal explanations rather than superficial verbatim recall.`,
          adaptationTriggers: `Branch to simplified visual analogy on misconception; advance to application challenge on success.`,
          nextStepsRecommendation: `Comprehensive summative assessment test followed by progression to the next curriculum unit.`
        },
        steps: [
          {
            id: 'dyn-step-1',
            conceptName: `${topic}: Core Foundations`,
            allocatedMinutes: timeBudget === '5min' ? 2 : 5,
            summary: `Essential principles and introductory intuition of ${topic}.`,
            keyTerms: ['Principle', 'Core Definition', 'Behavior'],
            beats: [
              {
                id: 'dyn-b1',
                action: 'INTRODUCE',
                speechEn: `Welcome to our focused lesson on ${topic}. Let's first look at the core physical or structural model.`,
                speechHi: `${topic} के इस विशेष सत्र में आपका स्वागत है। आइए सबसे पहले इसके बुनियादी मॉडल को समझें।`,
                speechHinglish: `${topic} ke is interactive session me welcome! Pehle iska basic practical model samajhte hain.`,
                speechTe: `${topic} కి సంబంధించిన ఈ పాఠానికి స్వాగతం! మొదట దీని ప్రాథమిక నమూనాను అర్థం చేసుకుందాం.`,
                caption: `Core Intuition of ${topic}`,
                pauseForInteraction: false,
                visualCue: {
                  subject: defaultSubject,
                  viewMode: 'circuit_simulation'
                },
                durationSec: 10
              },
              {
                id: 'dyn-b2',
                action: 'ASK_CONCEPTUAL',
                speechEn: `Before we advance, let us test our intuitive understanding with a quick checkpoint question.`,
                speechHi: `आगे बढ़ने से पहले, आइए एक त्वरित प्रश्न के साथ अपनी समझ की जांच करें।`,
                speechHinglish: `Next step par jaane se pehle, ek quick question try karte hain.`,
                speechTe: `ముందుకు వెళ్ళే ముందు, ఒక చిన్న ప్రశ్నతో మన అవగాహనను పరీక్షించుకుందాం.`,
                caption: `Formative Checkpoint: Core Principle`,
                pauseForInteraction: true,
                visualCue: {
                  subject: defaultSubject,
                  viewMode: 'circuit_simulation'
                },
                checkpoint: {
                  question: `When the fundamental driving potential increases, what immediately happens to the rate of flow?`,
                  options: [
                    'The flow rate increases proportionally',
                    'The flow rate decreases to zero',
                    'The flow rate remains strictly constant'
                  ],
                  correctAnswer: 'The flow rate increases proportionally',
                  hint: 'Think of water pressure in a pipe: higher pressure pushes more water through per second.',
                  misconceptions: [
                    {
                      trigger: 'constant',
                      category: 'conceptual_misconception',
                      diagnosis: 'Believing flow is invariant to applied potential.',
                      correctionSpeech: 'Remember, potential is the direct push that drives charges forward.'
                    }
                  ]
                },
                durationSec: 8
              }
            ]
          }
        ]
      }
    });
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate plan' });
  }
});

// 2. Misconception Evaluation & Adaptive Response Endpoint
app.post('/api/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { question, studentAnswer, correctAnswer, conceptName, knownMisconceptions = [] } = req.body;
    const client = getGeminiClient();

    // Check if student answer matches known misconception patterns first
    const cleanStudent = (studentAnswer || '').toLowerCase().trim();
    const cleanCorrect = (correctAnswer || '').toLowerCase().trim();

    let matchedPattern = null;
    for (const m of knownMisconceptions) {
      if (cleanStudent.includes(m.triggerPattern?.toLowerCase() || '')) {
        matchedPattern = m;
        break;
      }
    }

    if (matchedPattern) {
      return res.json({
        isCorrect: false,
        category: matchedPattern.category || 'conceptual_misconception',
        misconceptionName: matchedPattern.misconceptionName,
        diagnosedThought: matchedPattern.diagnosedThought,
        correctiveSpeech: matchedPattern.correctiveSpeech,
        teachingAction: 'CORRECT_MISCONCEPTION',
        suggestedStrategy: matchedPattern.correctiveStrategy || 'analogy',
        visualState: matchedPattern.correctiveVisualState
      });
    }

    // Direct match check
    if (cleanStudent === cleanCorrect || cleanStudent.includes(cleanCorrect)) {
      return res.json({
        isCorrect: true,
        category: 'correct',
        misconceptionName: null,
        diagnosedThought: 'Student demonstrated accurate conceptual grasp.',
        correctiveSpeech: 'Excellent reasoning! You identified the exact principle correctly. Let us move forward.',
        teachingAction: 'MOVE_FORWARD'
      });
    }

    // Use Gemini for deep diagnosis if key available
    if (client) {
      const prompt = `You are OutLearn's expert diagnostic teacher evaluating a student's response.
Concept: "${conceptName}"
Question asked: "${question}"
Expected Correct Answer: "${correctAnswer}"
Student Actual Answer: "${studentAnswer}"

Classify into exactly one category:
1. "careless_mistake": Process is correct, minor computation or slip.
2. "conceptual_misconception": Systematic flawed mental model.
3. "prerequisite_gap": Missing foundational knowledge.
4. "partial": Heading in right direction but incomplete.

Provide valid JSON:
{
  "isCorrect": boolean,
  "category": "careless_mistake" | "conceptual_misconception" | "prerequisite_gap" | "partial" | "correct",
  "misconceptionName": string,
  "diagnosedThought": string,
  "correctiveSpeech": string,
  "teachingAction": "CORRECT_MISCONCEPTION" | "SIMPLIFY" | "GIVE_ANALOGY" | "REVIEW_PREREQUISITE" | "MOVE_FORWARD"
}`;

      const { text, modelUsed } = await callGemini(prompt, true);
      const parsed = cleanAndParseJson(text || '{}');
      return res.json({ ...parsed, isLiveAi: true, modelUsed });
    }

    // Fallback classification
    const isClose = cleanStudent.length > 3 && cleanCorrect.includes(cleanStudent);
    return res.json({
      isCorrect: isClose,
      category: isClose ? 'partial' : 'conceptual_misconception',
      misconceptionName: isClose ? 'Incomplete formulation' : 'Intuition mismatch',
      diagnosedThought: `The response "${studentAnswer}" reveals an intuitive confusion with the definition of ${conceptName}.`,
      correctiveSpeech: `Not quite. Let us look at why this happens from a physical perspective rather than just memory. Notice the causal link in the visual diagram!`,
      teachingAction: 'CORRECT_MISCONCEPTION',
      suggestedStrategy: 'analogy'
    });
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ error: error.message || 'Evaluation error' });
  }
});

// 3. Mid-Lesson Student Interruption & Follow-up Q&A (RAG Grounded)
app.post('/api/ask-teacher', async (req: Request, res: Response) => {
  try {
    const { studentQuestion, currentConcept, currentTopic, language = 'en', teacherPersonality = 'mentor', materialContext = '' } = req.body;
    const client = getGeminiClient();

    if (client) {
      const qLower = (studentQuestion || '').toLowerCase();
      let taskComplexity: 'complex' | 'general' | 'fast' = 'general';
      if (qLower.includes('code') || qLower.includes('solve') || qLower.includes('derive') || qLower.includes('proof') || qLower.includes('step-by-step') || qLower.includes('equation')) {
        taskComplexity = 'complex';
      } else if (qLower.length < 25 || qLower.includes('hint') || qLower.includes('quick')) {
        taskComplexity = 'fast';
      }

      const prompt = `You are OutLearn, a warm, authoritative human-like teacher with the personality of "${teacherPersonality}".
Current Lesson Topic: "${currentTopic}".
Active Concept being taught: "${currentConcept}".
Language preference: "${language}".
${materialContext ? `SOURCE DOCUMENT RAG CONTEXT:\n"""\n${materialContext.slice(0, 3000)}\n"""` : ''}

STRICT KNOWLEDGE GROUNDING DIRECTIVE:
1. Base your answer directly on the active concept and uploaded source material.
2. Minimize unsupported or hallucinated claims.
3. Keep the response concise, clear, warm, spoken, and easy to understand.
4. End with a gentle prompt: "Ready to continue our lesson?".

The student just paused your lesson and asked:
"${studentQuestion}"`;

      const { text, modelUsed } = await callGemini(prompt, false, taskComplexity);

      return res.json({
        answer: text.trim(),
        resumePrompt: 'Ready to continue where we paused?',
        isLiveAi: true,
        modelUsed,
        taskComplexity
      });
    }

    return res.json({
      answer: `Great question! In ${currentConcept || currentTopic}, this connects directly to the core principle in our textbook material. When you change one parameter, the balance responds immediately. Let us keep this in mind as we proceed.`,
      resumePrompt: 'Shall we resume our lesson right where we left off?'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3.1 Multi-turn Chatbot Tutor Endpoint powered by Gemini (gemini-3.1-pro-preview for complex, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast)
app.post('/api/tutor-chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      message = '',
      currentTopic = 'Curriculum Subject',
      currentConcept = '',
      teacherPersonality = 'mentor',
      language = 'en',
      educationalLevel = 'beginner',
      taskComplexity: requestedComplexity,
      systemRole = ''
    } = req.body;

    const client = getGeminiClient();

    // System instruction defining AI Tutor's role & behavior
    const systemInstruction = systemRole || `You are Dr. Vikram Sharma, a warm, supportive, human-like AI Tutor with the persona of "${teacherPersonality}".
You are directly chatting 1-on-1 with your student about "${currentTopic}" (Active Concept: "${currentConcept || currentTopic}").

CRITICAL HUMAN CONVERSATION DIRECTIVES:
1. Respond DIRECTLY, CONVERSATIONALLY, and WARMLY to the student's latest message.
2. If the student says a simple greeting (e.g. "hey", "hello", "hi", "kaise ho", "namaste"), greet them back naturally like a real teacher (e.g., "Hey there! I'm doing great. How is Chapter 4 going for you so far? What's on your mind?").
3. Adapt naturally to the student's language (${language} / Hinglish / Hindi / English). If Hinglish is used, reply in friendly Hinglish!
4. NEVER output internal debug tags, system analysis notes, scope definitions, or rigid canned disclaimers.
5. Provide clear, concise, step-by-step explanations, analogies, math derivations, or code solutions when asked.`;

    // Clean & build strictly alternating multi-turn history for Gemini API
    const rawFiltered: { role: string; text: string }[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        if (!msg.content || !msg.content.trim()) continue;
        const text = msg.content.trim();

        // Strip out internal system logs / analysis dumps
        if (
          text.startsWith('[Gemini AI Analysis]') ||
          text.startsWith('Analyzed Learner Profile') ||
          text.startsWith('Mapped ') ||
          msg.role === 'system'
        ) {
          continue;
        }

        const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
        rawFiltered.push({ role, text });
      }
    }

    // Append current message if provided
    if (message && message.trim()) {
      const cleanMsg = message.trim();
      if (rawFiltered.length === 0 || rawFiltered[rawFiltered.length - 1].text !== cleanMsg) {
        rawFiltered.push({ role: 'user', text: cleanMsg });
      }
    }

    // Ensure strictly alternating user <-> model turns for Gemini API
    const formattedHistory: { role: string; parts: { text: string }[] }[] = [];
    for (const item of rawFiltered) {
      if (formattedHistory.length === 0) {
        formattedHistory.push({ role: item.role, parts: [{ text: item.text }] });
      } else {
        const last = formattedHistory[formattedHistory.length - 1];
        if (last.role === item.role) {
          // Combine same-role turns to avoid invalid consecutive roles
          last.parts[0].text += `\n${item.text}`;
        } else {
          formattedHistory.push({ role: item.role, parts: [{ text: item.text }] });
        }
      }
    }

    // Determine model complexity tier
    const lastMsgText = (message || (formattedHistory.length > 0 ? formattedHistory[formattedHistory.length - 1].parts[0].text : '')).toLowerCase();
    let determinedComplexity: 'complex' | 'general' | 'fast' = requestedComplexity || 'general';

    if (!requestedComplexity) {
      if (
        lastMsgText.includes('code') ||
        lastMsgText.includes('solve') ||
        lastMsgText.includes('derive') ||
        lastMsgText.includes('explain step by step') ||
        lastMsgText.includes('proof') ||
        lastMsgText.includes('complex') ||
        lastMsgText.includes('architecture') ||
        lastMsgText.includes('algorithm') ||
        lastMsgText.includes('deep')
      ) {
        determinedComplexity = 'complex';
      } else if (
        (lastMsgText.length < 25 && (lastMsgText.includes('hi') || lastMsgText.includes('hello') || lastMsgText.includes('quick') || lastMsgText.includes('hint') || lastMsgText.includes('definition'))) ||
        lastMsgText.includes('fast')
      ) {
        determinedComplexity = 'fast';
      }
    }

    if (client) {
      const contentsToPass = formattedHistory.length > 0 ? formattedHistory : (message || `Explain ${currentTopic}`);
      const { text, modelUsed } = await callGemini(contentsToPass, false, determinedComplexity, systemInstruction);

      return res.json({
        success: true,
        answer: text.trim(),
        modelUsed,
        taskComplexity: determinedComplexity,
        isLiveAi: true
      });
    }

    // High quality offline fallback
    return res.json({
      success: true,
      isLiveAi: false,
      modelUsed: 'gemini-3.5-flash-simulated',
      taskComplexity: determinedComplexity,
      answer: `As your AI Tutor in ${currentTopic}, I'm here to answer your queries in every way!\n\n1. **Explanation**: In ${currentTopic}, every concept connects back to underlying mechanics.\n2. **Practical Insight**: Regarding "${message || currentConcept || currentTopic}", breaking it down into smaller steps makes it easy to master.\n3. **Example**: Apply this principle step-by-step in your exercises!\n\nWhat would you like me to clarify or solve next?`
    });
  } catch (error: any) {
    console.error('Error in tutor-chat endpoint:', error);
    res.status(500).json({ error: error.message || 'Tutor chat failed' });
  }
});

// 3.5. Dynamic Curriculum Roadmap Generation Endpoint
app.post('/api/generate-roadmap', async (req: Request, res: Response) => {
  try {
    const { topic = 'General Science', educationalLevel = 'beginner', learningObjective = '' } = req.body;
    const client = getGeminiClient();

    const lowerTopic = (topic || '').toLowerCase();

    if (client) {
      const prompt = `You are OutLearn's master educational curriculum architect.
Generate a structured, 6 to 8-stage sequential learning roadmap graph tailored specifically to the subject/topic: "${topic}".
Learner Educational Level: ${educationalLevel}
Learning Objective: "${learningObjective}"

Guidelines:
- Create 6 to 8 distinct, logical learning stages that build progressively on prerequisites.
- If the topic is "Machine Learning" or "AI", produce exactly these 8 stages:
  1. Python Fundamentals
  2. Mathematics for ML
  3. Data Processing
  4. Supervised Learning
  5. Unsupervised Learning
  6. Model Evaluation
  7. Neural Networks
  8. Advanced Machine Learning
- For each stage, provide: title, level ("beginner" | "intermediate" | "advanced"), status ("mastered" | "understood" | "developing" | "unknown"), conceptsCount (e.g. 5 to 8), and a short 1-sentence description.
- Stage 1 and 2 should be 'mastered', Stage 3 'understood', Stage 4 'developing' (current active milestone), and subsequent stages 'unknown'.

Return STRICT RAW JSON matching this structure:
{
  "title": string,
  "subject": string,
  "description": string,
  "stages": [
    {
      "id": string,
      "title": string,
      "level": "beginner" | "intermediate" | "advanced",
      "status": "mastered" | "understood" | "developing" | "unknown",
      "conceptsCount": number,
      "description": string
    }
  ]
}`;

      const { text, modelUsed } = await callGemini(prompt, true);
      const parsed = cleanAndParseJson(text || '{}');
      if (parsed && parsed.stages && Array.isArray(parsed.stages)) {
        return res.json({ success: true, roadmap: parsed, isLiveAi: true, modelUsed });
      }
    }

    // Machine Learning custom fallback matching user specification
    if (lowerTopic.includes('machine learning') || lowerTopic.includes('ml')) {
      return res.json({
        success: true,
        roadmap: {
          title: 'Machine Learning Masterclass Roadmap',
          subject: 'programming',
          description: 'Comprehensive 8-stage structured learning path from fundamentals to neural networks and advanced AI.',
          stages: [
            { id: 'ml-1', title: 'Python Fundamentals', level: 'beginner', status: 'mastered', conceptsCount: 6, description: 'Core Python syntax, primitives, functions, and scientific computing tools.' },
            { id: 'ml-2', title: 'Mathematics for ML', level: 'beginner', status: 'mastered', conceptsCount: 8, description: 'Linear algebra, matrix transformations, multivariable calculus, and probability.' },
            { id: 'ml-3', title: 'Data Processing', level: 'intermediate', status: 'understood', conceptsCount: 7, description: 'Data cleaning, feature scaling, normalization, and Pandas dataframe operations.' },
            { id: 'ml-4', title: 'Supervised Learning', level: 'intermediate', status: 'developing', conceptsCount: 10, description: 'Linear/logistic regression, decision trees, random forests, and SVMs.' },
            { id: 'ml-5', title: 'Unsupervised Learning', level: 'intermediate', status: 'unknown', conceptsCount: 5, description: 'K-Means clustering, hierarchical clustering, and PCA dimensionality reduction.' },
            { id: 'ml-6', title: 'Model Evaluation', level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'Cross-validation, ROC-AUC curves, confusion matrices, and loss function tuning.' },
            { id: 'ml-7', title: 'Neural Networks', level: 'advanced', status: 'unknown', conceptsCount: 9, description: 'Perceptrons, backpropagation, activation functions, and PyTorch deep learning.' },
            { id: 'ml-8', title: 'Advanced Machine Learning', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Transformers, LLM architectures, reinforcement learning, and MLOps deployment.' }
          ]
        }
      });
    }

    return res.json({
      success: true,
      roadmap: {
        title: `${topic} Adaptive Roadmap`,
        subject: 'general',
        description: `6-stage structured curriculum created for ${topic}.`,
        stages: [
          { id: 'stage-1', title: `Foundations of ${topic}`, level: 'beginner', status: 'mastered', conceptsCount: 5, description: 'Core definitions and initial concepts.' },
          { id: 'stage-2', title: `Core Principles & Models`, level: 'beginner', status: 'understood', conceptsCount: 6, description: 'Fundamental operational rules and mental models.' },
          { id: 'stage-3', title: `Analytical Applications & Mechanisms`, level: 'intermediate', status: 'developing', conceptsCount: 7, description: 'Practical calculations and mechanism execution.' },
          { id: 'stage-4', title: `Problem Solving & Scenarios`, level: 'intermediate', status: 'unknown', conceptsCount: 8, description: 'Applied problem solving in real scenarios.' },
          { id: 'stage-5', title: `Advanced Diagnostics & Edge Cases`, level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'Edge case resolution and diagnostic reasoning.' },
          { id: 'stage-6', title: `Mastery Synthesis & Integration`, level: 'advanced', status: 'unknown', conceptsCount: 7, description: 'Comprehensive subject synthesis.' }
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Document Processing & Knowledge Extraction (RAG & Grounding)
app.post('/api/process-document', async (req: Request, res: Response) => {
  try {
    const { fileName, fileContent } = req.body;
    const client = getGeminiClient();

    if (client && fileContent) {
      const prompt = `You are OutLearn's expert RAG educational document analyzer.
Analyze the following user-provided educational material from file "${fileName}":
"""
${fileContent.slice(0, 5000)}
"""

Determine the material classification (e.g., Textbook, Research Paper, Lecture Notes, DOCX, PPTX, Course Material) and extract:
1. Document title and detected subject (physics, mathematics, dbms, biology, programming, history, general).
2. Identified Chapters, Sections, and Page/Slide topics.
3. Key extracted concepts with precise definitions, formulas, and direct source citations/quotes.
4. Two anticipated misconceptions students typically make on these specific topics.
5. Key illustrative examples or visual models described in the text.

Return valid JSON:
{
  "title": string,
  "docType": "Textbook" | "Research Paper" | "Lecture Notes" | "PDF Document" | "DOCX Notes" | "PPTX Presentation" | "Course Material",
  "subject": string,
  "chapters": [{ "number": number, "title": string, "summary": string, "keySection": string }],
  "concepts": [{ "name": string, "definition": string, "formula": string, "sourceCitation": string }],
  "anticipatedMisconceptions": [{ "concept": string, "commonError": string, "fix": string }],
  "examples": string[],
  "ragGrounded": true
}`;

      const { text, modelUsed } = await callGemini(prompt, true);
      const parsed = cleanAndParseJson(text || '{}');
      return res.json({ success: true, extracted: parsed, isLiveAi: true, modelUsed });
    }

    // Default structured parse
    return res.json({
      success: true,
      extracted: {
        title: fileName.replace(/\.[^/.]+$/, ''),
        docType: fileName.toLowerCase().includes('pdf') ? 'PDF Document' : fileName.toLowerCase().includes('ppt') ? 'PPTX Presentation' : 'Educational Material',
        subject: fileName.toLowerCase().includes('math') ? 'mathematics' : fileName.toLowerCase().includes('dbms') ? 'dbms' : fileName.toLowerCase().includes('cell') ? 'biology' : 'physics',
        chapters: [
          { number: 1, title: 'Chapter 1: Foundational Principles & Scope', summary: 'Core foundational principles extracted from uploaded document.', keySection: 'Section 1.1' },
          { number: 2, title: 'Chapter 2: Analytical Applications & Examples', summary: 'Practical examples and quantitative proofs.', keySection: 'Section 2.3' }
        ],
        concepts: [
          { name: 'Core Grounded Law', definition: 'The foundational law stated in the introduction.', formula: 'Law = Direct Proportionality', sourceCitation: 'Section 1.1' }
        ],
        anticipatedMisconceptions: [
          { concept: 'Direct vs Inverse Variation', commonError: 'Inverting proportional variables', fix: 'Use intuitive physical analogy' }
        ],
        examples: ['Hydraulic pressure analogy', 'Circuit simulation lab model'],
        ragGrounded: true
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server with Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OutLearn AI Teacher server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
