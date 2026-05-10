# MediCore Central - Hospital Management System (HMS)
## Technical Documentation & System Overview

MediCore Central is a modern, enterprise-grade Hospital Management System built for efficiency, clinical accuracy, and high-performance hospital operations. This document outlines the system architecture, core modules, and integration protocols.

---

## 🏗️ 1. Core Technology Stack
- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand (Auth) & TanStack Query (Server State)
- **Styling**: Tailwind CSS with sleek glassmorphic and high-contrast design
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend/Database**: Supabase (PostgreSQL)
- **Deployment**: Production-ready with environment-based configuration

---

## 🏥 2. Operational Modules

### 🩺 Clinical Core
- **Dashboard**: Real-time facility throughput, bed occupancy monitoring, and critical alerts.
- **Patients**: Unified Electronic Health Records (EHR) with medical history tracking.
- **Doctors**: Specialized personnel directory with availability and consultation management.
- **Appointments**: Intelligent scheduling queue with status tracking (Pending, Confirmed, Completed).
- **Prescriptions**: Digital prescription engine with structured medication data.
- **Lab Reports**: Integrated diagnostic tracking with status workflow from Pending to Reviewed.
- **Admissions**: In-patient management with room/bed allocation and clinical observations.

### 💰 Financial & Administrative
- **Billing**: Automated invoice generation and expense tracking.
- **Inventory**: Real-time pharmacy and equipment stock monitoring with low-stock alerts.
- **Human Resources**: Personnel hierarchy management and role-based access control (RBAC).
- **Attendance**: Biometric-ready punch-in/out monitoring with late-entry tracking.
- **Departments**: Hierarchical node infrastructure for hospital units.

---

## 🔒 3. Security & Data Architecture
- **Tenant Isolation**: Every query is scoped by `tenantId` to support multi-facility operations.
- **Row Level Security (RLS)**: Enforced at the database level in Supabase.
- **Authentication**: JWT-based session management with role-aware routing.
- **Infrastructure**: Programmatic access management via API Keys and registered device monitoring.

---

## 🚀 4. Setup & Deployment

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Initialization
Run the schema defined in `database.sql` in your Supabase SQL Editor. This will:
1. Create all 15 operational tables.
2. Configure RLS policies.
3. Establish necessary relationships and indexes.

### Installation
```bash
npm install
npm run dev
```

---

## 🛠️ 5. Recent Architecture Migration
The system has been successfully migrated from a mock-data prototype to a live, persistent Supabase infrastructure. 
- **Persistence**: All modules now communicate with live tables.
- **Cleanup**: Mock data storage (`dataStorage.ts`) has been removed in favor of `fetchWithFallback` API services.
- **Stability**: Implemented descriptive error handling and loading states for a premium UX.

---

## 📅 6. Future Roadmap
- [ ] Integration with HL7/FHIR standards for interoperability.
- [ ] Advanced BI Analytics for hospital efficiency.
- [ ] Patient Portal for appointment booking and report viewing.
- [ ] Mobile App for Doctor-on-the-go notifications.

---
*Documentation generated for MediCore Central Infrastructure v4.2*
