import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, Clock, Filter, SlidersHorizontal } from "lucide-react";
import cameraImage from "@/assets/sample-camera.jpg";
import booksImage from "@/assets/sample-books.jpg";
import guitarImage from "@/assets/sample-guitar.jpg";

const mockItems = [
  {
    id: 1,
    title: "Vintage Canon Camera",
    description: "Beautiful vintage camera in excellent condition. Perfect for photography enthusiasts.",
    image: cameraImage,
    category: "Electronics",
    location: "San Francisco, CA",
    timeAgo: "2 hours ago",
    wantedItems: ["Laptop", "Books"],
    user: { name: "Sarah M.", rating: 4.9, exchanges: 23 }
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
    user: { name: "Mike R.", rating: 4.8, exchanges: 41 }
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
    user: { name: "Alex K.", rating: 5.0, exchanges: 15 }
  },
  // Duplicate items for demonstration
  {
    id: 4,
    title: "Professional DSLR Camera",
    description: "High-end DSLR camera with multiple lenses. Perfect for professional photography.",
    image: cameraImage,
    category: "Electronics",
    location: "Los Angeles, CA",
    timeAgo: "3 hours ago",
    wantedItems: ["Bicycle", "Art Supplies"],
    user: { name: "John D.", rating: 4.7, exchanges: 32 }
  },
  {
    id: 5,
    title: "Programming Books Set",
    description: "Complete set of programming and computer science books. Great for students.",
    image: booksImage,
    category: "Books",
    location: "Boston, MA",
    timeAgo: "6 hours ago",
    wantedItems: ["Laptop", "Monitor"],
    user: { name: "Emma L.", rating: 4.9, exchanges: 18 }
  },
  {
    id: 6,
    title: "Electric Guitar",
    description: "Fender electric guitar with amplifier. Excellent sound quality.",
    image: guitarImage,
    category: "Music",
    location: "Nashville, TN",
    timeAgo: "2 days ago",
    wantedItems: ["Recording Equipment", "Books"],
    user: { name: "David W.", rating: 4.8, exchanges: 26 }
  }
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = mockItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || 
                             item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    // Sort items
    switch (sortBy) {
      case "oldest":
        return filtered.reverse();
      case "distance":
        // In real app, would sort by actual distance
        return filtered;
      case "popular":
        return filtered.sort((a, b) => b.user.exchanges - a.user.exchanges);
      default:
        return filtered;
    }
  }, [searchTerm, selectedCategory, selectedLocation, sortBy]);

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
              Showing {mockItems.length} items
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-card-hover transition-all duration-300 overflow-hidden border-border/50">
              <CardHeader className="p-0 relative">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  {item.category}
                </Badge>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors cursor-pointer">
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
                <Button className="w-full" variant="default" asChild>
                  <Link to={`/item/${item.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

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