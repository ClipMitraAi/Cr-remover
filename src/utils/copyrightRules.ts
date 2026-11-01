/**
 * Copyright & Content ID educational analysis algorithms
 */

export interface FairUseAnswers {
  purpose: 'commentary' | 'educational' | 'parody' | 'entertainment_reupload' | 'commercial_promo';
  amountUsed: 'under_5s' | 'brief_clips' | 'substantial' | 'entire_video';
  originalWorkNature: 'non_fiction_news' | 'factual' | 'creative_fiction' | 'commercial_music_movie';
  marketEffect: 'none_promotes_original' | 'no_impact' | 'potential_substitute' | 'direct_competition';
  addsValue: boolean; // transformative commentary/editing added
  creditedAuthor: boolean;
}

export interface FairUseAssessment {
  score: number; // 0 - 100
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK';
  summary: string;
  factorBreakdown: {
    purposeScore: number; // max 30
    natureScore: number;  // max 20
    amountScore: number;  // max 25
    marketScore: number;  // max 25
  };
  recommendations: string[];
  disclaimerText: string;
}

/**
 * Calculates fair use score based on standard 4-factor doctrine
 */
export function evaluateFairUse(answers: FairUseAnswers, channelName: string = 'Creator'): FairUseAssessment {
  let purposeScore = 0;
  switch (answers.purpose) {
    case 'educational':
    case 'commentary':
      purposeScore = 26;
      break;
    case 'parody':
      purposeScore = 22;
      break;
    case 'commercial_promo':
      purposeScore = 8;
      break;
    case 'entertainment_reupload':
      purposeScore = 2;
      break;
  }
  if (answers.addsValue) purposeScore += 4;

  let natureScore = 0;
  switch (answers.originalWorkNature) {
    case 'non_fiction_news':
      natureScore = 20;
      break;
    case 'factual':
      natureScore = 15;
      break;
    case 'creative_fiction':
      natureScore = 6;
      break;
    case 'commercial_music_movie':
      natureScore = 2;
      break;
  }

  let amountScore = 0;
  switch (answers.amountUsed) {
    case 'under_5s':
      amountScore = 25;
      break;
    case 'brief_clips':
      amountScore = 18;
      break;
    case 'substantial':
      amountScore = 6;
      break;
    case 'entire_video':
      amountScore = 0;
      break;
  }

  let marketScore = 0;
  switch (answers.marketEffect) {
    case 'none_promotes_original':
      marketScore = 25;
      break;
    case 'no_impact':
      marketScore = 18;
      break;
    case 'potential_substitute':
      marketScore = 6;
      break;
    case 'direct_competition':
      marketScore = 0;
      break;
  }

  const rawScore = purposeScore + natureScore + amountScore + marketScore;
  const score = Math.max(0, Math.min(100, rawScore));

  let riskLevel: FairUseAssessment['riskLevel'] = 'LOW_RISK';
  let summary = '';
  const recommendations: string[] = [];

  if (score >= 75) {
    riskLevel = 'LOW_RISK';
    summary = 'Strong Fair Use argument. Highly transformative with minimal market harm.';
    recommendations.push('Add an explicit Fair Use citation in your description.');
    recommendations.push('Keep original commentary audible throughout the clip.');
  } else if (score >= 50) {
    riskLevel = 'MODERATE_RISK';
    summary = 'Moderate risk. Automated Content ID may still flag the audio or video hash.';
    recommendations.push('Reduce the duration of the external clip.');
    recommendations.push('Add visual commentary overlays, voiceover, or split-screen discussion.');
    recommendations.push('Consider replacing commercial background music with royalty-free audio.');
  } else if (score >= 30) {
    riskLevel = 'HIGH_RISK';
    summary = 'High copyright risk. The clip takes substantial parts or serves as entertainment substitute.';
    recommendations.push('Automated Rights Manager/Content ID will almost certainly claim or strike this.');
    recommendations.push('Seek direct license from rights holder or use Creative Commons CC0/CC-BY media.');
    recommendations.push('Transform the clip completely into critique, review, or educational breakdown.');
  } else {
    riskLevel = 'CRITICAL_RISK';
    summary = 'Critical risk of Copyright Strike and takedown. This appears to be a direct reupload.';
    recommendations.push('Direct re-upload of copyrighted media cannot be made safe by simple speed/pitch tweaks.');
    recommendations.push('Replace with 100% original footage or verified royalty-free stock footage.');
    recommendations.push('Do not upload to YouTube, Instagram, or TikTok without explicit written license.');
  }

  const disclaimerText = `DISCLAIMER / FAIR USE NOTICE:
Copyright Disclaimer under section 107 of the Copyright Act 1976 / Section 52 Indian Copyright Act: Fair Dealing allowance is made for "fair use" for purposes such as criticism, comment, news reporting, teaching, scholarship, education and research.
Original video clips credit belongs to respective owners. Channel (${channelName}) claims transformative fair use for review, commentary, and educational breakdown.`;

  return {
    score,
    riskLevel,
    summary,
    factorBreakdown: {
      purposeScore,
      natureScore,
      amountScore,
      marketScore,
    },
    recommendations,
    disclaimerText,
  };
}

/**
 * Fingerprint simulation: calculates simulated Content ID detection probability
 * given various audio/video modifications. Demonstrates why naive 'tricks' fail.
 */
export interface FingerprintSimulationResult {
  matchConfidence: number; // 0 to 100%
  detectedTechniques: string[];
  explanation: string;
  verdict: 'DETECTED_IMMEDIATELY' | 'DETECTED_DELAYED_OR_MANUAL' | 'TRANSFORMATIVE_OR_CLEARED';
}

export function simulateContentIdDetection(options: {
  speedMultiplier: number; // e.g. 1.05
  pitchShiftSemitones: number; // e.g. +1
  videoFlipped: boolean;
  hasNoiseOverlay: boolean; // rain, static
  hasCommentaryVoiceover: boolean;
  replacedAudio: boolean;
  cropOrBorderApplied: boolean;
  clipDurationSeconds: number;
}): FingerprintSimulationResult {
  // Acoustic and neural fingerprints are robust against linear time-stretch and pitch shift
  let audioMatchRisk = 95;
  let videoMatchRisk = 92;
  const detectedTechniques: string[] = [];

  if (options.replacedAudio) {
    audioMatchRisk = 0;
    detectedTechniques.push('Audio track replaced with safe audio (Audio fingerprint removed)');
  } else {
    if (Math.abs(options.speedMultiplier - 1.0) > 0.01 && Math.abs(options.speedMultiplier - 1.0) < 0.2) {
      detectedTechniques.push('Linear time-stretch detected (+/- speed is normalized by modern Chromaprint / Shazam algorithms)');
      audioMatchRisk -= 8;
    }
    if (Math.abs(options.pitchShiftSemitones) > 0.5) {
      detectedTechniques.push('Pitch shift detected (Resampled chromatic hash still matches harmonic peaks)');
      audioMatchRisk -= 10;
    }
    if (options.hasNoiseOverlay) {
      detectedTechniques.push('Background noise overlay (Peak picking filters out diffuse noise easily)');
      audioMatchRisk -= 7;
    }
    if (options.hasCommentaryVoiceover) {
      detectedTechniques.push('Voiceover overlay (Reduces audio confidence but primary song/speech harmonics remain detectable)');
      audioMatchRisk -= 25;
    }
  }

  if (options.videoFlipped) {
    detectedTechniques.push('Horizontal flip (Modern video neural networks compare inverted frame embeddings)');
    videoMatchRisk -= 15;
  }
  if (options.cropOrBorderApplied) {
    detectedTechniques.push('Border / Crop / Zoom (Visual feature extraction scales to crop windows)');
    videoMatchRisk -= 12;
  }

  // Duration impact: clips under 3s are harder for automated algorithms, >15s are instant matches
  let durationMultiplier = 1.0;
  if (options.clipDurationSeconds < 4) {
    durationMultiplier = 0.5;
  } else if (options.clipDurationSeconds < 8) {
    durationMultiplier = 0.75;
  } else if (options.clipDurationSeconds > 30) {
    durationMultiplier = 1.2;
  }

  const effectiveAudio = Math.max(0, Math.min(100, audioMatchRisk));
  const effectiveVideo = Math.max(0, Math.min(100, videoMatchRisk));

  // If audio is replaced, overall match is driven by video
  const combinedRisk = options.replacedAudio
    ? effectiveVideo * durationMultiplier
    : (effectiveAudio * 0.65 + effectiveVideo * 0.35) * durationMultiplier;

  const matchConfidence = Math.min(99, Math.max(2, Math.round(combinedRisk)));

  let verdict: FingerprintSimulationResult['verdict'] = 'DETECTED_IMMEDIATELY';
  let explanation = '';

  if (matchConfidence >= 70) {
    verdict = 'DETECTED_IMMEDIATELY';
    explanation = 'Automated Content ID / Rights Manager will detect this within 30-90 seconds of upload. Naive pitch/speed/mirror tricks do not defeat perceptual hashes.';
  } else if (matchConfidence >= 35) {
    verdict = 'DETECTED_DELAYED_OR_MANUAL';
    explanation = 'Automated match may be delayed or flagged for manual rights holder review. If flagged, revenue may be claimed or blocked.';
  } else {
    verdict = 'TRANSFORMATIVE_OR_CLEARED';
    explanation = 'Audio replacement or heavy transformation brings detection below automated threshold. Ensure visual footage qualifies under Fair Use.';
  }

  return {
    matchConfidence,
    detectedTechniques,
    explanation,
    verdict,
  };
}

/**
 * Calculates canvas framing parameters for social media formats
 */
export function calculateAspectRatioCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetRatio: '9:16' | '1:1' | '16:9'
): { targetWidth: number; targetHeight: number; scaleMode: 'fit' | 'fill' } {
  let targetAspect = 16 / 9;
  if (targetRatio === '9:16') targetAspect = 9 / 16;
  if (targetRatio === '1:1') targetAspect = 1 / 1;

  if (targetRatio === '9:16') {
    return { targetWidth: 720, targetHeight: 1280, scaleMode: 'fit' };
  } else if (targetRatio === '1:1') {
    return { targetWidth: 1080, targetHeight: 1080, scaleMode: 'fit' };
  } else {
    return { targetWidth: 1280, targetHeight: 720, scaleMode: 'fit' };
  }
}
