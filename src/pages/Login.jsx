
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Hash, User, ArrowRight, Code2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const LoginPage = () => {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!name || !rollNumber) return;

        const finalRoll = rollNumber.toUpperCase();

        try {
            const docRef = doc(db, "exam_requests", finalRoll);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.status === 'disqualified') {
                    alert("You have been Disqualified! You cannot retake the exam unless an Admin revokes your suspension.");
                    return;
                }
                if (data.status === 'completed' || data.status === 'auto_submitted') {
                    alert("You have already completed the exam.");
                    return;
                }
            }

            // Proceed to Login / Request
            const userData = {
                name,
                rollNumber: finalRoll,
                loginTime: new Date().toISOString(),
                status: 'active',
                correctMarks: 0,
                totalViolations: 0,
                retakes: docSnap.exists() ? (docSnap.data().retakes || 0) + 1 : 0
            };

            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Update DB
            // Only update if not already approved? Or always reset to pending?
            // If they are logging in again, let's set to pending if status is not 'approved' or 'active'
            // Actually, if status is 'active', they might be refreshing.

            await setDoc(docRef, {
                name: name,
                rollNumber: finalRoll,
                // If previously approved, keep approved? No, let's force re-approval/waiting room if it's a new session?
                // But user might just be relogging.
                // Simplest: Set to 'pending' if it was 'active' or 'rejected'. 
                // If 'approved', maybe keep it?
                status: docSnap.exists() && docSnap.data().status === 'approved' ? 'approved' : 'pending',
                requestTime: serverTimestamp(),
                retakes: userData.retakes
            }, { merge: true });

            navigate('/waiting');

        } catch (error) {
            console.error("Firebase Error:", error);
            alert("Connection failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[100px] rounded-full"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-accent/20 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl mb-4 shadow-lg shadow-primary/25">
                        <Code2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Codex Login</h1>
                    <p className="text-gray-400">Enter your credentials to begin</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Roll Number</label>
                        <div className="relative group">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="21BXC..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-primary/25 transform transition-all active:scale-[0.98] mt-4"
                    >
                        Start Exam
                    </button>
                </form>
            </div>

            <div className="absolute bottom-4 text-center space-y-1">
                <p className="text-zinc-600 text-xs font-mono">Made by Akkala Teja Swaroop</p>
                <p className="text-[10px] text-zinc-700">© 2026 All Rights Reserved</p>
            </div>
        </div>
    );
};

export default LoginPage;
