export interface Partner {
  id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalEarnings: number;
  activeCampaigns: number;
  campaigns?: {
    id: string;
    title: string;
    status: string;
    deadline?: string;
  }[];
  _count?: {
    campaigns: number;
  };
}

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  partnerId: string;
  productValue: number | null;
  deadline: Date | null;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  collaborationType: 'BARTER' | 'PAID' | 'SPONSORED' | 'GIFTED' | 'EVENT';
  createdAt: string;
  updatedAt: string;
  partner: {
    id: string;
    name: string;
    company: string;
  };
  socialLinks?: SocialLink[];
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'other';
  url: string;
  postType: 'post' | 'story' | 'reel' | 'video' | 'carousel';
  description?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface DashboardStats {
  totalEarnings: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalPartners: number;
  upcomingDeadlines: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  socialHandles: {
    instagram: string;
    tiktok: string;
    youtube: string;
  };
  createdAt: string;
  updatedAt: string;
}