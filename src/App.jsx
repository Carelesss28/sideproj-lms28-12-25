import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// --- COMPONENT 1: THE QUIZ MODAL ---
function QuizModal({ isOpen, onClose, quizData }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen || !quizData) return null;

  const handleAnswer = (selected) => {
    if (selected === quizData[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl animate-in zoom-in duration-300">
        {!showResult ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                Question {currentQuestion + 1} / {quizData.length}
              </span>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors text-xl">✕</button>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-8 leading-tight">
              {quizData[currentQuestion].question}
            </h2>
            <div className="grid gap-3">
              {quizData[currentQuestion].options.map((opt) => (
                <button 
                  key={opt} 
                  onClick={() => handleAnswer(opt)}
                  className="p-5 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-gray-700 active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-7xl mb-6"> {score === quizData.length ? "🔥" : "✨"} </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Quiz Results</h2>
            <p className="text-gray-500 mb-8 font-bold text-lg">
              You scored <span className="text-blue-600">{score}</span> out of {quizData.length}
            </p>
            <button 
              onClick={resetQuiz}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95"
            >
              Finish & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENT 2: THE HOME PAGE (GRID VIEW) ---
function CourseFeed() {
  const [dbCourses, setDbCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase.from('LMS| Courses').select('*').order('id', { ascending: true });
      if (data) setDbCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const filteredCourses = dbCourses.filter((course) => {
    const name = (course.module || course.Module || "").toLowerCase();
    const desc = (course.description || course.Description || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse">LOADING LMS...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Available Modules</h1>
          <p className="text-gray-500 font-medium">Continue your learning journey</p>
        </div>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search for a topic..."
            className="w-full p-4 pl-12 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:border-blue-500 outline-none transition-all font-bold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4.5 text-xl">🔍</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer p-8 group flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest border border-blue-100">
                {course.module || course.Module}
              </span>
              <h2 className="text-2xl font-black text-gray-800 mt-6 group-hover:text-blue-600 transition-colors">
                {course.description || course.Description}
              </h2>
            </div>
            <div className="mt-8 flex items-center text-blue-600 font-black text-sm uppercase tracking-widest">
              Start Learning <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENT 3: THE DETAIL PAGE ---
function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0); 
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem(`lms-progress-${id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`lms-progress-${id}`, JSON.stringify(completedLessons));
  }, [completedLessons, id]);

  useEffect(() => {
    async function getDetails() {
      const { data } = await supabase.from('LMS| Courses').select('*').eq('id', id).single();
      if (data) setCourse(data);
    }
    getDetails();
  }, [id]);

  const toggleComplete = (index) => {
    if (completedLessons.includes(index)) {
      setCompletedLessons(completedLessons.filter(i => i !== index));
    } else {
      setCompletedLessons([...completedLessons, index]);
    }
  };

  if (!course) return <div className="p-20 text-center font-black animate-pulse">PREPARING CLASSROOM...</div>;

  const lessonNames = (course.lessons || "").split(' | ');
  const videoLinks = (course.video_urls || "").split(' | ');
  const progressPercentage = Math.round((completedLessons.length / lessonNames.length) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-blue-600 font-black flex items-center gap-2 transition-colors">
          <span>←</span> BACK TO DASHBOARD
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white shadow-blue-900/10">
            {videoLinks[activeLesson] ? (
              <iframe className="w-full h-full" src={videoLinks[activeLesson].replace("watch?v=", "embed/")} title="Video" allowFullScreen></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No Video Available</div>
            )}
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">Now Playing</span>
                   <h1 className="text-4xl font-black text-gray-900 mt-2 tracking-tight">{lessonNames[activeLesson]}</h1>
                </div>
                <button 
                  onClick={() => toggleComplete(activeLesson)}
                  className={`px-10 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl ${
                    completedLessons.includes(activeLesson) ? "bg-green-500 text-white" : "bg-blue-600 text-white"
                  }`}
                >
                  {completedLessons.includes(activeLesson) ? "✓ COMPLETED" : "MARK AS DONE"}
                </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 sticky top-24 shadow-sm">
            <h3 className="font-black text-xl mb-6">Course Content</h3>
            <div className="space-y-3 mb-10">
              {lessonNames.map((name, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveLesson(index)}
                  className={`w-full text-left p-5 rounded-2xl transition-all flex items-center justify-between border-2 ${
                    activeLesson === index ? 'bg-blue-50 border-blue-600' : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${activeLesson === index ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      {index + 1}
                    </div>
                    <span className="font-bold text-sm text-gray-700">{name}</span>
                  </div>
                  {completedLessons.includes(index) && <span>✅</span>}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Mastery</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
              </div>

              {/* QUIZ GATING LOGIC */}
              <button 
                disabled={progressPercentage < 100}
                onClick={() => setIsQuizOpen(true)}
                className={`w-full mt-4 py-5 rounded-2xl font-black transition-all shadow-xl ${
                  progressPercentage === 100 
                  ? "bg-orange-500 text-white hover:bg-orange-600" 
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                {progressPercentage === 100 ? "🔥 START MODULE QUIZ" : "LOCK 🔒 FINISH LESSONS"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        quizData={course.quiz_data} 
      />
    </div>
  );
}

// --- MAIN APP WRAPPER ---
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
        <nav className="p-6 bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="font-black text-2xl tracking-tighter text-blue-600 cursor-pointer" onClick={() => window.location.href = '/'}>
              MY LMS
            </div>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Learning Portal</div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<CourseFeed />} />
          <Route path="/course/:id" element={<CourseDetail />} />
        </Routes>
      </div>
    </Router>
  );
}