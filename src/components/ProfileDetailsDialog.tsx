import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProfileDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDetailsDialog = ({ open, onOpenChange }: ProfileDetailsDialogProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [adminRequestReason, setAdminRequestReason] = useState("");
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchProfileData();
      checkExistingAdminRequest();
    }
  }, [open, user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_image")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data?.profile_image) {
        setProfileImageUrl(data.profile_image);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  };

  const checkExistingAdminRequest = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("admin_requests")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

      if (error) throw error;
      setHasExistingRequest(!!data);
    } catch (error: any) {
      console.error("Error checking admin request:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an image file",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Upload to a public URL (using a placeholder for now)
      // In production, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Update profile with image URL
        const { error } = await supabase
          .from("profiles")
          .update({ profile_image: base64String })
          .eq("id", user.id);

        if (error) throw error;

        setProfileImageUrl(base64String);
        toast({
          title: "Success",
          description: "Profile photo updated successfully",
        });
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRequestAdmin = async () => {
    if (!user || !adminRequestReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for your admin request",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("admin_requests")
        .insert({
          user_id: user.id,
          reason: adminRequestReason,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: "Your admin request has been sent for review",
      });
      setAdminRequestReason("");
      setHasExistingRequest(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
          <DialogDescription>
            Update your profile photo{!isAdmin && " and request admin access"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Photo Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarImage src={profileImageUrl} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <Label
                  htmlFor="profile-image"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Change Photo
                    </>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Max 2MB • JPG, PNG, or GIF
                </p>
              </div>
            </div>
          </div>

          {/* Admin Request Section */}
          {!isAdmin && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div>
                <Label htmlFor="admin-reason" className="text-sm font-semibold">Request Admin Access</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Need permissions to manage courses and approve resources?
                </p>
              </div>
              {hasExistingRequest ? (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    You have a pending admin request under review
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    id="admin-reason"
                    placeholder="Why do you need admin access? (e.g., 'I'm a TA for CS101')"
                    value={adminRequestReason}
                    onChange={(e) => setAdminRequestReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleRequestAdmin}
                    disabled={loading || !adminRequestReason.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Submit Admin Request
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailsDialog;
