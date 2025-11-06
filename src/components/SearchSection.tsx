import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch courses from the database
  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("course_code");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-16 bg-card">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold mb-3">
            Find Your Course
          </h2>
          <p className="text-muted-foreground">
            Search by unit code or browse by course and year
          </p>
        </div>

        <Tabs defaultValue="code" className="w-full animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="code" className="font-medium">
              Unit Code/Name
            </TabsTrigger>
            <TabsTrigger value="browse" className="font-medium">
              Browse by Course
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Enter unit code or unit name (e.g., CS101 or Introduction to Programming)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus-visible:ring-primary"
                />
              </div>
              <Button 
                size="lg" 
                className="px-8 bg-primary hover:bg-primary/90 font-semibold"
              >
                Search
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="browse" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-12 text-base border-2 focus:ring-primary">
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {courses && courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.course_code} - {course.course_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No courses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-12 text-base border-2 focus:ring-primary">
                  <SelectValue placeholder="Year of study" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 font-semibold"
            >
              Find Courses
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default SearchSection;
