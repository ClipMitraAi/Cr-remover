import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFairUse, simulateContentIdDetection, calculateAspectRatioCrop } from './copyrightRules';

test('Fair Use evaluation: educational commentary with added value gives low risk', () => {
  const result = evaluateFairUse({
    purpose: 'educational',
    amountUsed: 'under_5s',
    originalWorkNature: 'non_fiction_news',
    marketEffect: 'none_promotes_original',
    addsValue: true,
    creditedAuthor: true,
  }, 'MyStudyChannel');

  assert.equal(result.riskLevel, 'LOW_RISK');
  assert.ok(result.score >= 80);
  assert.ok(result.disclaimerText.includes('MyStudyChannel'));
  assert.ok(result.recommendations.length > 0);
});

test('Fair Use evaluation: entertainment re-upload of full commercial movie gives critical risk', () => {
  const result = evaluateFairUse({
    purpose: 'entertainment_reupload',
    amountUsed: 'entire_video',
    originalWorkNature: 'commercial_music_movie',
    marketEffect: 'direct_competition',
    addsValue: false,
    creditedAuthor: false,
  });

  assert.equal(result.riskLevel, 'CRITICAL_RISK');
  assert.ok(result.score < 30);
  assert.ok(result.summary.includes('Critical risk'));
});

test('Content ID simulation: speed and pitch naive tweaks still result in high match confidence', () => {
  const naiveTweak = simulateContentIdDetection({
    speedMultiplier: 1.05,
    pitchShiftSemitones: 1,
    videoFlipped: true,
    hasNoiseOverlay: true,
    hasCommentaryVoiceover: false,
    replacedAudio: false,
    cropOrBorderApplied: true,
    clipDurationSeconds: 20,
  });

  // Modern perceptual hash algorithms still detect this!
  assert.ok(naiveTweak.matchConfidence >= 50);
  assert.ok(naiveTweak.detectedTechniques.length >= 3);
});

test('Content ID simulation: audio replacement dramatically reduces audio fingerprint risk', () => {
  const safeAudio = simulateContentIdDetection({
    speedMultiplier: 1.0,
    pitchShiftSemitones: 0,
    videoFlipped: false,
    hasNoiseOverlay: false,
    hasCommentaryVoiceover: false,
    replacedAudio: true,
    cropOrBorderApplied: true,
    clipDurationSeconds: 15,
  });

  assert.ok(safeAudio.matchConfidence < naiveMatchConfidenceBaseline());
  assert.ok(safeAudio.detectedTechniques.some(t => t.includes('Audio track replaced')));
});

function naiveMatchConfidenceBaseline() {
  return simulateContentIdDetection({
    speedMultiplier: 1.0,
    pitchShiftSemitones: 0,
    videoFlipped: false,
    hasNoiseOverlay: false,
    hasCommentaryVoiceover: false,
    replacedAudio: false,
    cropOrBorderApplied: false,
    clipDurationSeconds: 15,
  }).matchConfidence;
}

test('Aspect ratio calculation returns correct targets', () => {
  const reels = calculateAspectRatioCrop(1920, 1080, '9:16');
  assert.equal(reels.targetWidth, 720);
  assert.equal(reels.targetHeight, 1280);

  const square = calculateAspectRatioCrop(1920, 1080, '1:1');
  assert.equal(square.targetWidth, 1080);
  assert.equal(square.targetHeight, 1080);
});
