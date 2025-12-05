# HR System Frontend

A modern HR Management System frontend built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 🔐 JWT-based authentication
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI components
- 🔄 Real-time data fetching with Axios
- 📊 Dashboard with statistics
- 👥 Employee management
- 🏢 Department and position management
- 💰 Payroll and payslip management
- ⭐ Performance management

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── employees/        # Employee pages
│   ├── departments/      # Department pages
│   ├── payslips/         # Payslip pages
│   ├── login/            # Login page
│   └── register/         # Registration page
├── components/            # React components
│   └── layout/           # Layout components (Sidebar, Header)
├── contexts/             # React contexts (AuthContext)
├── lib/                  # Utility libraries (API client)
└── types/                # TypeScript type definitions
```

## Available Pages

- `/` - Home (redirects to login or dashboard)
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard with statistics
- `/employees` - Employee list
- `/departments` - Department list
- `/positions` - Position list
- `/performance` - Performance management
- `/payroll` - Payroll management
- `/payslips` - Payslip list
- `/claims` - Expense claims
- `/disputes` - Payroll disputes

## Authentication

The app uses JWT tokens stored in cookies. The `AuthContext` provides:
- `login(credentials)` - Login user
- `register(data)` - Register new user
- `logout()` - Logout user
- `user` - Current user object
- `isAuthenticated` - Authentication status

## API Integration

The API client (`lib/api.ts`) is configured to:
- Automatically add JWT tokens to requests
- Handle 401 errors (unauthorized) by redirecting to login
- Use environment variable for API URL

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The frontend can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any static hosting service

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable in your deployment platform.

## Next Steps

- Add form components for creating/editing entities
- Implement role-based access control in UI
- Add data tables with pagination and filtering
- Create detailed view pages for each entity
- Add charts and analytics
- Implement real-time updates
