import React, { useState } from 'react';
import { SessionAnalysis, PracticeSession } from '../types';
import { 
  Activity, 
  MessageSquare, 
  Mic2, 
  User, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Feather,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Award
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface AnalysisDisplayProps {
  analysis: SessionAnalysis;
  history: PracticeSession[];
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, history }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'refinement' | 'verbal' | 'delivery' | 'mannerisms'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-red-500';
  };

  // Prepare small history data for sparklines
  const recentHistory = history.slice(-5);
  const showSparklines = recentHistory.length > 1;
  const clarityData = recentHistory.map(h => ({ val: h.analysis.metrics.clarityScore }));
  const fillerData = recentHistory.map(h => ({ val: h.analysis.metrics.fillerWordCount }));

  const Sparkline = ({ data, color }: { data: any[], color: string }) => (
    <div className="h-8 w-20 ml-2">
       <ResponsiveContainer width="100%" height="100%">
         <LineChart data={data}>
           <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
           <YAxis domain={['auto', 'auto']} hide />
         </LineChart>
       </ResponsiveContainer>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-4 border-b-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
        activeTab === id 
        ? 'border-gold text-gold bg-white/5' 
        : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon className="w-3 h-3 md:w-4 md:h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-surface shadow-2xl border border-slate-800 overflow-hidden relative">
       <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto bg-primary border-b border-slate-800 scrollbar-hide">
        <TabButton id="overview" label="Overview" icon={Activity} />
        <TabButton id="refinement" label="Master's Revision" icon={Feather} />
        <TabButton id="verbal" label="Verbal" icon={MessageSquare} />
        <TabButton id="delivery" label="Delivery" icon={Mic2} />
        <TabButton id="mannerisms" label="Mannerisms" icon={User} />
      </div>

      <div className="p-4 md:p-8 min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            
            {analysis.enhancements.recurringAlert && (
              <div className="bg-red-900/20 border border-red-800 p-4 flex items-start gap-3 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/>
                <div>
                   <h4 className="text-red-500 text-xs font-bold uppercase tracking-widest">Recidivism Alert</h4>
                   <p className="text-slate-300 text-sm mt-1">{analysis.enhancements.recurringAlert}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary p-4 md:p-6 border border-slate-800 text-center flex flex-col items-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">Clarity</p>
                <p className={`text-3xl md:text-4xl font-serif font-bold ${getScoreColor(analysis.metrics.clarityScore)}`}>
                  {analysis.metrics.clarityScore}
                </p>
                {showSparklines && <Sparkline data={clarityData} color="#C5A059" />}
              </div>
              <div className="bg-primary p-4 md:p-6 border border-slate-800 text-center flex flex-col items-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">Fillers</p>
                <p className={`text-3xl md:text-4xl font-serif font-bold ${analysis.metrics.fillerWordCount > 5 ? 'text-red-500' : 'text-success'}`}>
                  {analysis.metrics.fillerWordCount}
                </p>
                 {showSparklines && <Sparkline data={fillerData} color="#ef4444" />}
              </div>
              <div className="bg-primary p-4 md:p-6 border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">Pacing (WPM)</p>
                <p className="text-3xl md:text-4xl font-serif font-bold text-white">
                  {analysis.metrics.wordsPerMinute}
                </p>
              </div>
              <div className="bg-primary p-4 md:p-6 border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">Eye Contact</p>
                <p className={`text-3xl md:text-4xl font-serif font-bold ${getScoreColor(analysis.metrics.eyeContactScore)}`}>
                  {analysis.metrics.eyeContactScore}%
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8">
              <h3 className="text-sm font-bold text-gold uppercase tracking-widest flex items-center space-x-2 mb-6">
                <Zap className="w-4 h-4 text-gold" />
                <span>Critical Enhancements</span>
              </h3>
              <div className="space-y-4">
                {analysis.enhancements.topAreas.map((item, idx) => (
                  <div key={idx} className="flex items-start p-4 bg-primary border border-l-4 border-l-red-900 border-slate-800">
                    <AlertCircle className="w-5 h-5 text-red-700 mt-0.5 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200 uppercase text-xs tracking-wider mb-1">{item.area}</p>
                      <p className="text-sm text-slate-400 font-light">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary to-surface border border-gold/30 p-6 mt-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-3">Next Session Mandate</h4>
              <p className="text-lg font-serif italic text-white leading-relaxed">"{analysis.enhancements.exercise}"</p>
            </div>
          </div>
        )}

        {/* Master's Revision Tab */}
        {activeTab === 'refinement' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Original vs Refined */}
               <div className="bg-primary p-6 border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Original Transcript</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-mono whitespace-pre-wrap">{analysis.transcript}</p>
               </div>
               <div className="bg-primary p-6 border border-gold/30 relative">
                   <div className="absolute top-0 right-0 p-2">
                      <Feather className="w-4 h-4 text-gold opacity-50"/>
                   </div>
                  <h4 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4">The Master's Revision</h4>
                  <p className="text-white text-base leading-relaxed font-serif">{analysis.refinedTranscript}</p>
               </div>
            </div>

            <div className="border-t border-slate-800 pt-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Coaching Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Structural */}
                 <div className="bg-surface p-5 border-t-2 border-slate-600">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-slate-400"/>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Structural Shifts</h4>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{analysis.coachingBreakdown.structuralShifts}</p>
                 </div>
                 
                 {/* Vocabulary */}
                 <div className="bg-surface p-5 border-t-2 border-gold">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-gold"/>
                      <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Vocabulary Elevation</h4>
                    </div>
                    <div className="space-y-3">
                       {analysis.coachingBreakdown.vocabularyElevation.map((item, i) => (
                         <div key={i} className="text-sm">
                            <div className="flex items-center gap-2 text-xs font-mono mb-1">
                               <span className="text-slate-500 line-through">{item.original}</span>
                               <ArrowRight className="w-3 h-3 text-slate-600"/>
                               <span className="text-white font-bold">{item.improved}</span>
                            </div>
                            <p className="text-xs text-slate-500 italic">{item.context}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Efficiency */}
                 <div className="bg-surface p-5 border-t-2 border-success">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-success"/>
                      <h4 className="text-xs font-bold text-success uppercase tracking-wider">Efficiency Wins</h4>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{analysis.coachingBreakdown.efficiencyWins}</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Verbal Tab */}
        {activeTab === 'verbal' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Filler Word Detection</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.verbal.fillerWords.length > 0 ? (
                    analysis.verbal.fillerWords.map((word, i) => (
                      <span key={i} className="px-4 py-1 bg-red-900/20 border border-red-900/50 text-red-400 rounded-none text-xs font-mono">
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-success flex items-center text-sm"><CheckCircle2 className="w-4 h-4 mr-2"/> Clean Record</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Vocabulary Assessment</h4>
                <p className="text-white font-serif text-lg mb-2">{analysis.verbal.vocabularyRichness}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{analysis.verbal.wordChoiceAlignment}</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8">
              <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-6">Tactical Rephrasing</h3>
              <div className="space-y-4">
                {analysis.enhancements.rephrasing.map((item, idx) => (
                  <div key={idx} className="bg-primary p-6 border border-slate-800">
                     <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-2">Weakness</p>
                          <p className="text-slate-500 line-through decoration-red-900 font-serif italic">{item.original}</p>
                        </div>
                        <div className="hidden md:block text-slate-600">→</div>
                        <div className="flex-1">
                          <p className="text-[10px] text-success font-bold uppercase tracking-wider mb-2">Correction</p>
                          <p className="text-white font-serif font-medium">{item.improved}</p>
                        </div>
                     </div>
                     <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-800">
                        <span className="text-gold uppercase tracking-wider text-[10px] font-bold mr-2">Rationale:</span> {item.reason}
                     </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
             <div className="grid grid-cols-1 gap-4">
               <div className="p-6 bg-primary border border-slate-800">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Pacing & Tempo</h4>
                  <p className="text-slate-300 font-light">{analysis.delivery.pacing}</p>
               </div>
               <div className="p-6 bg-primary border border-slate-800">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Tone Analysis</h4>
                  <p className="text-slate-300 font-light">{analysis.delivery.toneAnalysis}</p>
               </div>
               <div className="p-6 bg-primary border border-slate-800">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Volume Consistency</h4>
                  <p className="text-slate-300 font-light">{analysis.delivery.volumeConsistency}</p>
               </div>
             </div>
          </div>
        )}

        {/* Mannerisms Tab */}
        {activeTab === 'mannerisms' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
             <div className="grid grid-cols-1 gap-4">
               <div className="p-6 bg-primary border border-slate-800">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Eye Contact</h4>
                  <p className="text-slate-300 font-light">{analysis.mannerisms.eyeContactAnalysis}</p>
               </div>
               <div className="p-6 bg-primary border border-slate-800">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Hand Gestures</h4>
                  <p className="text-slate-300 font-light">{analysis.mannerisms.gestures}</p>
               </div>
               <div className="p-6 bg-primary border border-slate-800">
                  <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Posture</h4>
                  <p className="text-slate-300 font-light">{analysis.mannerisms.posture}</p>
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalysisDisplay;