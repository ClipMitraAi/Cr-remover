export type Language = 'en' | 'hi';

export type AppTab = 'video_studio' | 'fingerprint_simulator' | 'fair_use_calculator' | 'drm_academy';

export interface SampleVideo {
  id: string;
  titleEn: string;
  titleHi: string;
  category: string;
  descriptionEn: string;
  descriptionHi: string;
  colorScheme: [string, string]; // gradient colors for synthetic canvas video
  defaultMotion: 'cinematic' | 'pulse' | 'gaming';
}

export interface RoyaltyFreeTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  descriptionEn: string;
  descriptionHi: string;
  license: 'CC0 Public Domain' | 'Creative Commons BY 4.0' | 'CreatorShield Safe-Audio';
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  explanationEn: string;
  explanationHi: string;
  realWorldImpactEn: string;
  realWorldImpactHi: string;
}
