import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Mic, 
  BarChart2, 
  User, 
  ChevronRight, 
  PlayCircle,
  Calendar,
  Award,
  Crown,
  History,
  Edit3
} from 'lucide-react';
import { 
  UserProfile, 
  ViewState, 
  PracticeSession, 
  CustomPersona
} from './types';
import VideoRecorder from './components/VideoRecorder';
import AnalysisDisplay from './components/AnalysisDisplay';
import { generateDailyTopic, analyzeVideoSession } from './services/geminiService';

// --- Helper Components ---

const Header = ({ 
  user, 
  onChangeView, 
  currentView 
}: { 
  user: UserProfile | null, 
  onChangeView: (v: ViewState) => void,
  currentView: ViewState
}) => (
  <header className="bg-primary border-b border-surface sticky top-0 z-50 shadow-md shadow-black">
    <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => user && onChangeView(ViewState.DASHBOARD)}>
        <div className="w-10 h-10 border border-gold bg-primary flex items-center justify-center rounded">
          <Crown className="text-gold w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif font-bold text-gold text-lg tracking-widest uppercase">The Ledger</span>
          <span className="text-[10px] text-slate-500 tracking-widest uppercase">Communication Mastery</span>
        </div>
      </div>
      
      {user && (
        <nav className="flex items-center space-x-8">
          <button 
            onClick={() => onChangeView(ViewState.DASHBOARD)}
            className={`flex items-center space-x-2 text-sm font-bold tracking-wider uppercase transition-colors ${currentView === ViewState.DASHBOARD ? 'text-gold' : 'text-slate-500 hover:text-white'}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>
          <button 
             onClick={() => onChangeView(ViewState.PRACTICE)}
             className={`flex items-center space-x-2 text-sm font-bold tracking-wider uppercase transition-colors ${currentView === ViewState.PRACTICE ? 'text-gold' : 'text-slate-500 hover:text-white'}`}
          >
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Engage</span>
          </button>
          <div className="w-10 h-10 bg-surface border border-slate-700 rounded flex items-center justify-center text-gold font-serif font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
        </nav>
      )}
    </div>
  </header>
);

// --- Views ---

const OnboardingView = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    name: string;
    goal: string;
    customGoal: string;
    personaType: string;
    customPersona: CustomPersona;
  }>({ 
    name: '', 
    goal: '', 
    customGoal: '', 
    personaType: '', 
    customPersona: { name: '', traits: '', adopt: '', avoid: '' } 
  });

  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [isCustomPersona, setIsCustomPersona] = useState(false);

  const handleSubmit = () => {
    onComplete({
      name: formData.name,
      primaryGoal: isCustomGoal ? formData.customGoal : formData.goal,
      isCustomGoal,
      preferredPersona: isCustomPersona ? 'Custom' : formData.personaType,
      customPersona: isCustomPersona ? formData.customPersona : undefined,
      level: 1,
      streak: 0
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 bg-primary text-silver">
      <div className="max-w-lg w-full bg-surface border border-gold/30 p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
        
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-bold text-white mb-2 uppercase tracking-widest">Identify Yourself</h1>
          <p className="text-slate-400 font-light text-sm">State your intentions and desired stature.</p>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <label className="block">
              <span className="text-xs font-bold text-gold uppercase tracking-wider mb-2 block">Name</span>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-primary border border-slate-700 text-white p-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                placeholder="Enter your name"
              />
            </label>
            <button 
              disabled={!formData.name}
              onClick={() => setStep(2)}
              className="w-full bg-gold text-primary font-bold py-3 uppercase tracking-wider hover:bg-goldlight disabled:opacity-50 transition"
            >
              Proceed
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <label className="block">
              <span className="text-xs font-bold text-gold uppercase tracking-wider mb-2 block">Primary Objective</span>
              
              <div className="space-y-3">
                {[
                  "Sound more confident in meetings",
                  "Speak clearly under pressure",
                  "Command authority",
                  "Master storytelling"
                ].map(g => (
                  <div 
                    key={g}
                    onClick={() => { setFormData({...formData, goal: g}); setIsCustomGoal(false); }}
                    className={`p-3 border cursor-pointer transition-all ${!isCustomGoal && formData.goal === g ? 'border-gold bg-gold/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    {g}
                  </div>
                ))}
                
                <div 
                  onClick={() => setIsCustomGoal(true)}
                  className={`p-3 border cursor-pointer transition-all ${isCustomGoal ? 'border-gold bg-gold/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  <span className="flex items-center gap-2"><Edit3 className="w-4 h-4"/> Write My Own Goal</span>
                </div>
              </div>

              {isCustomGoal && (
                <textarea 
                  value={formData.customGoal}
                  onChange={(e) => setFormData({...formData, customGoal: e.target.value})}
                  className="mt-3 w-full bg-primary border border-gold text-white p-3 focus:outline-none h-24 text-sm"
                  placeholder="E.g., Speak slowly, eliminate 'uhm', and maintain fierce eye contact."
                />
              )}
            </label>
            <button 
              disabled={(!isCustomGoal && !formData.goal) || (isCustomGoal && !formData.customGoal)}
              onClick={() => setStep(3)}
              className="w-full bg-gold text-primary font-bold py-3 uppercase tracking-wider hover:bg-goldlight disabled:opacity-50 transition"
            >
              Proceed
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <label className="block">
              <span className="text-xs font-bold text-gold uppercase tracking-wider mb-2 block">Target Archetype</span>
              <p className="text-xs text-slate-500 mb-4">Who do you intend to emulate?</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {['Authoritative Leader', 'Stoic Professional', 'Witty Conversationalist', 'Calm Expert'].map(p => (
                  <button
                    key={p}
                    onClick={() => { setFormData({...formData, personaType: p}); setIsCustomPersona(false); }}
                    className={`text-xs py-3 px-2 border transition ${!isCustomPersona && formData.personaType === p ? 'border-gold bg-gold text-primary font-bold' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsCustomPersona(true)}
                className={`w-full text-xs py-3 px-2 border transition mb-4 ${isCustomPersona ? 'border-gold bg-gold/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                + Create Custom Persona (e.g., Shelby, Tate)
              </button>

              {isCustomPersona && (
                <div className="space-y-3 bg-primary/50 p-4 border border-slate-700">
                  <input 
                    placeholder="Archetype Name (e.g., Thomas Shelby)"
                    className="w-full bg-primary border border-slate-700 p-2 text-sm focus:border-gold outline-none"
                    value={formData.customPersona.name}
                    onChange={e => setFormData({...formData, customPersona: {...formData.customPersona, name: e.target.value}})}
                  />
                  <input 
                    placeholder="Traits (e.g., Low pitch, slow tempo)"
                    className="w-full bg-primary border border-slate-700 p-2 text-sm focus:border-gold outline-none"
                    value={formData.customPersona.traits}
                    onChange={e => setFormData({...formData, customPersona: {...formData.customPersona, traits: e.target.value}})}
                  />
                   <div className="grid grid-cols-2 gap-2">
                    <input 
                      placeholder="Adopt (Words/Habits)"
                      className="w-full bg-primary border border-slate-700 p-2 text-sm focus:border-gold outline-none"
                      value={formData.customPersona.adopt}
                      onChange={e => setFormData({...formData, customPersona: {...formData.customPersona, adopt: e.target.value}})}
                    />
                    <input 
                      placeholder="Avoid (Words/Habits)"
                      className="w-full bg-primary border border-slate-700 p-2 text-sm focus:border-gold outline-none"
                      value={formData.customPersona.avoid}
                      onChange={e => setFormData({...formData, customPersona: {...formData.customPersona, avoid: e.target.value}})}
                    />
                   </div>
                </div>
              )}
            </label>
            <button 
              disabled={(!isCustomPersona && !formData.personaType) || (isCustomPersona && !formData.customPersona.name)}
              onClick={handleSubmit}
              className="w-full bg-gold text-primary font-bold py-3 uppercase tracking-wider hover:bg-goldlight disabled:opacity-50 transition mt-2"
            >
              Finalize Ledger
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardView = ({ 
  user, 
  history,
  onStartPractice,
  onViewSession
}: { 
  user: UserProfile, 
  history: PracticeSession[],
  onStartPractice: () => void,
  onViewSession: (s: PracticeSession) => void
}) => {
  const chartData = useMemo(() => {
    return history.slice(-7).map((h, i) => ({
      day: `Day ${i + 1}`,
      clarity: h.analysis.metrics.clarityScore,
      fillers: h.analysis.metrics.fillerWordCount
    }));
  }, [history]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Welcome back, {user.name}.</h1>
          <p className="text-slate-500 uppercase tracking-widest text-xs">Streak: <span className="text-gold font-bold">{user.streak} Days</span></p>
        </div>
        <button 
          onClick={onStartPractice}
          className="bg-gold hover:bg-goldlight text-primary px-8 py-4 font-bold uppercase tracking-widest transition shadow-lg shadow-gold/20 flex items-center justify-center space-x-3 border border-transparent hover:border-white"
        >
          <PlayCircle className="w-5 h-5" />
          <span>Commence Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="bg-surface p-8 border border-slate-800 shadow-xl relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
          <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-8 flex items-center gap-2">
            <BarChart2 className="w-4 h-4"/> Performance Trajectory
          </h3>
          <div className="h-64 w-full">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" hide />
                  <YAxis domain={[0, 100]} stroke="#666" tick={{fill: '#666', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#C5A059', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="clarity" stroke="#C5A059" strokeWidth={2} dot={{ fill: '#C5A059' }} activeDot={{ r: 6, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 font-serif italic border border-dashed border-slate-800">
                Awaiting Data
              </div>
            )}
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="flex flex-col gap-8">
           <div className="bg-surface p-8 border border-slate-800 shadow-xl relative">
             <div className="absolute top-0 left-0 w-1 h-full bg-slate-700"></div>
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Award className="w-4 h-4"/> Mandate & Archetype
            </h3>
            <div className="space-y-4">
              <div className="bg-primary p-4 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-xs uppercase tracking-wider">Goal</span>
                <span className="text-white text-sm font-medium text-right max-w-[60%]">{user.primaryGoal}</span>
              </div>
              <div className="bg-primary p-4 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-xs uppercase tracking-wider">Persona</span>
                <span className="text-gold text-sm font-bold font-serif">
                   {user.preferredPersona === 'Custom' && user.customPersona ? user.customPersona.name : user.preferredPersona}
                </span>
              </div>
            </div>
           </div>
           
           <div className="bg-surface p-8 border border-slate-800 shadow-xl flex-grow relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-700"></div>
              <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-6 flex items-center gap-2">
                <History className="w-4 h-4"/> Recent Log
              </h3>
              {history.length === 0 ? (
                <p className="text-sm text-slate-600 italic font-serif text-center mt-4">No sessions recorded in the ledger.</p>
              ) : (
                <div className="space-y-3">
                  {history.slice().reverse().slice(0, 3).map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => onViewSession(session)}
                      className="flex items-center justify-between text-sm p-3 bg-primary border border-slate-800 hover:border-gold cursor-pointer transition group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className="text-slate-500 font-mono text-xs">{new Date(session.date).toLocaleDateString()}</span>
                        <span className="truncate max-w-[150px] font-medium text-slate-300 group-hover:text-white transition">{session.topic}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                         <span className={`text-xs font-bold font-mono ${session.analysis.metrics.clarityScore > 80 ? 'text-success' : 'text-warning'}`}>
                           {session.analysis.metrics.clarityScore}
                         </span>
                         <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-gold" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const PracticeView = ({ 
  user, 
  history,
  onFinish 
}: { 
  user: UserProfile, 
  history: PracticeSession[],
  onFinish: (session: PracticeSession) => void 
}) => {
  const [topic, setTopic] = useState<string>('');
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      const t = await generateDailyTopic(user, user.level || 1);
      setTopic(t);
      setLoadingTopic(false);
    };
    fetchTopic();
  }, [user]);

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setProcessing(true);
    try {
      const analysis = await analyzeVideoSession(blob, user, topic, history);
      const newSession: PracticeSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        topic,
        durationSeconds: duration,
        analysis
      };
      onFinish(newSession);
    } catch (err) {
      alert("Failed to analyze video. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500 flex flex-col items-center">
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1 border border-gold text-gold rounded-none text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
          Daily Protocol • Day {user.level || 1}
        </span>
        <h2 className="text-lg text-slate-400 uppercase tracking-widest mb-4">Subject Matter</h2>
        {loadingTopic ? (
          <div className="h-8 w-64 bg-surface animate-pulse mx-auto border border-slate-700" />
        ) : (
          <p className="text-2xl md:text-3xl font-serif font-bold text-white leading-relaxed">"{topic}"</p>
        )}
      </div>

      <div className="w-full max-w-2xl bg-surface p-1 rounded-none shadow-2xl border border-gold/50">
        <VideoRecorder 
          onRecordingComplete={handleRecordingComplete} 
          isProcessing={processing}
        />
      </div>
      
      <div className="mt-8 max-w-lg text-center text-sm text-slate-500 font-serif italic">
        <p>Maintain the demeanor of: <span className="text-gold">{user.preferredPersona === 'Custom' && user.customPersona ? user.customPersona.name : user.preferredPersona}</span></p>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load state from localStorage on mount ONLY
  useEffect(() => {
    const storedUser = localStorage.getItem('cit_user');
    const storedHistory = localStorage.getItem('cit_history');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setView(ViewState.DASHBOARD);
    }
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    setLoaded(true);
  }, []);

  // Save state updates (Only if loaded to prevent overwriting with empty)
  useEffect(() => {
    if (loaded && user) {
      localStorage.setItem('cit_user', JSON.stringify(user));
    }
  }, [user, loaded]);

  useEffect(() => {
    if (loaded && history.length > 0) {
      localStorage.setItem('cit_history', JSON.stringify(history));
    }
  }, [history, loaded]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    // Explicit save here to ensure immediate persistence
    localStorage.setItem('cit_user', JSON.stringify(profile));
    setView(ViewState.DASHBOARD);
  };

  const handleSessionComplete = (session: PracticeSession) => {
    const newHistory = [...history, session];
    setHistory(newHistory);
    localStorage.setItem('cit_history', JSON.stringify(newHistory));
    
    if (user) {
       const updatedUser = {...user, streak: user.streak + 1, level: user.level + 1};
       setUser(updatedUser);
       localStorage.setItem('cit_user', JSON.stringify(updatedUser));
    }
    setSelectedSession(session);
    setView(ViewState.ANALYSIS_RESULT);
  };

  // Prevent flicker
  if (!loaded) return <div className="min-h-screen bg-primary"></div>;

  return (
    <div className="min-h-screen bg-primary text-silver font-sans selection:bg-gold selection:text-primary">
      <Header 
        user={user} 
        onChangeView={(v) => {
          setView(v);
          setSelectedSession(null);
        }} 
        currentView={view}
      />
      
      <main className="pb-12">
        {view === ViewState.ONBOARDING && (
          <OnboardingView onComplete={handleOnboardingComplete} />
        )}
        
        {view === ViewState.DASHBOARD && user && (
          <DashboardView 
            user={user} 
            history={history}
            onStartPractice={() => setView(ViewState.PRACTICE)}
            onViewSession={(session) => {
              setSelectedSession(session);
              setView(ViewState.ANALYSIS_RESULT);
            }}
          />
        )}
        
        {view === ViewState.PRACTICE && user && (
          <PracticeView user={user} history={history} onFinish={handleSessionComplete} />
        )}

        {view === ViewState.ANALYSIS_RESULT && selectedSession && (
           <div className="max-w-5xl mx-auto px-6 py-10 animate-in fade-in duration-500">
             <button 
               onClick={() => setView(ViewState.DASHBOARD)} 
               className="mb-6 text-xs text-gold hover:text-white uppercase tracking-widest flex items-center space-x-2 transition-colors"
             >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Return to Overview</span>
             </button>
             <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                <div>
                   <h2 className="text-3xl font-serif font-bold text-white mb-2">Analysis Report</h2>
                   <p className="text-slate-500 text-xs uppercase tracking-widest">{new Date(selectedSession.date).toLocaleDateString()} • {selectedSession.topic}</p>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Clarity Index</div>
                   <div className="text-4xl font-bold text-gold font-serif">{selectedSession.analysis.metrics.clarityScore}</div>
                </div>
             </div>
             <AnalysisDisplay analysis={selectedSession.analysis} history={history} />
           </div>
        )}
      </main>
    </div>
  );
};

export default App;