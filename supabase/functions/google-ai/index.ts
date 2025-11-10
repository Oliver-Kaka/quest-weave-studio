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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt = "";
    let chatMessages = [];

    switch (type) {
      case "summarize":
        prompt = `Please provide a clear and concise summary of the following notes:\n\n${notes}`;
        chatMessages = [
          { role: "user", content: prompt }
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
        chatMessages = [
          { role: "user", content: prompt }
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
        chatMessages = [
          { role: "user", content: prompt }
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
        chatMessages = [
          { role: "user", content: prompt }
        ];
        break;

      case "chat":
        chatMessages = messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
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
        chatMessages = [
          { role: "user", content: prompt }
        ];
        break;

      default:
        throw new Error("Invalid request type");
    }

    console.log("Calling Lovable AI Gateway with:", { type });

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to your workspace.");
      }
      
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Lovable AI Gateway response received");

    const result = data.choices?.[0]?.message?.content || "No response generated";

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
