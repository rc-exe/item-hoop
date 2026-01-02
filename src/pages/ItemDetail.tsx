import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Heart, Share2, Flag, Star, Calendar, Eye, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Item {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  condition: string | null;
  images: string[];
  user_id: string;
  created_at: string;
  views_count: number;
  categories: { name: string } | null;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    rating: number;
    total_exchanges: number;
    created_at: string;
  };
}

interface UserItem {
  id: string;
  title: string;
  images: string[];
}

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [item, setItem] = useState<Item | null>(null);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExchangeDialogOpen, setIsExchangeDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [pendingExchanges, setPendingExchanges] = useState<any[]>([]);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  useEffect(() => {
    fetchItemDetails();
    if (user) {
      fetchUserItems();
      checkFavoriteStatus();
      fetchPendingExchanges();
    }
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) return;

    // Real-time updates for favorites
    const favoritesChannel = supabase
      .channel('item-detail-favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          checkFavoriteStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(favoritesChannel);
    };
  }, [user, id]);

  const fetchItemDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch item details with owner profile and category
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select(`
          *,
          categories (name),
          profiles (username, full_name, avatar_url, rating, total_exchanges, created_at)
        `)
        .eq('id', id)
        .single();

      if (itemError) throw itemError;

      setItem(itemData);

      // Increment view count
      await supabase
        .from('items')
        .update({ views_count: (itemData.views_count || 0) + 1 })
        .eq('id', id);

      // Fetch related items from the same owner
      const { data: related } = await supabase
        .from('items')
        .select(`
          *,
          categories (name),
          profiles (username, full_name, avatar_url, rating, total_exchanges, created_at)
        `)
        .eq('user_id', itemData.user_id)
        .neq('id', id)
        .eq('status', 'available')
        .limit(3);

      if (related) {
        setRelatedItems(related);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      toast({
        title: "Error",
        description: "Failed to load item details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('items')
      .select('id, title, images')
      .eq('user_id', user.id)
      .eq('status', 'available');

    if (data) {
      setUserItems(data);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', id)
      .maybeSingle();

    if (!error) {
      setIsFavorited(!!data);
    }
  };

  const fetchPendingExchanges = async () => {
    if (!user || !id) return;

    const { data, error } = await supabase
      .from('exchanges')
      .select(`
        id,
        status,
        requester_id,
        owner_id,
        created_at,
        requester:profiles!exchanges_requester_id_fkey(username, full_name),
        owner:profiles!exchanges_owner_id_fkey(username, full_name)
      `)
      .eq('owner_item_id', id)
      .eq('status', 'pending');

    if (!error && data) {
      setPendingExchanges(data);
      // Check if the current user already has a pending request for this item
      const userHasRequest = data.some(exchange => exchange.requester_id === user.id);
      setHasExistingRequest(userHasRequest);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to favorite items",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id);

        if (error) throw error;

        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, item_id: id });

        if (error) throw error;

        toast({
          title: "Added to favorites",
          description: "Item added to your favorites",
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const handleExchangeRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to request an exchange",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!item) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-exchange-request', {
        body: {
          owner_item_id: item.id,
          requester_item_id: selectedItemId || null,
          message: message || null,
        }
      });

      if (error) throw error;

      toast({
        title: "Exchange request sent!",
        description: `${item.profiles.username || item.profiles.full_name} will be notified of your interest.`,
      });

      setHasExistingRequest(true);
      setIsExchangeDialogOpen(false);
      setSelectedItemId("");
      setMessage("");
    } catch (error: any) {
      console.error('Error creating exchange request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send exchange request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Button onClick={() => navigate('/browse')}>Browse Items</Button>
        </main>
      </div>
    );
  }

  const ownerName = item.profiles.username || item.profiles.full_name || "User";
  const ownerInitials = ownerName ? ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "U";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[currentImageIndex]} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{item.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {item.views_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleFavorite}>
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {item.categories && <Badge variant="secondary">{item.categories.name}</Badge>}
                {item.condition && <Badge variant="outline" className="capitalize">{item.condition.replace('_', ' ')}</Badge>}
              </div>
            </div>

            {/* Owner Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={item.profiles.avatar_url || undefined} />
                    <AvatarFallback>{ownerInitials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold cursor-pointer hover:text-primary" onClick={() => navigate(`/profile/${item.user_id}`)}>
                      {ownerName}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {Number(item.profiles.rating || 0).toFixed(1)}
                      </span>
                      <span>{item.profiles.total_exchanges || 0} exchanges</span>
                      <span>Joined {new Date(item.profiles.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/profile/${item.user_id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exchange Actions */}
            {user?.id !== item.user_id && (
              <div className="space-y-3">
                {hasExistingRequest ? (
                  <Button className="w-full" size="lg" disabled variant="secondary">
                    <ArrowUpDown className="w-5 h-5 mr-2" />
                    Exchange Request Sent
                  </Button>
                ) : (
                <Dialog open={isExchangeDialogOpen} onOpenChange={setIsExchangeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <ArrowUpDown className="w-5 h-5 mr-2" />
                      Request Exchange
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Exchange</DialogTitle>
                      <DialogDescription>
                        Send an exchange request for "{item.title}"
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-offer">Offer Your Item (Optional)</Label>
                        <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                          <SelectTrigger id="item-offer">
                            <SelectValue placeholder="Select an item to offer" />
                          </SelectTrigger>
                          <SelectContent>
                            {userItems.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                You have no items to offer
                              </div>
                            ) : (
                              userItems.map((userItem) => (
                                <SelectItem key={userItem.id} value={userItem.id}>
                                  {userItem.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          You can also request without offering a specific item
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell the owner why you're interested..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsExchangeDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleExchangeRequest}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Send Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {/* Pending Exchanges for Owner */}
            {user?.id === item.user_id && pendingExchanges.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Pending Exchange Requests ({pendingExchanges.length})</h3>
                <div className="space-y-2">
                  {pendingExchanges.map((exchange) => (
                    <Card key={exchange.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate(`/profile/${exchange.requester_id}`)}>
                            <AvatarFallback>
                              {(exchange.requester.username || exchange.requester.full_name || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p 
                              className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                              onClick={() => navigate(`/profile/${exchange.requester_id}`)}
                            >
                              {exchange.requester.username || exchange.requester.full_name || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(exchange.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/dashboard?tab=exchanges')}
                        >
                          View Request
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Other items from {ownerName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedItems.map((relatedItem) => (
                <Card 
                  key={relatedItem.id} 
                  className="group hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/item/${relatedItem.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted">
                      {relatedItem.images && relatedItem.images.length > 0 ? (
                        <img 
                          src={relatedItem.images[0]} 
                          alt={relatedItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{relatedItem.title}</h3>
                    {relatedItem.categories && (
                      <p className="text-sm text-muted-foreground">{relatedItem.categories.name}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ItemDetail;