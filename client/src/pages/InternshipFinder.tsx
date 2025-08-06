// client/src/pages/InternshipFinder.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { findInternships } from "@/lib/api"; // <-- use new helper
import type { InternshipWithMatch } from "@shared/schema";

export default function InternshipFinder() {
  const [loading, setLoading] = useState<boolean>(false);
  const [internships, setInternships] = useState<InternshipWithMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Replace with actual onboarding/profile later (or studentId)
  const [profile, setProfile] = useState({
    year: 2,
    skills: ["python", "sql"],
    interests: ["web", "ai"],
    location: ""
  });
  const [filters, setFilters] = useState({ location: "", remote: false });

  async function loadJobs(payload?: any) {
    setLoading(true);
    setError(null);
    try {
      // We call findInternships(payload) which posts to /api/find-internships
      const body = payload ?? { profile, filters };
      const res = await findInternships(body);
      // our api wrapper returns the parsed body (handleRequest)
      // it will return either { success: true, internships } or direct { internships } depending on server
      const results = res.internships ?? res.internships ?? res.internships;
      // Defensive: if server returned success wrapper
      const internshipsList = res?.internships ?? (res?.internships === undefined && res?.results ? res.results : res);
      // Normalize
      const finalList = internshipsList || [];
      setInternships(finalList);
    } catch (err: any) {
      console.error("fetch internships error", err);
      setError(err?.message || "Failed to fetch internships");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Internship Finder</h1>
        <div className="flex gap-2">
          <Button onClick={() => loadJobs()}>Refresh</Button>
        </div>
      </div>

      {/* Quick filter UI */}
      <div className="mb-4 flex gap-2 items-center">
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
        <Button onClick={() => loadJobs({ profile, filters })}>Apply</Button>
      </div>

      {loading && (
        <div>
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-6 w-1/2 mb-3" />
          <Skeleton className="h-40" />
        </div>
      )}

      {!loading && error && (
        <div className="text-red-600 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && internships.length === 0 && !error && (
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
