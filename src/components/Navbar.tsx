import React from 'react';
import { ShieldCheck, Video, Cpu, Scale, BookOpen, Globe2 } from 'lucide-react';
import { AppTab, Language } from '../types';

interface NavbarProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, lang, setLang }) => {
  const navItems = [
    {
      id: 'video_studio' as AppTab,
      labelEn: 'Safe Video Studio',
      labelHi: 'सुरक्षित वीडियो स्टूडियो',
      icon: Video,
      badge: 'Interactive',
    },
    {
      id: 'fingerprint_simulator' as AppTab,
      labelEn: 'Content ID & Fingerprint Lab',
      labelHi: 'कंटेंट ID व फिंगरप्रिंट लैब',
      icon: Cpu,
      badge: 'Myth Buster',
    },
    {
      id: 'fair_use_calculator' as AppTab,
      labelEn: 'Fair Use Calculator',
      labelHi: 'फेयर यूज़ कैलकुलेटर',
      icon: Scale,
      badge: 'Legal Tool',
    },
    {
      id: 'drm_academy' as AppTab,
      labelEn: 'DRM & Copyright Academy',
      labelHi: 'DRM व कॉपीराइट एकेडमी',
      icon: BookOpen,
      badge: 'Guide & Quiz',
    },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setTab('video_studio')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                  RightsLab
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {lang === 'en' ? 'Educational' : 'शैक्षणिक'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {lang === 'en' ? 'Content ID, DRM Science & Safe Video Repurposing' : 'कंटेंट ID, DRM और सुरक्षित वीडियो रिपर्पज़ लैब'}
              </p>
            </div>
          </div>

          {/* Right side: Language Switcher */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60">
              <Globe2 className="w-4 h-4 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'hi'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी / Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{lang === 'en' ? item.labelEn : item.labelHi}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                  isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
