import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Filter, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  location: string | null;
  created_at: string;
  categories: { name: string; icon: string | null } | null;
  profiles: { username: string | null; full_name: string | null; avatar_url: string | null; rating: number; total_exchanges: number } | null;
}

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
    if (user) {
      fetchFavorites();
    }

    // Real-time updates for items
    const itemsChannel = supabase
      .channel('browse-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    // Real-time updates for favorites
    const favoritesChannel = supabase
      .channel('browse-favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          if (user) fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(favoritesChannel);
    };
  }, [user]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          images,
          location,
          created_at,
          categories:category_id (
            name,
            icon
          ),
          profiles:user_id (
            username,
            full_name,
            avatar_url,
            rating,
            total_exchanges
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.item_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (itemId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to favorite items",
        variant: "destructive",
      });
      return;
    }

    const isFavorited = favorites.has(itemId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;

        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, item_id: itemId });

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

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesCategory = selectedCategory === "all" || 
                             item.categories?.name.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    // Sort items
    switch (sortBy) {
      case "oldest":
        return [...filtered].reverse();
      case "distance":
        // In real app, would sort by actual distance
        return filtered;
      case "popular":
        return [...filtered].sort((a, b) => (b.profiles?.total_exchanges || 0) - (a.profiles?.total_exchanges || 0));
      default:
        return filtered;
    }
  }, [items, searchTerm, selectedCategory, selectedLocation, sortBy]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="hero-title text-3xl lg:text-4xl text-foreground mb-4">
            Browse Items
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover amazing items available for exchange in your area
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input 
              placeholder="Search for items..." 
              className="lg:max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="computers">Computers</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="sf">San Francisco, CA</SelectItem>
                <SelectItem value="austin">Austin, TX</SelectItem>
                <SelectItem value="seattle">Seattle, WA</SelectItem>
                <SelectItem value="boston">Boston, MA</SelectItem>
                <SelectItem value="la">Los Angeles, CA</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="lg:w-auto">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredItems.length} items
            </p>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden border-border/50">
                <CardHeader className="p-0 relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.images[0] || '/placeholder.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {item.categories && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      {item.categories.name}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors cursor-pointer">
                      {item.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {item.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.location || 'Location not specified'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-sm">
                        <span className="font-medium">{item.profiles?.full_name || item.profiles?.username || 'Anonymous'}</span>
                        <span className="text-muted-foreground ml-2">
                          ⭐ {item.profiles?.rating || 0} ({item.profiles?.total_exchanges || 0} exchanges)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button className="w-full" variant="default" asChild>
                    <Link to={`/item/${item.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="default">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;