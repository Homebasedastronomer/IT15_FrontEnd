<<<<<<< HEAD
# IT15_FrontEnd
=======
# DOLLENTE Enrollment System Frontend Prototype

Modern React + Vite frontend prototype for the Integrative Programming Enrollment System.

## Features

- Creative and responsive login page (frontend-only authentication simulation)
- Route-based redirect flow (`/login` ➜ `/dashboard`)
- Structured dashboard navigation:
	- Students
	- Courses
	- Enrollment
	- Reports
	- Settings
- Overview widgets and realistic enrollment analytics charts
- Weather API integration (Open-Meteo)
- Simple chatbot interface with mock assistant service
- Mock service layer organized for future Laravel REST API integration

## Tech Stack

- React 19
- Vite 7
- React Router DOM
- Recharts

## Project Structure

```
src/
	components/
		dashboard/
		navigation/
	layouts/
	pages/
	services/
```

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL and sign in from `/login`.

## Build

```bash
npm run build
```

## API-Ready Notes

The files in `src/services/` already isolate data access:

- `mockApi.js`
- `weatherService.js`
- `chatbotService.js`

For Laravel integration, replace the mock exports with real `fetch`/`axios` calls to your REST endpoints while keeping UI components unchanged.
>>>>>>> 8f86fc7 (Initial commit)
