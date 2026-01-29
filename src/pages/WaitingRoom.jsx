import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert, CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const WaitingPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
            navigate('/');
            return;
        }
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        // Listen for real-time updates to this student's request
        const unsub = onSnapshot(doc(db, "exam_requests", user.rollNumber), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStatus(data.status);

                if (data.status === 'approved') {
                    // Auto-redirect to Guidelines
                    setTimeout(() => navigate('/guidelines'), 1500);
                }
            }
        });

        return () => unsub();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
            {status === 'pending' && (
                <>
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-zinc-800 border-t-primary animate-spin"></div>
                        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={40} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Waiting for Approval</h1>
                        <p className="text-zinc-400 max-w-md mx-auto">
                            Your request to enter the exam lobby has been sent. Please wait while an administrator reviews your details.
                        </p>
                    </div>
                </>
            )}

            {status === 'approved' && (
                <>
                    <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center animate-bounce">
                        <CheckCircle size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2 text-green-400">Request Approved!</h1>
                        <p className="text-zinc-400">Redirecting to exam guidelines...</p>
                    </div>
                </>
            )}

            {status === 'rejected' && (
                <>
                    <div className="w-24 h-24 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                        <ShieldAlert size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2 text-red-400">Request Denied</h1>
                        <p className="text-zinc-400 max-w-md mx-auto">
                            An administrator has declined your request to enter the exam. Please contact the invigilator for assistance.
                        </p>
                        <button onClick={() => navigate('/')} className="mt-8 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors">
                            Back to Login
                        </button>
                    </div>
                </>
            )}

            {status === 'disqualified' && (
                <>
                    <div className="w-24 h-24 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                        <ShieldAlert size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2 text-red-400">You have been Disqualified</h1>
                        <p className="text-zinc-400 max-w-md mx-auto">
                            Your exam session has been terminated due to violations. Please contact the administrator to revoke your disqualification.
                        </p>
                        <button onClick={() => navigate('/')} className="mt-8 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors">
                            Back to Login
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default WaitingPage;
