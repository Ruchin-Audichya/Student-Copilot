import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export async function findInternships(profile: any) {
  const res = await api.post('/find-internships', profile);
  return res.data;
}

export async function skillGap(payload: any) {
  const res = await api.post('/skill-gap', payload);
  return res.data;
}

export async function getProjects(profile: any) {
  const res = await api.post('/projects', profile);
  return res.data;
}
