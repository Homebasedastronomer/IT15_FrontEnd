# API Documentation

This document lists all API endpoints currently used by the frontend, including expected request and response formats.

## Base URL

All backend endpoints are resolved from:

- `VITE_API_URL`
- Example: `http://127.0.0.1:8000/api`

## Authentication

### POST /login

Authenticates a user and returns a token.

Request body:

```json
{
  "email": "registrar@school.edu",
  "password": "secret"
}
```

Expected success response:

```json
{
  "token": "jwt-or-api-token",
  "user": {
    "email": "registrar@school.edu"
  }
}
```

Expected error response:

```json
{
  "message": "Invalid credentials"
}
```

Frontend behavior:
- Stores `auth_token`, `enrollment_auth`, and `enrollment_user` in localStorage.
- Uses `Authorization: Bearer <token>` for protected backend requests.

## Program Endpoints

### GET /programs

Returns all programs.

Accepted response shapes:

```json
[
  {
    "id": 1,
    "code": "BSIT",
    "name": "Bachelor of Science in Information Technology",
    "department": "CCS",
    "status": "Active"
  }
]
```

or

```json
{
  "data": [
    {
      "id": 1,
      "code": "BSIT",
      "name": "Bachelor of Science in Information Technology",
      "department": "CCS",
      "status": "Active"
    }
  ]
}
```

or

```json
{
  "items": [
    {
      "id": 1,
      "code": "BSIT",
      "name": "Bachelor of Science in Information Technology",
      "department": "CCS",
      "status": "Active"
    }
  ]
}
```

### POST /programs

Creates a new program.

Request body sent by frontend:

```json
{
  "code": "BSIT",
  "name": "Bachelor of Science in Information Technology",
  "department": "CCS",
  "status": "Active"
}
```

Expected response:

```json
{
  "id": 1,
  "code": "BSIT",
  "name": "Bachelor of Science in Information Technology",
  "department": "CCS",
  "status": "Active"
}
```

### PUT /programs/{id}

Updates an existing program.

Request body:

```json
{
  "code": "BSCS",
  "name": "Bachelor of Science in Computer Science",
  "department": "CCS",
  "status": "Active"
}
```

Expected response:

```json
{
  "id": 1,
  "code": "BSCS",
  "name": "Bachelor of Science in Computer Science",
  "department": "CCS",
  "status": "Active"
}
```

### DELETE /programs/{id}

Deletes a program.

Expected response examples:

```json
{
  "message": "Program deleted successfully"
}
```

or HTTP 204 with no response body.

## Subject Endpoints

### GET /subjects

Returns all subjects.

Accepted response shapes:
- array directly
- object with `data` array
- object with `items` array

Expected item fields used by frontend:
- `id`
- `code`
- `title`
- `programCode`
- `yearLevel`
- `offeredIn` or `offered_in`
- `prerequisites`

Example response:

```json
[
  {
    "id": 101,
    "code": "BSIT101",
    "title": "Fundamentals of Computing",
    "programCode": "BSIT",
    "yearLevel": "1st Year",
    "offeredIn": "1st Semester",
    "prerequisites": []
  }
]
```

## Dashboard Analytics Endpoints

### GET /dashboard/enrollment-trend

Returns enrollment trend data.

Example response:

```json
[
  {
    "month": "January",
    "enrolled": 120,
    "submitted": 130,
    "approved": 115,
    "pending": 15
  }
]
```

### GET /dashboard/course-distribution

Returns student distribution per course/program.

Example response:

```json
[
  {
    "short": "BSIT",
    "course": "BS Information Technology",
    "students": 530
  }
]
```

### GET /dashboard/attendance-trend

Returns attendance trend.

Example response:

```json
[
  {
    "label": "2026-03-14",
    "attendance": 96.4
  }
]
```

## Course Endpoints

### GET /courses

Returns courses/program options for student creation form.

Example response:

```json
[
  {
    "id": 1,
    "code": "BSIT",
    "name": "Bachelor of Science in Information Technology",
    "department": "CCS"
  }
]
```

## Student Endpoints

### GET /students

Returns student records used in student table.

Example response:

```json
[
  {
    "student_number": "UM-0001",
    "first_name": "Maria",
    "last_name": "Santos",
    "year_level": 2,
    "program_code": "BSIT",
    "course": {
      "code": "BSIT",
      "department": "CCS"
    }
  }
]
```

### POST /students

Creates a student record.

Request body sent by frontend:

```json
{
  "first_name": "Maria",
  "last_name": "Santos",
  "email": "maria@school.edu",
  "gender": "Female",
  "birth_date": "2006-02-10",
  "department": "CCS",
  "course_id": 1,
  "year_level": 1,
  "status": "Enrolled"
}
```

Expected response:

```json
{
  "student_number": "UM-0100",
  "first_name": "Maria",
  "last_name": "Santos"
}
```

### GET /students/search?q={query}

Searches students by ID or name.

Example response:

```json
[
  {
    "student_id": "UM-0001",
    "full_name": "Maria Santos",
    "year_level": 2,
    "program": {
      "code": "BSIT"
    }
  }
]
```

### GET /students/{studentId}/enrollment-history

Returns detailed enrollment history for a student.

Example response:

```json
{
  "student": {
    "student_number": "UM-0001",
    "full_name": "Maria Santos",
    "year_level": 2
  },
  "program": {
    "code": "BSIT",
    "name": "Bachelor of Science in Information Technology"
  },
  "current_term": "2nd Semester",
  "history": [
    {
      "year_level": 1,
      "label": "1st Year",
      "is_current": false,
      "total_subjects": 10,
      "total_units": 30,
      "terms": [
        {
          "term": "1st Semester",
          "subjects": [
            {
              "id": 11,
              "code": "BSIT101",
              "title": "Fundamentals of Computing"
            }
          ]
        }
      ]
    }
  ]
}
```

## Enrollment Endpoints

### GET /enrollment/options?student_id={id}&term={term?}&year_level={year?}

Returns available subjects for a student based on year and term.

Example response:

```json
{
  "student": {
    "student_number": "UM-0001",
    "full_name": "Maria Santos",
    "year_level": 2
  },
  "current_term": "2nd Semester",
  "selected": {
    "year_level": 2,
    "label": "2nd Year",
    "term": "2nd Semester",
    "course": {
      "code": "BSIT",
      "name": "Bachelor of Science in Information Technology"
    }
  },
  "available_for_selected_year": [
    {
      "id": 220,
      "code": "BSIT201",
      "title": "Data Structures and Algorithms"
    }
  ]
}
```

### POST /enrollment

Creates/updates current student enrollment.

Request body sent by frontend:

```json
{
  "student_id": "UM-0001"
}
```

Expected response:

```json
{
  "message": "Enrollment updated successfully"
}
```

## Third-Party Weather APIs

These are called directly from the frontend and do not use `VITE_API_URL`.

### GET https://geocoding-api.open-meteo.com/v1/search

Used to convert city name into coordinates.

Query params:
- `name`
- `count=1`
- `language=en`
- `format=json`

Example response:

```json
{
  "results": [
    {
      "name": "Tagum City",
      "country": "Philippines",
      "latitude": 7.4478,
      "longitude": 125.8078
    }
  ]
}
```

### GET https://api.open-meteo.com/v1/forecast

Used to get current weather + 5-day forecast.

Main query params used:
- `latitude`
- `longitude`
- `current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day`
- `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
- `timezone=auto`
- `forecast_days=5`

Frontend-normalized response object example:

```json
{
  "location": "Tagum City",
  "temperature": 31,
  "feelsLike": 34,
  "weatherCode": 1,
  "summary": "Partly Cloudy",
  "windSpeed": 9,
  "rainChance": 20,
  "isDay": true,
  "forecast": [
    {
      "date": "2026-03-16",
      "weatherCode": 3,
      "summary": "Overcast",
      "high": 32,
      "low": 24,
      "rainChance": 35
    }
  ]
}
```

## Standard Error Response Recommendation

For best frontend compatibility, return errors in this shape:

```json
{
  "message": "Human-readable error message"
}
```

## Endpoint Summary Table

| Module | Method | Endpoint |
|---|---|---|
| Auth | POST | /login |
| Programs | GET | /programs |
| Programs | POST | /programs |
| Programs | PUT | /programs/{id} |
| Programs | DELETE | /programs/{id} |
| Subjects | GET | /subjects |
| Dashboard | GET | /dashboard/enrollment-trend |
| Dashboard | GET | /dashboard/course-distribution |
| Dashboard | GET | /dashboard/attendance-trend |
| Courses | GET | /courses |
| Students | GET | /students |
| Students | POST | /students |
| Enrollment | GET | /enrollment/options |
| Enrollment | POST | /enrollment |
| Students | GET | /students/search |
| Students | GET | /students/{studentId}/enrollment-history |
| Weather | GET | https://geocoding-api.open-meteo.com/v1/search |
| Weather | GET | https://api.open-meteo.com/v1/forecast |

Last updated: March 15, 2026
