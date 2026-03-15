# IT15 Frontend - Enrollment System

Frontend application for the Integrative Programming Enrollment System, built with React and Vite.

## Required Deliverables Status

- Complete frontend source code: available in this repository
- Detailed README with setup instructions: this file
- .env.example with required environment variables: included
- API documentation (endpoints and expected responses): see API_DOCUMENTATION.md
- List of technologies with versions: see Technology Stack section

## Key Features

- Authentication flow with backend login endpoint
- Protected dashboard routes
- Program and subject management views
- Student creation and enrollment workflow
- Enrollment history and student search
- Dashboard analytics (enrollment, attendance, distribution)
- Integrated weather data with location search
- Chatbot helper powered by live dashboard/service data

## Technology Stack (with Versions)

### Core

- React: 19.2.0
- React DOM: 19.2.0
- React Router DOM: 7.13.0
- Vite: 7.3.1
- Axios: 1.13.6
- Recharts: 3.7.0

### Development Tooling

- ESLint: 9.39.1
- @eslint/js: 9.39.1
- @vitejs/plugin-react: 5.1.1
- eslint-plugin-react-hooks: 7.0.1
- eslint-plugin-react-refresh: 0.4.24
- globals: 16.5.0

## Project Structure

```text
src/
  components/
    auth/
    common/
    dashboard/
    navigation/
  layouts/
  pages/
  services/
public/
```

## Setup Instructions

Use the following steps in order.

### 1. Backend Setup (Laravel API)

```bash
cd /Users/markkian/Documents/GitHub/IT15_BackEnd
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Expected backend base URL used by frontend:
- http://127.0.0.1:8000/api

### 2. Frontend Setup (This Project)

```bash
cd IT15_FrontEnd
npm install
cp .env.example .env
npm start
```

Alternative dev command:

```bash
npm run dev
```

Open the displayed local URL (usually http://localhost:5173).

## Environment Variables

Create a local .env file based on .env.example.

Required variables:

- VITE_API_URL: base URL of backend API

Example:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## API Documentation

Full API endpoint documentation with expected responses is available in:

- API_DOCUMENTATION.md

## Available Scripts

- npm start: start dev server (alias for Vite)
- npm run dev: start Vite dev server
- npm run build: production build
- npm run preview: preview production build
- npm run lint: run ESLint checks

## Documentation Checklist for Submission

- Add at least 5 screenshots of the working application
- Include API documentation (already provided)
- Include list of technologies with versions (already provided)
- Prepare a 3-5 minute demo video

## Suggested Screenshot List

- Login screen
- Dashboard overview
- Programs/Course offerings page
- Students and enrollment page
- Reports page with filters/export

