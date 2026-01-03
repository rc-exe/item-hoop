import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ArrowRight, Star } from "lucide-react";
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

    const channel = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchFeaturedItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Latest Items
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover recently listed items from our community
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl shimmer" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <FadeInUp className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Latest Items
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover recently listed items from our community
          </p>
        </FadeInUp>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No items available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <FadeInUp key={item.id} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card 
                    className="glass-card-hover overflow-hidden border-0 bg-card/60 h-full cursor-pointer group"
                    onClick={() => navigate(`/item/${item.id}`)}
                  >
                    <CardHeader className="p-0 relative">
                      <div className="aspect-[4/3] overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.5 }}
                          src={item.images?.[0] || '/placeholder.svg'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {item.categories && (
                        <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-foreground border-0 font-medium">
                          {item.categories.name}
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {item.description || "No description available"}
                        </p>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[120px]">{item.location || "Not specified"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                              {item.profiles?.username?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.profiles?.username || "Anonymous"}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {item.profiles?.rating?.toFixed(1) || "0.0"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <Button 
                        className="w-full rounded-xl font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/item/${item.id}`);
                        }}
                      >
                        Request Exchange
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </FadeInUp>
            ))}
          </div>
        )}

        <FadeInUp delay={0.4} className="text-center mt-12">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="lg" 
              className="font-semibold rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => navigate('/browse')}
            >
              View All Items
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default FeaturedItems;
