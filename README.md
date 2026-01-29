# CODEX HUB — AI Powered Event & Talent Intelligence Platform

CODEX HUB is a next-generation full-stack SaaS platform designed to centralize technical events, hackathons, online coding exams, and talent evaluation into a single intelligent ecosystem. The platform integrates secure assessment environments, automated event management, real-time analytics, resume intelligence, and structured multi-day skill challenges.

Built for universities, corporates, government institutions, and hiring partners, CODEX HUB enables large-scale talent identification, engagement, and evaluation with minimal manual intervention.

---

## Project Information

Project Name: CODEX HUB  
Hackathon: FORTEX36  
Team Name: Syntax Squad  
Repository: https://github.com/akkalatejaswaroop/codex-exam  
Deployment Status: Not Deployed (Serverless Ready)  

---

## Platform Overview

CODEX HUB provides an end-to-end event and assessment management solution that covers:

- Secure online coding examinations  
- Hackathon and workshop hosting  
- Resume-based smart profile generation  
- QR-based attendance verification  
- Automated evaluation and leaderboards  
- Talent analytics dashboards  
- AI-powered challenge workflows  

The platform is designed to be scalable, modular, and cloud-native.

---

## System Architecture

CODEX HUB follows a modern serverless cloud architecture.

User Interface (React Dashboard)  
↓  
API Layer (Serverless Functions)  
↓  
Authentication & Authorization Service  
↓  
Business Logic Layer  
↓  
Supabase Database + Firebase Realtime Database  
↓  
Storage, Email Services, Payment Gateways  

Architecture Benefits:

- Automatic scaling  
- Low operational overhead  
- High availability  
- Cost-effective deployment  
- Modular feature expansion  

---

## Authentication and Security

CODEX HUB implements enterprise-level security mechanisms.

Authentication Features:

- Session-based login system  
- JWT token authorization  
- Role-based access control  
- Protected API routes  

Exam Proctoring and Integrity System:

- Mandatory fullscreen enforcement  
- Window focus detection  
- Tab switching monitoring  
- Right-click blocking  
- Copy and paste prevention  
- Violation tracking system  
- Automatic exam termination after repeated violations  

These features ensure fair assessments and platform credibility.

---

## Intelligent Exam Engine (Monaco Editor)

CODEX HUB integrates Monaco Editor (VS Code Engine) to provide a professional coding environment.

Editor Layout:

- Question Panel (Left)  
- Code Editor Panel (Center)  
- Output and Test Case Panel (Right)  

Supported Programming Languages:

- Python  
- Java  
- C  

The editor automatically loads starter templates based on the selected language.

---

## Automated Test Case Evaluation Engine

The platform executes submitted code against multiple validation layers.

Evaluation Workflow:

1. Code submission  
2. Serverless execution  
3. Output validation  
4. Hidden test case verification  
5. Score calculation  
6. Leaderboard update  

Core Implementation Files:

netlify/functions/questions.js  
src/components/ExamEditor.jsx  

This architecture allows scalable parallel code execution and real-time feedback.

---

## AI Runtime Demonstration (Antigravity Module)

The platform supports runtime code interception and extensible execution pipelines.

Demo Steps:

1. Switch language to Python  
2. Clear editor content  
3. Enter: import antigravity  
4. Click Run Custom  

Result:

- XKCD comic output  
- "You are flying!" message  

This demonstrates custom runtime hooks and AI execution extensions.

---

## Event Hosting and Hackathon Management System

CODEX HUB includes a full event lifecycle management module.

Supported Event Types:

- Hackathons  
- Coding Contests  
- Workshops  
- Bootcamps  
- Multi-day Skill Challenges  

Organizer Dashboard Features:

- Event creation and configuration  
- Registration form builder  
- Ticket pricing tiers  
- Participant management  
- Automated email notifications  
- Event analytics dashboard  

---

## CODEX 5-Day Gauntlet Engine (Flagship Feature)

A structured intelligence evaluation framework designed to measure holistic skillsets.

Daily Challenge Flow:

Monday — Programming Logic  
Tuesday — Analytical Reasoning  
Wednesday — Mathematical Problem Solving  
Thursday — Logical Puzzles  
Friday — Critical Thinking Scenarios  

Engine Capabilities:

- Progressive difficulty scaling  
- Time-based challenge unlocking  
- Automatic evaluation  
- Rank calculation  
- Badge generation  
- Certificate issuance  

---

## QR-Based Attendance Verification System

CODEX HUB provides secure physical event attendance validation.

System Features:

- Encrypted QR ticket generation  
- Organizer scanning dashboard  
- Duplicate scan prevention  
- Offline scan fallback support  
- Attendance analytics  

This module eliminates manual attendance errors.

---

## Analytics and Talent Intelligence Layer

Organizer Analytics Dashboard:

- Registration metrics  
- Attendance statistics  
- Engagement tracking  
- Revenue monitoring  

Employer Talent Dashboard:

- Candidate leaderboard  
- Skill-based filtering  
- Performance ranking export  
- Shortlist generation  

This transforms events into actionable recruitment pipelines.

---

## Technology Stack

Frontend:

- React 18  
- Vite  
- Tailwind CSS  
- Monaco Editor  

Backend:

- Node.js  
- Netlify Serverless Functions  
- REST API Architecture  

Database and Realtime Systems:

- Supabase (Relational Database)  
- Firebase Realtime Database  

Development Tools:

- GitHub Version Control  
- Cloud Storage Services  
- Email Automation Services  

---

## Local Development Setup

Prerequisites:

- Node.js v18 or above  
- Netlify CLI  

Installation:

npm install  

Run Development Server:

npm start  

This runs netlify dev which launches both frontend and backend in a unified environment.

---

## Production Deployment

CODEX HUB is optimized for cloud deployment using Netlify.

Deployment Command:

netlify deploy --prod  

Configuration is managed through netlify.toml.

---

## Platform Security Measures

- Secure environment variable handling  
- API request validation  
- Rate limiting  
- Input sanitization  
- Secure file uploads  
- Role-based permission enforcement  

---

## Future Roadmap

Planned upgrades include:

- AI Interview Simulator  
- Video Interview Platform  
- Mobile Application  
- Employer Hiring Portal  
- Blockchain Certificate Verification  
- SaaS Subscription Monetization  

---

## Team Syntax Squad

Akkala Teja Swaroop  
MCS Raghu Sasidhar  
K Yashwanth Varma  
G Yashwanth  

---

## Hackathon Submission Details

Hackathon: FORTEX36  
Organizer: FORTEX Organiser  
Submission Date: 29 January 2026  

---

## License

This project is developed for educational, research, and hackathon demonstration purposes.

---

CODEX HUB transforms fragmented event management and isolated assessments into a unified intelligent talent ecosystem.
