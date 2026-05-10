# 🏥 MediCore Central - Enterprise Hospital Management System

![MediCore Banner](https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200)

MediCore Central is a high-performance, full-stack Hospital Management System (HMS) designed to streamline clinical workflows, patient care, and administrative operations. Built with a modern tech stack and a focus on visual excellence, it provides a seamless experience for doctors, nurses, staff, and administrators.

## ✨ Key Features

- **Clinical Excellence**: Integrated EHR, Prescriptions, Lab Reports, and Admissions tracking.
- **Dynamic Scheduling**: Real-time appointment management with automated status updates.
- **Financial Control**: Comprehensive billing, invoicing, and expense tracking.
- **Operational Intelligence**: Inventory management, staff attendance, and department hierarchy.
- **Live Infrastructure**: Powered by Supabase for real-time data persistence and security.
- **Premium UI**: Sleek, responsive design with glassmorphic aesthetics and fluid animations.

## 🚀 Quick Start

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. **Initialize Database**:
   Execute the `database.sql` script in your Supabase SQL Editor.
5. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `/src/pages`: Core functional modules (Admissions, Billing, Patients, etc.)
- `/src/services`: API layer and database integration logic.
- `/src/store`: Global state management for authentication and user sessions.
- `/src/types`: TypeScript definitions for the entire HMS ecosystem.
- `database.sql`: Full schema definition for production-ready PostgreSQL deployment.

## 📜 Documentation

For a detailed technical overview, architecture analysis, and setup instructions, please refer to the [**DOCUMENTATION.md**](./DOCUMENTATION.md) file.

## 🛡️ Security

MediCore Central implements Row Level Security (RLS) and Tenant Isolation to ensure that patient data is strictly protected and accessible only to authorized personnel.

---
*Built with ❤️ for modern healthcare.*
# Hospital-management-system-01
# Hospital-management-system-01
# Hospital-management-system-01
