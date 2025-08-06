import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-7xl md:text-5xl font-bold text-slate-900 mb-6" data-testid="hero-title">
              Where's My Stipend? <br />
              <span className="text-primary-600">Your AI Career Co-Pilot for B.Tech Students</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto" data-testid="hero-description">
              Navigate your tech career with AI-powered guidance. Find perfect internships,
              identify skill gaps, and get personalized project recommendations.
            </p>
            <Link href="/onboarding">
              <button 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                data-testid="button-get-started"
              >
                Get Started Now
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4" data-testid="section-title">
              Your Journey to Success
            </h2>
            <p className="text-lg text-slate-600" data-testid="section-description">
              Three simple steps to accelerate your tech career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group" data-testid="step-onboard">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <span className="text-primary-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Onboard</h3>
              <p className="text-slate-600">
                Tell us about your skills, interests, and career goals to create your personalized profile.
              </p>
            </div>

            <div className="text-center group" data-testid="step-internships">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                <span className="text-emerald-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Find Internships</h3>
              <p className="text-slate-600">
                Discover perfectly matched internship opportunities with AI-powered compatibility scores.
              </p>
            </div>

            <div className="text-center group" data-testid="step-skills">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                <span className="text-amber-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Improve Skills</h3>
              <p className="text-slate-600">
                Get personalized learning paths and project recommendations to close skill gaps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
