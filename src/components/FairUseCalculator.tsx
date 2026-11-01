import React, { useState } from 'react';
import { 
  Scale, ShieldCheck, AlertTriangle, AlertCircle, Copy, Check, FileText,
  Award, ArrowRight, HelpCircle
} from 'lucide-react';
import { Language } from '../types';
import { evaluateFairUse, FairUseAnswers } from '../utils/copyrightRules';

interface FairUseCalculatorProps {
  lang: Language;
}

export const FairUseCalculator: React.FC<FairUseCalculatorProps> = ({ lang }) => {
  const [channelName, setChannelName] = useState<string>('@CreatorChannel');
  const [copied, setCopied] = useState<boolean>(false);

  const [answers, setAnswers] = useState<FairUseAnswers>({
    purpose: 'commentary',
    amountUsed: 'brief_clips',
    originalWorkNature: 'non_fiction_news',
    marketEffect: 'no_impact',
    addsValue: true,
    creditedAuthor: true,
  });

  const assessment = evaluateFairUse(answers, channelName);

  const handleCopyDisclaimer = () => {
    navigator.clipboard.writeText(assessment.disclaimerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Scale className="w-4 h-4" />
              <span>{lang === 'en' ? 'Copyright Compliance Diagnostic' : 'कॉपीराइट अनुपालन निदान उपकरण'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'en' ? 'Fair Use & Copyright Safety Calculator' : 'फेयर यूज़ व कॉपीराइट सुरक्षा कैलकुलेटर'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              {lang === 'en'
                ? 'Assess whether your video qualifies as legal Fair Use under Section 107 of the US Copyright Act and Section 52 of the Indian Copyright Act (Fair Dealing) before publishing.'
                : 'वीडियो पब्लिश करने से पहले जांचें कि आपका वीडियो भारतीय कॉपीराइट कानून (धारा 52) और अंतरराष्ट्रीय फेयर यूज़ नियमों के तहत वैध है या नहीं।'}
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-xs text-slate-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'en' ? '4-Factor Legal Matrix' : '4-कारक कानूनी विश्लेषण'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Questionnaire + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Questionnaire (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'en' ? 'Evaluate Your Video Usage' : 'अपने वीडियो के उपयोग का मूल्यांकन करें'}</span>
            </h3>

            <div className="flex items-center space-x-2">
              <label className="text-xs text-slate-400">{lang === 'en' ? 'Your Handle:' : 'आपका चैनल:'}</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono w-32"
              />
            </div>
          </div>

          {/* Factor 1: Purpose & Character */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. {lang === 'en' ? 'Purpose & Character of Your Video' : 'आपके वीडियो का मुख्य उद्देश्य (Purpose)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'educational' as const, labelEn: 'Educational / Tutorial', labelHi: 'शिक्षा / ट्यूटोरियल' },
                { id: 'commentary' as const, labelEn: 'Criticism & Review', labelHi: 'समीक्षा व आलोचना' },
                { id: 'parody' as const, labelEn: 'Parody / Comedy Sketch', labelHi: 'पैरोडी / हास्य' },
                { id: 'entertainment_reupload' as const, labelEn: 'Pure Entertainment Reupload', labelHi: 'मनोरंजन के लिए री-अपलोड' },
                { id: 'commercial_promo' as const, labelEn: 'Commercial Product Promo', labelHi: 'व्यावसायिक विज्ञापन / प्रोमो' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAnswers({ ...answers, purpose: opt.id })}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    answers.purpose === opt.id
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? opt.labelEn : opt.labelHi}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.addsValue}
                  onChange={(e) => setAnswers({ ...answers, addsValue: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {lang === 'en'
                    ? 'I added substantive voice commentary or analysis'
                    : 'मैंने अपनी आवाज में विश्लेषण या टिप्पणी जोड़ी है'}
                </span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.creditedAuthor}
                  onChange={(e) => setAnswers({ ...answers, creditedAuthor: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {lang === 'en'
                    ? 'I credited the original creator/source'
                    : 'मैंने मूल निर्माता को क्रेडिट दिया है'}
                </span>
              </label>
            </div>
          </div>

          {/* Factor 2: Nature of Original Work */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. {lang === 'en' ? 'Nature of Original Clip' : 'मूल क्लिप किस प्रकार की है (Nature)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'non_fiction_news' as const, labelEn: 'News / Historical Footage', labelHi: 'समाचार / ऐतिहासिक फुटेज' },
                { id: 'factual' as const, labelEn: 'Scientific / Documentary', labelHi: 'वैज्ञानिक / डॉक्यूमेंट्री' },
                { id: 'creative_fiction' as const, labelEn: 'Indie Web Video / Drama', labelHi: 'क्रिएटिव फिक्शन / वेब शो' },
                { id: 'commercial_music_movie' as const, labelEn: 'Major Movie / Hit Song', labelHi: 'बड़ी फिल्म / हिट गाना' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAnswers({ ...answers, originalWorkNature: opt.id })}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    answers.originalWorkNature === opt.id
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? opt.labelEn : opt.labelHi}
                </button>
              ))}
            </div>
          </div>

          {/* Factor 3: Amount Used */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. {lang === 'en' ? 'Amount & Duration Used' : 'आपने मूल वीडियो का कितना हिस्सा उपयोग किया (Amount)'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'under_5s' as const, labelEn: '< 5 Seconds', labelHi: '< 5 सेकंड' },
                { id: 'brief_clips' as const, labelEn: 'Short Clips (5-20s)', labelHi: 'छोटे क्लिप्स (5-20s)' },
                { id: 'substantial' as const, labelEn: 'Over 1 Minute', labelHi: '1 मिनट से अधिक' },
                { id: 'entire_video' as const, labelEn: 'Full / Most of it', labelHi: 'पूरा वीडियो' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAnswers({ ...answers, amountUsed: opt.id })}
                  className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                    answers.amountUsed === opt.id
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? opt.labelEn : opt.labelHi}
                </button>
              ))}
            </div>
          </div>

          {/* Factor 4: Market Effect */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              4. {lang === 'en' ? 'Effect on Original Market' : 'मूल वीडियो के दर्शकों पर प्रभाव (Market Impact)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'none_promotes_original' as const, labelEn: 'Promotes / References Original', labelHi: 'मूल वीडियो को प्रमोट करता है' },
                { id: 'no_impact' as const, labelEn: 'No Commercial Impact', labelHi: 'कोई व्यावसायिक नुकसान नहीं' },
                { id: 'potential_substitute' as const, labelEn: 'People might skip original', labelHi: 'लोग मूल वीडियो देखना छोड़ सकते हैं' },
                { id: 'direct_competition' as const, labelEn: 'Direct replacement for original', labelHi: 'मूल वीडियो का सीधा विकल्प' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAnswers({ ...answers, marketEffect: opt.id })}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    answers.marketEffect === opt.id
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? opt.labelEn : opt.labelHi}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results, Safety Meter & Copyable Notice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Safety Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {lang === 'en' ? 'Fair Use Safety Score' : 'फेयर यूज़ सुरक्षा स्कोर'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  assessment.riskLevel === 'LOW_RISK'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : assessment.riskLevel === 'MODERATE_RISK'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {assessment.riskLevel.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {assessment.score}%
              </div>
              <div className="text-xs text-slate-300 leading-snug">
                {assessment.summary}
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  assessment.score >= 70
                    ? 'bg-emerald-500'
                    : assessment.score >= 45
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${assessment.score}%` }}
              />
            </div>

            {/* Recommendations */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'en' ? 'Recommendations for Your Video:' : 'आपके वीडियो के लिए सुझाव:'}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {assessment.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ready-to-use YouTube/Instagram Description Disclaimer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'en' ? 'Copyable Fair Use Notice' : 'कॉपी करने योग्य फेयर यूज़ डिस्क्लेमर'}</span>
              </h4>

              <button
                onClick={handleCopyDisclaimer}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'en' ? 'Copied!' : 'कॉपी हो गया!') : (lang === 'en' ? 'Copy Text' : 'कॉपी करें')}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              {lang === 'en'
                ? 'Paste this notice directly in your YouTube video description or Instagram caption.'
                : 'इस डिस्क्लेमर को सीधे अपने यूट्यूब डिस्क्रिप्शन या इंस्टाग्राम कैप्शन में पेस्ट करें।'}
            </p>

            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {assessment.disclaimerText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
