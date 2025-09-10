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

const categories = [
  { name: "Books", icon: BookOpen, count: "2,341", color: "text-blue-600" },
  { name: "Electronics", icon: Camera, count: "1,856", color: "text-purple-600" },
  { name: "Gaming", icon: Gamepad2, count: "987", color: "text-green-600" },
  { name: "Clothing", icon: Shirt, count: "3,241", color: "text-pink-600" },
  { name: "Home & Garden", icon: Home, count: "1,432", color: "text-orange-600" },
  { name: "Music", icon: Music, count: "654", color: "text-red-600" },
  { name: "Computers", icon: Laptop, count: "1,234", color: "text-indigo-600" },
  { name: "Sports", icon: Dumbbell, count: "876", color: "text-teal-600" },
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover thousands of items available for exchange across popular categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Card 
              key={category.name} 
              className="group hover:shadow-card-hover transition-all duration-200 cursor-pointer border-border/50"
              onClick={() => window.location.href = `/browse?category=${category.name.toLowerCase()}`}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <category.icon className={`w-8 h-8 mx-auto ${category.color} group-hover:scale-110 transition-transform duration-200`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} items</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;