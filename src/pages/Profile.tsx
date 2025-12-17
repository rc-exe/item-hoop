import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Star, Calendar, MapPin, Package, ArrowUpDown, MessageSquare, Settings, Eye, Clock, Users, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { profile, items, favorites, activity, reviews, exchangedItems, loading, error, refreshData } = useProfile(userId);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isOwnProfile = !userId;

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item deleted",
        description: "Your item has been successfully deleted.",
      });

      refreshData();
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMessageClick = () => {
    if (profile?.id) {
      navigate(`/messages?userId=${profile.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <Skeleton className="w-24 h-24 rounded-full mb-4" />
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Failed to load profile: {error}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Profile not found</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 
                   profile.username?.charAt(0)?.toUpperCase() || 
                   user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <h1 className="hero-title text-2xl mb-1">
                  {profile.full_name || profile.username || "Anonymous User"}
                </h1>
                {profile.username && (
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>
                )}
                
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {format(new Date(profile.created_at), "MMMM yyyy")}
                  </span>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="w-fit">
                      <Users className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{profile.rating?.toFixed(1) || "0.0"}</span>
                  <span className="text-muted-foreground">({profile.total_exchanges} exchanges)</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio || "No bio available"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{items.length}</div>
                  <div className="text-xs text-muted-foreground">Total Items</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{profile.total_exchanges}</div>
                  <div className="text-xs text-muted-foreground">Exchanges</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{profile.rating?.toFixed(1) || "0.0"}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{profile.response_time_hours}h</div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                </div>
              </div>

              <div className="flex gap-3">
                {isOwnProfile ? (
                  <ProfileEditDialog />
                ) : (
                  <>
                    <Button onClick={handleMessageClick}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Propose Exchange
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {items.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No items listed yet</p>
                  {isOwnProfile && (
                    <Button asChild className="mt-4">
                      <Link to="/list-item">List Your First Item</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                    <Link to={`/item/${item.id}`} className="block">
                      <CardContent className="p-4">
                        <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted relative">
                          {item.images.length > 0 ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <Badge 
                            className="absolute top-2 right-2" 
                            variant={item.status === 'available' ? 'default' : 
                                    item.status === 'exchanged' ? 'secondary' : 'outline'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.category?.name || "Uncategorized"}
                        </p>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.views_count} views
                          </span>
                          <span>{format(new Date(item.created_at), "MMM d")}</span>
                        </div>
                      </CardContent>
                    </Link>
                    {isOwnProfile && (
                      <div className="p-4 pt-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Item
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No favorite items yet</p>
                  {isOwnProfile && (
                    <Button asChild className="mt-4">
                      <Link to="/browse">Browse Items</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                    <Link to={`/item/${item.id}`} className="block">
                      <CardContent className="p-4">
                        <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted relative">
                          {item.images.length > 0 ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <Badge 
                            className="absolute top-2 right-2" 
                            variant={item.status === 'available' ? 'default' : 
                                    item.status === 'exchanged' ? 'secondary' : 'outline'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.category?.name || "Uncategorized"}
                        </p>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.views_count} views
                          </span>
                          <span>{format(new Date(item.created_at), "MMM d")}</span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>
                  Reviews from completed exchanges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No reviews yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="flex gap-4 p-4 bg-muted rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.otherUser?.avatar_url || ""} />
                          <AvatarFallback>
                            {review.otherUser?.full_name?.charAt(0)?.toUpperCase() || 
                             review.otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/profile/${review.otherUser?.id}`}
                                className="font-medium hover:underline"
                              >
                                {review.otherUser?.full_name || review.otherUser?.username || "Anonymous"}
                              </Link>
                              <Badge variant={review.type === 'received' ? 'default' : 'secondary'}>
                                {review.type === 'received' ? 'Received' : 'Given'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          {review.exchangeItem && (
                            <p className="text-xs text-muted-foreground mb-1">
                              Exchange: {review.exchangeItem}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {review.comment || "No comment provided"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest exchanges and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {activity.length === 0 && exchangedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Exchanged Items Section */}
                    {exchangedItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <ArrowUpDown className="w-4 h-4" />
                          Successfully Exchanged Items
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {exchangedItems.map((item) => (
                            <div key={item.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
                                {item.images.length > 0 ? (
                                  <img 
                                    src={item.images[0]} 
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.category?.name || "Uncategorized"}</p>
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Exchanged
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activity Timeline */}
                    {activity.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Recent Activity
                        </h3>
                        <div className="space-y-3">
                          {activity.map((activityItem) => (
                            <div key={activityItem.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              {activityItem.type === 'item_listed' && (
                                <Package className="w-5 h-5 text-primary flex-shrink-0" />
                              )}
                              {activityItem.type === 'exchange_completed' && (
                                <ArrowUpDown className="w-5 h-5 text-green-500 flex-shrink-0" />
                              )}
                              {activityItem.type === 'exchange_requested' && (
                                <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{activityItem.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{activityItem.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(activityItem.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;