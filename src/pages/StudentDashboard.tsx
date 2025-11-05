import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, FileSpreadsheet, Presentation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const StudentDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Fetch all units
  const { data: units } = useQuery({
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

  // Fetch user's uploaded resources
  const { data: myResources, refetch } = useQuery({
    queryKey: ["my-resources", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("resources")
        .select("*, units(unit_code, unit_name)")
        .eq("uploaded_by", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedUnit || !user) return;

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("study-resources")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("study-resources")
        .getPublicUrl(fileName);

      // Create resource record
      const { error: insertError } = await supabase
        .from("resources")
        .insert({
          unit_id: selectedUnit,
          uploaded_by: user.id,
          title,
          description,
          file_type: file.type,
          file_url: publicUrl,
          file_size: file.size,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Your resource has been uploaded and is pending approval.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedUnit("");
      setFile(null);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf") || fileType.includes("document")) return <FileText className="w-4 h-4" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return <FileSpreadsheet className="w-4 h-4" />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return <Presentation className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-4xl mb-8">Student Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Study Resource
              </CardTitle>
              <CardDescription>Share notes, presentations, or study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Week 5 Lecture Notes"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unit_code} - {unit.unit_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the resource"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted: PDF, Word, PowerPoint, Excel
                  </p>
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? "Uploading..." : "Upload Resource"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>My Uploads</CardTitle>
              <CardDescription>Track your submitted resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myResources?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No uploads yet. Upload your first resource!
                  </p>
                ) : (
                  myResources?.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-3 border rounded-lg space-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(resource.file_type)}
                          <h4 className="font-medium">{resource.title}</h4>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            resource.approval_status === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : resource.approval_status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {resource.approval_status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {resource.units?.unit_code} - {resource.units?.unit_name}
                      </p>
                      {resource.approval_notes && (
                        <p className="text-xs text-muted-foreground italic">
                          Note: {resource.approval_notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
