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
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl">
        {!showResult ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                Question {currentQuestion + 1} / {quizData.length}
              </span>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-xl">✕</button>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-8">{quizData[currentQuestion].question}</h2>
            <div className="grid gap-3">
              {quizData[currentQuestion].options.map((opt) => (
                <button key={opt} onClick={() => handleAnswer(opt)} className="p-5 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 font-bold transition-all">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <h2 className="text-4xl font-black mb-2">Quiz Results</h2>
            <p className="text-lg mb-8 font-bold">You scored {score} out of {quizData.length}</p>
            <button onClick={resetQuiz} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl">
              Finish & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENT 2: THE HOME PAGE ---
function CourseFeed() {
  const [dbCourses, setDbCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        // Updated to lowercase 'courses'
        const { data, error: sbError } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: true });
        
        if (sbError) throw sbError;
        setDbCourses(data || []);
      } catch (err) {
        console.error("Fetch Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse">LOADING LMS...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-bold">Connection Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black mb-12 tracking-tighter text-gray-900">Available Modules</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {dbCourses.map((course) => (
          <div key={course.id} onClick={() => navigate(`/course/${course.id}`)} className="bg-white rounded-[2rem] border-2 border-gray-50 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer transition-all flex flex-col justify-between min-h-[250px]">
            <div>
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest">{course.module}</span>
              <h2 className="text-2xl font-black mt-6 text-gray-800">{course.description}</h2>
            </div>
            <div className="mt-8 text-blue-600 font-black text-sm uppercase tracking-widest">Start Learning →</div>
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
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    async function getDetails() {
      // Updated to lowercase 'courses'
      const { data } = await supabase.from('courses').select('*').eq('id', id).single();
      if (data) setCourse(data);
    }
    getDetails();
  }, [id]);

  if (!course) return <div className="p-20 text-center font-black animate-pulse">PREPARING CLASSROOM...</div>;

  const lessonNames = (course.lessons || "").split(' | ');
  const videoLinks = (course.video_urls || "").split(' | ');
  const progress = Math.round((completedLessons.length / lessonNames.length) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <button onClick={() => navigate('/')} className="mb-10 font-black text-gray-400 hover:text-blue-600 transition-colors">← DASHBOARD</button>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl">
            {videoLinks[activeLesson] ? (
              <iframe className="w-full h-full" src={videoLinks[activeLesson].replace("watch?v=", "embed/")} allowFullScreen></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-white">No Video Available</div>
            )}
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
            <h1 className="text-4xl font-black text-gray-900">{lessonNames[activeLesson]}</h1>
            <button 
              onClick={() => setCompletedLessons(prev => prev.includes(activeLesson) ? prev.filter(i => i !== activeLesson) : [...prev, activeLesson])}
              className={`mt-6 px-10 py-5 rounded-2xl font-black text-white transition-all ${completedLessons.includes(activeLesson) ? "bg-green-500" : "bg-blue-600"}`}
            >
              {completedLessons.includes(activeLesson) ? "✓ COMPLETED" : "MARK AS DONE"}
            </button>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] p-8 border sticky top-24 shadow-sm">
            <h3 className="font-black text-xl mb-6">Course Content</h3>
            <div className="space-y-3 mb-8">
              {lessonNames.map((name, index) => (
                <button key={index} onClick={() => setActiveLesson(index)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${activeLesson === index ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}>
                  <span className="font-bold text-sm text-gray-700">{name}</span>
                  {completedLessons.includes(index) && <span>✅</span>}
                </button>
              ))}
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <button disabled={progress < 100} onClick={() => setIsQuizOpen(true)} className={`w-full mt-6 py-5 rounded-2xl font-black shadow-xl transition-all ${progress === 100 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
              {progress === 100 ? "🔥 START MODULE QUIZ" : "LOCK 🔒 FINISH LESSONS"}
            </button>
          </div>
        </div>
      </div>
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} quizData={course.quiz_data} />
    </div>
  );
}

// --- MAIN APP WRAPPER ---
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
        <nav className="p-6 bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="font-black text-2xl text-blue-600 cursor-pointer" onClick={() => window.location.href = '/'}>MY LMS</div>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Learning Portal</div>
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