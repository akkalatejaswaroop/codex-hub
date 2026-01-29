
import React, { useState, useEffect, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Play, Terminal, AlertTriangle, Check, BookOpen, Clock, XCircle, CheckCircle, Brain, X } from 'lucide-react';
import { runCode } from '../hooks/useCodeExecution';
import { checkTestCase } from '../utils/testCases';
import toast, { Toaster } from 'react-hot-toast';

const LANGUAGES = {
    python: {
        name: "Python 3",
        id: "python",
        defaultCode: `def solve():\n    pass`
    },
    java: {
        name: "Java",
        id: "java",
        defaultCode: `public class Main {\n    public static void main(String[] args) {\n        \n    }\n}`
    },
    c: {
        name: "C",
        id: "c",
        defaultCode: `#include <stdio.h>\n\nint main() {\n    return 0;\n}`
    }
};

const ExamEditor = ({ question, onCodeSubmit }) => {
    const monaco = useMonaco();
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [terminalTab, setTerminalTab] = useState('output'); // 'output' | 'tests'
    // AI / Easter Egg State
    const [showXKCD, setShowXKCD] = useState(false);

    // Update code when Question or Language changes
    useEffect(() => {
        if (question && question.starterCode && question.starterCode[language]) {
            setCode(question.starterCode[language]);
        } else {
            setCode(LANGUAGES[language].defaultCode);
        }
        setOutput("");
        setTestResults(null);
    }, [question, language]);

    const handleLanguageChange = (slug) => {
        setLanguage(slug);
        // Code update handled by useEffect
    };

    const executeTests = async (onlyPublic = false) => {
        if (!question || !question.testCases) return;
        if (isRunning) return; // Prevent double clicks

        setIsRunning(true);
        setTerminalTab('tests');

        try {
            const casesToRun = onlyPublic ? question.testCases.filter(tc => !tc.hidden) : question.testCases;
            const results = [];
            let passedCount = 0;

            for (const tc of casesToRun) {
                try {
                    // Pass metadata for Dynamic Harness
                    const meta = {
                        functionName: question.functionName,
                        args: tc.args,
                        expectedOutput: tc.output
                    };

                    // Add a timeout race condition (5 seconds per test case) to prevent stuck buttons
                    // Note: This won't unfreeze the main thread if Pyodide hangs violently, but helps with Promise hangs.
                    const executionPromise = runCode(language, code, tc.input, meta);
                    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({
                        stdout: "",
                        stderr: "Execution Timed Out (5s limit)",
                        status: "Time Limit Exceeded"
                    }), 5000));

                    const res = await Promise.race([executionPromise, timeoutPromise]);

                    const validation = checkTestCase(res.stdout, tc.output);
                    const passed = validation.passed;

                    if (passed) passedCount++;

                    results.push({
                        input: tc.hidden ? "Hidden" : tc.input,
                        expected: tc.hidden ? "Hidden" : tc.output,
                        actual: tc.hidden ? (passed ? "Passed" : "Failed") : validation.actual,
                        passed,
                        hidden: tc.hidden,
                        error: res.stderr
                    });
                } catch (e) {
                    results.push({ passed: false, error: "System Error: " + e.message });
                }
            }

            setTestResults(results);

            if (onlyPublic) {
                if (passedCount === casesToRun.length) {
                    toast.success("All Sample Cases Passed! 🚀");
                    // DO NOT submit code here
                } else {
                    toast.error(`${passedCount}/${casesToRun.length} Sample Cases Passed`);
                }
            } else {
                // Submit Mode - Check ALL cases
                if (passedCount === casesToRun.length) {
                    toast.success("All Test Cases Passed! 🚀");
                    if (onCodeSubmit) onCodeSubmit(true);
                } else {
                    toast.error(`${passedCount}/${casesToRun.length} Passed`);
                }
            }
        } catch (err) {
            console.error("Execution Suite Error:", err);
            toast.error("Execution failed unexpectedly.");
        } finally {
            setIsRunning(false);
        }
    };

    const handleRunCode = () => executeTests(true);
    const handleSubmit = () => executeTests(false);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-white overflow-hidden relative">
            <Toaster position="bottom-right" />

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42] shrink-0">
                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-[#3c3c3c] text-white text-xs px-3 py-1.5 rounded border border-transparent focus:border-blue-500 outline-none"
                    >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                    </select>

                    <div className="flex items-center text-xs text-gray-400 gap-1 bg-[#2d2d2d] px-2 py-1 rounded">
                        <Clock size={12} />
                        <span>Time Limit: 2s</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        <Play size={14} className="fill-current" /> Run Code
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-1.5 bg-green-700 hover:bg-green-600 rounded text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        <CheckCircle size={14} /> Submit
                    </button>
                </div>
            </div>

            {/* Main Split */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Editor */}
                <div className="flex-1 relative border-r border-[#3e3e42]">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={setCode}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: "'Fira Code', monospace",
                            padding: { top: 16 }
                        }}
                    />

                    {/* Floating XKCD Easter Egg */}
                    {showXKCD && (
                        <div className="absolute top-10 right-10 z-50 bg-white p-2 rounded shadow-2xl animate-in fade-in zoom-in duration-500">
                            <a href="https://xkcd.com/353/" target="_blank" rel="noreferrer">
                                <img src="https://imgs.xkcd.com/comics/python.png" alt="Antigravity" className="max-w-[300px]" />
                            </a>
                            <button onClick={() => setShowXKCD(false)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                        </div>
                    )}
                </div>

                {/* Output Panel */}
                <div className="h-[300px] md:h-auto md:w-[35%] flex flex-col bg-[#1e1e1e]">
                    <div className="flex border-b border-[#3e3e42]">
                        <button
                            onClick={() => setTerminalTab('output')}
                            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${terminalTab === 'output' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            Console Output
                        </button>
                        <button
                            onClick={() => setTerminalTab('tests')}
                            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${terminalTab === 'tests' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            Test Results
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                        {terminalTab === 'output' ? (
                            <div className="whitespace-pre-wrap text-gray-300">
                                {output || <span className="text-gray-600 italic">// Run code to see output</span>}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {!testResults && <span className="text-gray-600 italic">// Submit code to run tests</span>}
                                {testResults && testResults.map((res, i) => (
                                    <div key={i} className={`p-3 rounded border ${res.passed ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-bold text-xs ${res.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                Case {i + 1} {res.hidden ? "(Hidden)" : ""}
                                            </span>
                                            {res.passed ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                                        </div>
                                        {!res.passed && !res.hidden && (
                                            <div className="text-xs space-y-1">
                                                <div className="flex gap-2"><span className="text-gray-500 w-16">Expected:</span> <span className="text-green-300">{res.expected}</span></div>
                                                <div className="flex gap-2"><span className="text-gray-500 w-16">Actual:</span> <span className="text-red-300">{res.actual}</span></div>
                                                {res.error && <div className="text-red-400 mt-1 whitespace-pre-wrap">{res.error}</div>}
                                            </div>
                                        )}
                                        {!res.passed && res.hidden && (
                                            <div className="text-xs text-center text-gray-500 italic mt-1">Hidden test case failed</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default ExamEditor;
