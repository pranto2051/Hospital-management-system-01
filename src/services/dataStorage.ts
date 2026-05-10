import { Patient, AdmissionStatus, Admission, Diagnosis, Prescription, Doctor, Department, Appointment, AppointmentStatus, PrescriptionStatus, Attendance, InventoryItem, LabReport } from '../types';

// Centralised mock data to persist between page transitions in this SPA
// ... (omitting helper for brevity)
const getLocalISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientName: 'John Smith',
    patientAge: '45',
    doctorId: 'u-2', // Dr. Sarah Smith
    date: getLocalISO(),
    time: '10:00',
    status: AppointmentStatus.CONFIRMED,
    reason: 'Routine checkup',
    tenantId: 'MediCore Central',
    createdAt: Date.now()
  },
  {
    id: 'apt-2',
    patientName: 'Sarah Connor',
    patientAge: '32',
    doctorId: 'u-3', // Dr. Michael Chen
    date: getLocalISO(),
    time: '11:15',
    status: AppointmentStatus.CONFIRMED,
    reason: 'Back pain',
    tenantId: 'MediCore Central',
    createdAt: Date.now()
  }
];

export const mockPatients: Patient[] = [
  {
    id: 'PID-1001',
    userId: 'pat-1',
    name: 'John Smith',
    age: '45',
    gender: 'MALE',
    dateOfBirth: '1979-05-15',
    bloodGroup: 'O+',
    address: '123 Medical Lane, Health City',
    medicalHistory: ['Hypertension'],
    tenantId: 'demo-tenant',
    createdAt: Date.now()
  },
  {
    id: 'PID-1002',
    userId: 'pat-2',
    name: 'Sarah Connor',
    age: '32',
    gender: 'FEMALE',
    dateOfBirth: '1992-08-22',
    bloodGroup: 'A-',
    address: '456 Cyberdyne Blvd, Tech City',
    medicalHistory: [],
    tenantId: 'demo-tenant',
    createdAt: Date.now()
  },
  {
    id: 'PID-1003',
    userId: 'pat-3',
    name: 'Robert Brown',
    age: '58',
    gender: 'MALE',
    dateOfBirth: '1966-03-10',
    bloodGroup: 'B+',
    address: '789 Oak Avenue, Leafy Suburb',
    medicalHistory: ['Peanuts Allergy'],
    tenantId: 'demo-tenant',
    createdAt: Date.now()
  }
];

// Add existing patients back for context
mockPatients.push(
  {
    id: 'PID-1004',
    userId: 'u-101',
    name: 'John Doe',
    dateOfBirth: '1985-05-15',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '123 Main St',
    medicalHistory: ['Hypertension'],
    tenantId: 'MediCore Central',
    age: '38',
    phone: '+1 (555) 123-4567',
    createdAt: Date.now()
  },
  {
    id: 'PID-1005',
    userId: 'u-102',
    name: 'Jane Smith',
    dateOfBirth: '1990-08-22',
    gender: 'FEMALE',
    bloodGroup: 'A-',
    address: '456 Oak Ave',
    medicalHistory: ['Asthma'],
    tenantId: 'MediCore Central',
    age: '33',
    phone: '+1 (555) 987-6543',
    createdAt: Date.now()
  }
);

export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Cardiology', description: 'Heart and vascular care', tenantId: 'MediCore Central' },
  { id: 'dept-2', name: 'Neurology', description: 'Brain and nervous system', tenantId: 'MediCore Central' },
  { id: 'dept-3', name: 'Pediatrics', description: 'Child healthcare', tenantId: 'MediCore Central' },
  { id: 'dept-4', name: 'Orthopedics', description: 'Bone and joint care', tenantId: 'MediCore Central' },
  { id: 'dept-5', name: 'Gynecology', description: 'Women health specialist', tenantId: 'MediCore Central' },
  { id: 'dept-6', name: 'Dermatology', description: 'Skin specialist', tenantId: 'MediCore Central' },
];

export const mockDoctors: Doctor[] = [
  {
    id: 'dr-1',
    userId: 'u-2',
    name: 'Dr. Sarah Smith',
    photoURL: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200',
    specialization: 'CARDIOLOGY',
    licenseNumber: 'MED-12345',
    departmentId: 'dept-1',
    bio: 'Senior cardiologist with 15 years of experience in interventional cardiology.',
    experience: 15,
    rating: 4.9,
    consultationFee: 150,
    tags: ['OPD', 'SURG', 'DIAG'],
    availability: [
      { day: 'monday', slots: [{ start: '09:00', end: '13:00' }] },
      { day: 'wednesday', slots: [{ start: '14:00', end: '18:00' }] }
    ],
    tenantId: 'MediCore Central'
  },
  {
    id: 'dr-2',
    userId: 'u-3',
    name: 'Dr. Michael Chen',
    photoURL: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
    specialization: 'NEUROLOGY',
    licenseNumber: 'MED-67890',
    departmentId: 'dept-2',
    bio: 'Specialist in neurological disorders and brain surgeries.',
    experience: 12,
    rating: 4.8,
    consultationFee: 180,
    tags: ['OPD', 'SURG'],
    availability: [
      { day: 'tuesday', slots: [{ start: '10:00', end: '15:00' }] },
      { day: 'thursday', slots: [{ start: '10:00', end: '15:00' }] }
    ],
    tenantId: 'MediCore Central'
  },
  {
    id: 'dr-3',
    userId: 'u-4',
    name: 'Dr. Emma Watson',
    photoURL: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
    specialization: 'PEDIATRICS',
    licenseNumber: 'MED-54321',
    departmentId: 'dept-3',
    bio: 'Compassionate pediatrician focusing on neonatology.',
    experience: 8,
    rating: 4.9,
    consultationFee: 100,
    tags: ['OPD', 'DIAG'],
    availability: [
      { day: 'monday', slots: [{ start: '08:00', end: '12:00' }] },
      { day: 'friday', slots: [{ start: '08:00', end: '16:00' }] }
    ],
    tenantId: 'MediCore Central'
  }
];

export const mockAdmissions: Admission[] = [
  {
    id: 'adm-1',
    patientId: 'p-1',
    patientName: 'John Doe',
    roomNumber: '302',
    bedNumber: 'A-12',
    reason: 'Observation after surgery',
    status: AdmissionStatus.ADMITTED,
    admittedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    doctorInChargeId: 'u-2',
    doctorInChargeName: 'Dr. Sarah Smith',
    tenantId: 'MediCore Central'
  }
];

export const mockDiagnoses: Diagnosis[] = [];
export const mockPrescriptions: Prescription[] = [
  {
    id: 'rx-1',
    patientId: 'p-1',
    patientName: 'John Doe',
    patientAge: '38',
    patientPhone: '+1 (555) 123-4567',
    diagnosis: 'Chronic Back Pain',
    doctorId: 'u-2',
    doctorName: 'Dr. Sarah Smith',
    medications: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '10 days' }
    ],
    instructions: 'Take after meals. Avoid strenuous activity.',
    status: PrescriptionStatus.ACTIVE,
    date: Date.now(),
    createdAt: Date.now(),
    tenantId: 'MediCore Central'
  }
];

export const mockAttendance: Attendance[] = [
  {
    id: 'att-1',
    userId: 'u-2',
    userName: 'Dr. Sarah Smith',
    date: getLocalISO(),
    checkIn: '08:45 AM',
    status: 'PRESENT',
    tenantId: 'MediCore Central'
  },
  {
    id: 'att-2',
    userId: 'u-3',
    userName: 'Dr. Michael Chen',
    date: getLocalISO(),
    checkIn: '09:05 AM',
    status: 'LATE',
    tenantId: 'MediCore Central'
  }
];

export const mockInventory: InventoryItem[] = [
  { id: 'i-1', name: 'Paracetamol', category: 'MEDICINE', stock: 50, unit: 'Boxes', minStock: 20, tenantId: 'MediCore Central' },
  { id: 'i-2', name: 'Surgical Gloves', category: 'SUPPLY', stock: 15, unit: 'Pairs', minStock: 25, tenantId: 'MediCore Central' },
  { id: 'i-3', name: 'Defibrillator', category: 'EQUIPMENT', stock: 3, unit: 'Units', minStock: 1, tenantId: 'MediCore Central' }
];

export const mockLabReports: LabReport[] = [];
