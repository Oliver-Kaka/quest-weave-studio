import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FloatingChatButton from "@/components/FloatingChatButton";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_type: string;
  file_url: string;
  created_at: string;
  unit_id: string;
  units: {
    unit_name: string;
    unit_code: string;
    course_id: string;
    courses: {
      course_name: string;
      course_code: string;
      year: number;
    };
  };
}

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  year: number;
}

interface Unit {
  id: string;
  unit_name: string;
  unit_code: string;
  course_id: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("year", { ascending: true });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch all units
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*");

      if (unitsError) throw unitsError;
      setUnits(unitsData || []);

      // Fetch approved resources with related data
      const { data: resourcesData, error: resourcesError } = await supabase
        .from("resources")
        .select(`
          *,
          units!inner (
            unit_name,
            unit_code,
            course_id,
            courses!inner (
              course_name,
              course_code,
              year
            )
          )
        `)
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });

      if (resourcesError) throw resourcesError;
      setResources(resourcesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const courseMatch = selectedCourse === "all" || resource.units.course_id === selectedCourse;
    const unitMatch = selectedUnit === "all" || resource.unit_id === selectedUnit;
    const yearMatch = selectedYear === "all" || resource.units.courses.year.toString() === selectedYear;
    const typeMatch = selectedType === "all" || resource.file_type === selectedType;

    return courseMatch && unitMatch && yearMatch && typeMatch;
  });

  const uniqueYears = Array.from(new Set(courses.map(c => c.year))).sort();
  const uniqueTypes = Array.from(new Set(resources.map(r => r.file_type)));
  const filteredUnits = selectedCourse === "all" 
    ? units 
    : units.filter(u => u.course_id === selectedCourse);

  const clearFilters = () => {
    setSelectedCourse("all");
    setSelectedUnit("all");
    setSelectedYear("all");
    setSelectedType("all");
  };

  const handleDownload = (url: string, title: string) => {
    window.open(url, '_blank');
    toast({
      title: "Download Started",
      description: `Downloading ${title}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Study Resources
            </h1>
            <p className="text-muted-foreground">
              Browse and download approved study materials
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                Filter resources by course, unit, year, or type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Course</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.course_code} - {course.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Unit</label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {filteredUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unit_code} - {unit.unit_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {uniqueYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="past_papers">Past Papers</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      {uniqueTypes
                        .filter(type => !['notes', 'past_papers', 'other'].includes(type))
                        .map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredResources.length} resource(s)
              </p>
            </div>

            {filteredResources.length === 0 ? (
              <Card className="animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    No resources found
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Try adjusting your filters or check back later for new materials
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card 
                    key={resource.id} 
                    className="card-hover animate-fade-in-up cursor-pointer group"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                            {resource.title}
                          </CardTitle>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              {resource.units.courses.course_code} - {resource.units.courses.course_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {resource.units.unit_code} - {resource.units.unit_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Year {resource.units.courses.year}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                            {resource.file_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <Button
                        onClick={() => handleDownload(resource.file_url, resource.title)}
                        className="w-full"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <FloatingChatButton />
    </div>
  );
};

export default Resources;
