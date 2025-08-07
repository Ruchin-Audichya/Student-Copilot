#!/usr/bin/env node

/**
 * Student Co-Pilot Setup Script
 * This script helps you set up your Supabase connection and test the system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Student Co-Pilot Setup Script');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DATABASE_URL=your_supabase_database_url

# AI/ML Services (optional for enhanced features)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Web Scraping Services (for internship scraping)
SCRAPING_BEE_API_KEY=your_scraping_bee_api_key
BRIGHT_DATA_API_KEY=your_bright_data_api_key
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created! Please fill in your Supabase credentials.\n');
} else {
  console.log('✅ .env file already exists!\n');
}

// Check if supabase directory exists
const supabasePath = path.join(__dirname, 'supabase');
if (!fs.existsSync(supabasePath)) {
  console.log('📁 Creating supabase directory structure...');
  fs.mkdirSync(supabasePath, { recursive: true });
  fs.mkdirSync(path.join(supabasePath, 'functions'), { recursive: true });
  fs.mkdirSync(path.join(supabasePath, 'functions', 'scrape-internships'), { recursive: true });
  console.log('✅ Supabase directory structure created!\n');
} else {
  console.log('✅ Supabase directory already exists!\n');
}

console.log('📋 Next Steps:');
console.log('==============');
console.log('');
console.log('1. 🗄️  Create a Supabase project:');
console.log('   - Go to https://supabase.com');
console.log('   - Create a new project');
console.log('   - Copy your project URL and API keys');
console.log('');
console.log('2. 🔧 Update your .env file with:');
console.log('   - SUPABASE_URL');
console.log('   - SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
console.log('   - DATABASE_URL');
console.log('');
console.log('3. 🗃️  Set up your database:');
console.log('   npm run db:push');
console.log('');
console.log('4. 🚀 Start development:');
console.log('   npm run dev');
console.log('');
console.log('5. 🤖 Deploy Edge Functions (optional):');
console.log('   npx supabase functions deploy scrape-internships');
console.log('');
console.log('📚 For detailed instructions, see:');
console.log('   - SUPABASE_SETUP.md');
console.log('   - README.md');
console.log('');
console.log('🎉 Happy coding! Your agentic AI internship finder is ready to build!'); 