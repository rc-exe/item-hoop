import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, ArrowUpDown, Star, MessageSquare, Check, X, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

const notifications = [
  {
    id: 1,
    type: "exchange_request",
    title: "New Exchange Request",
    message: "Sarah Chen wants to exchange her Professional Headphones for your Vintage Camera",
    time: "2 hours ago",
    read: false,
    actionRequired: true
  },
  {
    id: 2,
    type: "exchange_accepted",
    title: "Exchange Accepted!",
    message: "Mike Rodriguez accepted your exchange request for the Guitar",
    time: "1 day ago",
    read: false,
    actionRequired: false
  },
  {
    id: 3,
    type: "new_message",
    title: "New Message",
    message: "Alex Johnson sent you a message about the Art Supplies",
    time: "2 days ago",
    read: true,
    actionRequired: false
  },
  {
    id: 4,
    type: "review_received",
    title: "Review Received",
    message: "You received a 5-star review from Emma Wilson",
    time: "3 days ago",
    read: true,
    actionRequired: false
  },
  {
    id: 5,
    type: "exchange_completed",
    title: "Exchange Completed",
    message: "Your exchange with David Kim has been marked as completed",
    time: "1 week ago",
    read: true,
    actionRequired: false
  }
];

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
  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

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
              <Button variant="ghost" size="sm">
                Mark all as read
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`transition-all hover:shadow-md ${
                  !notification.read ? 'border-primary/20 bg-primary/5' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {notification.time}
                            </div>
                          </div>

                          {notification.actionRequired && (
                            <div className="flex gap-2 flex-shrink-0">
                              <Button size="sm" variant="outline">
                                <X className="w-4 h-4" />
                              </Button>
                              <Button size="sm">
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="action" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Action Required</h2>
            <div className="space-y-3">
              {notifications.filter(n => n.actionRequired).map((notification) => (
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
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {notification.time}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Decline
                            </Button>
                            <Button size="sm">
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exchanges" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Exchange Related</h2>
            <div className="space-y-3">
              {notifications.filter(n => n.type.includes('exchange')).map((notification) => (
                <Card key={notification.id} className={!notification.read ? 'border-primary/20 bg-primary/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Messages & Reviews</h2>
            <div className="space-y-3">
              {notifications.filter(n => n.type === 'new_message' || n.type === 'review_received').map((notification) => (
                <Card key={notification.id} className={!notification.read ? 'border-primary/20 bg-primary/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Notifications;