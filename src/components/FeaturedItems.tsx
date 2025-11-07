import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { FadeInUp } from "./ScrollAnimations";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Item {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  location: string | null;
  created_at: string;
  status: string;
  profiles: {
    username: string | null;
    rating: number | null;
    total_exchanges: number;
  };
  categories: {
    name: string;
  } | null;
}

const FeaturedItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFeaturedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles(username, rating, total_exchanges),
          categories(name)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedItems();

    // Set up real-time subscription
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        () => {
          fetchFeaturedItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading featured items...</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <FadeInUp className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Latest Items
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
            Discover recently listed items from our community
          </p>
        </FadeInUp>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured items available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <FadeInUp key={item.id} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card 
                    className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden border-border/50 h-full cursor-pointer"
                    onClick={() => navigate(`/item/${item.id}`)}
                  >
                    <CardHeader className="p-0 relative">
                      <div className="aspect-square overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          src={item.images?.[0] || '/placeholder.svg'}
                          alt={item.title}
                          className="w-full h-full object-cover"
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
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {item.description || "No description available"}
                        </p>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {item.location || "Location not specified"}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="text-sm">
                            <span className="font-medium">{item.profiles?.username || "Anonymous"}</span>
                            <span className="text-muted-foreground ml-2">
                              ⭐ {item.profiles?.rating?.toFixed(1) || "0.0"} ({item.profiles?.total_exchanges || 0} exchanges)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Button 
                          className="w-full font-medium" 
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/item/${item.id}`);
                          }}
                        >
                          Request Exchange
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              </FadeInUp>
            ))}
          </div>
        )}

        <FadeInUp delay={0.3} className="text-center mt-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="font-medium"
              onClick={() => navigate('/browse')}
            >
              View All Items
            </Button>
          </motion.div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default FeaturedItems;