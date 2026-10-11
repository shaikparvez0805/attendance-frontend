# Student Attendance Management System - Frontend

React.js (Vite) + CSS. Talks to the Spring Boot REST API with JWT authentication.

## Run locally
1. Install Node.js 18+.
2. `npm install`
3. Copy `.env.example` to `.env` and set `VITE_API_URL` (default `http://localhost:8080/api`).
4. `npm run dev` and open http://localhost:5173

## Build
`npm run build` (output in `dist/`)

## Screens
- Login (role based redirect)
- Admin: manage students/faculty, subjects, classes, search & filter
- Faculty: create classes, mark/update attendance, reports and low-attendance list
- Student: overall % and subject-wise attendance with daily records
