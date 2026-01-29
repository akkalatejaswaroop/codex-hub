import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { AlertTriangle, Terminal, Monitor, Check } from 'lucide-react';
import ExamEditor from '../components/ExamEditor';
import toast, { Toaster } from 'react-hot-toast';



const ExamPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Core State
    const [examQuestions, setExamQuestions] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [solvedQuestions, setSolvedQuestions] = useState([]);
    const [violations, setViolations] = useState(0);
    const [fullScreenError, setFullScreenError] = useState(false);

    // 1. Init User & Questions
    const [loadingError, setLoadingError] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
            navigate('/');
            return;
        }
        setCurrentUser(JSON.parse(userStr));

        // Load Questions from JSON
        console.log("Fetching questions from /questions.json...");
        fetch('/questions.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Questions loaded:", data);
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("Invalid or empty questions data");
                }
                const qs = location.state?.shuffle
                    ? [...data].sort(() => Math.random() - 0.5)
                    : data;

                setExamQuestions(qs);
                setActiveQuestion(qs[0]);
            })
            .catch(err => {
                console.error("Failed to load questions:", err);
                setLoadingError(err.message);
                toast.error(`Error loading exam: ${err.message}`);
            });

    }, [navigate, location.state]);

    const syncResultToBackend = async (finalViolations, finalResultState) => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, "exam_requests", currentUser.rollNumber); // Assuming rollNumber is the ID
            // If not id, we might need to use currentUser.id if that was passed. 
            // Based on Admin.jsx, doc.id seems to be used as key.
            // Let's fallback to query if needed, but for now try direct ref if we stored id/roll properly.
            // Actually, in Login.jsx we usually store the Doc ID or use Roll Number as Doc ID.
            // Let's assume currentUser.id exists or we use rollNumber (Login.jsx pending check).
            // Safest: use currentUser.id if available.

            const docId = currentUser.id || currentUser.rollNumber;

            await updateDoc(doc(db, "exam_requests", docId), {
                status: finalResultState.status || 'completed',
                correctMarks: finalResultState.score,
                totalViolations: finalViolations,
                logoutTime: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to sync result", e);
        }
    };

    // 2. Proctoring & Fullscreen
    const terminatedRef = useRef(false);

    useEffect(() => {
        const checkFS = () => {
            if (activeQuestion && !document.fullscreenElement) {
                setFullScreenError(true);
            } else {
                setFullScreenError(false);
            }
        };

        const interval = setInterval(checkFS, 1500);

        const handleViolation = (msg) => {
            if (terminatedRef.current) return;

            // Show toast first
            import('react-hot-toast').then(({ default: toast }) => {
                toast.error(`⚠️ Violation Recorded: ${msg}`, { duration: 4000 });
            });

            setViolations(v => {
                const nv = v + 1;

                // Sync partial violation count immediately
                if (currentUser) {
                    const docId = currentUser.id || currentUser.rollNumber;
                    updateDoc(doc(db, "exam_requests", docId), {
                        totalViolations: nv
                    }).catch(console.error);
                }

                if (nv >= 3) {
                    // TERMINATE
                    terminatedRef.current = true;

                    const resultState = {
                        user: currentUser,
                        score: solvedQuestions.length * 10,
                        maxScore: examQuestions.length * 10,
                        violations: nv,
                        timeTaken: "Terminated",
                        status: 'disqualified'
                    };

                    syncResultToBackend(nv, resultState).then(() => {
                        alert("Exam Terminated due to multiple violations.");
                        navigate('/result', { state: resultState });
                    });
                }
                return nv;
            });
            console.warn("VIOLATION:", msg);
        };

        // ... (Listeners same as before)

        // Listeners for shortcuts
        const handleKey = (e) => {
            if (terminatedRef.current) return;
            // Block standard restricted keys
            if (e.key === "Alt" || e.metaKey || e.key === "contextmenu") {
                e.preventDefault();
                handleViolation("Restricted Key");
            }

            // Block F12, Ctrl+Shift+I (DevTools), Ctrl+P (Print)
            if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I") || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault();
                handleViolation("Inspector / Tools Attempt");
            }

            // Block Copy/Paste Shortcuts via Keyboard (Optional, since we handle the event below too)
            // if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
            //     e.preventDefault();
            //     handleViolation("Clipboard Shortcut");
            // }
        };

        const preventDefaultAndViolate = (e, type) => {
            if (terminatedRef.current) return;
            e.preventDefault();
            handleViolation(type);
            return false;
        };

        window.addEventListener('keydown', handleKey);

        // Block Context Menu (Right Click)
        const handleContextMenu = (e) => preventDefaultAndViolate(e, "Right Click");
        window.addEventListener('contextmenu', handleContextMenu);

        // Block Clipboard Operations
        const handleCopy = (e) => preventDefaultAndViolate(e, "Copy Attempt");
        const handleCut = (e) => preventDefaultAndViolate(e, "Cut Attempt");
        const handlePaste = (e) => preventDefaultAndViolate(e, "Paste Attempt");

        window.addEventListener('copy', handleCopy);
        window.addEventListener('cut', handleCut);
        window.addEventListener('paste', handlePaste);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !terminatedRef.current) handleViolation("Tab Switch");
        });

        // Strict Fullscreen Exit Monitoring
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && !terminatedRef.current) {
                setFullScreenError(true);
                handleViolation("Exited Fullscreen");
            }
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('cut', handleCut);
            window.removeEventListener('paste', handlePaste);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, [activeQuestion, navigate, solvedQuestions, examQuestions, currentUser]);

    // ... (Navigation helper)

    const submitExam = () => {
        if (confirm("Are you sure you want to finish the exam?")) {
            const score = solvedQuestions.length * 10;
            const resultState = {
                user: currentUser,
                score: score,
                maxScore: examQuestions.length * 10,
                violations,
                timeTaken: "25m",
                status: 'completed'
            };

            syncResultToBackend(violations, resultState).then(() => {
                navigate('/result', { state: resultState });
            });
        }
    };

    const handleCodeSubmit = (success) => {
        if (success && activeQuestion) {
            setSolvedQuestions(prev => {
                if (!prev.includes(activeQuestion.id)) {
                    toast.success("Problem Solved! (+10 pts) 🎉");
                    return [...prev, activeQuestion.id];
                }
                return prev;
            });
        }
    };

    if (loadingError) return (
        <div className="bg-[#1e1e1e] text-red-400 h-screen flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle size={48} className="mb-4" />
            <h2 className="text-xl font-bold mb-2">Failed to Load Exam</h2>
            <p className="text-gray-400 max-w-md">{loadingError}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">Retry</button>
        </div>
    );

    if (!activeQuestion) return (
        <div className="bg-[#1e1e1e] text-blue-400 h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="font-mono text-sm animate-pulse">Loading Environment...</p>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#1e1e1e] overflow-hidden text-gray-200">
            <Toaster position="top-center" reverseOrder={false} />
            {/* Header */}
            <div className="h-14 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-blue-400" />
                    <span className="font-bold">Codex <span className="text-blue-500">Exam</span></span>
                </div>

                <div className="flex gap-2">
                    {examQuestions.map((q, i) => (
                        <button
                            key={q.id}
                            onClick={() => setActiveQuestion(q)}
                            className={`w-8 h-8 rounded text-xs font-bold ${activeQuestion.id === q.id ? 'bg-blue-600 text-white' : (solvedQuestions.includes(q.id) ? 'bg-green-600/20 text-green-500' : 'bg-[#3e3e42] text-gray-400')}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#2d2d2d] px-3 py-1 rounded">
                        <Check size={14} className="text-green-500" />
                        <span className="text-xs font-bold text-gray-300">Score: {solvedQuestions.length * 10}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded border border-red-500/20">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="text-xs font-bold text-red-500">{violations} / 3</span>
                    </div>

                    <button onClick={submitExam} className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-transform active:scale-95">
                        FINISH EXAM
                    </button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Info */}
                <div className="w-[30%] min-w-[300px] border-r border-[#3e3e42] flex flex-col bg-[#1e1e1e]">
                    <div className="p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">{activeQuestion.title}</h2>
                        <div className="prose prose-invert prose-sm text-gray-300 leading-relaxed whitespace-pre-line mb-6">
                            {activeQuestion.description}
                        </div>

                        <div className="space-y-4">
                            {activeQuestion.testCases.filter(tc => !tc.hidden).map((tc, k) => (
                                <div key={k} className="bg-[#252526] p-3 rounded border border-[#3e3e42]">
                                    <div className="text-xs uppercase text-gray-500 font-bold mb-1">Input</div>
                                    <code className="block bg-black/30 p-2 rounded text-xs font-mono mb-2 text-blue-200">{tc.input}</code>
                                    <div className="text-xs uppercase text-gray-500 font-bold mb-1">Output</div>
                                    <code className="block bg-black/30 p-2 rounded text-xs font-mono text-green-200">{tc.output}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 min-w-0">
                    <ExamEditor question={activeQuestion} onCodeSubmit={handleCodeSubmit} />
                </div>
            </div>

            {/* Fullscreen Blocker */}
            {fullScreenError && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-10 text-center">
                    <div className="max-w-md">
                        <Monitor size={64} className="mx-auto text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-4">Fullscreen Required</h2>
                        <p className="text-gray-400 mb-8">You must remain in fullscreen mode to continue the exam.</p>
                        <button onClick={() => document.documentElement.requestFullscreen()} className="bg-blue-600 px-6 py-3 rounded-lg text-white font-bold">return to exam</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;

