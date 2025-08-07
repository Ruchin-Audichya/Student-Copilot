import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Schemas for multi-step form validation
const personalInfoSchema = z.object({ name: z.string().min(2, "Name is required"), email: z.string().email() });
const skillsSchema = z.object({ skills: z.array(z.string()).min(1, "Select at least one skill") });
const interestsSchema = z.object({ interests: z.array(z.string()).min(1, "Select at least one interest") });

// All available options
const availableSkills = ["Python", "JavaScript", "React", "Node.js", "Java", "SQL", "Machine Learning", "CSS", "Git", "Docker", "TypeScript", "Testing"];
const availableInterests = ["Web Development", "AI/Machine Learning", "Data Science", "Cybersecurity", "Cloud Computing", "UI/UX Design"];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const personalForm = useForm({ resolver: zodResolver(personalInfoSchema) });
  const skillsForm = useForm({ resolver: zodResolver(skillsSchema), defaultValues: { skills: [] } });
  const interestsForm = useForm({ resolver: zodResolver(interestsSchema), defaultValues: { interests: [] } });

  // The API Mutation: This sends the final data to the backend.
  const createStudentMutation = useMutation({
    mutationFn: async (fullData: any) => {
      const response = await apiRequest("POST", "/api/onboard", fullData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Welcome aboard!", description: "Your profile has been created." });
      localStorage.setItem("studentId", data.id); // Save the student ID from the response
      setLocation("/internships");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create profile.", variant: "destructive" });
    },
  });

  const processStep = (data: any) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    if (currentStep === 3) {
      createStudentMutation.mutate(updatedData); // On final step, call the mutation
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Create Your Profile</h2>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(processStep)} className="space-y-6">
                  {/* Personal Info Fields: Name, Email */}
                  <FormField control={personalForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Ada Lovelace" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={personalForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="ada@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" className="w-full">Next Step</Button>
                </form>
              </Form>
            )}
            {currentStep === 2 && (
              <Form {...skillsForm}>
                <form onSubmit={skillsForm.handleSubmit(processStep)} className="space-y-6">
                  {/* Skills Checkboxes */}
                  <FormField control={skillsForm.control} name="skills" render={({ field }) => (<FormItem><FormLabel>Select Your Skills</FormLabel><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{availableSkills.map((skill) => (<div key={skill} className="flex items-center"><Checkbox id={skill} onCheckedChange={(checked) => { checked ? field.onChange([...field.value, skill]) : field.onChange(field.value?.filter((s) => s !== skill)); }} /><label htmlFor={skill} className="ml-2">{skill}</label></div>))}</div><FormMessage /></FormItem>)} />
                  <div className="flex justify-between"><Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button><Button type="submit">Next Step</Button></div>
                </form>
              </Form>
            )}
            {currentStep === 3 && (
              <Form {...interestsForm}>
                <form onSubmit={interestsForm.handleSubmit(processStep)} className="space-y-6">
                  {/* Interests Checkboxes */}
                  <FormField control={interestsForm.control} name="interests" render={({ field }) => (<FormItem><FormLabel>Select Your Interests</FormLabel><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{availableInterests.map((interest) => (<div key={interest} className="flex items-center"><Checkbox id={interest} onCheckedChange={(checked) => { checked ? field.onChange([...field.value, interest]) : field.onChange(field.value?.filter((i) => i !== interest)); }} /><label htmlFor={interest} className="ml-2">{interest}</label></div>))}</div><FormMessage /></FormItem>)} />
                  <div className="flex justify-between"><Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button><Button type="submit" disabled={createStudentMutation.isPending}>{createStudentMutation.isPending ? "Saving..." : "Finish Onboarding"}</Button></div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}