import { BookOpen, Bot, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import aiToolsImage from "@/assets/ai-tools.jpg";
import studyPlanImage from "@/assets/study-plan.jpg";

const QuickAccessCards = () => {
  const cards = [
    {
      title: "Recent Course",
      description: "Continue where you left off",
      icon: BookOpen,
      image: null,
      buttonText: "CS301 - Data Structures",
      gradient: "from-primary/10 to-accent/10",
      delay: "0s",
      link: "/student",
    },
    {
      title: "AI Tools",
      description: "Enhance your learning experience",
      icon: Bot,
      image: aiToolsImage,
      features: ["Quiz Generation", "Note Summarization", "Presentation Builder"],
      buttonText: "Explore AI Tools",
      gradient: "from-accent/10 to-primary/10",
      delay: "0.1s",
      link: "/ai-tools",
    },
    {
      title: "Study Plan",
      description: "Stay organized and on track",
      icon: Calendar,
      image: studyPlanImage,
      buttonText: "View Study Plan",
      gradient: "from-primary/10 to-accent/10",
      delay: "0.2s",
      link: "/study-plan",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold mb-3">
            Quick Access
          </h2>
          <p className="text-muted-foreground">
            Jump right into your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card
              key={index}
              className="card-hover overflow-hidden border-2 group animate-fade-in-up"
              style={{ animationDelay: card.delay }}
            >
              <CardContent className="p-0">
                {card.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient}`} />
                  </div>
                ) : (
                  <div className={`h-48 bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                    <card.icon className="w-20 h-20 text-primary/30" />
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <card.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  
                  {card.features && (
                    <ul className="space-y-2">
                      {card.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <Link to={card.link}>
                    <Button 
                      className="w-full font-semibold"
                      variant={index === 1 ? "default" : "outline"}
                    >
                      {card.buttonText}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessCards;
