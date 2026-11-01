import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, Lock, AlertTriangle, CheckCircle2, HelpCircle,
  ExternalLink, Sparkles, Award, ArrowRight, XCircle
} from 'lucide-react';
import { Language, QuizQuestion } from '../types';

interface DrmAcademyProps {
  lang: Language;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    questionEn: 'If I write "No copyright infringement intended / Credit to owner" in my reel caption, does it protect me from Content ID?',
    questionHi: 'अगर मैं कैप्शन में लिखूं "क्रेडिट मूल मालिक को / कोई कॉपीराइट उल्लंघन का इरादा नहीं", तो क्या इससे कॉपीराइट क्लेम रुक जाएगा?',
    optionsEn: [
      'Yes, crediting the owner legally waives copyright claims.',
      'No, disclaimers have zero legal power against automated Content ID or copyright law.',
      'Only if the video is under 15 seconds.',
      'Only on Instagram, but not on YouTube.',
    ],
    optionsHi: [
      'हाँ, क्रेडिट देने से कॉपीराइट क्लेम नहीं आता।',
      'नहीं, ऐसे डिस्क्लेमर की कानून या कंटेंट ID के सामने कोई मान्यता नहीं होती।',
      'सिर्फ तभी अगर वीडियो 15 सेकंड से छोटी हो।',
      'सिर्फ इंस्टाग्राम पर, लेकिन यूट्यूब पर नहीं।',
    ],
    correctIndex: 1,
    explanationEn: 'Writing "Credit to owner" or "No copyright infringement intended" provides zero legal protection. Copyright is an exclusive legal right; unless you have a license or meet Fair Use standards, automated algorithms will match the content.',
    explanationHi: 'कैप्शन में "Credit to owner" लिखने से कोई कानूनी छूट नहीं मिलती। जब तक आपके पास लाइसेंस या फेयर यूज़ का अधिकार न हो, कंटेंट ID वीडियो को क्लेम करेगा।',
    realWorldImpactEn: 'Content ID operates mathematically on audio/video hashes, completely ignoring description text.',
    realWorldImpactHi: 'कंटेंट ID सिर्फ ऑडियो/वीडियो के फिंगरप्रिंट पर काम करता है, डिस्क्रिप्शन पढ़ने से उसे कोई फर्क नहीं पड़ता।',
  },
  {
    id: 'q2',
    questionEn: 'What is DRM (Digital Rights Management) and why can websites NOT legally "remove" it?',
    questionHi: 'DRM क्या है और वेबसाइटें इसे कानूनी रूप से क्यों नहीं "हटा" सकतीं?',
    optionsEn: [
      'DRM is a file compression tool like ZIP.',
      'DRM is hardware and software encryption (Widevine, FairPlay) legally protected under DMCA §1201 & Indian Copyright Act §65A.',
      'DRM is an optional watermark that can be deleted easily.',
      'Any open-source website can remove DRM without legal consequences.',
    ],
    optionsHi: [
      'DRM एक ज़िप (ZIP) फाइल जैसा कंप्रेशन टूल है।',
      'DRM एनक्रिप्शन तकनीक (Widevine, FairPlay) है, जिसे तोड़ना भारतीय कॉपीराइट कानून धारा 65A और DMCA के तहत गैर-कानूनी है।',
      'DRM सिर्फ एक साधारण वॉटरमार्क है जिसे मिटाया जा सकता है।',
      'कोई भी ओपन-सोर्स वेबसाइट बिना किसी परेशानी के DRM हटा सकती है।',
    ],
    correctIndex: 1,
    explanationEn: 'DRM (like Google Widevine, Apple FairPlay) encrypts high-definition streams with hardware decryption keys. Circumventing technological protection measures is strictly prohibited under international copyright treaties.',
    explanationHi: 'DRM डिजिटल कंटेंट को एनक्रिप्ट करता है। इसे तकनीकी रूप से बाईपास करना या तोड़ना दुनिया भर के कॉपीराइट कानूनों में प्रतिबंधित है।',
    realWorldImpactEn: 'Websites claiming to "strip DRM" are usually phishing scams or illegal pirated stream scrapers.',
    realWorldImpactHi: '"DRM रिमूव" करने का दावा करने वाली साइटें अक्सर वायरस, मैलवेयर या फिशिंग स्कैम होती हैं।',
  },
  {
    id: 'q3',
    questionEn: 'What is the crucial difference between a Content ID Claim and a Copyright Strike?',
    questionHi: 'कंटेंट ID क्लेम (Claim) और कॉपीराइट स्ट्राइक (Strike) में मुख्य अंतर क्या है?',
    optionsEn: [
      'They are identical terms for the same event.',
      'A Claim is automated (usually redirects ad revenue or tracks); a Strike is a legal DMCA takedown (3 strikes terminate your channel).',
      'A Strike only deletes the video, but a Claim suspends your account.',
      'Only YouTube has strikes, Instagram does not have any rules.',
    ],
    optionsHi: [
      'दोनों एक ही चीज़ के दो नाम हैं।',
      'क्लेम ऑटोमेटेड होता है (विज्ञापन की कमाई मूल मालिक को जाती है); जबकि स्ट्राइक कानूनी टेकडाउन है (3 स्ट्राइक से चैनल बंद हो सकता है)।',
      'स्ट्राइक से सिर्फ वीडियो डिलीट होता है, क्लेम से चैनल बंद होता है।',
      'सिर्फ यूट्यूब पर नियम हैं, इंस्टाग्राम पर कोई नियम नहीं हैं।',
    ],
    correctIndex: 1,
    explanationEn: 'A Content ID Claim is an automated business match—the video stays up, but the owner monetizes or tracks it. A Copyright Strike is an official legal takedown notice; receiving 3 strikes within 90 days causes permanent channel termination.',
    explanationHi: 'कंटेंट ID क्लेम एक स्वचालित व्यवस्था है जिसमें वीडियो चालू रहता है मगर कमाई मूल मालिक को जाती है। कॉपीराइट स्ट्राइक कानूनी नोटिस है, 90 दिनों में 3 स्ट्राइक से चैनल स्थायी रूप से बंद हो जाता है।',
    realWorldImpactEn: 'Avoid escalating an automated claim into a legal strike unless you are 100% sure you qualify under Fair Use.',
    realWorldImpactHi: 'जब तक आप पूरी तरह कानूनी रूप से सही न हों, बिना सोचे-समझे काउंटर-नोटिस न भेजें।',
  },
  {
    id: 'q4',
    questionEn: 'Can I use movie trailer footage in my YouTube video if I show my face, provide commentary, and review the plot?',
    questionHi: 'क्या मैं अपने वीडियो में फिल्म ट्रेलर का फुटेज इस्तेमाल कर सकता हूँ अगर मैं अपना चेहरा दिखाकर कहानी की समीक्षा करूँ?',
    optionsEn: [
      'Yes, genuine critique and review is protected under Fair Use / Fair Dealing.',
      'No, movie studios ban all use of trailers under all circumstances.',
      'Only if you do not earn money from the video.',
      'Only if you play the trailer at 2x speed.',
    ],
    optionsHi: [
      'हाँ, समीक्षा, विश्लेषण और आलोचना फेयर यूज़ (Fair Use / Fair Dealing) के तहत मान्य है।',
      'नहीं, फिल्में किसी भी हाल में इस्तेमाल नहीं की जा सकतीं।',
      'सिर्फ तभी अगर आप वीडियो से पैसे न कमा रहे हों।',
      'सिर्फ तभी अगर ट्रेलर को 2x स्पीड पर चलाया जाए।',
    ],
    correctIndex: 0,
    explanationEn: 'Under Section 107 of the US Copyright Act and Section 52 of the Indian Copyright Act, using brief excerpts of a work for criticism, review, and commentary is protected Fair Dealing / Fair Use.',
    explanationHi: 'भारतीय कॉपीराइट कानून की धारा 52 और अंतरराष्ट्रीय फेयर यूज़ के तहत, समीक्षा और आलोचना के लिए क्लिप का इस्तेमाल कानूनी रूप से सुरक्षित है।',
    realWorldImpactEn: 'Keep the movie clip brief, keep your voiceover active, and do not show entire unbroken scenes.',
    realWorldImpactHi: 'क्लिप को छोटा रखें (10-15 सेकंड), अपनी कमेंट्री लगातार जारी रखें, और पूरी कहानी बिना बोले न दिखाएं।',
  },
  {
    id: 'q5',
    questionEn: 'Where can creators find 100% legal, strike-free music for their social media videos?',
    questionHi: 'क्रिएटर्स अपने वीडियो के लिए 100% कानूनी और बिना स्ट्राइक वाला संगीत कहाँ से पा सकते हैं?',
    optionsEn: [
      'Downloading popular songs from unauthorized Telegram channels.',
      'YouTube Audio Library, Creative Commons (CC0 / CC-BY), or verified royalty-free libraries.',
      'Recording commercial songs with a phone microphone.',
      'Using slow-reverb versions of Bollywood songs.',
    ],
    optionsHi: [
      'टेलीग्राम चैनलों से गाने डाउनलोड करके।',
      'यूट्यूब ऑडियो लाइब्रेरी, क्रिएटिव कॉमन्स (CC0 / CC-BY), या सत्यापित रॉयल्टी-फ्री लाइब्रेरी से।',
      'फोन के माइक से गाने रिकॉर्ड करके।',
      'गानों का स्लो-रीवर्ब वर्जन इस्तेमाल करके।',
    ],
    correctIndex: 1,
    explanationEn: 'The YouTube Audio Library offers thousands of free tracks and sound effects cleared for commercial monetization. Creative Commons (CC0 and CC-BY) platforms also allow free legal use.',
    explanationHi: 'यूट्यूब ऑडियो लाइब्रेरी में हज़ारों फ्री ट्रैक्स उपलब्ध हैं जो मोनेटाइजेशन के लिए 100% सुरक्षित हैं। CC0 और CC-BY म्यूजिक भी पूरी तरह वैध है।',
    realWorldImpactEn: 'Slowed/Reverb tracks are still copyrighted and still match acoustic fingerprint databases!',
    realWorldImpactHi: 'स्लो-रीवर्ब गानों में भी ओरिजिनल गाना ही होता है, इसलिए वे भी पकड़े जाते हैं।',
  },
];

export const DrmAcademy: React.FC<DrmAcademyProps> = ({ lang }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'en' ? 'Educational Masterclass' : 'शैक्षणिक मास्टरक्लास'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'en' ? 'DRM & Copyright Law Academy' : 'DRM और कॉपीराइट कानून एकेडमी'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              {lang === 'en'
                ? 'Master the fundamentals of Digital Rights Management, the architecture of Content ID, and how creators protect their channels while making engaging content.'
                : 'डिजिटल राइट्स मैनेजमेंट (DRM), कंटेंट ID की कार्यप्रणाली और कॉपीराइट से सुरक्षित रहकर कंटेंट बनाने के नियमों को समझें।'}
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-xs text-blue-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>{lang === 'en' ? 'WIPO & DMCA Standards' : 'अंतरराष्ट्रीय कॉपीराइट मानक'}</span>
          </div>
        </div>
      </div>

      {/* 3 Core Educational Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {lang === 'en' ? '1. What is DRM?' : '1. DRM क्या है?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Digital Rights Management uses hardware cryptography (e.g. Google Widevine, Apple FairPlay) to prevent unauthorized decryption of streaming media. Bypassing DRM violates Section 1201 of the DMCA and Section 65A of the Indian Copyright Act, carrying criminal liabilities.'
                : 'DRM (जैसे Widevine, FairPlay) वीडियो स्ट्रीम्स को एनक्रिप्ट करके सुरक्षित रखता है। DRM को तकनीकी रूप से तोड़ना भारतीय कॉपीराइट कानून (धारा 65A) और अंतरराष्ट्रीय कानून के तहत दंडनीय अपराध है।'}
            </p>
          </div>
          <div className="text-[11px] text-blue-400 font-mono bg-blue-950/40 p-2.5 rounded-lg border border-blue-500/20">
            {lang === 'en' ? 'Key takeaway: True DRM cannot be legally stripped by websites.' : 'मुख्य बिंदु: वेबसाइट्स से DRM हटाना न कानूनी है न सुरक्षित।'}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {lang === 'en' ? '2. How Content ID Works' : '2. कंटेंट ID कैसे काम करता है?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Rights owners upload reference files. The platform generates perceptual acoustic and video neural hashes (spectrogram peaks and temporal vectors). When you upload, your video is scanned against 100M+ hashes in real-time within seconds.'
                : 'राइट्स मालिक अपने गानों व वीडियो की मास्टर कॉपी अपलोड करते हैं। सिस्टम उनके अकॉस्टिक और विजुअल फिंगरप्रिंट तैयार करता है। अपलोड होते ही आपका वीडियो 10 करोड़ से अधिक फिंगरप्रिंट्स से मैच किया जाता है।'}
            </p>
          </div>
          <div className="text-[11px] text-purple-400 font-mono bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/20">
            {lang === 'en' ? 'Actions: 1. Monetize (Ads) 2. Track 3. Block' : 'कार्रवाई: 1. कमाई ट्रांसफर 2. ट्रैक 3. ब्लॉक'}
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {lang === 'en' ? '3. Legal Safe Sourcing' : '3. सुरक्षित व कानूनी स्रोत'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Never download commercial songs from random websites. Instead, use YouTube Audio Library, Creative Commons (CC0 / CC-BY), or subscribe to creator licensing platforms. For video clips, always transform them with active original commentary.'
                : 'अवैध वेबसाइटों से गाने डाउनलोड न करें। हमेशा यूट्यूब ऑडियो लाइब्रेरी, क्रिएटिव कॉमन्स (CC0/CC-BY) का उपयोग करें। वीडियो क्लिप्स के साथ हमेशा अपनी आवाज में समीक्षा और कमेंट्री जोड़ें।'}
            </p>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
            {lang === 'en' ? 'Safe formula: Transformative Review + Safe Music' : 'सुरक्षित फार्मूला: मूल समीक्षा + सेफ ऑडियो'}
          </div>
        </div>
      </div>

      {/* Interactive Scenario Quiz */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{lang === 'en' ? 'Creator Knowledge Check (5 Scenarios)' : 'क्रिएटर ज्ञान परीक्षा (5 वास्तविक स्थितियां)'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Test your understanding with real-world scenarios faced by social media creators.'
                : 'सोशल मीडिया पर क्रिएटर्स के सामने आने वाले वास्तविक कॉपीराइट मामलों को हल करें।'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {showResults && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                {lang === 'en' ? 'Score:' : 'आपका स्कोर:'} {calculateScore()} / {quizQuestions.length}
              </span>
            )}
            <button
              onClick={() => setShowResults(!showResults)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-indigo-500/20"
            >
              {showResults
                ? (lang === 'en' ? 'Hide Answers' : 'उत्तर छुपाएं')
                : (lang === 'en' ? 'Check My Answers' : 'उत्तर जांचें')}
            </button>
          </div>
        </div>

        {/* Quiz Items */}
        <div className="space-y-6">
          {quizQuestions.map((q, qIndex) => {
            const chosen = selectedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctIndex;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-200">
                    <span className="text-indigo-400 font-mono mr-2">Q{qIndex + 1}.</span>
                    {lang === 'en' ? q.questionEn : q.questionHi}
                  </h4>
                  {showResults && isAnswered && (
                    <span className="shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(lang === 'en' ? q.optionsEn : q.optionsHi).map((opt, optIdx) => {
                    const isThisSelected = chosen === optIdx;
                    const isThisCorrect = optIdx === q.correctIndex;

                    let btnClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (showResults) {
                      if (isThisCorrect) {
                        btnClass = 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-medium';
                      } else if (isThisSelected && !isThisCorrect) {
                        btnClass = 'bg-red-950/50 border-red-500 text-red-300';
                      }
                    } else if (isThisSelected) {
                      btnClass = 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnClass}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-slate-400">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card when results are toggled */}
                {showResults && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Explanation' : 'व्याख्या'}:</span>
                    </div>
                    <p>{lang === 'en' ? q.explanationEn : q.explanationHi}</p>
                    <p className="text-[11px] text-slate-400 font-mono pt-1">
                      💡 {lang === 'en' ? q.realWorldImpactEn : q.realWorldImpactHi}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
