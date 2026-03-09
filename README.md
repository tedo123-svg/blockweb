# Woreda Reporting System

A modern web-based reporting system for community discussions conducted in Woredas.

## Features

- Secure role-based authentication (Woreda & Sub-City)
- Discussion report submission with file attachments
- Real-time dashboard with statistics
- Gender participation analytics
- Topic analysis with charts
- Export reports to PDF and Excel
- Responsive modern UI

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Charts: Recharts
- Export: jsPDF, xlsx

## Installation

```bash
npm install
```

## Running the Application

```bash
npm run dev
```

This starts both the backend server (port 5000) and frontend (port 3000).

## Demo Credentials

Woreda User:
- Username: woreda1
- Password: password123

Sub-City Admin:
- Username: subcity
- Password: admin123

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── ReportForm.jsx
│   │   ├── WoredaDashboard.jsx
│   │   └── SubCityDashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   └── index.js
└── package.json
```

## Notes

- This uses in-memory storage. For production, integrate a database (MongoDB, PostgreSQL, etc.)
- Update JWT_SECRET in server/index.js for production
- File uploads are stored in server/uploads/
