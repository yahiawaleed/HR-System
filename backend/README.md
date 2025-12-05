# HR System Backend

A comprehensive HR Management System built with NestJS, TypeScript, and MongoDB.

## Features Implemented

### ✅ Core Modules
- **Authentication Module**: JWT-based authentication with role-based access control
- **Employee Profile Module**: Complete employee data management with change request workflow
- **Organization Structure Module**: Department and position management
- **Performance Management Module**: Appraisal templates, cycles, and evaluations
- **Payroll Tracking Module**: Payslips, claims, and disputes management

### 🔄 Modules in Progress
- Time Management Module
- Leaves Management Module
- Recruitment/Onboarding/Offboarding Modules
- Payroll Configuration & Policy Setup
- Payroll Processing & Execution

## Technology Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/hr-system
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Employees
- `GET /employees` - Get all employees
- `GET /employees/:id` - Get employee by ID
- `POST /employees` - Create new employee
- `PATCH /employees/:id` - Update employee
- `GET /employees/department/:departmentId` - Get employees by department
- `GET /employees/manager/:managerId` - Get employees by manager

### Departments
- `GET /departments` - Get all departments
- `GET /departments/:id` - Get department by ID
- `POST /departments` - Create new department
- `PATCH /departments/:id` - Update department
- `DELETE /departments/:id` - Deactivate department

### Positions
- `GET /positions` - Get all positions
- `GET /positions/:id` - Get position by ID
- `POST /positions` - Create new position
- `PATCH /positions/:id` - Update position
- `DELETE /positions/:id` - Deactivate position

### Performance
- `GET /performance/templates` - Get all appraisal templates
- `POST /performance/templates` - Create appraisal template
- `GET /performance/cycles` - Get all appraisal cycles
- `POST /performance/cycles` - Create appraisal cycle
- `GET /performance/appraisals` - Get all appraisals
- `POST /performance/appraisals` - Create appraisal
- `GET /performance/appraisals/:id` - Get appraisal by ID
- `PATCH /performance/appraisals/:id` - Update appraisal

### Payroll Tracking
- `GET /payslips` - Get all payslips
- `POST /payslips` - Create payslip
- `GET /payslips/:id` - Get payslip by ID
- `GET /payslips/employee/:employeeId` - Get payslips by employee
- `GET /claims` - Get all claims
- `POST /claims` - Create claim
- `PATCH /claims/:id/status` - Update claim status
- `GET /disputes` - Get all disputes
- `POST /disputes` - Create dispute
- `PATCH /disputes/:id/status` - Update dispute status

## Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── guards/          # JWT guards
│   │   ├── strategies/      # Passport strategies
│   │   ├── schemas/         # User schema
│   │   └── dto/             # Data transfer objects
│   ├── employee-profile/    # Employee management
│   ├── organization-structure/ # Org structure management
│   ├── performance/         # Performance appraisals
│   ├── payroll-tracking/   # Payroll tracking
│   └── app.module.ts        # Root module
├── test/                    # E2E tests
└── package.json
```

## Role-Based Access Control

The system supports the following roles:
- `system_admin` - Full system access
- `hr_manager` - HR management access
- `hr_employee` - HR employee access
- `hr_admin` - HR administration
- `payroll_manager` - Payroll management
- `payroll_specialist` - Payroll operations
- `finance_staff` - Finance access
- `legal_admin` - Legal administration
- `department_manager` - Department management
- `line_manager` - Line management
- `employee` - Employee self-service

## Development

### Running in development mode
```bash
npm run start:dev
```

### Building for production
```bash
npm run build
npm run start:prod
```

### Running tests
```bash
npm run test
npm run test:e2e
```

## Next Steps

1. Complete remaining modules (Time Management, Leaves, Recruitment, Payroll subsystems)
2. Add comprehensive validation and business logic
3. Implement role-based access control guards
4. Add comprehensive error handling
5. Create frontend application with Next.js
6. Set up deployment configuration

## License

UNLICENSED
