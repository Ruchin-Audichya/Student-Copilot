import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedInternship {
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  requiredSkills: string[];
  description: string;
  source: string;
  url: string;
}

// AI-powered skill extraction
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'REST API', 'GraphQL', 'Redux', 'Vue.js', 'Angular', 'Express.js',
    'Django', 'Flask', 'Spring Boot', 'TensorFlow', 'PyTorch', 'Machine Learning',
    'Data Science', 'DevOps', 'CI/CD', 'Jenkins', 'Ansible', 'Terraform',
    'Firebase', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ'
  ];

  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return foundSkills;
}

// Intelligent text cleaning and processing
function cleanAndProcessText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?]/g, '')
    .trim()
    .substring(0, 1000); // Limit length
}

// Mock scraping function (replace with actual scraping logic)
async function scrapeJobSite(url: string): Promise<ScrapedInternship[]> {
  // This is a mock implementation
  // In production, you'd use services like:
  // - ScrapingBee
  // - Bright Data
  // - Puppeteer/Playwright
  // - Selenium
  
  const mockInternships: ScrapedInternship[] = [
    {
      title: "Software Engineering Intern",
      company: "TechCorp Solutions",
      location: "Remote",
      stipend: "25000",
      duration: "3-6 months",
      requiredSkills: ["JavaScript", "React", "Node.js"],
      description: "Join our team to build scalable web applications using modern technologies.",
      source: "LinkedIn",
      url: "https://linkedin.com/jobs/view/123"
    },
    {
      title: "Data Science Intern",
      company: "AI Innovations",
      location: "San Francisco, CA",
      stipend: "30000",
      duration: "6 months",
      requiredSkills: ["Python", "Machine Learning", "SQL"],
      description: "Work on cutting-edge machine learning projects and data analysis.",
      source: "Indeed",
      url: "https://indeed.com/jobs/view/456"
    }
  ];

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockInternships;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { sources = ['linkedin', 'indeed'] } = await req.json()

    const allInternships: ScrapedInternship[] = []

    // Scrape from multiple sources
    for (const source of sources) {
      try {
        const url = `https://${source}.com/internships`
        const internships = await scrapeJobSite(url)
        allInternships.push(...internships)
      } catch (error) {
        console.error(`Error scraping ${source}:`, error)
      }
    }

    // Process and store internships
    const processedInternships = allInternships.map(internship => ({
      title: cleanAndProcessText(internship.title),
      company: cleanAndProcessText(internship.company),
      location: cleanAndProcessText(internship.location),
      stipend: internship.stipend,
      duration: cleanAndProcessText(internship.duration),
      requiredSkills: internship.requiredSkills,
      description: cleanAndProcessText(internship.description),
      source: internship.source,
      url: internship.url
    }))

    // Store in database
    const { data, error } = await supabase
      .from('internships')
      .insert(processedInternships)
      .select()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped and stored ${processedInternships.length} internships`,
        data: processedInternships
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 