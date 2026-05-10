// Generic helper for fetching data using the Express backend
export async function fetchWithFallback<T>(
  table: string, 
  mockData: T[], 
  tenantId?: string,
  _filter?: (query: any) => any
): Promise<T[]> {
  try {
    const url = new URL(`/api/${table}`, window.location.origin);
    if (tenantId) url.searchParams.set('tenantId', tenantId);
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('API fetch failed');
    
    const data = await response.json();
    
    // If backend returns empty array but we have mock data, return mock data for initial demo
    if (data.length === 0 && mockData.length > 0) return [...mockData];
    return data;
  } catch (error) {
    console.warn(`Falling back to mocks for ${table}:`, error);
    return [...mockData];
  }
}

// Save helper using the Express backend (Generic for any DB)
export async function saveToDatabase<T extends { id: string }>(
  table: string, 
  item: T, 
  mockStore?: T[]
): Promise<T> {
  try {
    const response = await fetch(`/api/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    
    if (!response.ok) throw new Error('API save failed');
    return await response.json();
  } catch (error) {
    console.warn(`Falling back to local mock store for ${table}:`, error);
    if (mockStore) {
      const existingIndex = mockStore.findIndex(i => i.id === item.id);
      if (existingIndex !== -1) {
        mockStore[existingIndex] = { ...item };
      } else {
        mockStore.unshift({ ...item });
      }
    }
    return item;
  }
}

// Delete helper (future expansion)
export async function deleteFromFirestore(_table: string, _id: string) {
  // Mock artificial delay for now
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Real-time listener helper (mocked for file-based DB)
export function subscribeToCollection<T>(
  _table: string,
  _tenantId: string | undefined,
  onData: (data: T[]) => void,
  _onError?: (error: Error) => void
) {
  // In a file-based backend, we usually poll or use WebSockets. 
  // For now, we return an empty unsubscribe.
  return () => {}; 
}
