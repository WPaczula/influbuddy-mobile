import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Partner } from '@/types';
import { partnersService } from '@/services/partners';

// Query keys
export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (filters: string) => [...partnerKeys.lists(), { filters }] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
};

// Hooks
export function usePartners() {
  return useQuery({
    queryKey: partnerKeys.lists(),
    queryFn: () => partnersService.list(),
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnersService.getDetails(id),
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'totalEarnings' | 'activeCampaigns' | 'campaigns' | '_count'>) =>
      partnersService.create(partner),
    onSuccess: () => {
      // Invalidate and refetch partners list
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Partner> }) =>
      partnersService.update(id, updates),
    onSuccess: (data) => {
      // Invalidate and refetch both the list and the specific partner
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(data.id) });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => partnersService.delete(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch partners list
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      // Remove the deleted partner from cache
      queryClient.removeQueries({ queryKey: partnerKeys.detail(id) });
    },
  });
} 