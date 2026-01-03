import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Camera, 
  Gamepad2, 
  Shirt, 
  Home, 
  Music,
  Laptop,
  Dumbbell,
  ArrowRight
} from "lucide-react";
import { FadeInUp } from "./ScrollAnimations";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  "Books": BookOpen,
  "Electronics": Camera,
  "Gaming": Gamepad2,
  "Clothing": Shirt,
  "Home & Garden": Home,
  "Music": Music,
  "Computers": Laptop,
  "Sports": Dumbbell,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  "Books": { bg: "bg-blue-500/10", text: "text-blue-500" },
  "Electronics": { bg: "bg-purple-500/10", text: "text-purple-500" },
  "Gaming": { bg: "bg-green-500/10", text: "text-green-500" },
  "Clothing": { bg: "bg-pink-500/10", text: "text-pink-500" },
  "Home & Garden": { bg: "bg-orange-500/10", text: "text-orange-500" },
  "Music": { bg: "bg-red-500/10", text: "text-red-500" },
  "Computers": { bg: "bg-indigo-500/10", text: "text-indigo-500" },
  "Sports": { bg: "bg-teal-500/10", text: "text-teal-500" },
};

interface CategoryWithCount {
  name: string;
  count: number;
  icon: any;
  colors: { bg: string; text: string };
}

const CategorySection = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();

    const channel = supabase
      .channel('category-items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;

      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'available');

          if (error) {
            console.error(`Error fetching count for ${category.name}:`, error);
            return null;
          }

          return {
            name: category.name,
            count: count || 0,
            icon: iconMap[category.name] || BookOpen,
            colors: colorMap[category.name] || { bg: "bg-muted", text: "text-muted-foreground" },
          };
        })
      );

      const validCategories = categoriesWithCounts
        .filter((cat): cat is CategoryWithCount => cat !== null);

      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 section-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover thousands of items available for exchange
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl shimmer" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 section-muted">
      <div className="container mx-auto px-4">
        <FadeInUp className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover thousands of items available for exchange across popular categories
          </p>
        </FadeInUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <FadeInUp key={category.name} delay={index * 0.08}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/browse?category=${category.name.toLowerCase()}`}
              >
                <Card className="glass-card-hover cursor-pointer h-full border-0 bg-card/60">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${category.colors.bg} mb-4`}
                    >
                      <category.icon className={`w-8 h-8 ${category.colors.text}`} />
                    </motion.div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} {category.count === 1 ? 'item' : 'items'}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={0.4} className="text-center mt-12">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="lg" 
              className="font-semibold rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => window.location.href = '/browse'}
            >
              View All Categories
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default CategorySection;
