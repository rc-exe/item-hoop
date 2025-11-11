import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Upload, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const categories = [
  "Electronics",
  "Books & Media",
  "Fashion & Accessories", 
  "Home & Garden",
  "Sports & Outdoors",
  "Musical Instruments",
  "Art & Crafts",
  "Toys & Games",
  "Tools & Equipment",
  "Other"
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  location: z.string().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  lookingFor: z.string().min(1, "Please specify what you're looking for").max(500, "Must be less than 500 characters")
});

const ListItem = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      condition: "",
      location: "",
      lookingFor: ""
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Auto-fill canvas while maintaining aspect ratio
          const maxWidth = 1920;
          const maxHeight = 1920;
          let width = img.width;
          let height = img.height;

          // Calculate scaling to fit within max dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image to fill canvas without cropping
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 5 images per item.",
        variant: "destructive"
      });
      return;
    }

    // Compress images
    const compressedFiles = await Promise.all(
      files.map(file => compressImage(file))
    );

    setSelectedImages(prev => [...prev, ...compressedFiles]);
    
    // Create previews
    compressedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getUserLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use Nominatim reverse geocoding API (free, no API key required)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const data = await response.json();
            
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const state = data.address?.state || '';
            const country = data.address?.country || '';
            
            const location = [city, state, country].filter(Boolean).join(', ');
            form.setValue('location', location);
            
            toast({
              title: "Location detected",
              description: `Set to: ${location}`,
            });
          } catch (error) {
            console.error('Error getting location name:', error);
            toast({
              title: "Error",
              description: "Failed to get location name",
              variant: "destructive",
            });
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location error",
            description: "Please allow location access or enter manually",
            variant: "destructive",
          });
          setIsGettingLocation(false);
        }
      );
    } else {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsGettingLocation(false);
    }
  };

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to list an item.",
        variant: "destructive"
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your item.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Upload images to storage
      const imageUrls: string[] = [];
      for (const image of selectedImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('item-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }

      // Insert item into database
      const { error: insertError } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          category_id: null,
          condition: data.condition,
          location: data.location || null,
          images: imageUrls,
          status: 'available'
        });

      if (insertError) throw insertError;

      toast({
        title: "Item listed successfully!",
        description: "Your item has been added to the marketplace.",
      });
      
      // Reset form
      form.reset();
      setSelectedImages([]);
      setImagePreviews([]);
      
      // Navigate to dashboard or browse
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error listing item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to list item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">List New Item</h1>
          <p className="text-muted-foreground">Add an item you'd like to exchange</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Provide detailed information about your item to attract potential traders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Images Upload */}
                <div className="space-y-4">
                  <Label>Images (up to 5)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </label>
                  </div>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Vintage Canon Camera" {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your item a clear, descriptive title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like_new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your item in detail - condition, age, any issues, etc."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include important details that would help someone decide if they want to trade
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="flex-1 relative">
                            <Input 
                              placeholder="e.g. New York, NY" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                searchLocation(e.target.value);
                              }}
                              onBlur={() => {
                                setTimeout(() => setShowLocationSuggestions(false), 200);
                              }}
                            />
                            {showLocationSuggestions && locationSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                {locationSuggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                                    onClick={() => {
                                      form.setValue('location', suggestion.display_name);
                                      setShowLocationSuggestions(false);
                                    }}
                                  >
                                    {suggestion.display_name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getUserLocation}
                          disabled={isGettingLocation}
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        Help others know where the item is located. Click the pin icon to auto-detect.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lookingFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are you looking for?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Art supplies, musical instruments, books about photography..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Let others know what kind of items you'd be interested in trading for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="flex-1" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'List Item'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ListItem;