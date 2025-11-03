import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, ArrowUpDown, Star, MessageSquare, Check, X, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  related_id?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "exchange_request":
      return <ArrowUpDown className="w-5 h-5 text-primary" />;
    case "exchange_accepted":
      return <Check className="w-5 h-5 text-green-500" />;
    case "new_message":
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case "review_received":
      return <Star className="w-5 h-5 text-yellow-500" />;
    case "exchange_completed":
      return <Check className="w-5 h-5 text-green-500" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleExchangeResponse = async (exchangeId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase.functions.invoke('respond-to-exchange', {
        body: { exchange_id: exchangeId, action }
      });

      if (error) throw error;
      
      toast.success(`Exchange request ${action}ed successfully`);
      fetchNotifications();
    } catch (error) {
      console.error(`Error ${action}ing exchange:`, error);
      toast.error(`Failed to ${action} exchange request`);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    
    if (notification.type === 'exchange_request' && notification.related_id) {
      navigate('/dashboard');
    } else if (notification.type === 'new_message' && notification.related_id) {
      navigate('/messages');
    } else if (notification.type.includes('exchange') && notification.related_id) {
      navigate('/dashboard');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const actionRequiredCount = notifications.filter(n => n.type === 'exchange_request' && !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
          <p className="text-muted-foreground">Stay updated on your exchanges and activities</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="action" className="relative">
              Action Required
              {actionRequiredCount > 0 && (
                <Badge variant="outline" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {actionRequiredCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Notifications</h2>
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-all hover:shadow-md cursor-pointer ${
                      !notification.is_read ? 'border-primary/20 bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.content}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </div>
                            </div>

                            {notification.type === 'exchange_request' && notification.related_id && !notification.is_read && (
                              <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleExchangeResponse(notification.related_id!, 'reject')}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleExchangeResponse(notification.related_id!, 'accept')}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="action" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Action Required</h2>
            <div className="space-y-3">
              {notifications.filter(n => n.type === 'exchange_request' && !n.is_read).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Check className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending actions</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.filter(n => n.type === 'exchange_request' && !n.is_read).map((notification) => (
                  <Card key={notification.id} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.content}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </div>
                            </div>

                            {notification.related_id && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleExchangeResponse(notification.related_id!, 'reject')}
                                >
                                  Decline
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleExchangeResponse(notification.related_id!, 'accept')}
                                >
                                  Accept
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="exchanges" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Exchange Related</h2>
            <div className="space-y-3">
              {notifications.filter(n => n.type.includes('exchange')).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ArrowUpDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No exchange notifications</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.filter(n => n.type.includes('exchange')).map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer ${!notification.is_read ? 'border-primary/20 bg-primary/5' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Messages & Reviews</h2>
            <div className="space-y-3">
              {notifications.filter(n => n.type === 'new_message' || n.type === 'review_received').length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No message notifications</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.filter(n => n.type === 'new_message' || n.type === 'review_received').map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer ${!notification.is_read ? 'border-primary/20 bg-primary/5' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Notifications;