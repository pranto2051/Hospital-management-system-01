/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  NURSE = 'NURSE',
  TECHNICIAN = 'TECHNICIAN',
  RECEPTIONIST = 'RECEPTIONIST',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
  ACCOUNTS_OFFICER = 'ACCOUNTS_OFFICER'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL'
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: number;
  emailVerified: boolean;
  bloodGroup?: string;
  address?: string;
  fatherName?: string;
  age?: string;
  mobileNo?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  tenantId: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string; // Denormalized for performance
  photoURL?: string;
  specialization: string;
  licenseNumber: string;
  departmentId: string;
  bio: string;
  experience?: number;
  rating?: number;
  consultationFee?: number;
  tags?: string[];
  availability: DoctorAvailability[];
  tenantId: string;
}

export interface DoctorAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  slots: { start: string; end: string }[];
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  age?: string;
  phone?: string;
  problem?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  address: string;
  medicalHistory: string[];
  tenantId: string;
  createdAt: number;
}

export interface Appointment {
  id: string;
  patientId?: string; // Optional if existing patient is selected, but user wants manual entry
  patientName: string;
  patientAge: string;
  doctorId: string;
  date: string; // ISO format
  time: string; // 24h format
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  tenantId: string;
  createdAt: number;
}

export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  patientAge?: string;
  patientPhone?: string;
  patientBloodGroup?: string;
  diagnosis?: string;
  date: number;
  createdAt: number;
  updatedAt?: number;
  medications: Medication[];
  instructions: string;
  status: PrescriptionStatus;
  tenantId: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: number;
  items: InvoiceItem[];
  tenantId: string;
  createdAt: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  resource: string;
  resourceId: string;
  timestamp: number;
  details: string;
  tenantId: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  description: string;
  createdAt: number;
  lastUsedAt?: number;
  tenantId: string;
  createdBy: string;
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // ISO or HH:mm
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  tenantId: string;
}

export interface LabReportStatusEnum {
  PENDING: 'PENDING';
  IN_PROGRESS: 'IN_PROGRESS';
  COMPLETED: 'COMPLETED';
  REVIEWED: 'REVIEWED';
  CANCELLED: 'CANCELLED';
}

export enum LabReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REVIEWED = 'REVIEWED',
  CANCELLED = 'CANCELLED'
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string; // Optional doctor who ordered
  testName: string;
  specialization: string;
  status: LabReportStatus;
  date: string;
  result?: string;
  fileUrl?: string; // Optional path to PDF/image
  technicianId: string;
  technicianName: string;
  tenantId: string;
  createdAt: number;
}

export enum AdmissionStatus {
  ADMITTED = 'ADMITTED',
  DISCHARGED = 'DISCHARGED',
  OBSERVATION = 'OBSERVATION'
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: string;
  patientPhone?: string;
  patientBloodGroup?: string;
  roomNumber: string;
  bedNumber: string;
  admittedAt: number;
  dischargedAt?: number;
  status: AdmissionStatus;
  reason: string; // Used as 'Problem' in UI
  doctorInChargeId: string;
  doctorInChargeName: string;
  tenantId: string;
  observations?: ClinicalObservation[];
}

export interface ClinicalObservation {
  id: string;
  note: string;
  status: 'STABLE' | 'UNSTABLE' | 'CRITICAL' | 'RECOVERING';
  recordedAt: number;
  staffName: string;
}

export interface Diagnosis {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  condition: string;
  notes: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  date: number;
  tenantId: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'UPI' | 'INSURANCE';
  date: number;
  recordedBy: string;
  recordedByName: string;
  tenantId: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: number;
  recordedBy: string;
  recordedByName: string;
  tenantId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'MEDICINE' | 'EQUIPMENT' | 'SUPPLY';
  stock: number;
  unit: string;
  minStock: number;
  expiryDate?: number;
  tenantId: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  requestedBy: string;
  requestedByName: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  result?: string;
  fileUrl?: string;
  date: number;
  tenantId: string;
}

export interface RegisteredDevice {
  id: string;
  name: string;
  type: string; // Mobile, Desktop, Tablet
  os: string;
  browser: string;
  lastIp: string;
  lastSeen: number;
  isTrusted: boolean;
  userId: string;
  userName: string;
  tenantId: string;
}
