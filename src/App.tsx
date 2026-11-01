/**
 * RightsLab - Educational DRM & Content ID Studio
 */
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { VideoStudio } from './components/VideoStudio';
import { ContentIdSimulator } from './components/ContentIdSimulator';
import { FairUseCalculator } from './components/FairUseCalculator';
import { DrmAcademy } from './components/DrmAcademy';
import { AppTab, Language } from './types';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('video_studio');
  const [lang, setLang] = useState<Language>('hi'); // Default to Hindi/Hinglish based on user prompt

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'video_studio' && <VideoStudio lang={lang} />}
        {currentTab === 'fingerprint_simulator' && <ContentIdSimulator lang={lang} />}
        {currentTab === 'fair_use_calculator' && <FairUseCalculator lang={lang} />}
        {currentTab === 'drm_academy' && <DrmAcademy lang={lang} />}
      </main>

      {/* Educational Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-slate-300">RightsLab</span>
            <span className="text-slate-400">|</span>
            <span>
              {lang === 'en'
                ? 'Educational Copyright, DRM & Audio Fingerprinting Lab'
                : 'शैक्षणिक कॉपीराइट, DRM व ऑडियो फिंगरप्रिंटिंग लैब'}
            </span>
          </div>

          <p className="text-slate-400 text-center sm:text-right max-w-md">
            {lang === 'en'
              ? 'Complies with DMCA Section 1201 & Indian Copyright Act Section 52 (Fair Dealing). Designed for educational awareness and ethical video transformation.'
              : 'भारतीय कॉपीराइट कानून धारा 52 (फेयर डीलिंग) और वैश्विक मानकों के अनुरूप। शैक्षणिक जागरूकता और सुरक्षित कंटेंट निर्माण के लिए।'}
          </p>
        </div>
      </footer>
    </div>
  );
}
