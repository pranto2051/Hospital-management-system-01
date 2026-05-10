-- 1. Profiles (User data)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "mobileNo" TEXT,
  "bloodGroup" TEXT,
  address TEXT,
  "fatherName" TEXT,
  age TEXT,
  "createdAt" BIGINT,
  "updatedAt" BIGINT
);

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON departments
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Run this for the profiles table so you can register users
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON profiles
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);


-- 3. Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES profiles(id),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  "licenseNumber" TEXT,
  "departmentId" TEXT,
  bio TEXT,
  experience INTEGER,
  "consultationFee" NUMERIC,
  availability JSONB,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- 4. Patients
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  name TEXT NOT NULL,
  age TEXT,
  phone TEXT,
  problem TEXT,
  "dateOfBirth" TEXT,
  gender TEXT,
  "bloodGroup" TEXT,
  address TEXT,
  "medicalHistory" JSONB,
  "tenantId" TEXT NOT NULL,
  "createdAt" BIGINT
);

-- 5. Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  "patientId" TEXT,
  "patientName" TEXT NOT NULL,
  "patientAge" TEXT,
  "doctorId" TEXT REFERENCES doctors(id),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  reason TEXT,
  notes TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" BIGINT
);

-- 6. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  "appointmentId" TEXT,
  "doctorId" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "patientName" TEXT NOT NULL,
  "patientAge" TEXT,
  diagnosis TEXT,
  medications JSONB,
  instructions TEXT,
  status TEXT DEFAULT 'ACTIVE',
  "tenantId" TEXT NOT NULL,
  date BIGINT,
  "createdAt" BIGINT
);

-- 7. Lab Reports
CREATE TABLE IF NOT EXISTS lab_reports (
  id TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL,
  "patientName" TEXT NOT NULL,
  "doctorId" TEXT,
  "testName" TEXT NOT NULL,
  specialization TEXT,
  status TEXT DEFAULT 'PENDING',
  date TEXT,
  result TEXT,
  "fileUrl" TEXT,
  "technicianId" TEXT,
  "technicianName" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" BIGINT
);

-- 8. Admissions
CREATE TABLE IF NOT EXISTS admissions (
  id TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL,
  "patientName" TEXT NOT NULL,
  "roomNumber" TEXT,
  "bedNumber" TEXT,
  "admittedAt" BIGINT,
  "dischargedAt" BIGINT,
  status TEXT DEFAULT 'ADMITTED',
  reason TEXT,
  "doctorInChargeId" TEXT,
  "doctorInChargeName" TEXT,
  observations JSONB DEFAULT '[]'::jsonb,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- 9. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  date TEXT NOT NULL,
  "checkIn" TEXT,
  "checkOut" TEXT,
  status TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- 10. Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  unit TEXT,
  "minStock" INTEGER DEFAULT 0,
  "expiryDate" BIGINT,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- 11. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  date BIGINT,
  "recordedBy" TEXT,
  "recordedByName" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- 12. Diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
  id TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "doctorName" TEXT,
  condition TEXT NOT NULL,
  notes TEXT,
  severity TEXT,
  date BIGINT,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);





-- 13. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  "dueDate" BIGINT,
  items JSONB DEFAULT '[]'::jsonb,
  "tenantId" TEXT NOT NULL,
  "createdAt" BIGINT
);

-- 14. API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  "createdAt" BIGINT,
  "lastUsedAt" BIGINT,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- 15. Registered Devices
CREATE TABLE IF NOT EXISTS registered_devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  browser TEXT,
  os TEXT,
  "lastIp" TEXT,
  "lastSeen" BIGINT,
  "isTrusted" BOOLEAN DEFAULT false,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- Enable RLS for all tables and add permissive policies for development
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'main' 
    AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON %I', t);
    EXECUTE format('CREATE POLICY "Allow all access" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Manual RLS for schemas that might not be in 'main' or if public
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON doctors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON prescriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON lab_reports FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON admissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON attendance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON inventory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON diagnoses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON invoices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON api_keys FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON registered_devices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
