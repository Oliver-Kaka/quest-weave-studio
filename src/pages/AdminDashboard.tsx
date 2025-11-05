import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, BookOpen, GraduationCap, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Course form state
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  // Unit form state
  const [unitCode, setUnitCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitDescription, setUnitDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Fetch courses
  const { data: courses, refetch: refetchCourses } = useQuery({
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

  // Fetch units
  const { data: units, refetch: refetchUnits } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*, courses(course_name)")
        .order("unit_code");
      if (error) throw error;
      return data;
    },
  });

  // Fetch pending resources with uploader info
  const { data: pendingResources, refetch: refetchResources } = useQuery({
    queryKey: ["pending-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*, units(unit_code, unit_name)")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Fetch uploader profiles separately
      const resourcesWithProfiles = await Promise.all(
        (data || []).map(async (resource) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", resource.uploaded_by)
            .single();
          return { ...resource, uploader: profile };
        })
      );
      
      return resourcesWithProfiles;
    },
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("courses").insert({
        course_code: courseCode,
        course_name: courseName,
        year: parseInt(courseYear),
        description: courseDescription,
      });

      if (error) throw error;

      toast({ title: "Success!", description: "Course added successfully." });
      setCourseCode("");
      setCourseName("");
      setCourseYear("");
      setCourseDescription("");
      refetchCourses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("units").insert({
        course_id: selectedCourse,
        unit_code: unitCode,
        unit_name: unitName,
        description: unitDescription,
      });

      if (error) throw error;

      toast({ title: "Success!", description: "Unit added successfully." });
      setUnitCode("");
      setUnitName("");
      setUnitDescription("");
      setSelectedCourse("");
      refetchUnits();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This will also delete all associated units.")) return;
    
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success!", description: "Course deleted." });
      refetchCourses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    
    try {
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success!", description: "Unit deleted." });
      refetchUnits();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleApproveResource = async (id: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from("resources")
        .update({
          approval_status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_notes: notes,
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success!", description: "Resource approved." });
      refetchResources();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleRejectResource = async (id: string, notes: string) => {
    if (!notes) {
      toast({ variant: "destructive", title: "Error", description: "Please provide a reason for rejection." });
      return;
    }

    try {
      const { error } = await supabase
        .from("resources")
        .update({
          approval_status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_notes: notes,
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Resource rejected", description: "Student will be notified." });
      refetchResources();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="font-heading text-4xl">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals ({pendingResources?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Manage Courses
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Manage Units
            </TabsTrigger>
          </TabsList>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            {pendingResources?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending approvals
                </CardContent>
              </Card>
            ) : (
              pendingResources?.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>
                      Uploaded by: {resource.uploader?.first_name} {resource.uploader?.last_name} • 
                      Unit: {resource.units?.unit_code} - {resource.units?.unit_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resource.description && (
                      <p className="text-sm">{resource.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveResource(resource.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const notes = prompt("Reason for rejection:");
                          if (notes) handleRejectResource(resource.id, notes);
                        }}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(resource.file_url, "_blank")}
                      >
                        View File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCourse} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-code">Course Code</Label>
                      <Input
                        id="course-code"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="e.g., CS101"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-name">Course Name</Label>
                      <Input
                        id="course-name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-year">Year</Label>
                      <Input
                        id="course-year"
                        type="number"
                        value={courseYear}
                        onChange={(e) => setCourseYear(e.target.value)}
                        placeholder="e.g., 2024"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-description">Description</Label>
                      <Textarea
                        id="course-description"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        placeholder="Course description..."
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Course</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {courses?.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{course.course_code}</p>
                          <p className="text-sm text-muted-foreground">{course.course_name}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Units Tab */}
          <TabsContent value="units">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Unit</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddUnit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit-course">Course</Label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.course_code} - {course.course_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-code">Unit Code</Label>
                      <Input
                        id="unit-code"
                        value={unitCode}
                        onChange={(e) => setUnitCode(e.target.value)}
                        placeholder="e.g., CS101A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-name">Unit Name</Label>
                      <Input
                        id="unit-name"
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                        placeholder="e.g., Introduction to Programming"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-description">Description</Label>
                      <Textarea
                        id="unit-description"
                        value={unitDescription}
                        onChange={(e) => setUnitDescription(e.target.value)}
                        placeholder="Unit description..."
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Unit</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Units</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {units?.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{unit.unit_code}</p>
                          <p className="text-sm text-muted-foreground">{unit.unit_name}</p>
                          <p className="text-xs text-muted-foreground">{unit.courses?.course_name}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUnit(unit.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
