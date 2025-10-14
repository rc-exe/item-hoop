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
  Dumbbell 
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

const colorMap: Record<string, string> = {
  "Books": "text-blue-600",
  "Electronics": "text-purple-600",
  "Gaming": "text-green-600",
  "Clothing": "text-pink-600",
  "Home & Garden": "text-orange-600",
  "Music": "text-red-600",
  "Computers": "text-indigo-600",
  "Sports": "text-teal-600",
};

interface CategoryWithCount {
  name: string;
  count: number;
  icon: any;
  color: string;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();

    // Real-time updates
    const channel = supabase
      .channel('category-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch categories with item counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;

      // Fetch item counts for each category
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
            color: colorMap[category.name] || "text-gray-600",
          };
        })
      );

      // Filter out null values and categories with 0 items
      const validCategories = categoriesWithCounts
        .filter((cat): cat is CategoryWithCount => cat !== null && cat.count > 0);

      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
              Discover thousands of items available for exchange across popular categories
            </p>
          </FadeInUp>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
              Discover items available for exchange across popular categories
            </p>
          </FadeInUp>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No items available yet</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <FadeInUp className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
            Discover thousands of items available for exchange across popular categories
          </p>
        </FadeInUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <FadeInUp key={category.name} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/browse?category=${category.name.toLowerCase()}`}
              >
                <Card className="group hover:shadow-card-hover transition-all duration-200 cursor-pointer border-border/50 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className="inline-block"
                      >
                        <category.icon className={`w-8 h-8 mx-auto ${category.color} group-hover:scale-110 transition-transform duration-200`} />
                      </motion.div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 font-sans">{category.name}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{category.count} {category.count === 1 ? 'item' : 'items'}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={0.3} className="text-center mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="lg" className="font-medium" onClick={() => window.location.href = '/browse'}>
              View All Categories
            </Button>
          </motion.div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default CategorySection;