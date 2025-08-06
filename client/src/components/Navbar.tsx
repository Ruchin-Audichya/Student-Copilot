import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/internships", label: "Internships" },
    { href: "/skills", label: "Skill Gap" },
    { href: "/projects", label: "Projects" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary-600 cursor-pointer" data-testid="logo">
                  🎓 Co-Pilot AI
                </h1>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "nav-link transition-colors cursor-pointer",
                    location === item.href
                      ? "text-primary-600 font-medium"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          
          <div className="md:hidden">
            <button className="text-slate-600 hover:text-slate-900" data-testid="mobile-menu-button">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
