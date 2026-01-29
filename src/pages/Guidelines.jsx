
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, Monitor, Check, Lock, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Guidelines = () => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [examActive, setExamActive] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    // Listen for Global Exam Status
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "system", "examStatus"), (docSnap) => {
            if (docSnap.exists()) {
                const isActive = docSnap.data().isActive;
                setExamActive(isActive);
                if (isActive && isWaiting) {
                    enterExam();
                }
            }
        });
        return () => unsub();
    }, [isWaiting]);

    const enterExam = async () => {
        try {
            // Enter Fullscreen
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen().catch(e => console.log("Fullscreen blocked:", e));
            }
            console.log("Navigating to exam...");
            navigate('/exam');
        } catch (error) {
            console.error("Navigation failed:", error);
            // Even if fullscreen fails, try to navigate if exam is live
            navigate('/exam');
        }
    };

    const handleStartClick = () => {
        if (!agreed) {
            alert("You must agree to the rules to proceed.");
            return;
        }

        if (examActive) {
            enterExam();
        } else {
            setIsWaiting(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                        <Shield size={18} fill="currentColor" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Codex <span className="text-purple-500">Secure</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <Lock size={12} />
                    <span>ENCRYPTED SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
                <div className="max-w-3xl w-full bg-zinc-900/30 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm flex flex-col max-h-[85vh]">

                    {/* Title Section */}
                    <div className="p-8 pb-0 text-center shrink-0">
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Exam Guidelines</h1>
                        <p className="text-zinc-400">Please review the following protocols strictly before proceeding.</p>
                    </div>

                    {/* Scrollable Rules Container */}
                    <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">

                        {/* Critical Warning */}
                        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl relative overflow-hidden group hover:bg-red-500/10 transition-colors">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[50px] rounded-full group-hover:bg-red-500/20 transition-all"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="mt-1 p-2 bg-red-500/20 text-red-500 rounded-lg">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-red-100">Zero Tolerance Policy</h3>
                                    <p className="text-sm text-red-200/70 leading-relaxed">
                                        The system monitors for tab switching, copy-pasting, minimizing, and shortcuts (Alt+Tab, Win, etc.).
                                        <span className="font-bold text-red-200"> 3 violations</span> will automatically terminate your session.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Rules List */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Monitor size={18} className="text-purple-500" /> 1. System Environment
                                </h3>
                                <ul className="list-disc list-inside space-y-2 text-zinc-400 text-sm ml-2">
                                    <li>The exam must be taken in <span className="text-zinc-200 font-medium">Full Screen Mode</span> at all times.</li>
                                    <li>Do not minimize the browser window.</li>
                                    <li>Do not switch to other tabs or applications.</li>
                                    <li>Ensure you have a stable internet connection throughout the session.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-purple-500" /> 2. Content & Integrity
                                </h3>
                                <ul className="list-disc list-inside space-y-2 text-zinc-400 text-sm ml-2">
                                    <li>All code must be written manually. Copy-pasting from external sources is strictly prohibited.</li>
                                    <li>Clipboard access is monitored. Any attempt to paste external content will be flagged.</li>
                                    <li>Right-click context menu and Developer Tools (F12) are disabled.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-purple-500" /> 3. Violation Protocol
                                </h3>
                                <ul className="list-disc list-inside space-y-2 text-zinc-400 text-sm ml-2">
                                    <li>User focus is tracked. Switching windows or tabs counts as a violation.</li>
                                    <li>Using prohibited keyboard shortcuts (Alt+Tab, Ctrl+C/V, etc.) counts as a violation.</li>
                                    <li>Reaching <span className="text-red-400 font-bold">3 violations</span> results in automatic disqualification.</li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-white/5 bg-black/20 shrink-0">
                        <div className="flex flex-col items-center gap-6">
                            {!isWaiting && (
                                <label className="flex items-center gap-4 cursor-pointer group select-none w-full p-4 rounded-xl border border-white/5 bg-white/5 hover:border-purple-500/30 transition-all">
                                    <div className={`w - 6 h - 6 rounded - md border - 2 flex items - center justify - center transition - all duration - 300 ${agreed ? 'bg-purple-600 border-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'border-zinc-600 group-hover:border-zinc-400'} `}>
                                        {agreed && <Check size={16} className="text-white scale-110" strokeWidth={3} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                                    <div className="flex-1">
                                        <span className={`font - bold transition - colors block ${agreed ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'} `}>I Acknowledge & Agree</span>
                                        <p className="text-xs text-zinc-500">I have read and understood all the instructions.</p>
                                    </div>
                                </label>
                            )}

                            {isWaiting ? (
                                <div className="w-full bg-zinc-800/50 border border-white/10 p-6 rounded-xl flex flex-col items-center justify-center gap-3 animate-pulse">
                                    <Loader2 size={32} className="text-purple-500 animate-spin" />
                                    <h3 className="text-lg font-bold text-white">Waiting for Admin...</h3>
                                    <p className="text-sm text-zinc-400">Please prepare yourself. The exam will start automatically.</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStartClick}
                                    disabled={!agreed}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-3 text-lg tracking-wide hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {examActive ? 'START EXAMINATION' : 'ENTER EXAM LOBBY'} <CheckCircle size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guidelines;
