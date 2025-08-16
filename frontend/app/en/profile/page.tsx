"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  User, 
  Edit, 
  Trash2, 
  Download, 
  Share2, 
  Eye, 
  EyeOff,
  BarChart3,
  Settings,
  Mic,
  Calendar,
  Clock,
  Globe,
  Heart,
  Star,
  Plus,
  Save,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface UserStats {
  subscription_plan: string;
  monthly_generation_count: number;
  monthly_generation_limit: number;
  remaining_generations: number;
  is_unlimited: boolean;
  display_name?: string;
  bio?: string;
  preferred_voice?: string;
  preferred_language?: string;
  avatar_url?: string;
}

interface Podcast {
  id: number;
  title: string;
  description?: string;
  audio_url: string;
  cover_image_url?: string;
  duration?: string;
  voice: string;
  emotion: string;
  speed: number;
  tags?: string;
  is_public: boolean;
  created_at: string;
}

interface Analytics {
  total_podcasts: number;
  public_podcasts: number;
  private_podcasts: number;
  voice_statistics: Record<string, number>;
  total_duration_seconds: number;
  recent_podcasts_30_days: number;
  average_duration: number;
}

// English translations
const translations = {
  profile: 'Profile',
  myPodcasts: 'My Podcasts',
  analytics: 'Analytics',
  settings: 'Settings',
  emailAddress: 'Email Address',
  displayName: 'Display Name',
  bio: 'Bio',
  defaultVoice: 'Default Voice',
  defaultLanguage: 'Default Language',
  youngLady: 'Young Lady',
  youngMan: 'Young Man',
  elderlyWoman: 'Elderly Woman',
  cantonese: 'Cantonese',
  mandarin: 'Mandarin',
  english: 'English',
  enterDisplayName: 'Enter your display name',
  introduceYourself: 'Tell us about yourself...',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  profileUpdated: 'Profile updated successfully',
  updateFailed: 'Failed to update profile',
  logout: 'Logout',
  subscriptionPlan: 'Subscription Plan',
  monthlyGenerations: 'Monthly Generations',
  remainingGenerations: 'Remaining Generations',
  unlimited: 'Unlimited',
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
  totalPodcasts: 'Total Podcasts',
  publicPodcasts: 'Public Podcasts',
  privatePodcasts: 'Private Podcasts',
  totalDuration: 'Total Duration',
  averageDuration: 'Average Duration',
  recentPodcasts: 'Recent Podcasts (30 days)',
  noPodcasts: 'No podcasts yet',
  createFirstPodcast: 'Create your first podcast',
  podcastTitle: 'Podcast Title',
  description: 'Description',
  tags: 'Tags',
  public: 'Public',
  private: 'Private',
  delete: 'Delete',
  download: 'Download',
  share: 'Share',
  play: 'Play',
  pause: 'Pause',
  created: 'Created',
  duration: 'Duration',
  voice: 'Voice',
  emotion: 'Emotion',
  speed: 'Speed',
  normal: 'Normal',
  happy: 'Happy',
  sad: 'Sad',
  excited: 'Excited',
  calm: 'Calm',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  confirmDelete: 'Are you sure you want to delete this podcast?',
  deleteSuccess: 'Podcast deleted successfully',
  deleteFailed: 'Failed to delete podcast',
  shareSuccess: 'Link copied to clipboard',
  downloadSuccess: 'Download started',
  noData: 'No data available',
  backToHome: 'Back to Home',
  editPodcast: 'Edit Podcast',
  updatePodcast: 'Update Podcast',
  podcastUpdated: 'Podcast updated successfully',
  updatePodcastFailed: 'Failed to update podcast'
};

export default function EnglishProfilePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<number | null>(null);
  
  // Profile editing state
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    bio: '',
    preferred_voice: 'young-lady',
    preferred_language: 'cantonese'
  });

  // Podcast editing state
  const [podcastForm, setPodcastForm] = useState({
    title: '',
    description: '',
    tags: '',
    is_public: true
  });

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (!email) {
      router.push('/en/login');
      return;
    }
    setUserEmail(email);
    fetchUserData(email);
  }, [router]);

  const fetchUserData = async (email: string) => {
    try {
      const [statsResponse, podcastsResponse, analyticsResponse] = await Promise.all([
        fetch('/api/podcast/user/stats'),
        fetch('/api/podcast/user/podcasts'),
        fetch('/api/podcast/user/analytics')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
        setProfileForm({
          display_name: statsData.display_name || '',
          bio: statsData.bio || '',
          preferred_voice: statsData.preferred_voice || 'young-lady',
          preferred_language: statsData.preferred_language || 'cantonese'
        });
      }

      if (podcastsResponse.ok) {
        const podcastsData = await podcastsResponse.json();
        setPodcasts(podcastsData.podcasts || []);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    router.push('/en');
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('/api/podcast/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        toast.success(translations.profileUpdated);
        setEditingProfile(false);
        fetchUserData(userEmail);
      } else {
        toast.error(translations.updateFailed);
      }
    } catch (error) {
      console.error('Update profile failed:', error);
      toast.error(translations.updateFailed);
    }
  };

  const handlePodcastUpdate = async (podcastId: number) => {
    try {
      const response = await fetch(`/api/podcast/${podcastId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(podcastForm),
      });

      if (response.ok) {
        toast.success(translations.podcastUpdated);
        setEditingPodcast(null);
        fetchUserData(userEmail);
      } else {
        toast.error(translations.updatePodcastFailed);
      }
    } catch (error) {
      console.error('Update podcast failed:', error);
      toast.error(translations.updatePodcastFailed);
    }
  };

  const handlePodcastDelete = async (podcastId: number) => {
    if (!confirm(translations.confirmDelete)) return;

    try {
      const response = await fetch(`/api/podcast/${podcastId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(translations.deleteSuccess);
        fetchUserData(userEmail);
      } else {
        toast.error(translations.deleteFailed);
      }
    } catch (error) {
      console.error('Delete podcast failed:', error);
      toast.error(translations.deleteFailed);
    }
  };

  const handleShare = (audioUrl: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${audioUrl}`);
    toast.success(translations.shareSuccess);
  };

  const handleDownload = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(translations.downloadSuccess);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{translations.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">{translations.profile}</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/en')}
                className="text-gray-600 hover:text-gray-900"
              >
                {translations.backToHome}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{translations.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', name: translations.profile, icon: User },
              { id: 'podcasts', name: translations.myPodcasts, icon: Mic },
              { id: 'analytics', name: translations.analytics, icon: BarChart3 },
              { id: 'settings', name: translations.settings, icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-200 text-black'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{translations.profile}</h2>
                {!editingProfile ? (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{translations.edit}</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileUpdate}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{translations.save}</span>
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>{translations.cancel}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.emailAddress}
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.displayName}
                    </label>
                    <input
                      type="text"
                      value={editingProfile ? profileForm.display_name : (userStats?.display_name || '')}
                      onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      placeholder={translations.enterDisplayName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.bio}
                    </label>
                    <textarea
                      value={editingProfile ? profileForm.bio : (userStats?.bio || '')}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      disabled={!editingProfile}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      placeholder={translations.introduceYourself}
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.defaultVoice}
                    </label>
                    <select
                      value={editingProfile ? profileForm.preferred_voice : (userStats?.preferred_voice || 'young-lady')}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_voice: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    >
                      <option value="young-lady">{translations.youngLady}</option>
                      <option value="young-man">{translations.youngMan}</option>
                      <option value="elderly-woman">{translations.elderlyWoman}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.defaultLanguage}
                    </label>
                    <select
                      value={editingProfile ? profileForm.preferred_language : (userStats?.preferred_language || 'cantonese')}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_language: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    >
                      <option value="cantonese">{translations.cantonese}</option>
                      <option value="mandarin">{translations.mandarin}</option>
                      <option value="english">{translations.english}</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'podcasts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{translations.myPodcasts}</h2>
                <button
                  onClick={() => router.push('/en')}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{translations.createFirstPodcast}</span>
                </button>
              </div>

              {podcasts.length === 0 ? (
                <div className="text-center py-12">
                  <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{translations.noPodcasts}</h3>
                  <p className="text-gray-600 mb-4">{translations.createFirstPodcast}</p>
                  <button
                    onClick={() => router.push('/en')}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    {translations.createFirstPodcast}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {podcasts.map((podcast) => (
                    <motion.div
                      key={podcast.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                          {podcast.title}
                        </h3>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleShare(podcast.audio_url)}
                            className="p-1 text-gray-500 hover:text-primary"
                            title={translations.share}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(podcast.audio_url, podcast.title)}
                            className="p-1 text-gray-500 hover:text-primary"
                            title={translations.download}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePodcastDelete(podcast.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title={translations.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div>{translations.duration}: {podcast.duration || '00:00:00'}</div>
                        <div>{translations.voice}: {podcast.voice}</div>
                        <div>{translations.emotion}: {podcast.emotion}</div>
                        <div>{translations.speed}: {podcast.speed}x</div>
                        <div>{translations.created}: {new Date(podcast.created_at).toLocaleDateString()}</div>
                      </div>

                      <div className="mt-3">
                        <audio
                          controls
                          className="w-full h-8"
                          src={podcast.audio_url}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{translations.analytics}</h2>
              
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.total_podcasts}</div>
                    <div className="text-sm text-gray-600">{translations.totalPodcasts}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.public_podcasts}</div>
                    <div className="text-sm text-gray-600">{translations.publicPodcasts}</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.private_podcasts}</div>
                    <div className="text-sm text-gray-600">{translations.privatePodcasts}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(analytics.total_duration_seconds / 60)}m
                    </div>
                    <div className="text-sm text-gray-600">{translations.totalDuration}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{translations.noData}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{translations.settings}</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{translations.subscriptionPlan}</h3>
                  <p className="text-gray-600">{userStats?.subscription_plan || translations.free}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{translations.monthlyGenerations}</h3>
                  <p className="text-gray-600">
                    {userStats?.is_unlimited ? translations.unlimited : `${userStats?.monthly_generation_count || 0} / ${userStats?.monthly_generation_limit || 10}`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 