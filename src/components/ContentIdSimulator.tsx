import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Zap, AlertOctagon, CheckCircle2, RefreshCw, BarChart2, ShieldAlert,
  HelpCircle, Info, Sparkles, ArrowRight, Music
} from 'lucide-react';
import { Language } from '../types';
import { simulateContentIdDetection, FingerprintSimulationResult } from '../utils/copyrightRules';

interface ContentIdSimulatorProps {
  lang: Language;
}

export const ContentIdSimulator: React.FC<ContentIdSimulatorProps> = ({ lang }) => {
  // Simulator test toggles
  const [speed, setSpeed] = useState<number>(1.05); // user commonly tries 1.05
  const [pitch, setPitch] = useState<number>(1);
  const [videoFlipped, setVideoFlipped] = useState<boolean>(true);
  const [hasNoise, setHasNoise] = useState<boolean>(false);
  const [hasVoiceover, setHasVoiceover] = useState<boolean>(false);
  const [replaceAudio, setReplaceAudio] = useState<boolean>(false);
  const [clipDuration, setClipDuration] = useState<number>(18);
  const [hasBorder, setHasBorder] = useState<boolean>(true);

  // Result state
  const [scanResult, setScanResult] = useState<FingerprintSimulationResult>(() =>
    simulateContentIdDetection({
      speedMultiplier: 1.05,
      pitchShiftSemitones: 1,
      videoFlipped: true,
      hasNoiseOverlay: false,
      hasCommentaryVoiceover: false,
      replacedAudio: false,
      cropOrBorderApplied: true,
      clipDurationSeconds: 18,
    })
  );

  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Canvas visualizer refs
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Run simulation
  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = simulateContentIdDetection({
        speedMultiplier: speed,
        pitchShiftSemitones: pitch,
        videoFlipped,
        hasNoiseOverlay: hasNoise,
        hasCommentaryVoiceover: hasVoiceover,
        replacedAudio: replaceAudio,
        cropOrBorderApplied: hasBorder,
        clipDurationSeconds: clipDuration,
      });
      setScanResult(res);
      setIsScanning(false);
    }, 600);
  };

  useEffect(() => {
    handleRunScan();
  }, [speed, pitch, videoFlipped, hasNoise, hasVoiceover, replaceAudio, clipDuration, hasBorder]);

  // Animated Spectrogram / Constellation map canvas
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 700;
    canvas.height = 200;

    let lastRender = 0;
    const render = (time: number) => {
      if (!canvas || !ctx) return;
      if (time - lastRender < 40) { // 25 FPS
        animRef.current = requestAnimationFrame(render);
        return;
      }
      lastRender = time;
      timeRef.current += 0.03;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Draw frequency grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 30; y < h; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${Math.round(20000 - (y / h) * 19000)}Hz`, 8, y - 4);
      }

      // Draw spectrogram frequency bins & energy heat
      const binWidth = 6;
      const numBins = Math.floor(w / binWidth);

      for (let i = 0; i < numBins; i++) {
        const x = i * binWidth;
        const progress = (i / numBins) * 10;
        
        // Multi-harmonic wave
        const energy1 = Math.sin(t * 3 + progress * 2) * 0.5 + 0.5;
        const energy2 = Math.cos(t * 2 + progress * 4) * 0.4 + 0.4;
        const combinedEnergy = (energy1 + energy2) / 2;

        const barHeight = combinedEnergy * (h - 50);
        const y = h - barHeight;

        // Color based on whether audio was replaced or altered
        const grad = ctx.createLinearGradient(x, h, x, y);
        if (replaceAudio) {
          grad.addColorStop(0, '#064e3b');
          grad.addColorStop(0.5, '#10b981');
          grad.addColorStop(1, '#6ee7b7');
        } else if (scanResult.matchConfidence > 65) {
          grad.addColorStop(0, '#450a0a');
          grad.addColorStop(0.5, '#ef4444');
          grad.addColorStop(1, '#fca5a5');
        } else {
          grad.addColorStop(0, '#312e81');
          grad.addColorStop(0.5, '#6366f1');
          grad.addColorStop(1, '#a5b4fc');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, binWidth - 1, barHeight);

        // Constellation peaks (the dots YouTube/Shazam algorithms store as hashes!)
        if (i % 6 === 0 && combinedEnergy > 0.6) {
          const peakY = y + 10;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + 2, peakY, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = replaceAudio ? '#34d399' : '#f87171';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x + 2, peakY, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Overlay text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        replaceAudio
          ? 'CLEAN AUDIO SPECTRUM (Royalty-Free Procedural Synth)'
          : `PERCEPTUAL HASH MATCH RATE: ${scanResult.matchConfidence}%`,
        70,
        22
      );

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [replaceAudio, scanResult.matchConfidence]);

  return (
    <div className="space-y-8">
      {/* Educational Header */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Cpu className="w-4 h-4" />
              <span>
                {lang === 'en' ? 'Acoustic & Neural Fingerprint Science' : 'अकॉस्टिक और न्यूरल फिंगरप्रिंट तकनीक'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'en'
                ? 'Content ID & Myth Buster Laboratory'
                : 'कंटेंट ID व मिथक बस्टर प्रयोगशाला'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              {lang === 'en'
                ? 'Understand why popular "tricks" like +5% speed, pitch shifting, or flipping fail against modern algorithms. Learn how YouTube Content ID and Meta Rights Manager truly identify media.'
                : 'जानिए क्यों +5% स्पीड, पिच शिफ्ट या वीडियो फ्लिप जैसे नुस्खे आधुनिक एल्गोरिदम को धोखा नहीं दे सकते। समझें कि यूट्यूब और मेटा वास्तव में मीडिया की पहचान कैसे करते हैं।'}
            </p>
          </div>

          <div className="bg-purple-950/80 border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs text-purple-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>{lang === 'en' ? 'Live Perceptual Hash Engine' : 'लाइव पर्सेप्चुअल हैश सिम्युलेटर'}</span>
          </div>
        </div>
      </div>

      {/* Spectrogram & Live Waveform */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>
                {lang === 'en'
                  ? 'Acoustic Constellation Map (How Content ID "Listens")'
                  : 'अकॉस्टिक कांस्टेलेशन मैप (कंटेंट ID कैसे ऑडियो सुनता है)'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'The white dots represent peak frequency constellation pairs stored in rights databases.'
                : 'सफ़ेद बिंदु फ्रीक्वेंसी पीक्स (कांस्टेलेशन पॉइंट्स) हैं जो डेटाबेस में हैश के रूप में सेव होते हैं।'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${
                scanResult.matchConfidence >= 70
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : scanResult.matchConfidence >= 35
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {lang === 'en' ? 'Match Probability:' : 'पहचान संभावना:'} {scanResult.matchConfidence}%
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <canvas ref={spectrogramCanvasRef} className="w-full h-44 block" />
        </div>
      </div>

      {/* Testing Ground & Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Myth Toggles (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{lang === 'en' ? 'Experiment with Common Bypass "Tricks"' : 'आम "बायपास नुस्खों" के साथ प्रयोग करें'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Toggle these popular myths to see their actual impact on Content ID detection.'
                : 'इन नुस्खों को ऑन/ऑफ करके देखें कि क्या कंटेंट ID इन्हें पकड़ पाता है या नहीं।'}
            </p>
          </div>

          {/* Speed slider */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">
                {lang === 'en' ? 'Myth 1: Speed Adjustment' : 'नुस्खा 1: वीडियो की स्पीड बदलना'}
              </span>
              <span className="font-mono text-purple-300 font-bold">{speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.25"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-[11px] text-slate-400">
              {lang === 'en'
                ? 'Algorithm Reality: Modern Chromaprint normalizes tempo changes linearly.'
                : 'हकीकत: आधुनिक क्रोमाप्रिंट एल्गोरिदम स्पीड में बदलाव को आसानी से नॉर्मलाइज कर लेता है।'}
            </p>
          </div>

          {/* Pitch Shift slider */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">
                {lang === 'en' ? 'Myth 2: Pitch Shift (Key)' : 'नुस्खा 2: गाने की पिच (सुर) बदलना'}
              </span>
              <span className="font-mono text-purple-300 font-bold">
                {pitch > 0 ? `+${pitch}` : pitch} semitones
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="1"
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-[11px] text-slate-400">
              {lang === 'en'
                ? 'Algorithm Reality: Harmonic ratios between frequencies stay identical even when shifted.'
                : 'हकीकत: फ्रीक्वेंसी के बीच का रेशियो वही रहता है, इसलिए फिंगरप्रिंट मैच हो जाता है।'}
            </p>
          </div>

          {/* Checkbox grid for other myths */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={videoFlipped}
                onChange={(e) => setVideoFlipped(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-200">
                  {lang === 'en' ? 'Horizontal Mirror' : 'हॉरिजॉन्टल मिरर'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {lang === 'en' ? 'Flips visual frame' : 'वीडियो को उल्टा घुमाता है'}
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={hasBorder}
                onChange={(e) => setHasBorder(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-200">
                  {lang === 'en' ? 'Add Border / Frame' : 'बॉर्डर / फ्रेम लगाना'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {lang === 'en' ? 'Adds canvas borders' : 'फ्रेम लगाकर वीडियो छोटा करना'}
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={hasNoise}
                onChange={(e) => setHasNoise(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-200">
                  {lang === 'en' ? 'Background Noise' : 'बारिश/शोर की आवाज'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {lang === 'en' ? 'Rain / static overlay' : 'पीछे बारिश का शोर जोड़ना'}
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={hasVoiceover}
                onChange={(e) => setHasVoiceover(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-200">
                  {lang === 'en' ? 'Voiceover Commentary' : 'अपनी आवाज में कमेंट्री'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {lang === 'en' ? 'Adds real commentary' : 'सच्चा ट्रांसफॉर्मेटिव वैल्यू'}
                </div>
              </div>
            </label>
          </div>

          {/* The true safe method */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceAudio}
                onChange={(e) => setReplaceAudio(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === 'en'
                      ? 'Replace with 100% Royalty-Free / Safe Music'
                      : 'ऑडियो को पूरी तरह रॉयल्टी-फ्री संगीत से बदलें'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {lang === 'en'
                    ? 'The legitimate engineering solution: removes the copyrighted acoustic fingerprint completely.'
                    : 'वैध तरीका: कॉपीराइटेड गाने के फिंगरप्रिंट को हटाकर सुरक्षित ऑडियो इस्तेमाल करता है।'}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Right: Scan Verdict & Educational Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <span>{lang === 'en' ? 'Content ID Scanner Verdict' : 'कंटेंट ID स्कैनर का फैसला'}</span>
            </h3>

            <span
              className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                scanResult.verdict === 'DETECTED_IMMEDIATELY'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : scanResult.verdict === 'DETECTED_DELAYED_OR_MANUAL'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {scanResult.verdict === 'DETECTED_IMMEDIATELY'
                ? (lang === 'en' ? 'Flagged / Claimed' : 'तुरंत क्लेम होगा')
                : scanResult.verdict === 'DETECTED_DELAYED_OR_MANUAL'
                ? (lang === 'en' ? 'Manual Review' : 'रिव्यू में फंसेगा')
                : (lang === 'en' ? 'Cleared / Safe' : 'सुरक्षित')}
            </span>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <div className="font-semibold text-slate-100 mb-1 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'en' ? 'Analysis Summary' : 'विश्लेषण निष्कर्ष'}</span>
            </div>
            <p>{scanResult.explanation}</p>
          </div>

          {/* Detected modifications breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              {lang === 'en' ? 'Techniques Analyzed By Scanner' : 'स्कैनर द्वारा जांची गई तकनीकें'}:
            </h4>
            <div className="space-y-1.5">
              {scanResult.detectedTechniques.map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2 text-xs text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The Technical Reality Callout */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
            <h4 className="font-bold text-indigo-300 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>
                {lang === 'en'
                  ? 'Why "DRM Removal Websites" Are Scams or Illegal'
                  : '"DRM रिमूवल वेबसाइट्स" फर्जी या गैर-कानूनी क्यों होती हैं?'}
              </span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {lang === 'en'
                ? 'Websites promising "Auto DRM Removal" or "100% Anti-Copyright Bypasser" either secretly steal credentials, install malware, or apply superficial video filters that fail modern neural network scans. True copyright immunity only comes from Fair Use transformative critique, Creative Commons licenses, or original production.'
                : 'जो वेबसाइटें "ऑटो DRM रिमूवल" या "बिना कॉपीराइट के डाउनलोड" का दावा करती हैं, वे या तो मैलवेयर फैलाती हैं या सिर्फ वीडियो में मामूली फिल्टर लगाती हैं जो यूट्यूब/इंस्टाग्राम के आधुनिक AI सिस्टम से तुरंत पकड़े जाते हैं। कॉपीराइट से बचने का एकमात्र सही तरीका फेयर यूज़ (समीक्षा/शिक्षा), रॉयल्टी-फ्री म्यूजिक और ओरिजिनल कंटेंट है।'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
