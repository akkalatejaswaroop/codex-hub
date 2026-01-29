import React, { useState, useEffect } from 'react';
import { Shield, Lock, Download, RefreshCw, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';


const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessKey, setAccessKey] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [autoApprove, setAutoApprove] = useState(false); // New state for Auto Approve
    const [examStarted, setExamStarted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter Users
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Listen for System Exam Status
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "system", "examStatus"), (doc) => {
            if (doc.exists()) {
                setExamStarted(doc.data().isActive);
            }
        });
        return () => unsub();
    }, []);

    // Auto-Approve Effect
    useEffect(() => {
        if (autoApprove && requests.length > 0) {
            requests.forEach(req => {
                if (req.status === 'pending') {
                    handleApproval(req.id, 'approved');
                }
            });
        }
    }, [autoApprove, requests]);

    const toggleExamStatus = async () => {
        // If we are starting the exam, ensure the document exists
        try {
            const statusRef = doc(db, "system", "examStatus");
            await setDoc(statusRef, { isActive: !examStarted }, { merge: true });
        } catch (err) {
            console.error("Failed to toggle exam status:", err);
            alert("System Error: Could not toggle exam status.");
        }
    };

    useEffect(() => {
        // Listen for ALL exam requests
        const q = query(collection(db, "exam_requests"));
        const unsub = onSnapshot(q, (snapshot) => {
            const allUsers = [];
            const activeRequests = [];

            snapshot.forEach((doc) => {
                const data = { ...doc.data(), id: doc.id };
                allUsers.push(data);

                if (data.status === 'pending' || data.status === 'disqualified') {
                    activeRequests.push(data);
                }
            });

            // Sort by login time if available, or name
            allUsers.sort((a, b) => new Date(b.loginTime || 0) - new Date(a.loginTime || 0));

            setUsers(allUsers);
            setRequests(activeRequests);
        });
        return () => unsub();
    }, []);

    const handleApproval = async (rollNumber, status) => {
        try {
            const userRef = doc(db, "exam_requests", rollNumber);
            await updateDoc(userRef, { status: status });
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Action failed");
        }
    };

    // No longer needing manual loadData as we have real-time listener
    const loadData = () => { };

    const downloadCSV = () => {
        if (users.length === 0) {
            alert("No data to download.");
            return;
        }

        const headers = ["Name", "Roll Number", "Correct Marks", "Violations", "Retakes", "Login Time", "Logout Time"];
        const csvRows = [headers.join(',')];

        users.forEach(u => {
            const row = [
                `"${u.name}"`,
                `"${u.rollNumber}"`,
                u.correctMarks || 0,
                u.totalViolations || 0,
                u.retakes || 0,
                u.loginTime ? new Date(u.loginTime).toLocaleString() : '',
                u.logoutTime ? new Date(u.logoutTime).toLocaleString() : ''
            ];
            csvRows.push(row.join(','));
        });

        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'codex_network_logs.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleAutoSubmitAll = async () => {
        if (window.confirm("WARNING: This will force submit the exam for ALL active candidates. They will be redirected to the result page. Proceed?")) {
            try {
                // Batch update or iterate through active users
                // Note: Only target users who are NOT already disqualified or finished (have logoutTime)
                const activeUsers = users.filter(u => !u.logoutTime && u.status !== 'disqualified' && u.status === 'approved');

                const updatePromises = activeUsers.map(user =>
                    updateDoc(doc(db, "exam_requests", user.id), { status: 'auto_submitted' })
                );

                await Promise.all(updatePromises);
                alert(`Successfully auto-submitted for ${activeUsers.length} active candidates.`);
            } catch (err) {
                console.error("Auto submit failed:", err);
                alert("Failed to auto-submit some users.");
            }
        }
    };

    const handleDeleteLogs = async () => {
        if (window.confirm("DANGER: This will delete ALL exam data and requests from the SERVER. This cannot be undone. Are you sure?")) {
            try {
                // Deleting one by one (For larger datasets, use batching or a cloud function)
                const deletePromises = users.map(user =>
                    deleteDoc(doc(db, "exam_requests", user.id))
                );
                await Promise.all(deletePromises);
                alert("All logs deleted successfully.");
            } catch (err) {
                console.error("Error deleting logs:", err);
                alert("Failed to delete logs.");
            }
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const validKey = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
        if (accessKey === validKey) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid Access Key');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="w-full max-w-sm p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
                    <Shield className="mx-auto mb-4 text-zinc-600" size={40} />
                    <h2 className="text-xl font-mono mb-6">Network Access Control</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={accessKey}
                                onChange={e => setAccessKey(e.target.value)}
                                className="w-full bg-black border border-zinc-700 p-3 text-center font-mono rounded focus:border-white focus:outline-none transition-colors"
                                placeholder="ENTER ACCESS KEY"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 font-mono">{error}</p>}
                        <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded hover:bg-zinc-200 transition-colors">
                            AUTHENTICATE
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-300 font-mono p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-zinc-800 pb-6 gap-6 md:gap-0">
                    <div>
                        <h1 className="text-2xl text-white font-bold flex items-center gap-3">
                            <Shield className="text-green-500" /> NETWORK LOGS
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Real-time local storage monitoring node</p>
                    </div>

                    {/* Controls - Responsive Grid/Flex */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <button
                            onClick={toggleExamStatus}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${examStarted ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-green-600 border-green-500 text-black'}`}
                        >
                            {examStarted ? 'STOP EXAM' : 'START EXAM'}
                        </button>

                        <div className="hidden md:block h-6 w-px bg-zinc-800 mx-2"></div>

                        {/* Auto Submit All Button */}
                        <button
                            onClick={handleAutoSubmitAll}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all border border-orange-500 whitespace-nowrap"
                        >
                            <Download size={14} className="rotate-180" /> AUTO SUBMIT
                        </button>

                        <div className="hidden md:block h-6 w-px bg-zinc-800 mx-2"></div>

                        {/* Auto Approve Toggle */}
                        <button
                            onClick={() => setAutoApprove(!autoApprove)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${autoApprove ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${autoApprove ? 'bg-white animate-pulse' : 'bg-zinc-600'}`}></div>
                            {autoApprove ? 'AUTO APPROVE: ON' : 'AUTO APPROVE: OFF'}
                        </button>

                        <div className="w-full md:w-auto flex gap-3 mt-2 md:mt-0">
                            <button onClick={handleDeleteLogs} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs transition-all whitespace-nowrap">
                                <Trash2 size={14} /> CLEAR LOGS
                            </button>
                            <button onClick={downloadCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded text-xs transition-all whitespace-nowrap">
                                CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Requests Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Lock size={18} className="text-yellow-500" /> Live Access Requests
                        {requests.length > 0 && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">{requests.length}</span>}
                    </h2>

                    {requests.length === 0 ? (
                        <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800 text-zinc-500 text-sm italic">
                            No pending requests.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {requests.map(req => (
                                <div key={req.id} className={`flex items-center justify-between border p-4 rounded-lg ${req.status === 'disqualified' ? 'bg-red-900/20 border-red-500/30' : 'bg-zinc-900 border-yellow-500/20'}`} >
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {req.name}
                                            {req.status === 'disqualified' && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Disqualified</span>}
                                        </div>
                                        <div className="text-sm text-zinc-400 font-mono">{req.rollNumber}</div>
                                    </div>
                                    <div className="flex gap-3">
                                        {req.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApproval(req.id, 'rejected')}
                                                    className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                                                    title="Deny Access"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(req.id, 'approved')}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                                                >
                                                    <CheckCircle size={14} /> APPROVE ACCESS
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'disqualified' && (
                                            <button
                                                onClick={() => handleApproval(req.id, 'approved')}
                                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded text-xs flex items-center gap-2 transition-all"
                                            >
                                                <RefreshCw size={14} /> REVOKE & APPROVE
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Student Logs</div>
                        <input
                            type="text"
                            placeholder="Search by Name or Roll No..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-800 text-white px-4 py-2 rounded text-sm outline-none border border-zinc-700 focus:border-zinc-500 w-full md:w-64 transition-all"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Student Name</th>
                                    <th className="px-6 py-4 font-medium">Roll Number</th>
                                    <th className="px-6 py-4 font-medium text-right">Marks</th>
                                    <th className="px-6 py-4 font-medium text-center">Violations</th>
                                    <th className="px-6 py-4 font-medium text-center">Retakes</th>
                                    <th className="px-6 py-4 font-medium">Login Time</th>
                                    <th className="px-6 py-4 font-medium">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-zinc-600">No matching logs found.</td></tr>
                                ) : (
                                    filteredUsers.map((u, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">{u.name}</td>
                                            <td className="px-6 py-4 text-zinc-400">{u.rollNumber}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-green-400 font-bold">{u.correctMarks || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {u.totalViolations > 0 ? (
                                                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs border border-red-500/20">{u.totalViolations}</span>
                                                ) : (
                                                    <span className="text-zinc-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center text-zinc-400">{u.retakes || 0}</td>
                                            <td className="px-6 py-4 text-zinc-500 text-xs">
                                                {u.loginTime ? new Date(u.loginTime).toLocaleString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 text-xs">
                                                {u.logoutTime ? (
                                                    <span className="text-zinc-500">{new Date(u.logoutTime).toLocaleString()}</span>
                                                ) : u.status === 'disqualified' ? (
                                                    <span className="text-red-500 font-bold">DISQUALIFIED</span>
                                                ) : u.status === 'auto_submitted' ? (
                                                    <span className="text-orange-500 font-bold">AUTO SUBMITTED</span>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-yellow-500/50">Active</span>

                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to TERMINATE user ${u.name}?`)) {
                                                                    handleApproval(u.id, 'disqualified');
                                                                }
                                                            }}
                                                            className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded text-[10px] font-bold transition-all"
                                                        >
                                                            TERMINATE
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
