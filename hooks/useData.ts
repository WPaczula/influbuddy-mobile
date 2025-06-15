import { useState, useEffect } from 'react';
import { Partner, Campaign, DashboardStats, UserProfile } from '@/types';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { campaignsService } from '@/services/campaigns';
import { partnersService } from '@/services/partners';


export function useData() {
  const { user, updateUserProfile } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const profile = user?.profile;

  const loadData = async () => {
    try {
      // Load partners from API
      const partnersData = await partnersService.list();
      setPartners(partnersData);

      // Load campaigns from API
      const campaignsData = await campaignsService.list();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPartner = async (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'totalEarnings' | 'activeCampaigns'>) => {
    try {
      const newPartner = await partnersService.create(partner);
      await loadData(); // Reload all data after adding a partner
      return newPartner;
    } catch (error) {
      console.error('Error adding partner:', error);
      throw error;
    }
  };

  const updatePartner = async (partnerId: string, updates: Partial<Partner>) => {
    try {
      const updatedPartner = await partnersService.update(partnerId, updates);
      await loadData(); // Reload all data after updating a partner
      return updatedPartner;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'partner'>) => {
    try {
      const newCampaign = await campaignsService.create(campaign);
      await loadData(); // Reload all data after adding a campaign
      return newCampaign;
    } catch (error) {
      console.error('Error adding campaign:', error);
      throw error;
    }
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      const updatedCampaign = await campaignsService.update(campaignId, updates);
      await loadData(); // Reload all data after updating a campaign
      return updatedCampaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      await campaignsService.delete(campaignId);
      await loadData(); // Reload all data after deleting a campaign
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (updateUserProfile) {
      await updateUserProfile(updates);
    }
  };

  const getDashboardStats = (): DashboardStats => {
    const totalEarnings = campaigns
      .filter(c => c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    
    const activeCampaigns = campaigns.filter(c => c.status !== 'COMPLETED').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED').length;
    
    const upcomingDeadlines = campaigns.filter(c => {
      const deadline = new Date(c.deadline || '');
      const today = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && c.status !== 'COMPLETED';
    }).length;

    return {
      totalEarnings,
      activeCampaigns,
      completedCampaigns,
      totalPartners: partners.length,
      upcomingDeadlines,
    };
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  return {
    partners,
    campaigns,
    profile: profile || {
      id: '',
      name: '',
      email: '',
      createdAt: '',
      updatedAt: '',
    },
    loading,
    addPartner,
    updatePartner,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    updateProfile,
    getDashboardStats,
    refresh: loadData, // Expose the loadData function as refresh
  };
}