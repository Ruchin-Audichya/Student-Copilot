import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, BarChart3, MessageCircle, DollarSign } from "lucide-react";
import type { Project } from "@shared/schema";

const difficultyColors = {
  "Beginner": "bg-green-100 text-green-700",
  "Intermediate": "bg-amber-100 text-amber-700", 
  "Advanced": "bg-red-100 text-red-700"
};

const iconMap = {
  "E-Commerce Dashboard": BarChart3,
  "AI Chatbot Assistant": MessageCircle,
  "Personal Finance Tracker": DollarSign,
  "Social Media Analytics": BarChart3
};

export default function ProjectRecommender() {
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("studentId");
    setStudentId(id);
  }, []);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["/api/projects", studentId],
    enabled: !!studentId,
  });

  const projects: Project[] = projectsData?.projects || [];

  const handleStartProject = (projectTitle: string) => {
    alert(`Project resources and starter code for "${projectTitle}" will be provided. Check your email for details!`);
  };

  const handleGetMoreIdeas = () => {
    alert("More project ideas will be generated based on your updated profile and interests!");
  };

  const handleCreateCustomProject = () => {
    alert("Custom project creation tool will be available soon! We'll help you design a project that matches your specific goals.");
  };

  if (!studentId) {
    return (
      <div className="py-12 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Please complete onboarding first</h2>
            <p className="text-lg text-slate-600">Create your profile to get personalized project recommendations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4" data-testid="page-title">
            Project Recommendations
          </h2>
          <p className="text-lg text-slate-600" data-testid="page-description">
            AI-curated projects to boost your portfolio and skills
          </p>
        </div>

        {/* Project Cards */}
        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="p-8">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-32" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8" data-testid="projects-grid">
            {projects.map((project) => {
              const IconComponent = iconMap[project.title as keyof typeof iconMap] || BarChart3;
              
              return (
                <Card 
                  key={project.id} 
                  className="p-8 hover:shadow-xl transition-all duration-300"
                  data-testid={`card-project-${project.id}`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2" data-testid={`text-title-${project.id}`}>
                          {project.title}
                        </h3>
                        <Badge 
                          className={difficultyColors[project.difficulty as keyof typeof difficultyColors]}
                          data-testid={`badge-difficulty-${project.id}`}
                        >
                          {project.difficulty}
                        </Badge>
                      </div>
                      <div className="bg-primary-100 p-3 rounded-xl">
                        <IconComponent className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4" data-testid={`text-description-${project.id}`}>
                      {project.description}
                    </p>

                    <div className="mb-4">
                      <h4 className="font-medium text-slate-900 mb-2">Technologies You'll Learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                            data-testid={`badge-tech-${project.id}-${index}`}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 mb-2">Project Features:</h4>
                      <ul className="space-y-1">
                        {project.features.map((feature, index) => (
                          <li 
                            key={index} 
                            className="text-sm text-slate-600 flex items-center"
                            data-testid={`text-feature-${project.id}-${index}`}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        <span data-testid={`text-duration-${project.id}`}>⏱️ {project.duration}</span>
                      </div>
                      <Button 
                        className="bg-primary-600 hover:bg-primary-700"
                        onClick={() => handleStartProject(project.title)}
                        data-testid={`button-start-${project.id}`}
                      >
                        Start Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Get More Recommendations */}
        {!isLoading && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="mr-4 px-8 py-3"
              onClick={handleGetMoreIdeas}
              data-testid="button-get-more-ideas"
            >
              Get More Ideas
            </Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700 px-8 py-3"
              onClick={handleCreateCustomProject}
              data-testid="button-create-custom"
            >
              Create Custom Project
            </Button>
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600" data-testid="text-no-projects">
              No projects found. Please complete your profile to get personalized recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
