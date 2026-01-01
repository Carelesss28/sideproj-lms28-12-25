import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";

// --- ANIMATED SAKURA PETAL COMPONENT ---
function SakuraPetals() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 10}s`
          }}
        >🌸</div>
      ))}
      <style>{`
        .sakura-petal {
          position: absolute;
          top: -10%;
          color: #fce7f3;
          font-size: 20px;
          user-select: none;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// --- SAKURA NAVBAR DROPDOWN ---
function NavbarDropdown({ title, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-4 py-2 text-base font-bold text-gray-700 hover:text-pink-500 transition-all uppercase tracking-widest relative group"
      >
        {title} <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>🌸</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-64 bg-white border-2 border-pink-100 shadow-2xl rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          {options.map((opt, i) => (
            <Link 
              key={i} 
              to={opt.path} 
              className="block px-8 py-5 text-sm font-bold text-gray-600 hover:bg-pink-50 hover:text-pink-600 border-b border-pink-50 last:border-0 uppercase tracking-wide transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// --- GLOBAL SAKURA LAYOUT ---
function Layout({ children }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full bg-[#FFFDFB] font-sans overflow-hidden">
      <div className="w-72 bg-white border-r border-pink-50 flex flex-col shadow-sm relative z-50">
        <div className="p-10 text-center border-b-2 border-pink-50 bg-pink-50/20">
          <h1 className="text-3xl font-black italic tracking-tighter text-pink-600 hover:scale-110 transition-transform cursor-default">CALCULOVE</h1>
        </div>
        <nav className="flex-1 p-6 space-y-4 mt-8">
          <button onClick={() => navigate('/')} className="w-full text-left p-6 rounded-2xl hover:bg-pink-50 font-black text-sm uppercase tracking-[0.2em] transition-all border border-transparent hover:border-pink-200 text-gray-700 hover:translate-x-2">Dashboard</button>
          <button onClick={() => navigate('/attendance')} className="w-full text-left p-6 rounded-2xl hover:bg-pink-50 font-black text-sm uppercase tracking-[0.2em] transition-all border border-transparent hover:border-pink-200 text-gray-700 hover:translate-x-2">Attendance</button>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <SakuraPetals />
        <header className="h-24 bg-white/90 backdrop-blur-md border-b border-pink-50 px-10 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <NavbarDropdown title="My Class" options={[{label: "Class Progress", path: "/"}, {label: "Class List", path: "/"}]} />
            <NavbarDropdown title="Assessments" options={[{label: "Assignments", path: "/"}, {label: "Grades", path: "/"}, {label: "Quizzes", path: "/"}]} />
            <NavbarDropdown title="Course Tools" options={[{label: "Awards", path: "/"}, {label: "Surveys", path: "/"}]} />
            <NavbarDropdown title="Library" options={[{label: "Study Notes", path: "/"}]} />
            <NavbarDropdown title="Support" options={[{label: "Help Center", path: "/"}]} />
          </div>
          <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center border-2 border-pink-100 text-pink-500 font-bold text-xl animate-pulse">🌸</div>
        </header>
        <main className="flex-1 overflow-hidden z-10">{children}</main>
      </div>
    </div>
  );
}

// --- DASHBOARD ---
function CourseFeed() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: c } = await supabase.from('Courses').select('*').order('id', { ascending: true });
      const { data: a } = await supabase.from('Announcements').select('*').order('created_at', { descending: true });
      if (c) setCourses(c);
      if (a) setAnnouncements(a);
    }
    fetchData();
  }, []);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-1000">
      <div className="h-56 bg-gradient-to-r from-pink-100 via-pink-200 to-pink-100 flex items-center px-20 relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-6xl font-black text-gray-800 tracking-tighter uppercase">Sakura Afternoon</h1>
          <p className="text-base font-bold text-pink-600 uppercase tracking-[0.5em] mt-4 italic">Welcome to Calculove Academy</p>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {courses.map(course => (
              <div 
                key={course.id} 
                onClick={() => navigate(`/course/${course.id}`)} 
                className="group relative bg-white p-10 rounded-tr-[5rem] rounded-bl-[5rem] border-2 border-pink-50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-r-8 border-b-8 hover:-translate-y-4 hover:rotate-1"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-pink-100 group-hover:w-full group-hover:opacity-10 transition-all duration-500"></div>
                <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-tight relative z-10">{course.description}</h3>
                <p className="text-xs font-bold text-pink-300 uppercase mt-6 tracking-widest italic flex items-center gap-2 relative z-10"><span>🌸</span> Module 0{course.id}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[450px] bg-white/80 backdrop-blur-sm border-l-2 border-pink-50 p-12 flex flex-col shadow-inner">
          <h2 className="text-base font-black uppercase tracking-[0.4em] text-pink-600 mb-10 border-b-2 border-pink-100 pb-4 flex items-center gap-3">
             <span>💮</span> Afternoon Decrees
          </h2>
          <div className="space-y-8 overflow-y-auto pr-4 scrollbar-hide">
            {announcements.map(a => (
              <div key={a.id} className="p-10 bg-pink-50/30 border border-pink-100 rounded-tr-[3.5rem] rounded-bl-[3.5rem] shadow-sm hover:scale-105 transition-transform duration-300">
                 <p className="text-sm font-medium italic text-gray-700 leading-relaxed">"{a.content}"</p>
                 <div className="mt-6 text-[10px] font-black text-pink-300 uppercase tracking-widest">Calculove Council</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MODULE VIEW (3:5 RATIO) ---
function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    async function get() {
      const { data } = await supabase.from('Courses').select('*').eq('id', id).single();
      setCourse(data);
    }
    get();
  }, [id]);

  if (!course) return null;
  const lessons = course.video_urls?.split(' | ') || [];

  return (
    <div className="flex h-full bg-white overflow-hidden animate-in zoom-in duration-500">
      <div className="w-[37.5%] bg-pink-50/20 border-r-2 border-pink-50 flex flex-col shadow-inner">
        <div className="p-12 bg-pink-600 text-white rounded-br-[4rem] shadow-xl">
          <button onClick={() => navigate('/')} className="mb-8 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center gap-2 group">
            <span className="group-hover:-translate-x-2 transition-transform">🌸</span> Dashboard
          </button>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">{course.description}</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-10">
          {lessons.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setActive(i)} 
              className={`w-full text-left px-12 py-8 flex items-center justify-between transition-all duration-300 ${active === i ? 'bg-white border-l-8 border-pink-400 translate-x-4 shadow-md' : 'hover:bg-pink-50 opacity-40 hover:opacity-100 hover:translate-x-2'}`}
            >
              <span className={`font-black text-base uppercase tracking-widest ${active === i ? 'text-pink-600' : 'text-gray-700'}`}>Lesson 0{i + 1}</span>
              {active === i && <span className="animate-bounce">🌸</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-16 bg-[#FFFDFB] flex flex-col items-center justify-center relative">
        <div className="w-full h-full bg-black rounded-tr-[10rem] rounded-bl-[10rem] overflow-hidden shadow-2xl border-[16px] border-white ring-1 ring-pink-50 transition-all duration-700 hover:shadow-pink-200/50 hover:shadow-3xl">
           <iframe className="w-full h-full" src={lessons[active]?.replace("watch?v=", "embed/")} allowFullScreen></iframe>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CourseFeed />} />
          <Route path="/course/:id" element={<CourseDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}