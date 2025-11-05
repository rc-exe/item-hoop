import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, Package, Star, TrendingUp, Users, Bell } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExchangeManagement } from '@/components/ExchangeManagement';
import { NotificationDropdown } from '@/components/NotificationDropdown';

interface DashboardStats {
  totalItems: number;
  totalViews: number;
  activeExchanges: number;
  completedExchanges: number;
}

interface Exchange {
  id: string;
  status: string;
  created_at: string;
  owner_item: {
    title: string;
    images: string[];
  };
  requester_item?: {
    title: string;
    images: string[];
  };
  owner: {
    id: string;
    username: string;
    avatar_url: string;
  };
  requester: {
    id: string;
    username: string;
    avatar_url: string;
  };
  message?: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalViews: 0,
    activeExchanges: 0,
    completedExchanges: 0,
  });
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // Fetch user's items
      const { data: items } = await supabase
        .from('items')
        .select('views_count')
        .eq('user_id', user.id);

      // Fetch exchanges with related data
      const { data: exchangesData } = await supabase
        .from('exchanges')
        .select(`
          *,
          owner_item:items!exchanges_owner_item_id_fkey(title, images),
          requester_item:items!exchanges_requester_item_id_fkey(title, images),
          owner:profiles!exchanges_owner_id_fkey(id, username, avatar_url),
          requester:profiles!exchanges_requester_id_fkey(id, username, avatar_url)
        `)
        .or(`owner_id.eq.${user.id},requester_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const totalItems = items?.length || 0;
      const totalViews = items?.reduce((sum, item) => sum + (item.views_count || 0), 0) || 0;
      const activeExchanges = exchangesData?.filter(e => ['pending', 'accepted'].includes(e.status)).length || 0;
      const completedExchanges = exchangesData?.filter(e => e.status === 'completed').length || 0;

      setStats({
        totalItems,
        totalViews,
        activeExchanges,
        completedExchanges,
      });

      setExchanges(exchangesData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to real-time updates for exchanges
    if (!user) return;

    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchanges',
          filter: `or(owner_id=eq.${user.id},requester_id=eq.${user.id})`
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your items and exchanges</p>
          </div>
          <NotificationDropdown onUpdate={fetchDashboardData} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Items you've listed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">Views on your items</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Exchanges</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeExchanges}</div>
              <p className="text-xs text-muted-foreground">Pending or accepted</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedExchanges}</div>
              <p className="text-xs text-muted-foreground">Successful exchanges</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Exchanges */}
        <div className="grid md:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exchanges.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No exchanges yet</h3>
                  <p className="text-muted-foreground">
                    Start browsing items to make your first exchange request!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exchanges.slice(0, 5).map((exchange) => (
                    <ExchangeManagement
                      key={exchange.id}
                      exchange={exchange}
                      currentUserId={user?.id || ''}
                      onUpdate={fetchDashboardData}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;