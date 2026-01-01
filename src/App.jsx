import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";

// --- 1. ATMOSPHERE ENGINE (Visuals) ---
function AtmosphereEngine() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#fdfafb]">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-pink-200/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-sky-200/20 blur-[100px] rounded-full"></div>
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
        className="px-8 py-3 text-xl font-black text-slate-700 hover:text-pink-600 transition-all uppercase tracking-[0.2em] flex items-center gap-3 bg-white/50 rounded-full border-2 border-white/80 shadow-sm"
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
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-12 lg:p-20 scrollbar-hide">
        <div className="relative mb-20 p-24 rounded-[5rem] bg-gradient-to-br from-pink-500 via-rose-400 to-orange-300 shadow-2xl overflow-hidden">
          <h1 className="text-7xl lg:text-9xl font-serif italic text-white tracking-tighter leading-none relative z-10">Afternoon Shallows</h1>
          <p className="text-lg font-black text-white/90 uppercase tracking-[1em] mt-10 italic relative z-10">✦ DRIFTING THROUGH THE CURRICULUM ✦</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {subjects.map(s => (
            <div key={s.id} onClick={() => navigate(`/subject/${s.id}`)} className="group relative bg-white/60 backdrop-blur-md p-16 rounded-[4rem] border-4 border-white shadow-xl hover:shadow-pink-200/50 hover:bg-white transition-all duration-500 cursor-pointer overflow-hidden">
              <h3 className="text-5xl font-serif italic text-slate-800 relative z-10">{s.subject_name}</h3>
              <p className="text-sm font-black text-pink-400 uppercase mt-6 tracking-[0.4em] italic relative z-10">Open Learning Scroll ✦</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full lg:w-[30rem] bg-white/40 border-l-4 border-white/60 p-16 backdrop-blur-3xl overflow-y-auto shadow-2xl shrink-0">
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
  const [lessonDoc, setLessonDoc] = useState(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const lessons = [1, 2, 3, 4, 5];

  useEffect(() => {
    async function getDetails() {
      const { data: s } = await supabase.from('Subjects').select('subject_name').eq('id', id).single();
      if (s) setSubjectName(s.subject_name);
      const { data: m } = await supabase.from('Materials').select('url').eq('subject_id', id).eq('title', `Lesson ${activeLesson} Doc`).single();
      setLessonDoc(m ? m.url : null);
    }
    getDetails();
  }, [id, activeLesson]);

  const handleDocUpload = async (file) => {
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const fileName = `lesson_docs/${id}_lesson${activeLesson}_${Date.now()}.pdf`;
      await supabase.storage.from('Assignments').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('Assignments').getPublicUrl(fileName);
      await supabase.from('Materials').upsert({ subject_id: id, title: `Lesson ${activeLesson} Doc`, content_type: 'pdf', url: publicUrl });
      setLessonDoc(publicUrl); alert("Scroll Archived! 🌸");
    } catch (err) { alert(err.message); } finally { setIsUploadingDoc(false); }
  };

  const handleSelect = (idx, opt) => { if (!quizScore) setSelectedAnswers({ ...selectedAnswers, [idx]: opt }); };

  const submitQuiz = async () => {
    const score = Math.floor(Math.random() * 2) + 8;
    setQuizScore(`${score}/10`);
    await supabase.from('Submissions').insert([{ student_name: "Shore Scholar", material_title: `${subjectName} Lesson ${activeLesson}`, status: 'Graded', file_url: `Score: ${score}/10` }]);
  };

  return (
    <div className="flex h-full w-full bg-white/20 overflow-hidden">
      <div className="w-[30rem] bg-white/50 border-r-4 border-white/60 flex flex-col backdrop-blur-2xl shadow-2xl shrink-0">
        <div className="p-16 bg-gradient-to-br from-pink-400 to-rose-300 text-white rounded-br-[6rem]">
          <Link to="/" className="text-sm font-black uppercase tracking-widest mb-8 block">↞ THE HORIZON</Link>
          <h2 className="text-4xl font-serif italic leading-tight">{subjectName}</h2>
        </div>
        <div className="flex-1 py-16 overflow-y-auto px-8 space-y-6">
          {lessons.map(num => (
            <button key={num} onClick={() => {setActiveLesson(num); setActiveTab("video"); setQuizScore(null);}} 
              className={`w-full text-left px-12 py-10 transition-all rounded-[3rem] flex items-center justify-between ${activeLesson === num ? 'bg-white shadow-2xl text-pink-500' : 'text-slate-500'}`}>
              <span className="text-2xl font-black uppercase tracking-[0.3em]">Lesson 0{num}</span>
              <span className="text-4xl">🐚</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-40 border-b-4 border-white/60 flex items-center px-24 gap-20 bg-white/40 backdrop-blur-xl shrink-0">
          {['video', 'document', 'quiz'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`text-2xl font-black uppercase tracking-[0.5em] relative py-6 ${activeTab === tab ? 'text-pink-500' : 'text-slate-400'}`}>
              {tab === 'video' ? 'Canto' : tab === 'document' ? 'Scroll' : 'Reflection'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-2 bg-pink-400 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="flex-1 p-24 overflow-y-auto bg-gradient-to-br from-white/10 to-[#fdfafb]">
          {activeTab === "video" && (
            <div className="h-full flex flex-col items-center">
              <div className="w-full aspect-video bg-white rounded-[6rem] shadow-2xl border-[32px] border-white overflow-hidden ring-12 ring-pink-50/50">
                 <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowFullScreen />
              </div>
              <h3 className="mt-16 text-6xl font-serif italic text-slate-800">Lesson {activeLesson} Surveillance</h3>
            </div>
          )}
          {activeTab === "document" && (
            <div className="h-full flex flex-col items-center justify-center space-y-12">
              {lessonDoc ? (
                <div className="w-full max-w-4xl p-20 bg-white rounded-[5rem] shadow-2xl border-4 border-pink-50 text-center">
                  <span className="text-[12rem] mb-10 block text-pink-100">📜</span>
                  <a href={lessonDoc} target="_blank" rel="noreferrer" className="inline-block py-10 px-24 bg-pink-500 text-white font-black uppercase tracking-widest rounded-full text-2xl shadow-xl">OPEN SCROLL</a>
                </div>
              ) : (
                <div className="w-full max-w-4xl p-20 border-8 border-dashed border-pink-100 rounded-[5rem] text-center">
                  <h3 className="text-4xl font-black text-slate-300 uppercase mb-12">No Scroll Uploaded</h3>
                  <label className="cursor-pointer py-8 px-16 bg-white border-4 border-pink-200 text-pink-400 font-black uppercase rounded-full hover:bg-pink-50 transition-all text-xl">
                    {isUploadingDoc ? "UPLOADING..." : "UPLOAD PDF SCROLL"}
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleDocUpload(e.target.files[0])} />
                  </label>
                </div>
              )}
            </div>
          )}
          {activeTab === "quiz" && (
            <div className="max-w-4xl mx-auto space-y-16 pb-40">
              <h3 className="text-6xl font-serif italic text-center">Trial 0{activeLesson}</h3>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-16 bg-white rounded-[5rem] border-4 border-pink-50 shadow-2xl">
                  <p className="font-serif italic text-slate-700 mb-12 text-3xl">Question 0{i+1}: Identify the shifting tide?</p>
                  <div className="grid grid-cols-1 gap-6">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <button key={opt} onClick={() => handleSelect(i, opt)}
                        className={`w-full text-left p-10 rounded-[3rem] border-4 text-2xl font-black transition-all ${selectedAnswers[i] === opt ? 'bg-pink-500 text-white border-none' : 'border-pink-50 text-slate-400'}`}>
                        Option {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!quizScore && <button onClick={submitQuiz} className="w-full py-12 bg-slate-900 text-white font-black uppercase tracking-[1em] rounded-full text-2xl shadow-2xl">SUBMIT REFLECTION</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendanceView() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const fetch = async () => {
    const { data } = await supabase.from('Attendance').select('*').order('recorded_at', { descending: true });
    if (data) setList(data);
  };
  useEffect(() => { fetch(); }, []);
  const sign = async () => {
    await supabase.from('Attendance').insert([{ student_name: name }]);
    setName(""); fetch();
  };
  return (
    <div className="h-full overflow-y-auto p-20 bg-white/20">
      <PageHeader title="Coastal Registry" subtitle="SCRIBE YOUR PRESENCE" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mt-12">
        <div className="p-24 bg-white/60 backdrop-blur-xl border-4 border-pink-50 rounded-[6rem] shadow-2xl text-center">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ENTER FULL NAME" className="w-full p-10 bg-transparent border-b-4 border-pink-200 text-4xl font-serif italic text-center text-slate-700 mb-12 outline-none" />
          <button onClick={sign} className="w-full py-10 bg-pink-400 text-white font-black uppercase tracking-[0.6em] rounded-full text-2xl">Confirm Presence</button>
        </div>
        <div className="space-y-6">
          {list.map((st, i) => (
            <div key={i} className="p-8 bg-white/40 border-b-2 border-pink-50 flex justify-between items-center italic text-slate-600 text-2xl italic">
              <span>{st.student_name}</span>
              <span className="text-pink-300 uppercase text-sm font-black tracking-widest">Verified 🌸</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssignmentsView() {
  const [tasks, setTasks] = useState([]);
  const [submitting, setSubmitting] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    async function getTasks() {
      const { data } = await supabase.from('Assignments').select('*').order('due_date', { ascending: true });
      if (data) setTasks(data);
    }
    getTasks();
  }, []);

  const handleFileUpload = async (taskId, taskTitle) => {
    if (!selectedFile || !studentName) return;
    const fileName = `submissions/${Date.now()}.${selectedFile.name.split('.').pop()}`;
    await supabase.storage.from('Assignments').upload(fileName, selectedFile);
    const { data: { publicUrl } } = supabase.storage.from('Assignments').getPublicUrl(fileName);
    await supabase.from('Submissions').insert([{ student_name: studentName, material_title: taskTitle, file_url: publicUrl, status: 'Archived' }]);
    alert("Scroll Delivered! 🌸"); setSubmitting(null); setStudentName(""); setSelectedFile(null);
  };

  return (
    <div className="h-full overflow-y-auto p-20 bg-white/20">
      <PageHeader title="Drifting Scrolls" subtitle="SUBMIT YOUR REFLECTIONS" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        {tasks.map(t => (
          <div key={t.id} className="p-16 bg-white/60 backdrop-blur-md border-4 border-pink-50 rounded-[5rem] shadow-xl">
            <h3 className="text-4xl font-serif italic text-slate-700">{t.title}</h3>
            <p className="text-slate-400 mt-6 text-xl italic">{t.description}</p>
            {submitting === t.id ? (
              <div className="mt-10 space-y-6">
                <input placeholder="Name" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full p-6 bg-white border-2 border-pink-100 rounded-full text-xl outline-none" />
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="text-lg text-slate-400" />
                <button onClick={() => handleFileUpload(t.id, t.title)} className="w-full py-6 bg-pink-500 text-white font-black uppercase text-xl rounded-full shadow-lg">Cast Scroll</button>
              </div>
            ) : (
              <button onClick={() => setSubmitting(t.id)} className="mt-10 px-12 py-6 bg-slate-900 text-white font-black uppercase text-xl rounded-full">Attach Scroll</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 4. MASTER LAYOUT ---
function Layout({ children }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-screen bg-[#fdfafb] font-sans overflow-hidden text-slate-800">
      <AtmosphereEngine />
      <aside className="w-[30rem] bg-white/40 border-r-4 border-white/60 flex flex-col z-50 backdrop-blur-3xl shadow-2xl shrink-0">
        <div className="p-20 text-center border-b-4 border-white/60 bg-gradient-to-br from-pink-50/50 to-white/50">
          <h1 onClick={() => navigate('/')} className="text-6xl font-serif italic tracking-tighter text-pink-500 cursor-pointer">Sakura Shores</h1>
          <p className="text-sm font-black uppercase tracking-[0.5em] text-pink-300 mt-8 italic">INSTITUTIONAL LMS</p>
        </div>
        <nav className="p-16 space-y-10 mt-12 flex-1 overflow-y-auto">
          <button onClick={() => navigate('/')} className="w-full text-left p-12 rounded-[4rem] bg-white shadow-xl text-slate-600 hover:text-pink-500 font-black uppercase text-2xl tracking-widest transition-all">THE HORIZON</button>
          <button onClick={() => navigate('/attendance')} className="w-full text-left p-12 rounded-[4rem] bg-white/60 shadow-md text-slate-600 hover:text-pink-500 font-black uppercase text-2xl tracking-widest transition-all">REGISTRY</button>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        <header className="h-40 bg-white/20 backdrop-blur-2xl border-b-4 border-white/60 px-24 flex items-center justify-between z-40 shrink-0">
          <div className="flex items-center gap-12">
            <NavDropdown title="Academy" options={[{label: "Subjects", path: "/"}, {label: "Courses", path: "/"}]} />
            <NavDropdown title="Trials" options={[{label: "Assignments", path: "/assignments"}, {label: "Quizzes", path: "/"}, {label: "Attendance", path: "/attendance"}]} />
            <NavDropdown title="Archive" options={[{label: "Profiles", path: "/"}, {label: "Submissions", path: "/assignments"}, {label: "Awards", path: "/"}]} />
          </div>
          <div className="w-24 h-24 rounded-full bg-white border-8 border-pink-100 flex items-center justify-center text-5xl shadow-2xl">🌸</div>
        </header>
        <main className="flex-1 overflow-hidden z-10 relative h-full">
          {children}
        </main>
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
          <Route path="/assignments" element={<AssignmentsView />} />
          <Route path="/attendance" element={<AttendanceView />} />
          <Route path="/subject/:id" element={<SubjectDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}