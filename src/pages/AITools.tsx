import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Brain, Presentation, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const AITools = () => {
  const [loading, setLoading] = useState(false);
  
  // Quiz state
  const [quizNotes, setQuizNotes] = useState("");
  const [quizType, setQuizType] = useState("mixed");
  const [numQuestions, setNumQuestions] = useState("5");
  const [quizResult, setQuizResult] = useState<any>(null);
  
  // Summarization state
  const [summaryNotes, setSummaryNotes] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  
  // Presentation state
  const [presentationNotes, setPresentationNotes] = useState("");
  const [presentationResult, setPresentationResult] = useState<any>(null);
  
  // Flashcard state
  const [flashcardNotes, setFlashcardNotes] = useState("");
  const [flashcardResult, setFlashcardResult] = useState<any>(null);

  const handleGenerateQuiz = async () => {
    if (!quizNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter notes to generate a quiz",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ai", {
        body: {
          type: "quiz",
          notes: quizNotes,
          quizType,
          numQuestions: parseInt(numQuestions),
        },
      });

      if (error) throw error;
      
      try {
        const parsedResult = JSON.parse(data.result.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
        setQuizResult(parsedResult);
      } catch {
        setQuizResult(data.result);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!summaryNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter notes to summarize",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ai", {
        body: {
          type: "summarize",
          notes: summaryNotes,
        },
      });

      if (error) throw error;
      setSummaryResult(data.result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePresentation = async () => {
    if (!presentationNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter notes to create a presentation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ai", {
        body: {
          type: "presentation",
          notes: presentationNotes,
        },
      });

      if (error) throw error;
      
      try {
        const parsedResult = JSON.parse(data.result.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
        setPresentationResult(parsedResult);
      } catch {
        setPresentationResult(data.result);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate presentation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!flashcardNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter notes to generate flashcards",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ai", {
        body: {
          type: "flashcards",
          notes: flashcardNotes,
        },
      });

      if (error) throw error;
      
      try {
        const parsedResult = JSON.parse(data.result.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
        setFlashcardResult(parsedResult);
      } catch {
        setFlashcardResult(data.result);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate flashcards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Study Tools</h1>
            <p className="text-muted-foreground">
              Enhance your learning with AI-powered tools
            </p>
          </div>

          <Tabs defaultValue="quiz" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quiz">
                <Brain className="w-4 h-4 mr-2" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="summarize">
                <FileText className="w-4 h-4 mr-2" />
                Summarize
              </TabsTrigger>
              <TabsTrigger value="presentation">
                <Presentation className="w-4 h-4 mr-2" />
                Presentation
              </TabsTrigger>
              <TabsTrigger value="flashcards">
                <Layers className="w-4 h-4 mr-2" />
                Flashcards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quiz" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Generator</CardTitle>
                  <CardDescription>
                    Generate quizzes from your notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiz-notes">Your Notes</Label>
                    <Textarea
                      id="quiz-notes"
                      placeholder="Paste your notes here..."
                      value={quizNotes}
                      onChange={(e) => setQuizNotes(e.target.value)}
                      rows={8}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quiz Type</Label>
                      <RadioGroup value={quizType} onValueChange={setQuizType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mixed" id="mixed" />
                          <Label htmlFor="mixed">Mixed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiple-choice" id="multiple-choice" />
                          <Label htmlFor="multiple-choice">Multiple Choice</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true-false" id="true-false" />
                          <Label htmlFor="true-false">True/False</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiple-answer" id="multiple-answer" />
                          <Label htmlFor="multiple-answer">Multiple Answers</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Number of Questions</Label>
                      <Select value={numQuestions} onValueChange={setNumQuestions}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      "Generate Quiz"
                    )}
                  </Button>

                  {quizResult && (
                    <div className="space-y-4 mt-4">
                      <Label>Generated Quiz</Label>
                      <div className="space-y-4">
                        {Array.isArray(quizResult) ? (
                          quizResult.map((q: any, idx: number) => (
                            <Card key={idx}>
                              <CardContent className="pt-6">
                                <p className="font-semibold mb-2">
                                  {idx + 1}. {q.question}
                                </p>
                                {q.options && (
                                  <ul className="space-y-1 ml-4">
                                    {q.options.map((opt: string, i: number) => (
                                      <li key={i} className="text-sm text-muted-foreground">
                                        {String.fromCharCode(65 + i)}. {opt}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <p className="text-sm text-primary mt-2">
                                  Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}
                                </p>
                                {q.explanation && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {q.explanation}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="p-4 bg-muted rounded-md">
                            <p className="whitespace-pre-wrap">{quizResult}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summarize" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes Summarizer</CardTitle>
                  <CardDescription>
                    Get concise summaries of your notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary-notes">Your Notes</Label>
                    <Textarea
                      id="summary-notes"
                      placeholder="Paste your notes here..."
                      value={summaryNotes}
                      onChange={(e) => setSummaryNotes(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      "Summarize"
                    )}
                  </Button>
                  {summaryResult && (
                    <div className="space-y-2">
                      <Label>Summary</Label>
                      <div className="p-4 bg-muted rounded-md">
                        <p className="whitespace-pre-wrap">{summaryResult}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presentation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Presentation Builder</CardTitle>
                  <CardDescription>
                    Create presentation slides from your notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="presentation-notes">Your Notes</Label>
                    <Textarea
                      id="presentation-notes"
                      placeholder="Paste your notes here..."
                      value={presentationNotes}
                      onChange={(e) => setPresentationNotes(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button
                    onClick={handleGeneratePresentation}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Presentation...
                      </>
                    ) : (
                      "Create Presentation"
                    )}
                  </Button>
                  {presentationResult && (
                    <div className="space-y-4 mt-4">
                      <Label>Presentation Slides</Label>
                      <div className="space-y-4">
                        {Array.isArray(presentationResult) ? (
                          presentationResult.map((slide: any, idx: number) => (
                            <Card key={idx}>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  Slide {idx + 1}: {slide.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside space-y-1">
                                  {slide.content.map((point: string, i: number) => (
                                    <li key={i} className="text-sm">{point}</li>
                                  ))}
                                </ul>
                                {slide.notes && (
                                  <p className="text-sm text-muted-foreground mt-3 italic">
                                    Speaker Notes: {slide.notes}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="p-4 bg-muted rounded-md">
                            <p className="whitespace-pre-wrap">{presentationResult}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Flashcard Generator</CardTitle>
                  <CardDescription>
                    Generate study flashcards from your notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="flashcard-notes">Your Notes</Label>
                    <Textarea
                      id="flashcard-notes"
                      placeholder="Paste your notes here..."
                      value={flashcardNotes}
                      onChange={(e) => setFlashcardNotes(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button
                    onClick={handleGenerateFlashcards}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Flashcards...
                      </>
                    ) : (
                      "Generate Flashcards"
                    )}
                  </Button>
                  {flashcardResult && (
                    <div className="space-y-4 mt-4">
                      <Label>Flashcards</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(flashcardResult) ? (
                          flashcardResult.map((card: any, idx: number) => (
                            <Card key={idx} className="cursor-pointer hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                  {card.front}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">
                                  {card.back}
                                </p>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="p-4 bg-muted rounded-md col-span-2">
                            <p className="whitespace-pre-wrap">{flashcardResult}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AITools;
