import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const StudyPlan = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [studyPlan, setStudyPlan] = useState("");

  const handleGenerateStudyPlan = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ai", {
        body: {
          type: "study-plan",
          topic,
        },
      });

      if (error) throw error;
      setStudyPlan(data.result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate study plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGoogleCalendar = () => {
    const eventTitle = `Study: ${topic}`;
    const eventDetails = studyPlan;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle
    )}&details=${encodeURIComponent(eventDetails)}&dates=${startDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}/${endDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`;

    window.open(googleCalendarUrl, "_blank");
    
    toast({
      title: "Success",
      description: "Opening Google Calendar...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Study Plan Generator</h1>
            <p className="text-muted-foreground">
              Create personalized study plans and sync with Google Calendar
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generate Your Study Plan</CardTitle>
              <CardDescription>
                Enter a topic and let AI create a comprehensive study plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Study Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Advanced Calculus, World War II, Python Programming"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerateStudyPlan}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Study Plan...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Study Plan
                  </>
                )}
              </Button>

              {studyPlan && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">Your Study Plan</Label>
                    <Button
                      onClick={handleAddToGoogleCalendar}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Google Calendar
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{studyPlan}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Enter the topic you want to study in the input field above</li>
                <li>Click "Generate Study Plan" to create an AI-powered study plan</li>
                <li>Review the generated plan with timelines, resources, and milestones</li>
                <li>Click "Add to Google Calendar" to sync your study schedule</li>
                <li>Customize the calendar event in Google Calendar as needed</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudyPlan;
