# CODEX - AI Powered Exam Platform

## 🚀 Hackathon Demo Walkthrough

### 1. Zero-Config Startup
We have migrated to a **Serverless Architecture** to eliminate local setup headaches (Docker, etc).

**To run the full platform locally:**
```bash
npm install
npm start
```
*This command runs `netlify dev`, which spins up the React Frontend (Port 8888) AND the Cloud Functions (Port 8888) in a unified proxy.*

### 2. Main Features Walkthrough

#### A. Secure Login
- Enter any Name and Roll Number.
- Note the **Fullscreen Enforcement**: If you try to exit fullscreen, a blocking overlay appears.

#### B. The Exam Editor (Monaco)
- **Unified Interface**: Left side has the question, Center is the VS Code-style editor, Right is the Test Case engine.
- **Language Support**: Switch between Python, Java, C via the dropdown. The starter code updates automatically.
- **Antigravity AI**: 
  - Switch to Python.
  - Delete the code.
  - Type `import antigravity`.
  - Click "Run Custom".
  - **Result**: You will see the Easter Egg (XKCD comic) and "You are flying!" output. This demonstrates the AI interception capability.

#### C. Test Case Engine
- Click **"Submit"** (Green Button).
- The system runs your code against multiple test cases (including Hidden ones) using the implementation in `netlify/functions/questions.js` + `src/components/ExamEditor.jsx`.
- Watch the toast notification and the Result Panel on the right update in real-time.

#### D. Security & Proctoring
- Try focusing another window -> **Toast Warning**: "Violation Recorded: Window Focus Lost".
- Try Right Click -> **Blocked**.
- Try Copy/Paste (Ctrl+C/V) -> **Blocked** & Warning recorded.
- If you accumulate 3 violations, the exam auto-terminates.

### 3. Deployment
The project is "Copy-Paste Ready" for Netlify.
```bash
netlify deploy --prod
```
Everything (Frontend + Backend Functions) is handled by `netlify.toml`.

---
**Tech Stack**: React 18, Vite, Monaco Editor, Netlify Functions (Node.js), TailwindCSS 4.
**Author**: Codex Team
