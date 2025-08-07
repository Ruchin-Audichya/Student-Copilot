import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { InternshipWithMatch } from "@shared/schema";

export default function InternshipFinder() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: "",
    role: "",
  });

  useEffect(() => {
    const id = localStorage.getItem("studentId");
    setStudentId(id);
  }, []);

  // --- CORRECTED DATA FETCHING ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ["internships", studentId],
    queryFn: async () => {
      // Ensure we don't fetch if studentId is null
      if (!studentId) return { internships: [] }; 

      const response = await fetch(`/api/internships?studentId=${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch internships');
      }
      return response.json();
    },
    enabled: !!studentId, // Only run the query if studentId exists
  });

  // Safely get the internships array from the fetched data
  const internships: InternshipWithMatch[] = data?.internships || [];

  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-700";
    if (score >= 80) return "bg-blue-100 text-blue-700";
    if (score >= 70) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const handleApply = (internshipId: string, company: string) => {
    alert(`Application submitted to ${company}! You will be redirected to their application portal.`);
  };

  // --- UI AND RENDER LOGIC (No changes needed here, it's great!) ---

  if (!studentId) {
    return (
      <div className="py-12 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Please complete onboarding first</h2>
            <p className="text-lg text-slate-600">Create your profile to find personalized internship matches.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4" data-testid="page-title">
            Perfect Internship Matches
          </h2>
          <p className="text-lg text-slate-600" data-testid="page-description">
            AI-curated opportunities based on your profile
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4" data-testid="filters">
              <Select onValueChange={(value) => setFilters({ ...filters, location: value })}>
                <SelectTrigger className="w-48" data-testid="filter-location">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger className="w-48" data-testid="filter-role">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="software">Software Development</SelectItem>
                  <SelectItem value="data">Data Science</SelectItem>
                  <SelectItem value="product">Product Management</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="bg-primary-600 hover:bg-primary-700" data-testid="button-apply-filters">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Internship Cards Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : isError ? (
           <div className="text-center py-12">
             <p className="text-lg text-red-600" data-testid="text-error">
               Could not load internships. Please try again later.
             </p>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="internships-grid">
            {internships.map((internship) => (
              <Card 
                key={internship.id} 
                className="p-6 hover:shadow-xl transition-all duration-300"
                data-testid={`card-internship-${internship.id}`}
              >
                <CardContent className="p-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2" data-testid={`text-title-${internship.id}`}>
                        {internship.title}
                      </h3>
                      <p className="text-slate-600 font-medium" data-testid={`text-company-${internship.id}`}>
                        {internship.company}
                      </p>
                      <p className="text-sm text-slate-500" data-testid={`text-location-${internship.id}`}>
                        📍 {internship.location}
                      </p>
                    </div>
                    <Badge className={getMatchBadgeColor(internship.matchScore)} data-testid={`badge-match-${internship.id}`}>
                      {internship.matchScore}% Match
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <span className="mr-2">💰</span>
                      <span data-testid={`text-stipend-${internship.id}`}>{internship.stipend}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <span className="mr-2">⏱️</span>
                      <span data-testid={`text-duration-${internship.id}`}>{internship.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(internship.requiredSkills || []).map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-primary-100 text-primary-700"
                        data-testid={`badge-skill-${internship.id}-${index}`}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-primary-600 hover:bg-primary-700"
                    onClick={() => handleApply(internship.id, internship.company)}
                    data-testid={`button-apply-${internship.id}`}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More and No Internships Found messages */}
        {!isLoading && !isError && internships.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="px-8 py-3"
              data-testid="button-load-more"
            >
              Load More Opportunities
            </Button>
          </div>
        )}

        {!isLoading && !isError && internships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600" data-testid="text-no-internships">
              No internships found matching your profile. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}