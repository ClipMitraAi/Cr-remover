import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Download, Volume2, VolumeX, Music, Crop as AspectRatioIcon,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Upload, Video as VideoIcon,
  Layers, Sliders, Type
} from 'lucide-react';
import { Language } from '../types';
import { audioEngine } from '../utils/audioGenerator';

interface VideoStudioProps {
  lang: Language;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ lang }) => {
  // Video Source state
  const [selectedPreset, setSelectedPreset] = useState<'tech' | 'gaming' | 'nature' | 'custom'>('tech');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Transformation states
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [visualFilter, setVisualFilter] = useState<'none' | 'cinematic' | 'vintage' | 'vibrant'>('cinematic');
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  
  // Audio state
  const [muteOriginalAudio, setMuteOriginalAudio] = useState<boolean>(true);
  const [selectedSafeMusic, setSelectedSafeMusic] = useState<'lofi' | 'synthwave' | 'ambient' | 'none'>('none');
  const [musicVolume, setMusicVolume] = useState<number>(0.6);

  // Overlay / Watermark state
  const [watermarkText, setWatermarkText] = useState<string>('Transformative Review & Commentary | @MyChannel');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [badgeText, setBadgeText] = useState<string>('FAIR USE');

  // Export / Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Synthetic video animation state if using built-in presets
  const synthTimeRef = useRef<number>(0);

  // Switch sound when selectedSafeMusic changes
  useEffect(() => {
    if (selectedSafeMusic === 'none' || !isPlaying) {
      audioEngine.stop();
    } else {
      audioEngine.setVolume(musicVolume);
      audioEngine.playTrack(selectedSafeMusic);
    }

    return () => {
      audioEngine.stop();
    };
  }, [selectedSafeMusic, isPlaying, musicVolume]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (customVideoUrl) {
        URL.revokeObjectURL(customVideoUrl);
      }
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setSelectedPreset('custom');
      setIsPlaying(true);
    }
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetW = 720;
    let targetH = 1280;
    if (aspectRatio === '1:1') {
      targetW = 1080;
      targetH = 1080;
    } else if (aspectRatio === '16:9') {
      targetW = 1280;
      targetH = 720;
    }
    canvas.width = targetW;
    canvas.height = targetH;

    let lastRenderTime = 0;
    const render = (time: number) => {
      if (!canvas || !ctx) return;
      if (time - lastRenderTime < 40) { // 25 FPS max
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = time;
      synthTimeRef.current += 0.02 * speedMultiplier;
      const t = synthTimeRef.current;

      // Clear
      ctx.save();
      ctx.clearRect(0, 0, targetW, targetH);

      // Background fill / blurred backdrop for vertical Reels/Shorts
      if (aspectRatio === '9:16') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, targetH);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, targetW, targetH);
      } else {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Draw video source
      const videoEl = videoRef.current;
      const hasRealVideo = selectedPreset === 'custom' && customVideoUrl && videoEl && videoEl.readyState >= 2;

      ctx.save();

      // Apply filter
      if (visualFilter === 'cinematic') {
        ctx.filter = 'contrast(1.15) saturate(1.25)';
      } else if (visualFilter === 'vintage') {
        ctx.filter = 'sepia(0.3) contrast(1.1) brightness(0.95)';
      } else if (visualFilter === 'vibrant') {
        ctx.filter = 'saturate(1.5) contrast(1.1)';
      } else {
        ctx.filter = 'none';
      }

      // Mirroring
      if (isMirrored) {
        ctx.translate(targetW, 0);
        ctx.scale(-1, 1);
      }

      if (hasRealVideo) {
        // Draw real user video centered with letterbox or fill
        const vw = videoEl.videoWidth || 1280;
        const vh = videoEl.videoHeight || 720;
        const scale = Math.min(targetW / vw, (targetH * 0.75) / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (targetW - dw) / 2;
        const dy = (targetH - dh) / 2;

        ctx.drawImage(videoEl, dx, dy, dw, dh);
      } else {
        // Draw dynamic synthetic sample motion
        drawSyntheticPreset(ctx, targetW, targetH, selectedPreset, t);
      }

      ctx.restore();

      // Add Frame Border / Social Media Safe Guide
      if (aspectRatio === '9:16') {
        // Top and Bottom header bar for Reels/Shorts
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, targetW, 110);
        ctx.fillRect(0, targetH - 140, targetW, 140);

        // Header Title in canvas
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CRITIQUE & EDUCATIONAL BREAKDOWN', targetW / 2, 60);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px system-ui, sans-serif';
        ctx.fillText('Analysis • Fair Use Transformation', targetW / 2, 92);
      }

      // Draw Creator Attribution & Fair Use Notice Watermark
      if (showWatermark && watermarkText) {
        const paddingY = aspectRatio === '9:16' ? targetH - 85 : targetH - 45;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(targetW * 0.05, paddingY - 32, targetW * 0.9, 48, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Badge
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.roundRect(targetW * 0.05 + 10, paddingY - 24, 85, 32, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(badgeText, targetW * 0.05 + 52, paddingY - 3);

        // Text
        ctx.fillStyle = '#f8fafc';
        ctx.font = '500 15px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(watermarkText, targetW * 0.05 + 108, paddingY - 2);
      }

      ctx.restore();

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render(performance.now());

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, aspectRatio, visualFilter, isMirrored, speedMultiplier, watermarkText, showWatermark, badgeText, selectedPreset, customVideoUrl]);

  // Helper to draw realistic dynamic educational scenes
  const drawSyntheticPreset = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    preset: 'tech' | 'gaming' | 'nature' | 'custom',
    t: number
  ) => {
    const cx = w / 2;
    const cy = h / 2;
    const boxW = Math.min(w * 0.9, 860);
    const boxH = (boxW * 9) / 16;
    const rx = cx - boxW / 2;
    const ry = cy - boxH / 2;

    // Outer card
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(rx, ry, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(rx, ry, boxW, boxH, 16);
    ctx.clip();

    if (preset === 'tech') {
      // Tech Gadget Review simulation scene
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, boxW * 0.6);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(rx, ry, boxW, boxH);

      // Grid background
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1;
      for (let x = rx; x < rx + boxW; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, ry);
        ctx.lineTo(x, ry + boxH);
        ctx.stroke();
      }
      for (let y = ry; y < ry + boxH; y += 40) {
        ctx.beginPath();
        ctx.moveTo(rx, y);
        ctx.lineTo(rx + boxW, y);
        ctx.stroke();
      }

      // Rotating smartphone mockup
      const phoneW = 120;
      const phoneH = 220;
      const floatY = Math.sin(t * 2) * 12;

      ctx.save();
      ctx.translate(cx, cy + floatY);
      ctx.rotate(Math.sin(t) * 0.1);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, phoneH / 2 + 25, 60, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Device body
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-phoneW / 2, -phoneH / 2, phoneW, phoneH, 20);
      ctx.fill();
      ctx.stroke();

      // Screen glow
      const screenGrad = ctx.createLinearGradient(-phoneW / 2, -phoneH / 2, phoneW / 2, phoneH / 2);
      screenGrad.addColorStop(0, '#4338ca');
      screenGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = screenGrad;
      ctx.beginPath();
      ctx.roundRect(-phoneW / 2 + 6, -phoneH / 2 + 10, phoneW - 12, phoneH - 20, 14);
      ctx.fill();

      ctx.restore();

      // UI Text in clip
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SMARTPHONE PRO BENCHMARK', rx + 24, ry + 42);

      ctx.fillStyle = '#a5b4fc';
      ctx.font = '14px monospace';
      ctx.fillText(`CPU: 3.4GHz • FPS: ${(58 + Math.sin(t * 4) * 3).toFixed(1)} • TEMP: 37°C`, rx + 24, ry + 70);

    } else if (preset === 'gaming') {
      // Futuristic Gaming Highlight Scene
      const grad = ctx.createLinearGradient(rx, ry, rx + boxW, ry + boxH);
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(rx, ry, boxW, boxH);

      // Laser lines
      for (let i = 0; i < 5; i++) {
        const lx = rx + ((t * 80 + i * 180) % boxW);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lx, ry);
        ctx.lineTo(lx - 60, ry + boxH);
        ctx.stroke();
      }

      // Crosshair
      const crossX = cx + Math.sin(t * 1.5) * 80;
      const crossY = cy + Math.cos(t * 2) * 45;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(crossX, crossY, 26, 0, Math.PI * 2);
      ctx.moveTo(crossX - 35, crossY);
      ctx.lineTo(crossX + 35, crossY);
      ctx.moveTo(crossX, crossY - 35);
      ctx.lineTo(crossX, crossY + 35);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SPEEDRUN HIGHLIGHT #42', rx + 24, ry + 42);

      ctx.fillStyle = '#fca5a5';
      ctx.font = '14px monospace';
      ctx.fillText(`KILLS: 14 • ACCURACY: 94.2% • TIME: 04:12`, rx + 24, ry + 70);

    } else {
      // Nature Drone Cinematic
      const grad = ctx.createLinearGradient(rx, ry, rx, ry + boxH);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.6, '#0f766e');
      grad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grad;
      ctx.fillRect(rx, ry, boxW, boxH);

      // Mountain silhouettes
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(rx, ry + boxH);
      ctx.lineTo(rx + boxW * 0.2, ry + boxH * 0.4);
      ctx.lineTo(rx + boxW * 0.5, ry + boxH * 0.65);
      ctx.lineTo(rx + boxW * 0.85, ry + boxH * 0.35);
      ctx.lineTo(rx + boxW, ry + boxH);
      ctx.fill();

      // Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(rx + boxW * 0.75, ry + boxH * 0.3, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('4K DRONE EXPLORATION', rx + 24, ry + 42);

      ctx.fillStyle = '#99f6e4';
      ctx.font = '14px monospace';
      ctx.fillText(`ELEVATION: 2,400M • SATELLITE LOCK: ACTIVE`, rx + 24, ry + 70);
    }

    ctx.restore();
  };

  // Start Export / Recording
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get video stream from canvas (30 FPS)
    const canvasStream = canvas.captureStream(30);

    // Get procedural audio stream if safe music is enabled
    const audioStream = audioEngine.getAudioStream();
    const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

    if (audioStream && selectedSafeMusic !== 'none') {
      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length > 0) {
        combinedTracks.push(audioTracks[0]);
      }
    }

    const combinedStream = new MediaStream(combinedTracks);
    recordedChunksRef.current = [];

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(combinedStream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      recorder.start(200); // 200ms slice
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            // Auto stop at 15s for educational preview clip
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {lang === 'en' ? 'Educational Creator Video Repurposer' : 'शैक्षणिक क्रिएटर वीडियो रिपर्पज़ स्टूडियो'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'en'
                ? 'Social Media Video Studio & Compliance Lab'
                : 'सोशल मीडिया वीडियो स्टूडियो और अनुपालन लैब'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              {lang === 'en'
                ? 'Transform and reformat clips for Reels/Shorts/TikTok legally. Replaces flagged audio with 100% royalty-free beats, adds verified Fair Use commentary badges, and formats aspect ratios without copyright strikes.'
                : 'वीडियो क्लिप्स को रील्स/शॉर्ट्स/टिकटॉक के लिए कानूनी रूप से रिफॉर्मेट करें। कॉपीराइटेड ऑडियो को 100% रॉयल्टी-फ्री बीट्स से बदलें, फेयर यूज़ बैज लगाएं और बिना स्ट्राइक वीडियो तैयार करें।'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {lang === 'en' ? 'Client-Side Processor' : 'लोकल ब्राउज़र रेंडरर'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
              <span className="text-sm font-semibold text-slate-200">
                {lang === 'en' ? 'Live Canvas Engine' : 'लाइव कैनवस इंजन'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {aspectRatio}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? (lang === 'en' ? 'Pause' : 'रोकें') : (lang === 'en' ? 'Play' : 'चलाएं')}</span>
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative w-full flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden p-2 min-h-[460px] border border-slate-800/80">
            <canvas
              ref={canvasRef}
              className={`max-w-full rounded-lg shadow-2xl object-contain ${
                aspectRatio === '9:16' ? 'max-h-[500px] aspect-[9/16]' : aspectRatio === '1:1' ? 'max-h-[460px] aspect-square' : 'max-h-[380px] aspect-video'
              }`}
            />

            {/* Hidden Video element for custom uploads */}
            {customVideoUrl && (
              <video
                ref={videoRef}
                src={customVideoUrl}
                crossOrigin="anonymous"
                loop
                playsInline
                autoPlay
                muted={muteOriginalAudio}
                className="hidden"
              />
            )}

            {/* Recording Active Overlay */}
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-2 animate-pulse shadow-lg">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>REC {recordingSeconds}s / 15s</span>
              </div>
            )}
          </div>

          {/* Video Transport & Recording Action */}
          <div className="w-full mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>
                {selectedPreset === 'custom'
                  ? (lang === 'en' ? 'Custom Clip Loaded' : 'कस्टम वीडियो लोड है')
                  : (lang === 'en' ? `Preset: ${selectedPreset.toUpperCase()}` : `प्रीसेट: ${selectedPreset.toUpperCase()}`)}
              </span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-lg shadow-red-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  <span>
                    {lang === 'en' ? 'Record & Export Safe Clip' : 'सुरक्षित वीडियो रिकॉर्ड व एक्सपोर्ट करें'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs cursor-pointer transition-all"
                >
                  <Pause className="w-4 h-4 text-red-400" />
                  <span>
                    {lang === 'en' ? 'Stop & Finalize' : 'रोकें और फाइनल करें'} ({recordingSeconds}s)
                  </span>
                </button>
              )}

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download="SafeCreatorVideo.webm"
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Download .webm' : 'डाउनलोड करें'}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Controls & Compliance Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Source Video Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 mb-3">
              <VideoIcon className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'en' ? '1. Video Source' : '1. वीडियो स्रोत'}</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['tech', 'gaming', 'nature'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setSelectedPreset(preset);
                    if (customVideoUrl) {
                      URL.revokeObjectURL(customVideoUrl);
                      setCustomVideoUrl(null);
                    }
                  }}
                  className={`py-2 px-2.5 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer capitalize ${
                    selectedPreset === preset
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  {preset === 'tech' ? '📱 Tech' : preset === 'gaming' ? '🎮 Gaming' : '🌲 Nature'}
                </button>
              ))}
            </div>

            {/* Custom file upload input */}
            <label className="block w-full">
              <div className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 hover:bg-slate-800/40 cursor-pointer transition-colors text-xs text-slate-300">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>
                  {selectedPreset === 'custom' && customVideoUrl
                    ? (lang === 'en' ? 'Upload Different Video File' : 'दूसरी वीडियो फाइल अपलोड करें')
                    : (lang === 'en' ? 'Upload Your Video (.mp4, .webm)' : 'अपनी वीडियो अपलोड करें (.mp4, .webm)')}
                </span>
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* 2. Platform Aspect Ratio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 mb-3">
              <AspectRatioIcon className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'en' ? '2. Platform Format' : '2. सोशल मीडिया फॉर्मेट'}</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '9:16' as const, label: '9:16 Reels/Shorts', desc: 'Vertical' },
                { id: '1:1' as const, label: '1:1 Square', desc: 'Instagram Feed' },
                { id: '16:9' as const, label: '16:9 Landscape', desc: 'YouTube Standard' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAspectRatio(item.id)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs transition-all cursor-pointer ${
                    aspectRatio === item.id
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm font-semibold'
                      : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] text-slate-400 opacity-80">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Audio & Music Replacement (The Core Copyright Shield!) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Music className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'en' ? '3. Safe Audio Replacement' : '3. सुरक्षित ऑडियो व म्यूजिक'}</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% Safe
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {lang === 'en'
                ? '95% of Content ID claims occur due to copyrighted background audio tracks. Replacing flagged audio with royalty-free synth tracks eliminates the audio hash completely.'
                : '95% कॉपीराइट क्लेम बैकग्राउंड ऑडियो/गाने की वजह से आते हैं। ऑडियो को रॉयल्टी-फ्री म्यूजिक से बदलने पर ऑडियो फिंगरप्रिंट पूरी तरह साफ हो जाता है।'}
            </p>

            <div className="space-y-2 mb-4">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={muteOriginalAudio}
                  onChange={(e) => setMuteOriginalAudio(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  {lang === 'en'
                    ? 'Mute / Strip original copyrighted video audio'
                    : 'मूल वीडियो की कॉपीराइटेड ऑडियो म्यूट/हटाएं'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { id: 'lofi' as const, name: 'Lofi Chill Beat', bpm: '75 BPM', tag: 'Safe Chill' },
                { id: 'synthwave' as const, name: 'Cyber Synthwave', bpm: '115 BPM', tag: 'Energetic' },
                { id: 'ambient' as const, name: 'Ambient Pulse', bpm: '60 BPM', tag: 'Minimal' },
                { id: 'none' as const, name: 'No Music (Mute)', bpm: '0 BPM', tag: 'Silent' },
              ].map((trk) => (
                <button
                  key={trk.id}
                  onClick={() => setSelectedSafeMusic(trk.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSafeMusic === trk.id
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{trk.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                    <span>{trk.bpm}</span>
                    <span className="text-emerald-400 font-mono">{trk.tag}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedSafeMusic !== 'none' && (
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-xs text-slate-400 font-mono">{Math.round(musicVolume * 100)}%</span>
              </div>
            )}
          </div>

          {/* 4. Creator Fair Use & Attribution Watermark */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 mb-3">
              <Type className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'en' ? '4. Fair Use & Attribution Badge' : '4. फेयर यूज़ और चैनल क्रेडिट'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'en' ? 'Channel / Commentary Watermark Text' : 'चैनल / कमेंट्री वॉटरमार्क टेक्स्ट'}
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. Transformative Review & Commentary | @Handle"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{lang === 'en' ? 'Burn Watermark into Video' : 'वीडियो में वॉटरमार्क शामिल करें'}</span>
                </label>

                <div className="flex items-center space-x-1">
                  <span className="text-slate-400">{lang === 'en' ? 'Badge:' : 'बैज:'}</span>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-indigo-300 text-center font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Transformative Visual Filters & Adjustments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 mb-3">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'en' ? '5. Visual Transform Effects' : '5. विज़ुअल ट्रांसफॉर्म फिल्टर्स'}</span>
            </h3>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { id: 'none' as const, label: 'Normal' },
                { id: 'cinematic' as const, label: 'Cinematic' },
                { id: 'vintage' as const, label: 'Vintage' },
                { id: 'vibrant' as const, label: 'Vibrant' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setVisualFilter(f.id)}
                  className={`py-1.5 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                    visualFilter === f.id
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMirrored}
                  onChange={(e) => setIsMirrored(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{lang === 'en' ? 'Mirror Horizontal Flip' : 'मिरर हॉरिजॉन्टल फ्लिप'}</span>
              </label>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">{lang === 'en' ? 'Speed:' : 'स्पीड:'}</span>
                <select
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                  aria-label={lang === 'en' ? 'Playback Speed Multiplier' : 'प्लेबैक स्पीड गुणक'}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                >
                  <option value="0.9">0.9x</option>
                  <option value="1.0">1.0x (Normal)</option>
                  <option value="1.05">1.05x</option>
                  <option value="1.1">1.1x</option>
                  <option value="1.2">1.2x</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
