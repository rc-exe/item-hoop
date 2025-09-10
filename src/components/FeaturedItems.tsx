import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock } from "lucide-react";
import { FadeInUp } from "./ScrollAnimations";
import { motion } from "framer-motion";
import cameraImage from "@/assets/sample-camera.jpg";
import booksImage from "@/assets/sample-books.jpg";
import guitarImage from "@/assets/sample-guitar.jpg";

const featuredItems = [
  {
    id: 1,
    title: "Vintage Canon Camera",
    description: "Beautiful vintage camera in excellent condition. Perfect for photography enthusiasts.",
    image: cameraImage,
    category: "Electronics",
    location: "San Francisco, CA",
    timeAgo: "2 hours ago",
    wantedItems: ["Laptop", "Books"],
    user: {
      name: "Sarah M.",
      rating: 4.9,
      exchanges: 23
    }
  },
  {
    id: 2,
    title: "Classic Book Collection",
    description: "Collection of 15 classic literature books. Great condition, perfect for book lovers.",
    image: booksImage,
    category: "Books",
    location: "Austin, TX",
    timeAgo: "5 hours ago",
    wantedItems: ["Guitar", "Art Supplies"],
    user: {
      name: "Mike R.",
      rating: 4.8,
      exchanges: 41
    }
  },
  {
    id: 3,
    title: "Acoustic Guitar",
    description: "Yamaha acoustic guitar, barely used. Comes with case and picks.",
    image: guitarImage,
    category: "Music",
    location: "Seattle, WA",
    timeAgo: "1 day ago",
    wantedItems: ["Camera", "Skateboard"],
    user: {
      name: "Alex K.",
      rating: 5.0,
      exchanges: 15
    }
  }
];

const FeaturedItems = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <FadeInUp className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Featured Items
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sans">
            Check out these amazing items available for exchange right now
          </p>
        </FadeInUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item, index) => (
            <FadeInUp key={item.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden border-border/50 h-full">
              <CardHeader className="p-0 relative">
                <div className="aspect-square overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </motion.div>
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  {item.category}
                </Badge>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.timeAgo}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Looking for:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.wantedItems.map((wanted) => (
                        <Badge key={wanted} variant="secondary" className="text-xs">
                          {wanted}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-sm">
                      <span className="font-medium">{item.user.name}</span>
                      <span className="text-muted-foreground ml-2">
                        ⭐ {item.user.rating} ({item.user.exchanges} exchanges)
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
                  <Button className="w-full font-medium" variant="default">
                    Request Exchange
                  </Button>
                </motion.div>
              </CardFooter>
                </Card>
              </motion.div>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={0.3} className="text-center mt-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="lg" className="font-medium">
              View All Items
            </Button>
          </motion.div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default FeaturedItems;