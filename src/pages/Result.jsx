import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Shield, RefreshCw, Trophy, Clock, AlertTriangle, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const reportRef = useRef(null);
    const [animate, setAnimate] = useState(false);

    // Expecting state: { user: currentUser, score: number, totalQuestions: number, timeTaken: string }
    const { user, score, maxScore, timeTaken, violations } = location.state || {}; // Fallback if direct access

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
        setTimeout(() => setAnimate(true), 100);
    }, [user, navigate]);

    if (!user) return null;

    const downloadReport = async () => {
        const element = reportRef.current;
        if (!element) return;

        // Temporary styling to ensure capture captures everything cleanly
        const originalStyle = element.style.cssText;
        element.style.borderRadius = "0"; // Flatten for capture

        try {
            console.log("Generating report...");

            // Wait a brief moment to ensure all re-renders are complete
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#0a0a0a', // Match theme background
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate ratios to fit the card nicely in the PDF
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.width / imgProps.height;
            const pdfRatio = pdfWidth / pdfHeight;

            let finalWidth = pdfWidth - 20; // 10mm padding each side
            let finalHeight = finalWidth / ratio;

            if (finalHeight > pdfHeight - 20) {
                finalHeight = pdfHeight - 20;
                finalWidth = finalHeight * ratio;
            }

            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            pdf.save(`Codex_Report_${user.rollNumber || 'Candidate'}.pdf`);

            console.log("Report generated successfully.");

        } catch (err) {
            console.error("Report generation failed:", err);
            alert("Failed to generate report. Please try again.");
        } finally {
            // Restore original styles
            if (element) element.style.cssText = originalStyle;
        }
    };

    const handleRetake = () => {
        if (!confirm("Start Exam Retake? Current progress will be lost and you will restart.")) return;

        // 1. Update retake count in history
        const allUsers = JSON.parse(localStorage.getItem('codex_users') || '[]');
        const idx = allUsers.findIndex(u => u.rollNumber === user.rollNumber && u.loginTime === user.loginTime);
        if (idx >= 0) {
            allUsers[idx].retakes = (allUsers[idx].retakes || 0) + 1;
            allUsers[idx].correctMarks = 0; // Reset marks for new attempt
            allUsers[idx].totalViolations = 0; // Reset violations
            localStorage.setItem('codex_users', JSON.stringify(allUsers));
        }

        // 2. Reset Current User Session Data
        const cleanUser = {
            ...user,
            correctMarks: 0,
            totalViolations: 0,
            retakes: (user.retakes || 0) + 1,
            loginTime: new Date().toISOString() // New session start
        };
        localStorage.setItem('currentUser', JSON.stringify(cleanUser));

        // 3. Redirect to Exam with Shuffle Flag
        navigate('/exam', { state: { shuffle: true } });
    };

    // Calculate percentage
    const percentage = Math.round((score / maxScore) * 100) || 0;
    const isPass = percentage >= 35;
    const isDisqualified = location.state?.disqualified;

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-primary/20">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className={`z-10 w-full max-w-4xl transition-all duration-1000 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Result Card (Capture Target) */}
                <div ref={reportRef} className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
                    {/* decorative top bar */}
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${isDisqualified ? 'bg-red-500' : (isPass ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500')}`}></div>

                    <div className="p-10 md:p-14 flex flex-col md:flex-row gap-12">

                        {/* Left: Score Circle */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-zinc-800 pb-8 md:pb-0 md:pr-12">
                            <div className="relative w-48 h-48 mb-6">
                                {/* Simple SVG Circle Progress */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="none"
                                        stroke={isDisqualified ? '#ef4444' : (isPass ? '#10b981' : '#f59e0b')}
                                        strokeWidth="8"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * percentage) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold text-white tracking-tighter">{percentage}%</span>
                                    <span className={`text-xs uppercase font-bold tracking-widest mt-1 ${isDisqualified ? 'text-red-500' : (isPass ? 'text-green-500' : 'text-yellow-500')}`}>
                                        {isDisqualified ? 'Failed' : (isPass ? 'Passed' : 'Average')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-white">
                                    {isDisqualified ? 'Disqualified' : (user.status === 'auto_submitted' || location.state?.isAutoSubmitted ? 'Exam Ended (Auto)' : 'Exam Completed')}
                                </h1>
                                <p className="text-zinc-500 text-sm">
                                    {isDisqualified
                                        ? "Violations exceeded allowed limit."
                                        : (user.status === 'auto_submitted' || location.state?.isAutoSubmitted
                                            ? "Your exam was automatically submitted by the administrator."
                                            : "Your session has been recorded successfully.")}
                                </p>
                            </div>
                        </div>

                        {/* Right: Detailed Stats */}
                        <div className="flex-[1.5] flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                                <div className="space-y-1">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <FileText size={14} /> Candidate
                                    </div>
                                    <div className="text-xl font-medium text-white">{user.name}</div>
                                    <div className="text-sm font-mono text-zinc-400">{user.rollNumber}</div>
                                </div>

                                <div className="space-y-1 text-right">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center justify-end gap-2">
                                        <Trophy size={14} /> Score Achieved
                                    </div>
                                    <div className="text-3xl font-bold text-white font-mono">{score} <span className="text-lg text-zinc-600 font-normal">/ {maxScore}</span></div>
                                </div>

                                {!isDisqualified && (
                                    <div className="space-y-1">
                                        <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Clock size={14} /> Time Taken
                                        </div>
                                        <div className="text-lg font-mono text-zinc-200">{timeTaken}</div>
                                    </div>
                                )}

                                <div className="space-y-1 text-right">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center justify-end gap-2">
                                        <AlertTriangle size={14} /> Violations
                                    </div>
                                    <div className={`text-lg font-bold ${violations > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {violations} <span className="text-sm font-normal text-zinc-600">recorded</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-3 bg-zinc-900/50 rounded-lg px-4 py-3 border border-zinc-800">
                                    <Shield size={16} className="text-emerald-500" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-zinc-500 font-bold">Verification ID</span>
                                        <span className="text-xs font-mono text-zinc-300">{Math.random().toString(36).substr(2, 12).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-zinc-600 font-mono">Codex Global Evaluation</div>
                                    <div className="text-[10px] text-zinc-700">© 2026 Secured System</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center mt-8">
                    <button onClick={downloadReport} className="group relative px-6 py-3 rounded-xl bg-white text-black font-bold text-sm shadow-xl shadow-white/5 hover:shadow-white/20 transition-all active:scale-95 flex items-center gap-2">
                        <Download size={16} className="text-zinc-600 group-hover:text-black transition-colors" /> {isDisqualified ? "Download Report" : "Download Certificate"}
                    </button>

                    {!isDisqualified && (
                        <button onClick={handleRetake} className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-sm hover:bg-zinc-700 hover:text-white transition-all flex items-center gap-2">
                            <RefreshCw size={16} /> Retake Exam
                        </button>
                    )}

                    <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-sm hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2">
                        <Home size={16} /> Login Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
