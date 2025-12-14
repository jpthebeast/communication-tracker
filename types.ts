export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PRACTICE = 'PRACTICE',
  ANALYSIS_RESULT = 'ANALYSIS_RESULT',
}

export interface CustomPersona {
  name: string;
  traits: string; // "Speak with absolute certainty, controlled pace"
  adopt: string; // "By Order Of...", "Indeed"
  avoid: string; // "Maybe", "Umm", "Sorry"
}

export interface UserProfile {
  name: string;
  primaryGoal: string; // Can be a preset or custom string
  isCustomGoal: boolean;
  preferredPersona: string; // "Custom" or Preset Name
  customPersona?: CustomPersona;
  level: number;
  streak: number;
}

export interface AnalysisMetrics {
  clarityScore: number; // 1-100
  fillerWordCount: number;
  wordsPerMinute: number;
  eyeContactScore: number; // 1-100
}

export interface VerbalScorecard {
  fillerWords: string[];
  vocabularyRichness: string; // High, Medium, Low
  wordChoiceAlignment: string; // Analysis text
}

export interface DeliveryScorecard {
  pacing: string; // Analysis text
  toneAnalysis: string;
  volumeConsistency: string;
}

export interface MannerismScorecard {
  eyeContactAnalysis: string;
  gestures: string;
  posture: string;
}

export interface EnhancementItem {
  area: string;
  action: string;
}

export interface RephrasingItem {
  original: string;
  improved: string;
  reason: string;
}

export interface CoachingBreakdown {
  structuralShifts: string;
  vocabularyElevation: {
    original: string;
    improved: string;
    context: string;
  }[];
  efficiencyWins: string;
}

export interface SessionAnalysis {
  transcript: string;
  refinedTranscript: string;
  coachingBreakdown: CoachingBreakdown;
  metrics: AnalysisMetrics;
  verbal: VerbalScorecard;
  delivery: DeliveryScorecard;
  mannerisms: MannerismScorecard;
  enhancements: {
    topAreas: EnhancementItem[];
    exercise: string;
    rephrasing: RephrasingItem[];
    recurringAlert?: string;
  };
}

export interface PracticeSession {
  id: string;
  date: string;
  topic: string;
  durationSeconds: number;
  analysis: SessionAnalysis;
}