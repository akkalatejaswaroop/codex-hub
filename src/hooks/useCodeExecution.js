
// Client-Side Execution Engine
// Removes dependency on Piston or External APIs
// Uses Pyodide for Python, Native Eval for JS, and Simulation for C/Java

let pyodideInstance = null;

const loadPyodideEngine = async () => {
    if (pyodideInstance) return pyodideInstance;
    if (window.loadPyodide) {
        pyodideInstance = await window.loadPyodide();
        return pyodideInstance;
    }
    throw new Error("Pyodide not loaded");
};

export const runCode = async (language, code, stdin = "", meta = {}) => {
    switch (language.toLowerCase()) {
        case 'python':
            return await runPython(code, stdin, meta);
        case 'javascript':
            return await runJavascript(code, stdin); // JS wrapper doesn't use meta yet, uses stdin parsing inside wrapper
        case 'c':
        case 'java':
            return await runPiston(language, code, stdin);
        default:
            return { stdout: "", stderr: "Unsupported Language", status: "Error" };
    }
};

const runPython = async (code, stdin, meta = {}) => {
    try {
        const pyodide = await loadPyodideEngine();

        // HARNESS: Dynamic Argument Injection
        const funcName = meta.functionName || "solution";
        const argsStr = meta.args ? JSON.stringify(meta.args) : "[]";

        // This python driver imports json, loads the args, and calls the function dynamically
        // It handles both list return (TwoSum) and simple return types.
        const driverCodeHeader = `
import sys
import json

# User Code Block
`;
        const driverCodeHarness = `

# Test Harness
def run_tests():
    try:
        # Load args from JSON injection
        # e.g. [[2,7,11,15], 9]
        # We need to *unpak* these args into the function call
        args = json.loads('${argsStr}')
        
        if '${funcName}' in globals():
            func = globals()['${funcName}']
            # Call function with unpacked args
            # If args is a list, we unpack. If it's a single value, we might need to wrap/unwrap.
            # Based on questions.json structure: "args": [[...], target] -> list of 2 args
            # or "args": [5] -> list of 1 arg
            
            res = func(*args)
            
            # Formatting Output
            if isinstance(res, list):
                print(" ".join(map(str, res)))
            elif isinstance(res, bool):
                print("true" if res else "false")
            else:
                print(str(res))
        else:
            print("Error: Function '${funcName}' not found.")
            
    except Exception as e:
        print(f"Harness Error: {e}")

run_tests()
`;
        // Safe concatenation to prevent template literal injection issues
        const driverCode = driverCodeHeader + code + driverCodeHarness;

        // Reset Stdout capture
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

        // Execute Driver
        await pyodide.runPythonAsync(driverCode);

        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        const stderr = pyodide.runPython("sys.stderr.getvalue()");

        return {
            stdout: stdout.trim(),
            stderr: stderr,
            status: "Accepted",
            isAntigravity: code.includes("import antigravity")
        };

    } catch (err) {
        return {
            stdout: "",
            stderr: err.toString(),
            status: "Runtime Error"
        };
    }
};


const runJavascript = async (code, stdin) => {
    try {
        let outputBuffer = "";
        const mockConsole = {
            log: (...args) => { outputBuffer += args.join(" ") + "\n"; },
            error: (...args) => { outputBuffer += args.join(" ") + "\n"; }
        };

        // Standard Wrapper Pattern
        const wrapperHeader = `
            
            // Harness
            const input = String.raw\`${stdin}\`.trim().split('\\n');
            
            if (typeof twoSum === 'function') {
                const nums = input[0].trim().split(' ').map(Number);
                const target = Number(input[1]);
                const res = twoSum(nums, target);
                console.log(Array.isArray(res) ? res.join(' ') : res);
            } 
            else if (typeof isPalindrome === 'function') {
                const res = isPalindrome(Number(input[0]));
                console.log(res ? "true" : "false");
            }
            else if (typeof factorial === 'function') {
                console.log(factorial(Number(input[0])));
            }
            else if (typeof checkOddEven === 'function') {
                console.log(checkOddEven(Number(input[0])));
            }
            else {
                console.error("Function definition not found or incorrect.");
            }
        `;

        const wrapper = code + "\n" + wrapperHeader;

        // Execution
        const runUserCode = new Function('console', wrapper);
        runUserCode(mockConsole);

        return {
            stdout: outputBuffer.trim(),
            stderr: "",
            status: "Accepted"
        };
    } catch (err) {
        return {
            stdout: "",
            stderr: err.toString(),
            status: "Runtime Error"
        };
    }
};

const runPiston = async (language, code, stdin) => {
    // Real Execution using Piston Public API
    const PISTON_API = "https://emkc.org/api/v2/piston/execute";

    // Config for Languages
    const langConfig = {
        c: { language: "c", version: "10.2.0" },
        java: { language: "java", version: "15.0.2" }
    };

    const config = langConfig[language.toLowerCase()];
    if (!config) return { stdout: "", stderr: "Unsupported Language", status: "Error" };

    try {
        const response = await fetch(PISTON_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: config.language,
                version: config.version,
                files: [{ content: code }],
                stdin: stdin
            })
        });

        const data = await response.json();

        if (data.run) {
            return {
                stdout: data.run.stdout.trim(),
                stderr: data.run.stderr,
                status: data.run.code === 0 ? "Accepted" : "Runtime Error"
            };
        } else {
            return { stdout: "", stderr: "Execution Failed", status: "Error" };
        }
    } catch (e) {
        return {
            stdout: "",
            stderr: "Connection to Compiler API Failed. Check Internet.",
            status: "Error"
        };
    }
};

