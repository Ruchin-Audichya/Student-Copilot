import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SkillGapAnalysis } from "@shared/schema";

const targetRoles = [
  {
    id: "Full-Stack Developer",
    title: "Full-Stack Developer",
    description: "Frontend + Backend development"
  },
  {
    id: "Data Scientist",
    title: "Data Scientist", 
    description: "ML, Analytics, Statistics"
  },
  {
    id: "DevOps Engineer",
    title: "DevOps Engineer",
    description: "Cloud, CI/CD, Infrastructure"
  }
];

export default function SkillGapAnalyzer() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("studentId");
    setStudentId(id);
  }, []);

  const analyzeSkillGapMutation = useMutation({
    mutationFn: async ({ studentId, targetRole }: { studentId: string; targetRole: string }) => {
      const response = await apiRequest("POST", "/api/skill-gap", { studentId, targetRole });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
    },
    onError: (error) => {
      console.error("Skill gap analysis failed:", error);
    },
  });

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    if (studentId) {
      analyzeSkillGapMutation.mutate({ studentId, targetRole: roleId });
    }
  };

  const handleStartLearningPlan = () => {
    alert("Your personalized learning plan has been created! Resources will be sent to your email.");
  };

  if (!studentId) {
    return (
      <div className="py-12 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Please complete onboarding first</h2>
            <p className="text-lg text-slate-600">Create your profile to analyze your skill gaps.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4" data-testid="page-title">
            Skill Gap Analysis
          </h2>
          <p className="text-lg text-slate-600" data-testid="page-description">
            Identify what you need to learn for your target role
          </p>
        </div>

        {/* Target Role Selection */}
        <Card className="mb-8 bg-slate-50">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4" data-testid="section-select-role">
              Select Your Target Role
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {targetRoles.map((role) => (
                <Button
                  key={role.id}
                  variant={selectedRole === role.id ? "default" : "outline"}
                  className={`p-4 h-auto text-left flex-col items-start ${
                    selectedRole === role.id 
                      ? "bg-primary-600 hover:bg-primary-700 border-primary-600" 
                      : "bg-white border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => handleRoleSelect(role.id)}
                  data-testid={`button-role-${role.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <h4 className="font-semibold text-slate-900">{role.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {analyzeSkillGapMutation.isPending && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600">Analyzing your skills...</p>
          </div>
        )}

        {analysis && (
          <>
            {/* Analysis Results */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Current Skills */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="section-current-skills">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    Your Current Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.currentSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between" data-testid={`skill-current-${index}`}>
                        <div className="flex items-center">
                          <span className="text-slate-900 font-medium">{skill.name}</span>
                          <Badge 
                            className={`ml-2 ${
                              skill.level === 'Advanced' ? 'bg-emerald-100 text-emerald-700' :
                              skill.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {skill.level}
                          </Badge>
                        </div>
                        <div className="w-24">
                          <Progress value={skill.proficiency} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Missing Skills */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="section-missing-skills">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    Skills to Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.missingSkills.map((skill, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          skill.priority === 'High Priority' ? 'bg-red-50 border-red-100' :
                          skill.priority === 'Medium Priority' ? 'bg-amber-50 border-amber-100' :
                          'bg-blue-50 border-blue-100'
                        }`}
                        data-testid={`skill-missing-${index}`}
                      >
                        <div className="flex items-center">
                          <span className="text-slate-900 font-medium">{skill.name}</span>
                          <Badge 
                            className={`ml-2 ${
                              skill.priority === 'High Priority' ? 'bg-red-100 text-red-700' :
                              skill.priority === 'Medium Priority' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {skill.priority}
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-600">{skill.timeToLearn}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Plan */}
            <Card className="gradient-primary shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="section-learning-plan">
                  <div className="bg-primary-100 p-2 rounded-lg mr-3">
                    <Award className="w-5 h-5 text-primary-600" />
                  </div>
                  Your 30-Day Learning Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {analysis.learningPlan.weeks.map((week, index) => (
                    <Card key={index} className="bg-white" data-testid={`week-plan-${index}`}>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-2">{week.title}</h4>
                        <p className="text-sm text-slate-600 mb-3">{week.focus}</p>
                        <ul className="space-y-1">
                          {week.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="text-xs text-slate-600">
                              • {task}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button 
                    className="bg-primary-600 hover:bg-primary-700 px-8 py-3"
                    onClick={handleStartLearningPlan}
                    data-testid="button-start-learning-plan"
                  >
                    Start Learning Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedRole && !analyzeSkillGapMutation.isPending && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600" data-testid="text-select-role-prompt">
              Select a target role above to analyze your skill gaps and get a personalized learning plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
