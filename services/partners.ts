import { Partner } from '@/types';
import { api } from './api';
import { AxiosError } from 'axios';

export const partnersService = {
  async list(): Promise<Partner[]> {
    try {
      const response = await api.get<Partner[]>('/partners');
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  },

  async getDetails(id: string): Promise<Partner> {
    try {
      const response = await api.get<Partner>(`/partners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner details:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Request URL:', error.config?.url);
      }
      throw error;
    }
  },

  async create(partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'totalEarnings' | 'activeCampaigns' | 'campaigns' | '_count'>): Promise<Partner> {
    try {
      const response = await api.post<Partner>('/partners', partner);
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Request URL:', error.config?.url);
      }
      throw error;
    }
  },

  async update(id: string, updates: Partial<Partner>): Promise<Partner> {
    try {
      const response = await api.patch<Partner>(`/partners/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating partner:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Request URL:', error.config?.url);
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/partners/${id}`);
    } catch (error) {
      console.error('Error deleting partner:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Request URL:', error.config?.url);
      }
      throw error;
    }
  }
}; 