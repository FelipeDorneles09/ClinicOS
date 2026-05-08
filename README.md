# Medical Consultation Platform
## Description
The Medical Consultation Platform is a web application designed to facilitate medical consultations between doctors and patients. The platform provides a secure and efficient way for patients to schedule consultations, access medical records, and communicate with healthcare professionals.

## Features
* User authentication and authorization
* Patient and doctor registration
* Specialty and consultation management
* Health check endpoint for server status
* Error handling and logging

## Tech Stack
* **Backend:** Express.js, Prisma, JSON Web Tokens
* **Database:** Prisma database client
* **Dependencies:** `express`, `cors`, `dotenv/config`, `jsonwebtoken`, `@prisma/client`

## Installation
To install the project, run the following commands:
```bash
npm install
npx prisma migrate dev
npx prisma generate
```
## Usage
To start the server, run:
```bash
npm run start
```
The server will listen on port 3001 by default. You can access the health check endpoint at `http://localhost:3001/health`.

### API Endpoints
The API endpoints are defined in the `app.ts` file and include routes for authentication, user management, specialty management, doctor management, patient management, and consultation management.

### Environment Variables
The project uses environment variables to configure the database connection and other settings. You can set these variables in a `.env` file or using your operating system's environment variable settings.

### Contributing
To contribute to the project, please fork the repository and submit a pull request with your changes. Ensure that your code is formatted consistently with the existing codebase and includes any necessary tests or documentation.
