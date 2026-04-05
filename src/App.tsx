import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, GraduationCap, IndianRupee, User, BookOpen, Award, 
  ExternalLink, Loader2, Filter, Bell, Moon, Globe, LogIn, 
  Rocket, Bot, Mic, FileText, CheckCircle2, MessageSquare,
  ChevronRight, ArrowRight, Sparkles, LayoutDashboard, Heart, Info, HelpCircle, Settings,
  Mail, Phone, ArrowLeft, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { searchScholarships, Scholarship, SearchCriteria } from './scholarshipAISearch';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const COURSES = ["10th", "12th", "B.Com", "BBA", "B.Sc", "BCA", "BA", "B.Tech", "MCA", "MA", "M.Com", "M.Sc", "MBA", "M.Tech", "MBBS", "PhD", "Diploma"];
const CATEGORIES = ["2A", "2B", "3A", "3B", "SC", "ST", "EWS", "PWD"];
const INCOMES = ["<1 Lakh", "1-2 Lakh", "2-3 Lakh", "3-4 Lakh", "4-5 Lakh", "5-6 Lakh", "6-7 Lakh", "7-8 Lakh"];
const CGPAS = ["+9.0", "+8.0", "+7.0", "+6.0", "+5.0"];
const SOURCES = ["All", "State Government", "Central Government", "Private Trust"];

type Page = 'landing' | 'search' | 'results' | 'about' | 'help' | 'matches' | 'details';

const ScholarshipDetails = ({ scholarship, onBack, language }: { scholarship: Scholarship; onBack: () => void; language: 'en' | 'kn' }) => {
  if (!scholarship) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-[#002b4d] mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> {language === 'en' ? 'Back to Results' : 'ಫಲಿತಾಂಶಗಳಿಗೆ ಹಿಂತಿರುಗಿ'}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-br from-[#002b4d] to-[#004d80] p-8 md:p-12 text-white">
          <span className="bg-white/20 backdrop-blur-md text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 inline-block">
            {scholarship.provider}
          </span>
          <h2 className="text-[32px] md:text-[40px] font-bold leading-tight mb-8">{scholarship.title}</h2>
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 uppercase font-bold tracking-wider">{language === 'en' ? 'Amount' : 'ಮೊತ್ತ'}</p>
                <p className="text-[18px] font-bold">{scholarship.amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 uppercase font-bold tracking-wider">{language === 'en' ? 'Deadline' : 'ಕೊನೆಯ ದಿನಾಂಕ'}</p>
                <p className="text-[18px] font-bold">{scholarship.deadline}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          <section>
            <h3 className="text-[24px] font-bold text-[#002b4d] dark:text-white mb-4 flex items-center gap-3">
              <Info className="w-6 h-6 text-indigo-500" /> {language === 'en' ? 'Eligibility Criteria' : 'ಅರ್ಹತಾ ಮಾನದಂಡಗಳು'}
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed text-[16px]">
              {scholarship.eligibility}
            </div>
          </section>

          <section>
            <h3 className="text-[24px] font-bold text-[#002b4d] dark:text-white mb-4 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-indigo-500" /> {language === 'en' ? 'Provider Details' : 'ಒದಗಿಸುವವರ ವಿವರಗಳು'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[16px]">
              {language === 'en' 
                ? `This scholarship is provided by ${scholarship.provider}. It is designed to support students pursuing their academic goals and overcoming financial barriers.`
                : `ಈ ಶಿಷ್ಯವೇತನವನ್ನು ${scholarship.provider} ಒದಗಿಸಿದೆ. ಇದು ವಿದ್ಯಾರ್ಥಿಗಳು ತಮ್ಮ ಶೈಕ್ಷಣಿಕ ಗುರಿಗಳನ್ನು ಅನುಸರಿಸಲು ಮತ್ತು ಆರ್ಥಿಕ ಅಡೆತಡೆಗಳನ್ನು ಜಯಿಸಲು ಸಹಾಯ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.`}
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-slate-500 dark:text-slate-400 text-[14px]">
              <p>{language === 'en' ? 'Make sure to verify all details on the official portal before applying.' : 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಮರೆಯದಿರಿ.'}</p>
            </div>
            <a 
              href={scholarship.applyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#002b4d] text-white px-10 py-4 rounded-2xl font-bold text-[18px] flex items-center justify-center gap-3 hover:bg-[#003d6e] transition-all shadow-lg shadow-slate-200"
            >
              {language === 'en' ? 'Apply on Official Website' : 'ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ'} <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<{ name: string; photoURL: string } | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    course: COURSES[0],
    category: CATEGORIES[0],
    income: INCOMES[0],
    cgpa: CGPAS[0],
    source: SOURCES[0],
  });

  const [results, setResults] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '') setCurrentPage('landing');
    else if (path === '/search') setCurrentPage('search');
    else if (path === '/results') setCurrentPage('results');
    else if (path === '/about') setCurrentPage('about');
    else if (path === '/help') setCurrentPage('help');
    else if (path === '/matches') setCurrentPage('matches');
    else if (path.startsWith('/scholarship/')) setCurrentPage('details');
  }, [location.pathname]);

  const navigateToSearch = () => navigate('/search');
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'en' ? "Speech recognition is not supported in this browser." : "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'kn-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Recognized text:", transcript);
      
      const newCriteria = { ...criteria };
      
      // Course
      COURSES.forEach(course => {
        if (transcript.includes(course.toLowerCase())) {
          newCriteria.course = course;
        }
      });
      
      // Category
      CATEGORIES.forEach(cat => {
        if (transcript.includes(cat.toLowerCase())) {
          newCriteria.category = cat;
        }
      });
      
      // Income
      INCOMES.forEach(inc => {
        const incClean = inc.replace('<', '').replace(' Lakh', '').toLowerCase();
        if (transcript.includes(incClean) || transcript.includes(inc.toLowerCase())) {
          newCriteria.income = inc;
        }
      });
      
      // CGPA
      CGPAS.forEach(cgpa => {
        const cgpaClean = cgpa.replace('+', '').toLowerCase();
        if (transcript.includes(cgpaClean) || transcript.includes(cgpa.toLowerCase())) {
          newCriteria.cgpa = cgpa;
        }
      });
      
      // Source
      SOURCES.forEach(src => {
        if (transcript.includes(src.toLowerCase())) {
          newCriteria.source = src;
        }
      });
      
      setCriteria(newCriteria);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchScholarships(criteria);
      console.log("RESULTS:", data);
      setResults(data);
      navigate('/results');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'kn' : 'en');
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert(language === 'en' ? "Failed to sign in. Please try again." : "ಸೈನ್ ಇನ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Shared Header Component
  const Header = () => (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <h1 className="text-xl font-bold tracking-tight text-[#002b4d] dark:text-white">
            {language === 'en' ? 'The Academic Curator' : 'ದಿ ಅಕಾಡೆಮಿಕ್ ಕ್ಯುರೇಟರ್'}
          </h1>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-slate-600 dark:text-slate-300">
          <Link to="/" className={`hover:text-[#002b4d] dark:hover:text-white transition-colors ${location.pathname === '/' ? 'text-[#002b4d] dark:text-white border-b-2 border-[#002b4d] dark:border-white pb-1' : ''}`}>
            {language === 'en' ? 'AI Guidance' : 'AI ಮಾರ್ಗದರ್ಶನ'}
          </Link>
          <Link to="/search" className={`hover:text-[#002b4d] dark:hover:text-white transition-colors ${location.pathname === '/search' ? 'text-[#002b4d] dark:text-white border-b-2 border-[#002b4d] dark:border-white pb-1' : ''}`}>
            {language === 'en' ? 'Search' : 'ಹುಡುಕಿ'}
          </Link>
          <Link to="/matches" className={`hover:text-[#002b4d] dark:hover:text-white transition-colors ${location.pathname === '/matches' ? 'text-[#002b4d] dark:text-white border-b-2 border-[#002b4d] dark:border-white pb-1' : ''}`}>
            {language === 'en' ? 'My Matches' : 'ನನ್ನ ಪಂದ್ಯಗಳು'}
          </Link>
          <Link to="/about" className={`hover:text-[#002b4d] dark:hover:text-white transition-colors ${location.pathname === '/about' ? 'text-[#002b4d] dark:text-white border-b-2 border-[#002b4d] dark:border-white pb-1' : ''}`}>
            {language === 'en' ? 'About' : 'ಬಗ್ಗೆ'}
          </Link>
          <Link to="/help" className={`hover:text-[#002b4d] dark:hover:text-white transition-colors ${location.pathname === '/help' ? 'text-[#002b4d] dark:text-white border-b-2 border-[#002b4d] dark:border-white pb-1' : ''}`}>
            {language === 'en' ? 'Help' : 'ಸಹಾಯ'}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300 text-[14px] font-medium"
          >
            <Globe className="w-[18px] h-[18px]" />
            {language === 'en' ? 'EN / KN' : 'KN / EN'}
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className={`p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300 ${notificationsOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[60]"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {language === 'en' ? 'Notifications' : 'ಅಧಿಸೂಚನೆಗಳು'}
                    </h3>
                    <span className="text-[12px] text-indigo-600 font-medium cursor-pointer hover:underline">
                      {language === 'en' ? 'Mark all as read' : 'ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ'}
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[
                      { id: 1, title: 'New Scholarship Match', desc: 'National Merit Portal matches 92% with your profile.', time: '2h ago' },
                      { id: 2, title: 'Deadline Approaching', desc: 'Central Sector Scheme closes in 3 days.', time: '5h ago' },
                      { id: 3, title: 'Application Update', desc: 'Your application for SSP has been reviewed.', time: '1d ago' }
                    ].map(n => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                        <p className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">{n.title}</p>
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-2">{n.desc}</p>
                        <p className="text-[11px] text-slate-400">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <button className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700">
                      {language === 'en' ? 'View all notifications' : 'ಎಲ್ಲಾ ಅಧಿಸೂಚನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300"
          >
            <Moon className="w-[18px] h-[18px]" />
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-100 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">{user.name}</p>
                <button onClick={handleSignOut} className="text-[11px] text-slate-500 hover:text-red-500 transition-colors">
                  {language === 'en' ? 'Sign Out' : 'ಸೈನ್ ಔಟ್'}
                </button>
              </div>
              <img 
                src={user.photoURL} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border-2 border-indigo-500 p-0.5"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <button 
              onClick={handleSignIn}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#002b4d] text-white rounded-full hover:bg-[#003d6e] transition-all text-[14px] font-bold shadow-lg shadow-slate-200"
            >
              <LogIn className="w-[18px] h-[18px]" />
              {language === 'en' ? 'Sign In' : 'ಸೈನ್ ಇನ್'}
            </button>
          )}
        </div>
      </div>
    </header>
  );

  // Shared Footer Component
  const Footer = () => (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="text-[18px] font-bold text-[#002b4d] mb-2">The Academic Curator</h3>
            <p className="text-slate-500 text-[14px]">© 2024 The Academic Curator. Made for Indian Students.</p>
          </div>
          <div className="flex gap-8 text-[14px] font-medium text-slate-600">
            <a href="#" className="hover:text-[#002b4d] transition-colors">Contact</a>
            <a href="#" className="hover:text-[#002b4d] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#002b4d] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <AnimatePresence mode="wait">
        {currentPage === 'landing' ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-white dark:bg-slate-950">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 text-left">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[64px] leading-[1.1] font-bold text-[#002b4d] mb-8"
                  >
                    {language === 'en' ? (
                      <>
                        Your Personal AI <br />
                        Guidance for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006666] to-[#00a3a3]">Scholarships</span>
                      </>
                    ) : (
                      <>
                        ಶಿಷ್ಯವೇತನಕ್ಕಾಗಿ ನಿಮ್ಮ <br />
                        ವೈಯಕ್ತಿಕ AI <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006666] to-[#00a3a3]">ಮಾರ್ಗದರ್ಶನ</span>
                      </>
                    )}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 mb-12"
                  >
                    <p className="text-[20px] text-slate-600 leading-relaxed max-w-xl">
                      {language === 'en' 
                        ? "Intelligent recommendations, bilingual support (EN/KN), and career guidance for your academic journey."
                        : "ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಪ್ರಯಾಣಕ್ಕೆ ಬುದ್ಧಿವಂತ ಶಿಫಾರಸುಗಳು, ದ್ವಿಭಾಷಾ ಬೆಂಬಲ (EN/KN) ಮತ್ತು ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ."}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-4"
                  >
                    <button 
                      onClick={navigateToSearch}
                      className="bg-[#002b4d] text-white px-8 py-4 rounded-xl font-bold text-[18px] flex items-center gap-3 hover:bg-[#003d6e] transition-all shadow-lg shadow-slate-200"
                    >
                      {language === 'en' ? '🚀 Start Your Search' : '🚀 ನಿಮ್ಮ ಹುಡುಕಾಟವನ್ನು ಪ್ರಾರಂಭಿಸಿ'}
                    </button>
                  </motion.div>
                </div>

                <div className="flex-1 relative">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10"
                  >
                    <div className="rounded-[32px] overflow-hidden shadow-2xl border-8 border-white relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#002b4d]/20 to-transparent z-10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1000" 
                        alt="Sunset Aesthetic" 
                        className="w-full h-[500px] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Match Card */}
                    <motion.div 
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -right-8 top-12 bg-white p-6 rounded-2xl shadow-2xl w-64 border border-slate-100 z-20"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider">98% MATCH FOUND</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '98%' }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="h-full bg-emerald-500 rounded-full"
                        ></motion.div>
                      </div>
                      <h4 className="text-[18px] font-bold text-[#002b4d] mb-1">STEM Excellence Grant</h4>
                      <p className="text-[14px] text-slate-600">₹2,50,000 Per Annum</p>
                    </motion.div>

                    {/* Floating Elements */}
                    <div className="absolute -left-8 -bottom-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl w-72 border border-white/50 z-20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">AI ANALYZING...</span>
                      </div>
                      <p className="text-[15px] text-slate-700 font-medium leading-snug">
                        "Finding best matches for Engineering students in Karnataka"
                      </p>
                    </div>
                  </motion.div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-50 rounded-full -z-10 blur-3xl opacity-50"></div>
                </div>
              </div>
            </section>

            {/* Multi-Agent Intelligence System Section */}
            <section className="py-24 bg-slate-50/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-[48px] font-bold text-[#002b4d] mb-4">Multi-Agent Intelligence System</h2>
                  <p className="text-[20px] text-slate-600">Our specialized AI agents work together to curate your perfect academic path.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Bot className="w-7 h-7 text-indigo-600" />
                    </div>
                    <h3 className="text-[24px] font-bold text-[#002b4d] mb-4">Data Collection Agent</h3>
                    <p className="text-[16px] text-slate-600 leading-relaxed">
                      Scans thousands of government and private portals daily to find the latest scholarship opportunities.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-[#002b4d] to-[#004d80] p-10 rounded-[32px] text-white shadow-xl shadow-slate-200 transform scale-105 z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                      <Mic className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-[24px] font-bold mb-4">Multilingual Voice Search</h3>
                    <p className="text-[16px] text-slate-300 leading-relaxed">
                      Search naturally in English or Kannada. Our AI understands regional nuances to provide localized results.
                    </p>
                  </div>

                  <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7 text-teal-600" />
                    </div>
                    <h3 className="text-[24px] font-bold text-[#002b4d] mb-4">Eligibility Engine</h3>
                    <p className="text-[16px] text-slate-600 leading-relaxed">
                      Instantly verifies your profile against complex criteria to ensure you only apply for what you can win.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Career + Recommendation Section */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-12 rounded-[40px] relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm">
                      <GraduationCap className="w-6 h-6 text-[#006666]" />
                    </div>
                    <h3 className="text-[36px] font-bold text-[#006666] mb-4">
                      {language === 'en' ? 'Career Guidance' : 'ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ'}
                    </h3>
                    <p className="text-[18px] text-slate-600 leading-relaxed mb-8 max-w-md">
                      {language === 'en' 
                        ? 'Beyond money, we help you map your scholarship to long-term career success and university admissions.'
                        : 'ಹಣದ ಆಚೆಗೆ, ನಿಮ್ಮ ಶಿಷ್ಯವೇತನವನ್ನು ದೀರ್ಘಕಾಲೀನ ವೃತ್ತಿಜೀವನದ ಯಶಸ್ಸು ಮತ್ತು ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರವೇಶಗಳಿಗೆ ನಕ್ಷೆ ಮಾಡಲು ನಾವು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.'}
                    </p>
                  </div>
                  <div className="absolute right-[-10%] bottom-[-10%] w-2/3 h-2/3 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <img 
                      src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=500" 
                      alt="Career Background" 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-12 rounded-[40px] flex flex-col justify-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-[36px] font-bold text-[#002b4d] mb-4">Smart Recommendations</h3>
                  <p className="text-[18px] text-slate-600 leading-relaxed mb-8">
                    Our recommendation agent learns from your profile to find unique grants you didn't know existed.
                  </p>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">#{i}</div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${100 - i * 20}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* AI Match Analysis Section */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-20">
                <div className="flex-1 relative z-10">
                  <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[40px] border border-white/20 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <span className="text-[12px] font-bold text-teal-400 uppercase tracking-wider block mb-2">AI MATCH ANALYSIS</span>
                        <h4 className="text-[32px] font-bold">National Merit Portal</h4>
                      </div>
                      <div className="bg-teal-500/20 text-teal-400 text-[12px] font-bold px-4 py-2 rounded-full border border-teal-500/30">
                        HIGH MATCH
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[18px] font-medium text-slate-300">Academic Fit</span>
                          <span className="text-[18px] font-bold text-teal-400">92%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '92%' }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-teal-500 rounded-full"
                          ></motion.div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[18px] font-medium text-slate-300">Financial Need Match</span>
                          <span className="text-[18px] font-bold text-indigo-400">85%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '85%' }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                            className="h-full bg-indigo-500 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 z-10">
                  <h2 className="text-[56px] font-bold leading-[1.1] mb-10">
                    Precision Curation <br />
                    for Your Profile.
                  </h2>
                  <p className="text-[20px] text-slate-400 leading-relaxed mb-12">
                    Our AI analyzes 42 different data points—from your family background to your academic scores—to find the 0.1% of funding opportunities that are perfect for you.
                  </p>
                  <ul className="space-y-8">
                    {[
                      "Zero false eligibility results",
                      "Direct application links with automated forms",
                      "Priority alerts for Karnataka State Scholarships"
                    ].map((item, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        className="flex items-center gap-5 text-[20px] font-medium"
                      >
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                          <CheckCircle2 className="w-5 h-5 text-teal-400" />
                        </div>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section id="about-section" className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-[48px] font-bold text-[#002b4d] mb-8">About The Academic Curator</h2>
                <div className="max-w-3xl mx-auto">
                  <p className="text-[20px] text-slate-600 leading-relaxed mb-12">
                    We are dedicated to empowering Indian students by providing a centralized, AI-driven platform for scholarship discovery and career planning. Our mission is to ensure that no student is held back by financial constraints.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                      <h4 className="text-[40px] font-bold text-[#006666] mb-2">5000+</h4>
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-[12px]">Scholarships</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                      <h4 className="text-[40px] font-bold text-[#006666] mb-2">1M+</h4>
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-[12px]">Students</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                      <h4 className="text-[40px] font-bold text-[#006666] mb-2">24/7</h4>
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-[12px]">AI Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <Footer />
          </motion.main>
        ) : currentPage === 'details' ? (
          <ScholarshipDetails 
            scholarship={selectedScholarship || results[0]} 
            onBack={() => navigate('/results')} 
            language={language}
          />
        ) : (
          <motion.main
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8"
          >
            {/* Left Sidebar */}
            <aside className="w-full lg:w-64 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="mb-8">
                  <p className="text-[14px] font-bold text-indigo-600 mb-1">Welcome Back</p>
                  <p className="text-[12px] text-slate-400">Ready for your next scholarship?</p>
                </div>
                
                <nav className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-[15px] font-medium">
                    <LayoutDashboard className="w-5 h-5" /> AI Guidance
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 text-[15px] font-bold">
                    <Search className="w-5 h-5" /> Search
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-[15px] font-medium">
                    <Sparkles className="w-5 h-5" /> My Matches
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-[15px] font-medium">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5" /> Saved
                    </div>
                    <span className="bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-[15px] font-medium">
                    <Info className="w-5 h-5" /> About
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-[15px] font-medium">
                    <HelpCircle className="w-5 h-5" /> Help
                  </button>
                </nav>
              </div>

              <button className="w-full bg-[#002b4d] text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#003d6e] transition-all shadow-lg shadow-slate-200">
                <Sparkles className="w-4 h-4" /> Find with AI
              </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-8">
              <div className="mb-2">
                <h2 className="text-[40px] font-bold text-[#002b4d] mb-2">Find Your Scholarship</h2>
                <p className="text-slate-500 text-[16px]">
                  Let our editorial intelligence curate the best opportunities tailored to your academic profile and socioeconomic background.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10">
                  {/* Course */}
                  <div className="space-y-3">
                    <label className="text-[14px] font-bold text-[#002b4d] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" /> {language === 'en' ? 'Course' : 'ಕೋರ್ಸ್'}
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-4 text-[15px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                      value={criteria.course}
                      onChange={(e) => setCriteria({...criteria, course: e.target.value})}
                    >
                      <option value="" disabled>{language === 'en' ? 'Select course' : 'ಕೋರ್ಸ್ ಆಯ್ಕೆಮಾಡಿ'}</option>
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <label className="text-[14px] font-bold text-[#002b4d] flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" /> {language === 'en' ? 'Category' : 'ವರ್ಗ'}
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-4 text-[15px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                      value={criteria.category}
                      onChange={(e) => setCriteria({...criteria, category: e.target.value})}
                    >
                      <option value="" disabled>{language === 'en' ? 'Select category' : 'ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Income */}
                  <div className="space-y-3">
                    <label className="text-[14px] font-bold text-[#002b4d] flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-slate-400" /> {language === 'en' ? 'Annual Income' : 'ವಾರ್ಷಿಕ ಆದಾಯ'}
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-4 text-[15px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                      value={criteria.income}
                      onChange={(e) => setCriteria({...criteria, income: e.target.value})}
                    >
                      <option value="" disabled>{language === 'en' ? 'Select annual income' : 'ವಾರ್ಷಿಕ ಆದಾಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}</option>
                      {INCOMES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>

                  {/* CGPA */}
                  <div className="space-y-3">
                    <label className="text-[14px] font-bold text-[#002b4d] flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" /> {language === 'en' ? 'Current CGPA / %' : 'ಪ್ರಸ್ತುತ CGPA / %'}
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-4 text-[15px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                      value={criteria.cgpa}
                      onChange={(e) => setCriteria({...criteria, cgpa: e.target.value})}
                    >
                      <option value="" disabled>{language === 'en' ? 'Select CGPA' : 'CGPA ಆಯ್ಕೆಮಾಡಿ'}</option>
                      {CGPAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Source */}
                  <div className="col-span-1 md:col-span-2 space-y-3">
                    <label className="text-[14px] font-bold text-[#002b4d] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" /> {language === 'en' ? 'Scholarship Source' : 'ಶಿಷ್ಯವೇತನ ಮೂಲ'}
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-4 text-[15px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                      value={criteria.source}
                      onChange={(e) => setCriteria({...criteria, source: e.target.value})}
                    >
                      {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-[#002b4d] text-white py-5 rounded-2xl font-bold text-[18px] flex items-center justify-center gap-3 hover:bg-[#003d6e] transition-all shadow-lg shadow-slate-100 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  {loading ? "Finding Scholarships..." : "Find Scholarships"}
                </button>
              </div>

              {/* Results Section */}
              <div id="results-section" className="scroll-mt-24">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 gap-6"
                    >
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-[#002b4d] rounded-full animate-spin"></div>
                      <p className="text-slate-500 font-medium">AI Agents are scanning portals...</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-12">
                      {results.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[24px] font-bold text-[#002b4d]">Matching Opportunities</h3>
                            <span className="text-[14px] text-slate-400 font-medium">{results.length} results found</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map((scholarship, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-slate-100 rounded-[24px] p-6 hover:shadow-lg transition-all group"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                    {scholarship.provider}
                                  </span>
                                  <span className="text-emerald-600 font-bold text-[18px]">
                                    {scholarship.amount}
                                  </span>
                                </div>
                                <h4 className="text-[20px] font-bold text-[#002b4d] mb-3 group-hover:text-indigo-600 transition-colors">
                                  {scholarship.title}
                                </h4>
                                <p className="text-[14px] text-slate-500 mb-4 line-clamp-2">
                                  {scholarship.eligibility}
                                </p>
                                <button 
                                  onClick={() => {
                                    setSelectedScholarship(scholarship);
                                    navigate(`/scholarship/${idx}`);
                                  }}
                                  className="text-indigo-600 font-bold text-[14px] hover:underline flex items-center gap-1 mb-6"
                                >
                                  {language === 'en' ? 'View Details' : 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ'} <ChevronRight className="w-4 h-4" />
                                </button>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline</span>
                                    <span className="text-[13px] font-bold text-slate-700">{scholarship.deadline}</span>
                                  </div>
                                  <a 
                                    href={scholarship.applyUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-[#002b4d] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#003d6e] transition-all"
                                  >
                                    Apply Now <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {hasSearched && results.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-100"
                        >
                          <Search className="text-slate-200 w-12 h-12 mx-auto mb-4" />
                          <h4 className="text-[20px] font-bold text-[#002b4d]">No matches found</h4>
                          <p className="text-slate-400 mt-2">Try adjusting your criteria to find more opportunities.</p>
                        </motion.div>
                      )}

                      {/* Career Guidance Section - Visible after first interaction */}
                      {(hasSearched || criteria.course) && (
                        <div id="career-guidance-section" className="scroll-mt-24 pt-12 border-t border-slate-100">
                          <div className="mb-8">
                            <h3 className="text-[28px] font-bold text-[#002b4d] mb-2">Career Guidance Suggestions</h3>
                            <p className="text-slate-500">Based on your profile in {criteria.course}, here are some recommended paths.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                              {
                                title: "Higher Education",
                                description: `Explore advanced degrees related to ${criteria.course} at top Indian universities.`,
                                icon: BookOpen,
                                color: "bg-blue-50 text-blue-600",
                                paths: ["Masters Program", "Specialized Diploma", "Research Fellowship"]
                              },
                              {
                                title: "Industry Roles",
                                description: `Career opportunities in sectors looking for ${criteria.course} graduates.`,
                                icon: Rocket,
                                color: "bg-emerald-50 text-emerald-600",
                                paths: ["Entry-level Associate", "Technical Trainee", "Project Assistant"]
                              },
                              {
                                title: "Skill Development",
                                description: "Certification courses to enhance your employability.",
                                icon: Award,
                                color: "bg-amber-50 text-amber-600",
                                paths: ["Soft Skills Training", "Digital Literacy", "Professional Certs"]
                              }
                            ].map((career, i) => (
                              <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className={`w-12 h-12 ${career.color} rounded-xl flex items-center justify-center mb-6`}>
                                  <career.icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-[20px] font-bold text-[#002b4d] mb-3">{career.title}</h4>
                                <p className="text-[14px] text-slate-500 mb-6">{career.description}</p>
                                <div className="space-y-2">
                                  {career.paths.map((path, j) => (
                                    <div key={j} className="flex items-center gap-2 text-[13px] font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                                      <ChevronRight className="w-3 h-3 text-slate-400" /> {path}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasSearched && (
                        <div className="text-center py-20">
                          <p className="text-slate-300 font-medium italic">Your personalized matches will appear here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
              
              <Footer />
            </div>

            {/* Right Sidebar */}
            <aside className="w-full lg:w-80 flex flex-col gap-6">
              {/* Speak Now Card */}
              <div 
                onClick={handleVoiceInput}
                className={`bg-[#f5f5f0] p-8 rounded-[32px] border border-[#e5e5df] cursor-pointer hover:bg-[#ecece6] transition-colors relative overflow-hidden ${isListening ? 'ring-2 ring-[#8b8b4b]' : ''}`}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Mic className={`w-6 h-6 ${isListening ? 'text-red-500 animate-pulse' : 'text-[#8b8b4b]'}`} />
                </div>
                <h3 className="text-[24px] font-bold text-[#002b4d] mb-2">
                  {isListening ? (language === 'en' ? 'Listening...' : 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...') : (language === 'en' ? 'Speak Now' : 'ಈಗ ಮಾತನಾಡಿ')}
                </h3>
                <p className="text-[14px] text-slate-500 mb-6">
                  {language === 'en' ? 'Describe your needs in English or Kannada' : 'ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ'}
                </p>
                <div className="flex gap-1 items-end h-8">
                  {[0.4, 0.7, 1, 0.6, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                    <motion.div 
                      key={i} 
                      animate={isListening ? { height: [`${h * 50}%`, `${h * 100}%`, `${h * 50}%`] } : { height: `${h * 100}%` }}
                      transition={isListening ? { repeat: Infinity, duration: 0.5, delay: i * 0.1 } : {}}
                      className="w-1 bg-[#8b8b4b] rounded-full" 
                    ></motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-[18px] font-bold text-[#002b4d] mb-6 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-indigo-500" /> Quick Actions
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Heart, label: "Saved Scholarships" },
                    { icon: HelpCircle, label: "Help & Guidance" },
                    { icon: FileText, label: "Eligibility Docs" },
                    { icon: Settings, label: "Profile Settings" }
                  ].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-[14px] font-medium text-slate-600">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <button className="fixed bottom-8 right-8 bg-[#002b4d] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all group z-50">
        <div className="relative">
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#002b4d]">1</span>
        </div>
      </button>
    </div>
  );
}
