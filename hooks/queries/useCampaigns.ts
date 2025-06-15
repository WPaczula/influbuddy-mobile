import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Campaign } from '@/types';
import { campaignsService } from '@/services/campaigns';

export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: string) => [...campaignKeys.lists(), { filters }] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

// Define the shape for creating a campaign (matches CreateCampaignDto)
export interface CreateCampaignInput {
  title: string;
  description: string;
  partnerId: string;
  productValue: number;
  deadline: Date;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  requirements: string[];
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignInput) => campaignsService.create(data),
    onSuccess: () => {
      // Invalidate and refetch campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Campaign> }) =>
      campaignsService.update(id, updates),
    onSuccess: (data) => {
      // Invalidate and refetch campaigns list and details
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(data.id) });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
} 