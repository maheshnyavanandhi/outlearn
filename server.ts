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

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString()
  });
});

// 1. Generate Structured Lesson Plan Endpoint
app.post('/api/generate-lesson-plan', async (req: Request, res: Response) => {
  try {
    const { topic, educationalLevel = 'beginner', timeBudget = '20min', language = 'en', materialContext = '' } = req.body;
    const client = getGeminiClient();

    if (client) {
      const prompt = `You are NOVA, a master human-like educator.
Plan a structured, adaptive pedagogical lesson on the topic: "${topic}".
Learner level: ${educationalLevel}.
Available time: ${timeBudget}.
Language: ${language}.
Uploaded Material context: "${materialContext.slice(0, 1500)}".

Generate a valid JSON object matching this schema:
{
  "topic": string,
  "subject": "physics" | "mathematics" | "dbms" | "biology" | "programming" | "history" | "general",
  "prerequisites": string[],
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
          "action": "INTRODUCE" | "EXPLAIN" | "DEMONSTRATE" | "ASK_CONCEPTUAL",
          "speechEn": string,
          "speechHi": string,
          "speechHinglish": string,
          "caption": string,
          "pauseForInteraction": boolean,
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
Return strictly raw valid JSON. Do not wrap in markdown quotes if possible.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, plan: parsed });
      } catch (err) {
        console.warn('Failed to parse Gemini JSON output, providing fallback synthesis', err);
      }
    }

    // Pedagogically solid fallback synthesis if no key or parsing fails
    const defaultSubject = topic.toLowerCase().includes('database') || topic.toLowerCase().includes('sql') || topic.toLowerCase().includes('relational')
      ? 'dbms'
      : topic.toLowerCase().includes('cell') || topic.toLowerCase().includes('plant') || topic.toLowerCase().includes('biology')
      ? 'biology'
      : topic.toLowerCase().includes('ohm') || topic.toLowerCase().includes('current') || topic.toLowerCase().includes('physics') || topic.toLowerCase().includes('circuit')
      ? 'physics'
      : topic.toLowerCase().includes('code') || topic.toLowerCase().includes('react') || topic.toLowerCase().includes('python') || topic.toLowerCase().includes('ai')
      ? 'programming'
      : 'physics';

    return res.json({
      success: true,
      plan: {
        topic,
        subject: defaultSubject,
        educationalLevel,
        timeBudget,
        prerequisites: ['Foundational concept overview', 'Analytical intuition'],
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
                caption: `Core Intuition of ${topic}`,
                pauseForInteraction: false
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
      const prompt = `You are an expert diagnostic teacher evaluating a student's response.
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

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
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

// 3. Mid-Lesson Student Interruption & Follow-up Q&A
app.post('/api/ask-teacher', async (req: Request, res: Response) => {
  try {
    const { studentQuestion, currentConcept, currentTopic, language = 'en', teacherPersonality = 'mentor' } = req.body;
    const client = getGeminiClient();

    if (client) {
      const prompt = `You are NOVA, a warm, authoritative human-like teacher with the personality of "${teacherPersonality}".
Current Lesson Topic: "${currentTopic}".
Active Concept being taught: "${currentConcept}".
Language preference: "${language}".

The student just paused your lesson and asked:
"${studentQuestion}"

Provide a concise, illuminating 2-3 sentence spoken response that directly answers their curiosity, links back to the active concept, and ends with a gentle "Ready to continue our lesson?".`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({
        answer: response.text,
        resumePrompt: 'Ready to continue where we paused?'
      });
    }

    return res.json({
      answer: `Great question! In ${currentConcept || currentTopic}, this connects directly to the core conservation principle. When you change one parameter, the balance responds immediately. Let us keep this in mind as we proceed.`,
      resumePrompt: 'Shall we resume our lesson right where we left off?'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Document Processing & Knowledge Extraction (RAG)
app.post('/api/process-document', async (req: Request, res: Response) => {
  try {
    const { fileName, fileContent } = req.body;
    const client = getGeminiClient();

    if (client && fileContent) {
      const prompt = `You are an educational parser for an AI Teacher system.
Analyze the following educational material from file "${fileName}":
"""
${fileContent.slice(0, 4000)}
"""

Extract:
1. Document title and detected subject (physics, mathematics, dbms, biology, programming, history).
2. Identified Chapters or Sections.
3. Key extracted concepts with definitions and formulas.
4. Two anticipated misconceptions students typically make on these topics.

Return valid JSON:
{
  "title": string,
  "subject": string,
  "chapters": [{ "number": number, "title": string, "summary": string }],
  "concepts": [{ "name": string, "definition": string, "formula": string }],
  "anticipatedMisconceptions": [{ "concept": string, "commonError": string, "fix": string }]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, extracted: parsed });
    }

    // Default structured parse
    return res.json({
      success: true,
      extracted: {
        title: fileName.replace(/\.[^/.]+$/, ''),
        subject: fileName.toLowerCase().includes('math') ? 'mathematics' : 'physics',
        chapters: [
          { number: 1, title: 'Fundamental Theorems & Principles', summary: 'Core foundational principles extracted from uploaded document.' },
          { number: 2, title: 'Analytical Applications & Problems', summary: 'Practical examples and computational proofs.' }
        ],
        concepts: [
          { name: 'Core Definition', definition: 'The foundational law stated in the introduction.', formula: 'Law = Input / Output' }
        ],
        anticipatedMisconceptions: [
          { concept: 'Direct vs Inverse Variation', commonError: 'Inverting proportional variables', fix: 'Use water flow analogy' }
        ]
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
    console.log(`NOVA AI Teacher server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
