import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { QRCodeSVG } from "qrcode.react";

// --- COMPONENT: ATTENDANCE PAGE (With 1, 2, 3 ID & Clear Button) ---
function AttendancePage() {
  const navigate = useNavigate();
  const [attendanceName, setAttendanceName] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  
  // NEW: State to store the class start time (Defaulting to current time)
  const [classStartTime, setClassStartTime] = useState("21:00"); 

  const qrUrl = window.location.href;

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('Attendance')
      .select('student_name, signed_in_at, status')
      .order('signed_in_at', { ascending: true });
    if (data) setAttendanceList(data);
  };

  useEffect(() => { fetchAttendance(); }, []);

  const handleClearAttendance = async () => {
    if (!window.confirm("Reset list for next class?")) return;
    const { error } = await supabase.from('Attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) { setAttendanceList([]); fetchAttendance(); }
  };

  const handleSignIn = async () => {
    if (!attendanceName) return alert("Enter your name!");
    
    const now = new Date();
    
    // Parse the tutor's set time (e.g., "21:00")
    const [targetHour, targetMinute] = classStartTime.split(':').map(Number);
    
    // Create a date object for the "Deadline" (5-minute grace period)
    const deadline = new Date();
    deadline.setHours(targetHour);
    deadline.setMinutes(targetMinute + 5); // 5 minute grace period

    const status = now > deadline ? "Late" : "On Time";

    const { error } = await supabase
      .from('Attendance')
      .insert([{ student_name: attendanceName, module_name: "General Hall", status: status }]);

    if (!error) { setAttendanceName(""); fetchAttendance(); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans min-h-screen bg-gray-50">
      <button onClick={() => navigate('/')} className="mb-8 text-gray-400 font-black flex items-center gap-2 hover:text-black transition-all"><span>←</span> DASHBOARD</button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          
          {/* NEW: TUTOR CONTROL BOX */}
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Tutor Controls</h3>
            <label className="block text-sm font-bold mb-2 text-gray-300">Class Start Time:</label>
            <input 
              type="time" 
              value={classStartTime}
              onChange={(e) => setClassStartTime(e.target.value)}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl font-black text-xl outline-none focus:border-blue-500 transition-all text-white mb-4"
            />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
              Students joining after <span className="text-blue-400">{classStartTime}</span> (+5m grace) will be marked Late.
            </p>
          </div>

          {/* QR & SIGN IN BOX */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 text-center">
            <div className="bg-blue-50 p-4 rounded-3xl inline-block mb-4 border-2 border-dashed border-blue-200">
              <QRCodeSVG value={qrUrl} size={150} />
            </div>
            <h2 className="text-2xl font-black mb-6 text-gray-900">Sign In</h2>
            <input type="text" placeholder="Full Name" value={attendanceName} onChange={(e) => setAttendanceName(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold mb-4 outline-none" />
            <button onClick={handleSignIn} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all">JOIN CLASS</button>
          </div>
        </div>

        {/* ATTENDANCE TABLE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
               <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Attendance Log</span>
               <button onClick={handleClearAttendance} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors">Clear List ✕</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">ID</th>
                  <th className="p-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Student</th>
                  <th className="p-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Time</th>
                  <th className="p-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((st, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-all">
                    <td className="p-6 font-black text-blue-600">{i + 1}</td>
                    <td className="p-6 font-bold text-gray-800">{st.student_name}</td>
                    <td className="p-6 text-sm text-gray-400">{new Date(st.signed_in_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="p-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${st.status === 'Late' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{st.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT: HOME FEED (Bento Grid) ---
function CourseFeed() {
  const [dbCourses, setDbCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase.from('Courses').select('*').order('id', { ascending: true });
      if (data) setDbCourses(data);
    }
    fetchCourses();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-[#F8F9FB] min-h-screen">
      <header className="mb-12 pt-4"><h1 className="text-5xl font-black tracking-tighter text-gray-900">Classroom</h1></header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => navigate('/attendance')} className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer min-h-[350px] flex flex-col justify-between group relative overflow-hidden">
           <div className="relative z-10"><h2 className="text-5xl font-black mt-6 leading-tight">Digital Attendance</h2></div>
           <div className="relative z-10 bg-white text-blue-600 w-fit px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-blue-50 transition-colors">Open QR Scanner →</div>
        </div>
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-center text-center"><div className="text-5xl mb-4">📘</div><h3 className="text-xl font-black">Resources</h3><p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-widest">LMS ACTIVE</p></div>
        {dbCourses.map((course) => (
          <div key={course.id} onClick={() => navigate(`/course/${course.id}`)} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between min-h-[280px]">
            <div><h2 className="text-2xl font-black text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{course.description}</h2></div>
            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest border-t border-gray-50 pt-6 group-hover:text-blue-400 transition-colors">{course.module} • View Module →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENT: DETAIL PAGE (PDF Upload) ---
function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function getDetails() {
      const { data } = await supabase.from('Courses').select('*').eq('id', id).single();
      if (data) setCourse(data);
    }
    getDetails();
  }, [id]);

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("Select a PDF!");
    setIsUploading(true);
    const fileName = `${id}_${Date.now()}.pdf`;
    await supabase.storage.from('Assignments').upload(fileName, selectedFile);
    await supabase.from('Assignments').insert([{ course_id: id, pdf_path: fileName, student_name: "Guest" }]);
    alert("Assignment Uploaded!");
    setIsUploading(false);
  };

  if (!course) return <div className="p-20 text-center font-black animate-pulse text-gray-300">Loading...</div>;

  const lessonNames = (course.lessons || "").split(' | ');
  const videoLinks = (course.video_urls || "").split(' | ');

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-screen bg-[#F8F9FB]">
      <button onClick={() => navigate('/')} className="mb-10 text-gray-400 font-black flex items-center gap-2 hover:text-blue-600"><span>←</span> BACK</button>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            <iframe className="w-full h-full" src={videoLinks[activeLesson]?.replace("watch?v=", "embed/")} allowFullScreen></iframe>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-2xl mb-4 text-blue-600">Submit Assignment</h3>
            <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} className="mb-6 block w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:font-black file:bg-blue-50 file:text-blue-600" />
            <button onClick={handleFileUpload} disabled={isUploading} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest">{isUploading ? "Uploading..." : "Submit PDF 🚀"}</button>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 sticky top-24 shadow-sm">
            <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6">Lessons</h3>
            <div className="space-y-3">
              {lessonNames.map((name, i) => (
                <button key={i} onClick={() => setActiveLesson(i)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${activeLesson === i ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}><span className="font-bold text-sm text-gray-700">{name}</span></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F9FB]">
        <Routes>
          <Route path="/" element={<CourseFeed />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/course/:id" element={<CourseDetail />} />
        </Routes>
      </div>
    </Router>
  );
}