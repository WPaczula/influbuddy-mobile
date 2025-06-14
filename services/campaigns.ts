import { Campaign } from '@/types';
import { api } from './api';

export const campaignsService = {
  async list(): Promise<Campaign[]> {
    try {
      const response = await api.get<Campaign[]>('/campaigns');
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  async getDetails(id: string): Promise<Campaign> {
    try {
      const response = await api.get<Campaign>(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      throw error;
    }
  },

  async create(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    try {
      const response = await api.post<Campaign>('/campaigns', campaign);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      const response = await api.patch<Campaign>(`/campaigns/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/campaigns/${id}`);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  async addPost(campaignId: string, postUrl: string): Promise<Campaign> {
    try {
      const response = await api.post<{ campaign: Campaign }>(`/api/v1/campaigns/${campaignId}/posts`, {
        postUrl,
      });
      return response.data.campaign;
    } catch (error) {
      console.error('Error adding post to campaign:', error);
      throw error;
    }
  },

  async removePost(campaignId: string, postUrl: string): Promise<Campaign> {
    try {
      const response = await api.delete<{ campaign: Campaign }>(`/api/v1/campaigns/${campaignId}/posts`, {
      });
      return response.data.campaign;
    } catch (error) {
      console.error('Error removing post from campaign:', error);
      throw error;
    }
  },

  async updatePosts(campaignId: string, postLinks: string[]): Promise<Campaign> {
    try {
      const response = await api.put<{ campaign: Campaign }>(`/api/v1/campaigns/${campaignId}/posts`, {
        postLinks,
      });
      return response.data.campaign;
    } catch (error) {
      console.error('Error updating campaign posts:', error);
      throw error;
    }
  },
}; 