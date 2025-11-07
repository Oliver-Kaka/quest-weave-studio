import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, text, messages, topic, notes, quizType, numQuestions } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    let prompt = "";
    let conversationMessages = [];

    switch (type) {
      case "summarize":
        prompt = `Please provide a clear and concise summary of the following notes:\n\n${notes}`;
        conversationMessages = [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ];
        break;

      case "quiz":
        const quizTypeText = quizType === "mixed" ? "a mixture of multiple choice, true/false, and multiple answer questions" : 
                            quizType === "multiple-choice" ? "multiple choice questions with 4 options each" :
                            quizType === "true-false" ? "true or false questions" :
                            "multiple answer questions (select all that apply) with 5 options each";
        
        prompt = `Based on the following notes, generate ${numQuestions} ${quizTypeText}.

Notes:
${notes}

Format your response as a JSON array with the following structure:
[
  {
    "question": "Question text",
    "type": "multiple-choice" | "true-false" | "multiple-answer",
    "options": ["Option 1", "Option 2", ...],
    "correctAnswer": "Option text" | ["Option 1", "Option 2"] (for multiple-answer),
    "explanation": "Brief explanation of the correct answer"
  }
]

Make sure questions test understanding, not just memorization.`;
        conversationMessages = [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ];
        break;

      case "flashcards":
        prompt = `Based on the following notes, generate 10 flashcards for studying.

Notes:
${notes}

Format your response as a JSON array:
[
  {
    "front": "Question or concept",
    "back": "Answer or explanation"
  }
]

Focus on key concepts, definitions, and important facts.`;
        conversationMessages = [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ];
        break;

      case "presentation":
        prompt = `Based on the following notes, create a presentation outline with 5-8 slides.

Notes:
${notes}

Format your response as a JSON array:
[
  {
    "title": "Slide title",
    "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
    "notes": "Speaker notes for this slide"
  }
]

Make it clear, concise, and engaging.`;
        conversationMessages = [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ];
        break;

      case "chat":
        conversationMessages = messages.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }));
        break;

      case "study-plan":
        prompt = `Create a comprehensive study plan for learning: ${topic}

Please include:
1. Overview of key concepts
2. Suggested timeline (weeks/days)
3. Learning resources
4. Practice exercises or projects
5. Milestones and checkpoints

Make it practical and actionable for a student.`;
        conversationMessages = [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ];
        break;

      default:
        throw new Error("Invalid request type");
    }

    console.log("Calling Google AI API with:", { type });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: conversationMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", response.status, errorText);
      throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Google AI API response received");

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    return new Response(
      JSON.stringify({ result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in google-ai function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
