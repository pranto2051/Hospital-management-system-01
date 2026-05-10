import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Patient } from '../types';

export function usePatients() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const tenantId = user?.tenantId;

  const patientsQuery = useQuery({
    queryKey: ['patients', tenantId],
    queryFn: async () => {
      // Mock data Since Supabase lookup needs valid connection
      return [
        { id: '1', name: 'John Doe', bloodGroup: 'O+', gender: 'MALE', tenantId: 'MediCore Central', userId: 'local-1', dateOfBirth: '1980-01-01', address: '123 Main St', medicalHistory: [] },
        { id: '2', name: 'Jane Smith', bloodGroup: 'A-', gender: 'FEMALE', tenantId: 'MediCore Central', userId: 'local-2', dateOfBirth: '1990-05-05', address: '456 Oak Ave', medicalHistory: [] }
      ] as Patient[];
    },
    enabled: !!tenantId
  });

  const createPatient = useMutation({
    mutationFn: async (newPatient: Omit<Patient, 'id' | 'tenantId'>) => {
      if (!tenantId) throw new Error('No tenant context');
      return { id: Math.random().toString(), ...newPatient, tenantId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', tenantId] });
    }
  });

  return {
    patients: patientsQuery.data || [],
    isLoading: patientsQuery.isLoading,
    isError: patientsQuery.isError,
    createPatient
  };
}
