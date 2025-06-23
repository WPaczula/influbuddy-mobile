import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Campaign } from '@/types';
import { campaignsService } from '@/services/campaigns';

export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: string) => [...campaignKeys.lists(), { filters }] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

export type CreateCampaignInput = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'partner'>;

export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: () => campaignsService.list(),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsService.getDetails(id),
  });
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
      // Invalidate and refetch both the list and the specific campaign
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(data.id) });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsService.delete(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      // Remove the deleted campaign from the cache
      queryClient.removeQueries({ queryKey: campaignKeys.detail(id) });
    },
  });
}

export function useAddPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, postUrl, platform, postType, description }: {
      campaignId: string;
      postUrl: string;
      platform: string;
      postType: string;
      description?: string;
    }) => campaignsService.addPost(campaignId, postUrl, platform, postType, description),
    onSuccess: (data) => {
      console.log(data);
      // Invalidate and refetch the campaign details
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(data.id) });
    },
  });
}

export function useRemovePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, postId }: {
      campaignId: string;
      postId: string;
    }) => campaignsService.removePost(campaignId, postId),
    onSuccess: (data) => {
      // Invalidate and refetch the campaign details
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(data.id) });
    },
  });
} 