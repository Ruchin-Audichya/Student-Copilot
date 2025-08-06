import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const personalInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  year: z.number().min(1).max(4),
});

const skillsSchema = z.object({
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
});

const interestsSchema = z.object({
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type Skills = z.infer<typeof skillsSchema>;
type Interests = z.infer<typeof interestsSchema>;

const availableSkills = [
  "Python", "JavaScript", "React", "Node.js", "Java", "C++", "SQL", "MongoDB",
  "Machine Learning", "Data Science", "CSS", "HTML", "Git", "Docker", "AWS"
];

const availableInterests = [
  "Web Development", "Mobile Development", "AI/Machine Learning", "Data Science",
  "Cybersecurity", "Cloud Computing", "DevOps", "UI/UX Design", "Blockchain",
  "IoT", "Game Development", "AR/VR"
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [studentData, setStudentData] = useState<Partial<PersonalInfo & Skills & Interests>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      year: undefined,
    },
  });

  const skillsForm = useForm<Skills>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: [],
    },
  });

  const interestsForm = useForm<Interests>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      interests: [],
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: PersonalInfo & Skills & Interests) => {
      const response = await apiRequest("POST", "/api/onboard", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome aboard!",
        description: "Your profile has been created successfully.",
      });
      // Store student ID for future use
      localStorage.setItem("studentId", data.student.id);
      setLocation("/internships");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setStudentData({ ...studentData, ...data });
    setCurrentStep(2);
  };

  const handleSkillsSubmit = (data: Skills) => {
    setStudentData({ ...studentData, ...data });
    setCurrentStep(3);
  };

  const handleInterestsSubmit = (data: Interests) => {
    const finalData = { ...studentData, ...data } as PersonalInfo & Skills & Interests;
    createStudentMutation.mutate(finalData);
  };

  const renderProgressIndicator = () => (
    <div className="mb-8" data-testid="progress-indicator">
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>1</div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= 1 ? 'text-primary-600' : 'text-slate-500'
          }`}>Personal Info</span>
        </div>
        <div className="w-16 h-1 bg-slate-200 rounded-full">
          <div className={`h-full bg-primary-600 rounded-full transition-all duration-300 ${
            currentStep >= 2 ? 'w-full' : 'w-0'
          }`}></div>
        </div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>2</div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= 2 ? 'text-primary-600' : 'text-slate-500'
          }`}>Skills</span>
        </div>
        <div className="w-16 h-1 bg-slate-200 rounded-full">
          <div className={`h-full bg-primary-600 rounded-full transition-all duration-300 ${
            currentStep >= 3 ? 'w-full' : 'w-0'
          }`}></div>
        </div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>3</div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= 3 ? 'text-primary-600' : 'text-slate-500'
          }`}>Interests</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4" data-testid="page-title">
            Welcome to Co-Pilot AI
          </h2>
          <p className="text-lg text-slate-600" data-testid="page-description">
            Let's create your personalized profile
          </p>
        </div>

        {renderProgressIndicator()}

        <Card className="shadow-lg border border-slate-200">
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-6" data-testid="form-personal-info">
                  <FormField
                    control={personalForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.email@college.edu" 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year in College</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} data-testid="select-year">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your current year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end mt-8">
                    <Button type="submit" className="bg-primary-600 hover:bg-primary-700" data-testid="button-next-step">
                      Next Step
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 2 && (
              <Form {...skillsForm}>
                <form onSubmit={skillsForm.handleSubmit(handleSkillsSubmit)} className="space-y-6" data-testid="form-skills">
                  <FormField
                    control={skillsForm.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Your Skills</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {availableSkills.map((skill) => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={skill}
                                checked={field.value?.includes(skill)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, skill]);
                                  } else {
                                    field.onChange(field.value?.filter(s => s !== skill));
                                  }
                                }}
                                data-testid={`checkbox-skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              />
                              <label htmlFor={skill} className="text-sm font-medium text-slate-700 cursor-pointer">
                                {skill}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between mt-8">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="bg-primary-600 hover:bg-primary-700" data-testid="button-next-step">
                      Next Step
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 3 && (
              <Form {...interestsForm}>
                <form onSubmit={interestsForm.handleSubmit(handleInterestsSubmit)} className="space-y-6" data-testid="form-interests">
                  <FormField
                    control={interestsForm.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Your Interests</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {availableInterests.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={interest}
                                checked={field.value?.includes(interest)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, interest]);
                                  } else {
                                    field.onChange(field.value?.filter(i => i !== interest));
                                  }
                                }}
                                data-testid={`checkbox-interest-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              />
                              <label htmlFor={interest} className="text-sm font-medium text-slate-700 cursor-pointer">
                                {interest}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between mt-8">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary-600 hover:bg-primary-700"
                      disabled={createStudentMutation.isPending}
                      data-testid="button-complete"
                    >
                      {createStudentMutation.isPending ? "Creating Profile..." : "Complete Profile"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
