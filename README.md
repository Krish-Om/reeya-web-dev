# Job Board Application

A modern job board platform built with Node.js, React, and PostgreSQL, offering comprehensive job search, application tracking, and user management capabilities.

## Features

- User authentication (Job Seekers & Employers)
- Job posting and management
- Job application system with resume uploads
- Real-time application status tracking
- Responsive UI with modern design

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm (comes with Node.js)

## Local Development Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd job-board
```

2. **Install dependencies**

```bash
npm install
````

3. **Set up the database**

- Create a PostgreSQL database for the project
- Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
SESSION_SECRET=your_secret_key_here
```

Replace the placeholders with your actual database credentials.

4. **Initialize the database**

```bash
npm run db:push
```

This command will create all necessary tables in your database.

5. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utility functions
│   │   └── pages/     # Page components
├── server/            # Backend Express server
│   ├── auth.ts       # Authentication logic
│   ├── routes.ts     # API routes
│   └── storage.ts    # Database operations
├── shared/           # Shared types and schemas
│   └── schema.ts     # Database schema and types
└── uploads/          # Uploaded files storage
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run db:push` - Push schema changes to the database

## API Routes

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Login user
- POST `/api/logout` - Logout user
- GET `/api/user` - Get current user

### Jobs
- GET `/api/jobs` - List all jobs
- POST `/api/jobs` - Create a new job (Employers only)
- GET `/api/jobs/:id` - Get job details

### Applications
- POST `/api/jobs/:id/apply` - Apply for a job (Job Seekers only)
- GET `/api/applications` - List user's applications
- PATCH `/api/applications/:id/status` - Update application status (Employers only)

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session management
- `NODE_ENV` - Environment mode ('development' or 'production')

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests if available
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
