import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";

// --- 1. ATMOSPHERE ENGINE (Visuals) ---
function AtmosphereEngine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#fdfafb]">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-pink-200/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-sky-200/20 blur-[100px] rounded-full"></div>
      {[...Array(15)].map((_, i) => (
        <div key={`p-${i}`} className="sakura-petal" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${12 + Math.random() * 8}s`
        }}>🌸</div>
      ))}
      {[...Array(6)].map((_, i) => (
        <div key={`l-${i}`} className="floating-lantern" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 15}s`,
          animationDuration: `${20 + Math.random() * 10}s`
        }}>🏮</div>
      ))}
      <style>{`
        .sakura-petal { position: absolute; top: -10%; color: #fce7f3; font-size: 20px; animation: fall linear infinite; }
        .floating-lantern { position: absolute; bottom: -10%; font-size: 24px; filter: drop-shadow(0 0 10px #fbbf24); animation: floatUp linear infinite; opacity: 0.6; }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1) rotate(-5deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-110vh) scale(1.2) rotate(5deg); opacity: 0; }
        }
      `}</style>
      <div className="absolute bottom-0 w-full h-96 bg-gradient-to-t from-[#fbcfe8]/40 via-[#e0f2fe]/30 to-transparent"></div>
    </div>
  );
}

// --- 2. ENHANCED NAV DROPDOWN (Bigger Text) ---
function NavDropdown({ title, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const out = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", out); return () => document.removeEventListener("mousedown", out);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="px-8 py-3 text-lg font-black text-slate-700 hover:text-pink-600 transition-all uppercase tracking-[0.2em] flex items-center gap-3 bg-white/50 rounded-full border-2 border-white/80 shadow-sm"
      >
        {title} <span className="text-pink-400 text-sm">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-72 bg-white/95 backdrop-blur-2xl border-2 border-pink-100 shadow-2xl rounded-[2.5rem] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4">
          {options.map((o, i) => (
            <Link key={i} to={o.path} onClick={() => setIsOpen(false)} className="block px-10 py-6 text-sm font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 border-b border-pink-50 last:border-0 uppercase tracking-widest italic">
              ✦ {o.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 3. DYNAMIC VIEWS ---

function StudentDashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [ann, setAnn] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: s } = await supabase.from('Subjects').select('*').order('id', { ascending: true });
      const { data: a } = await supabase.from('Announcements').select('*').order('created_at', { descending: true });
      if (s) setSubjects(s); if (a) setAnn(a);
    }
    fetchData();
  }, []);

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-20 scrollbar-hide">
        <div className="relative mb-20 p-24 rounded-[5rem] bg-gradient-to-br from-pink-500 via-rose-400 to-orange-300 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <h1 className="text-9xl font-serif italic text-white tracking-tighter leading-none relative z-10">Afternoon Shallows</h1>
          <p className="text-lg font-black text-white/90 uppercase tracking-[1em] mt-10 italic relative z-10">✦ DRIFTING THROUGH THE CURRICULUM ✦</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mt-12">
          {subjects.map(s => (
            <div key={s.id} onClick={() => navigate(`/subject/${s.id}`)} className="group relative bg-white/60 backdrop-blur-md p-16 rounded-[4rem] border-4 border-white shadow-xl hover:shadow-pink-200/50 hover:bg-white transition-all duration-500 cursor-pointer overflow-hidden">
              <h3 className="text-5xl font-serif italic text-slate-800 relative z-10">{s.subject_name}</h3>
              <p className="text-sm font-black text-pink-400 uppercase mt-6 tracking-[0.4em] italic relative z-10">Open Learning Scroll ✦</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-[30rem] bg-white/40 border-l-4 border-white/60 p-16 backdrop-blur-3xl shadow-2xl">
        <h2 className="text-lg font-black uppercase text-slate-500 mb-12 tracking-[0.5em] border-b-4 border-pink-100 pb-8 flex items-center gap-4">
          <span className="text-3xl">🐚</span> NOTICES
        </h2>
        <div className="space-y-10">
          {ann.map(a => (
            <div key={a.id} className="p-10 bg-white/90 rounded-[3rem] text-lg italic text-slate-600 border-2 border-pink-50 shadow-md">
              "{a.content}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectDetail() {
  const { id } = useParams();
  const [activeLesson, setActiveLesson] = useState(1);
  const [activeTab, setActiveTab] = useState("video");
  const [subjectName, setSubjectName] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const lessons = [1, 2, 3, 4, 5];

  useEffect(() => {
    async function getSubject() {
      const { data } = await supabase.from('Subjects').select('subject_name').eq('id', id).single();
      if (data) setSubjectName(data.subject_name);
    }
    getSubject();
  }, [id]);

  const handleSelect = (idx, opt) => { if (!quizScore) setSelectedAnswers({ ...selectedAnswers, [idx]: opt }); };

  const submitQuiz = async () => {
    if (Object.keys(selectedAnswers).length < 10) return;
    const score = Math.floor(Math.random() * 2) + 8;
    const finalGrade = `${score}/10`;
    setQuizScore(finalGrade);
    await supabase.from('Submissions').insert([{ student_name: "Shore Scholar", material_title: `${subjectName} Lesson ${activeLesson}`, file_url: `Score: ${finalGrade}`, status: 'Completed' }]);
  };

  return (
    <div className="flex h-full bg-white/20 animate-in zoom-in-95 duration-1000">
      <div className="w-[28rem] bg-white/50 border-r-4 border-white/60 flex flex-col backdrop-blur-2xl shadow-2xl">
        <div className="p-16 bg-gradient-to-br from-pink-400 to-rose-300 text-white rounded-br-[6rem] shadow-2xl">
          <Link to="/" className="text-sm font-black uppercase tracking-widest mb-8 block hover:translate-x-2 transition-transform">↞ THE HORIZON</Link>
          <h2 className="text-4xl font-serif italic leading-tight">{subjectName}</h2>
        </div>
        <div className="flex-1 py-16 overflow-y-auto space-y-6 px-8">
          {lessons.map(num => (
            <button key={num} onClick={() => {setActiveLesson(num); setActiveTab("video"); setQuizScore(null); setSelectedAnswers({});}} 
              className={`w-full text-left px-12 py-10 transition-all rounded-[3rem] flex items-center justify-between group ${activeLesson === num ? 'bg-white shadow-2xl text-pink-500 scale-105' : 'text-slate-500 hover:bg-white/40'}`}>
              <span className="text-lg font-black uppercase tracking-[0.3em]">Lesson 0{num}</span>
              <span className={`text-3xl transition-transform duration-500 ${activeLesson === num ? 'rotate-12' : 'group-hover:rotate-12'}`}>🐚</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="h-40 border-b-4 border-white/60 flex items-center px-24 gap-20 bg-white/40 backdrop-blur-xl">
          {['video', 'document', 'quiz'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`text-lg font-black uppercase tracking-[0.5em] transition-all relative py-6 ${activeTab === tab ? 'text-pink-500' : 'text-slate-500 hover:text-pink-300'}`}>
              {tab === 'video' ? 'Canto' : tab === 'document' ? 'Scroll' : 'Reflection'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-2 bg-pink-400 rounded-full shadow-[0_0_15px_#f43f5e]"></div>}
            </button>
          ))}
        </div>

        <div className="flex-1 p-24 overflow-y-auto bg-gradient-to-br from-white/10 to-[#fdfafb]">
          {activeTab === "video" && (
            <div className="h-full flex flex-col items-center">
              <div className="w-full aspect-video bg-white rounded-[6rem] shadow-2xl border-[32px] border-white overflow-hidden ring-12 ring-pink-50/50">
                 <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowFullScreen />
              </div>
              <h3 className="mt-16 text-6xl font-serif italic text-slate-800">Lesson {activeLesson}</h3>
            </div>
          )}
          
          {activeTab === "quiz" && (
            <div className="max-w-4xl mx-auto space-y-16 pb-40">
              <h3 className="text-6xl font-serif italic text-center text-slate-800">Evening Reflection</h3>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-16 bg-white rounded-[5rem] border-4 border-pink-50 shadow-2xl">
                  <p className="font-serif italic text-slate-700 mb-12 text-3xl">0{i+1}. Identify the shifting petal in this coastal arc?</p>
                  <div className="grid grid-cols-1 gap-6">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <button key={opt} onClick={() => handleSelect(i, opt)}
                        className={`w-full text-left p-10 rounded-[3rem] border-4 text-lg font-black transition-all ${selectedAnswers[i] === opt ? 'bg-gradient-to-r from-pink-500 to-rose-400 border-none text-white shadow-2xl scale-[1.03]' : 'border-pink-50 text-slate-400 hover:bg-pink-50'}`}>
                        Option {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={submitQuiz} className="w-full py-12 bg-slate-900 text-white font-black uppercase tracking-[1em] rounded-full text-lg shadow-2xl hover:bg-pink-500 transition-all duration-500">SUBMIT REFLECTION</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 4. MASTER LAYOUT (Sidebar text increase) ---
function Layout({ children }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full bg-[#fdfafb] font-sans overflow-hidden text-slate-800">
      <AtmosphereEngine />
      
      <aside className="w-[30rem] bg-white/40 border-r-4 border-white/60 flex flex-col z-50 backdrop-blur-3xl shadow-2xl">
        <div className="p-20 text-center border-b-4 border-white/60 bg-gradient-to-br from-pink-50/50 to-white/50">
          <h1 onClick={() => navigate('/')} className="text-6xl font-serif italic tracking-tighter text-pink-500 cursor-pointer hover:scale-105 transition-transform">Sakura Shores</h1>
          <p className="text-sm font-black uppercase tracking-[0.5em] text-pink-300 mt-8 italic">INSTITUTIONAL LMS</p>
        </div>
        <nav className="p-16 space-y-10 mt-12 flex-1">
          <button onClick={() => navigate('/')} className="w-full text-left p-10 rounded-[4rem] bg-white shadow-xl text-slate-600 hover:text-pink-500 font-black uppercase text-xl tracking-widest transition-all border-4 border-transparent hover:border-pink-100">THE HORIZON</button>
          <button onClick={() => navigate('/attendance')} className="w-full text-left p-10 rounded-[4rem] bg-white/60 shadow-md text-slate-600 hover:text-pink-500 font-black uppercase text-xl tracking-widest transition-all border-4 border-transparent hover:border-pink-100">REGISTRY</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-40 bg-white/20 backdrop-blur-2xl border-b-4 border-white/60 px-24 flex items-center justify-between z-40">
          <div className="flex items-center gap-12">
            <NavDropdown title="Academy" options={[{label: "Subjects", path: "/"}, {label: "Courses", path: "/"}]} />
            <NavDropdown title="Trials" options={[{label: "Assignments", path: "/assignments"}, {label: "Quizzes", path: "/"}]} />
            <NavDropdown title="Archive" options={[{label: "Profiles", path: "/"}, {label: "Submissions", path: "/assignments"}]} />
          </div>
          <div className="w-24 h-24 rounded-full bg-white border-8 border-pink-100 flex items-center justify-center text-5xl shadow-2xl animate-pulse">🌸</div>
        </header>
        <main className="flex-1 overflow-hidden z-10 relative">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/subject/:id" element={<SubjectDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}