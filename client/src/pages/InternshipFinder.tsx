import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { InternshipWithMatch } from "@shared/schema";

/**
 * InternshipFinder page now calls POST /api/find-internships
 * Sends a profile payload (mock or from actual onboarding)
 */
export default function InternshipFinder() {
  const [loading, setLoading] = useState<boolean>(true);
  const [internships, setInternships] = useState<InternshipWithMatch[]>([]);
  const [profile, setProfile] = useState({
    year: 2,
    skills: ["python", "sql"],
    interests: ["web", "ai"],
    location: ""
  });
  const [filters, setFilters] = useState({ location: "", remote: false });

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        // Use apiRequest helper to POST profile and filters
        const res = await apiRequest("POST", "/api/find-internships", { profile, filters });
        const json = await res.json();
        if (json && json.success) {
          setInternships(json.internships || []);
        } else if (json && json.internships) {
          setInternships(json.internships);
        } else {
          setInternships([]);
        }
      } catch (err) {
        console.error("Error fetching internships:", err);
        setInternships([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [profile, filters]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Internship Finder</h1>

      {/* Quick filter UI (simple) */}
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Location (e.g., Remote or Jaipur)"
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          className="border rounded px-3 py-2"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.remote}
            onChange={(e) => setFilters((f) => ({ ...f, remote: e.target.checked }))}
          />
          <span>Remote only</span>
        </label>
        <Button onClick={() => {
          // manually trigger by toggling filters state to cause effect re-run
          setFilters({ ...filters });
        }}>Apply</Button>
      </div>

      {loading && (
        <div>
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-6 w-1/2 mb-3" />
          <Skeleton className="h-40" />
        </div>
      )}

      {!loading && internships.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-slate-600">No internships found. Please complete your profile to get better matches.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {!loading && internships.map((job: any) => (
          <Card key={job.id}>
            <CardContent className="flex flex-col md:flex-row md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-slate-600">{job.company} · {job.location}</p>
                <p className="mt-2 text-sm">{job.description?.slice?.(0, 160) || "No description available."}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge>{Math.round((job.score || 0) * 100)}% match</Badge>
                <a href={job.url || "#"} target="_blank" rel="noreferrer">
                  <Button>Apply</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
