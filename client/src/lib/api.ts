// client/src/lib/api.ts
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Generic helper to unwrap response and throw consistent errors
async function handleRequest<T>(promise: Promise<any>): Promise<T> {
  try {
    const res = await promise;
    if (res?.data) {
      return res.data as T;
    }
    return res as T;
  } catch (err) {
    if ((err as AxiosError).isAxiosError) {
      const axiosErr = err as AxiosError;
      const errorResponse = axiosErr.response?.data as { error?: string };
      const msg =
        errorResponse?.error ||
        axiosErr.message ||
        "Network error";
      throw new Error(String(msg));
    }
    throw err;
  }
}

/**
 * Find internships by posting a profile or filters.
 * Accepts { studentId } OR { profile: {...}, filters: {...} }
 */
export async function findInternships(payload: any) {
  return handleRequest<any>(api.post("/find-internships", payload));
}

/**
 * Skill gap analysis
 * Server expects: { studentId, targetRole }
 */
export async function skillGap(payload: { studentId?: string; targetRole: string; profile?: any }) {
  return handleRequest<any>(api.post("/skill-gap", payload));
}

/**
 * Get recommended projects for a student.
 * Server currently supports GET /api/projects/:studentId and GET /api/projects
 * We'll implement both helpers:
 */
export async function getProjectsForStudent(studentId: string) {
  return handleRequest<any>(api.get(`/projects/${encodeURIComponent(studentId)}`));
}

export async function getAllProjects() {
  return handleRequest<any>(api.get("/projects"));
}

/**
 * If you prefer POST-style project generation (profile -> LLM generate),
 * keep a helper that posts to /projects (if you later create it).
 */
export async function postGenerateProjects(payload: any) {
  return handleRequest<any>(api.post("/projects", payload));
}

export default api;
