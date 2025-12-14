import { GoogleGenAI } from "@google/genai";
import { SessionAnalysis, UserProfile, PracticeSession } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON string if it comes wrapped in markdown
const cleanJson = (text: string): string => {
  return text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
};

export const generateDailyTopic = async (
  profile: UserProfile,
  dayNumber: number
): Promise<string> => {
  try {
    const personaName = profile.preferredPersona === 'Custom' && profile.customPersona 
      ? profile.customPersona.name 
      : profile.preferredPersona;

    let difficultyContext = "";
    if (dayNumber <= 7) {
      difficultyContext = "LEVEL: SIMPLE & DESCRIPTIVE. Task: Describe a tangible object or simple process. No abstract thought required.";
    } else if (dayNumber <= 14) {
      difficultyContext = "LEVEL: OPINION & JUSTIFICATION. Task: State a clear preference or opinion and provide two distinct reasons.";
    } else if (dayNumber <= 21) {
      difficultyContext = "LEVEL: NARRATIVE STRUCTURE. Task: Tell a short story with a clear beginning, middle, and end/result.";
    } else {
      difficultyContext = "LEVEL: PERSUASION & ABSTRACTION. Task: Complex reasoning, persuasion, or handling a crisis. Must align directly with the User Goal.";
    }

    const prompt = `
      Generate a single, engaging daily practice topic for a speech.
      User Goal: "${profile.primaryGoal}".
      Target Persona: "${personaName}".
      User Day: ${dayNumber}.
      
      ${difficultyContext}

      Return ONLY the topic sentence as plain text. No quotes.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating topic:", error);
    return "Describe the room you are currently in.";
  }
};

export const analyzeVideoSession = async (
  videoBlob: Blob,
  profile: UserProfile,
  topic: string,
  history: PracticeSession[]
): Promise<SessionAnalysis> => {
  // Convert Blob to Base64
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(videoBlob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:video/webm;base64,")
      resolve(base64data.split(",")[1]);
    };
  });

  // Construct Custom Persona Context
  let personaContext = "";
  if (profile.preferredPersona === 'Custom' && profile.customPersona) {
    personaContext = `
      TARGET PERSONA: ${profile.customPersona.name}
      CRITICAL TRAITS TO MIMIC: ${profile.customPersona.traits}
      VOCABULARY TO ADOPT: ${profile.customPersona.adopt}
      VOCABULARY TO AVOID: ${profile.customPersona.avoid}
    `;
  } else {
    personaContext = `TARGET PERSONA: "${profile.preferredPersona}"`;
  }

  // Construct Historical Context for Recidivism
  const recentHistory = history.slice(-7);
  const previousWeaknesses = recentHistory
    .flatMap(h => h.analysis.enhancements.topAreas.map(a => a.area))
    .join(", ");
  
  const historyContext = previousWeaknesses 
    ? `HISTORY WATCHLIST (User's Recent Weaknesses): ${previousWeaknesses}. Check strictly if these are repeated.`
    : "HISTORY: No prior data.";

  const prompt = `
    You are an expert, high-level Communication Coach. Your tone is strict, analytical, and uncompromising (The Shelby/Tate Aesthetic).
    
    Analyze the attached video/audio.
    
    Topic: "${topic}"
    Primary Objective: "${profile.primaryGoal}"
    ${personaContext}
    ${historyContext}

    **CORE TASKS**:
    1. **METRICS**: Analyze Clarity, Fillers, Pace, Eye Contact.
    2. **REFINED TRANSCRIPT (The Master's Revision)**: Rewrite the *entire* speech as if the Target Persona spoke it. It must be polished, authoritative, and perfectly structured.
    3. **COACHING BREAKDOWN**: Explain the rewrite.
       - Structural Shifts: Why sentence structures changed (e.g., passive to active).
       - Vocabulary Elevation: List specific weak words swapped for power words.
       - Efficiency Wins: Redundancies removed.
    4. **RECIDIVISM CHECK**: If the user repeated a weakness from the HISTORY WATCHLIST, flag it specifically in the 'recurringAlert' field.

    Return valid JSON matching this structure:
    {
      "transcript": "Verbatim transcript...",
      "refinedTranscript": "Full refined speech...",
      "coachingBreakdown": {
        "structuralShifts": "Explanation of structural changes...",
        "vocabularyElevation": [
           {"original": "good", "improved": "exemplary", "context": "Changed to project authority."}
        ],
        "efficiencyWins": "Explanation of cuts..."
      },
      "metrics": {
        "clarityScore": 85,
        "fillerWordCount": 4,
        "wordsPerMinute": 130,
        "eyeContactScore": 70
      },
      "verbal": {
        "fillerWords": ["um", "like"],
        "vocabularyRichness": "High/Medium/Low",
        "wordChoiceAlignment": "Analysis..."
      },
      "delivery": {
        "pacing": "Analysis...",
        "toneAnalysis": "Analysis...",
        "volumeConsistency": "Analysis..."
      },
      "mannerisms": {
        "eyeContactAnalysis": "Analysis...",
        "gestures": "Analysis...",
        "posture": "Analysis..."
      },
      "enhancements": {
        "topAreas": [
           {"area": "Pacing", "action": "Slow down."}
        ],
        "exercise": "Drill for tomorrow.",
        "rephrasing": [
           {"original": "text", "improved": "text", "reason": "text"}
        ],
        "recurringAlert": "OPTIONAL: Text warning if a historical weakness was repeated (e.g., 'You reverted to using 'um' despite last week's focus'). Return null if none."
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: videoBlob.type || "video/webm",
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const json = JSON.parse(cleanJson(text));
    return json as SessionAnalysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};