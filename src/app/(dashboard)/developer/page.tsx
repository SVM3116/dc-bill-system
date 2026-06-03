"use client";

import React from "react";
import Image from "next/image";
import { Mail, Phone, MapPin, GraduationCap, Code2, Heart, ExternalLink } from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Developer Profile</h1>
        <p className="text-slate-500 text-sm">Meet the developer behind the DC Bill System.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 relative">
        </div>
        
        <div className="px-6 pb-6 relative">
          {/* Avatar positioning */}
          <div className="absolute -top-16 left-6 md:left-8">
            <div className="relative h-32 w-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100">
              <Image 
                src="/developer.png" 
                alt="Manoj Kumar V" 
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="pt-20 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Manoj Kumar V</h2>
              <p className="text-blue-600 font-semibold text-sm">Full Stack Developer</p>
              
              <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Bengaluru, Karnataka
                </span>
                <a href="mailto:svmmdrpu@gmail.com" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  svmmdrpu@gmail.com
                </a>
                <a href="tel:+917975464020" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  +91-7975464020
                </a>
                <a 
                  href="https://github.com/SVM3116" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5 text-slate-400" />
                  github.com/SVM3116
                </a>
              </div>
            </div>

            <div className="flex gap-2">
              <a 
                href="mailto:svmmdrpu@gmail.com" 
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold rounded-lg shadow transition-colors h-10 cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                Contact Manoj
              </a>
              <a 
                href="https://github.com/SVM3116" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2 text-xs font-semibold rounded-lg transition-colors h-10 cursor-pointer"
              >
                <GithubIcon className="h-4 w-4" />
                GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Professional Summary & Education */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-600" />
              Professional Summary
            </h3>
            <p className="text-slate-650 text-sm leading-relaxed">
              B.Tech Computer Science and Business Systems student (6th Semester, VTU) with hands-on experience building and deploying robust full-stack applications. Skilled in backend architecture, role-based access control, REST API design, and cloud deployments. Passionate about creating secure, efficient, and user-centric digital tools.
            </p>
            <div className="mt-4 p-4 bg-blue-50/55 border border-blue-100 rounded-lg flex items-start gap-3">
              <div className="bg-blue-100 text-blue-700 p-1.5 rounded-md mt-0.5">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-900">Alumnus Connection</h4>
                <p className="text-xs text-blue-750 mt-1 leading-relaxed">
                  As a proud former student of <strong className="font-bold">Morarji Desai Residential School (Sulibele)</strong> and <strong className="font-bold">Morarji Desai PU College (Hosakote)</strong>, this DC Bill System was built with personal dedication to simplify financial administration for school principal and district office teams.
                </p>
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-600" />
              Key Projects
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 rounded-lg hover:border-slate-350 hover:shadow-sm transition-all">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-sm">Farewell &apos;26 - Payment System</h4>
                  <a href="https://vtu-farewell-pay.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-0.5 font-semibold">
                    Live <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-slate-500 text-xs mt-1">Role-based payment collection system serving 800+ concurrent students with audit logging.</p>
              </div>

              <div className="p-4 border border-slate-100 rounded-lg hover:border-slate-350 hover:shadow-sm transition-all">
                <h4 className="font-bold text-slate-900 text-sm">One Rupee RapidFix</h4>
                <p className="text-slate-500 text-xs mt-1">Real-time breakdown service and mechanic mapping platform using Google Maps API.</p>
              </div>

              <div className="p-4 border border-slate-100 rounded-lg hover:border-slate-350 hover:shadow-sm transition-all">
                <h4 className="font-bold text-slate-900 text-sm">SkillBridge AI</h4>
                <p className="text-slate-500 text-xs mt-1">Onboarding assessment suite using Gemini AI API to parse resumes and map learning pathways.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Skills & Education Timeline */}
        <div className="space-y-6">
          
          {/* Skills Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Technical Skills</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Languages</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["JavaScript", "SQL", "Java", "C", "C++"].map(s => (
                    <span key={s} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-1 rounded font-medium">{s}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frontend / Backend</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["React.js", "Node.js", "Express.js", "HTML5", "CSS3", "Bootstrap"].map(s => (
                    <span key={s} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-1 rounded font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Databases / Deployment</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["PostgreSQL", "Supabase", "MySQL", "MongoDB", "Vercel", "Git/GitHub"].map(s => (
                    <span key={s} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-1 rounded font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Education History
            </h3>
            
            <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-5">
              <div className="relative">
                <div className="absolute -left-[25px] top-1.5 bg-blue-600 rounded-full h-3 w-3 border-2 border-white" />
                <h4 className="font-bold text-slate-900 text-xs leading-none">B.Tech (CSBS)</h4>
                <p className="text-[11px] text-slate-500 mt-1">VTU PG Centre, Belagavi (Expected 2027)</p>
                <p className="text-[11px] font-semibold text-blue-600 mt-0.5">CGPA: 7.37 (6th Sem)</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1.5 bg-blue-600 rounded-full h-3 w-3 border-2 border-white" />
                <h4 className="font-bold text-slate-900 text-xs leading-none">12th Grade (PUC)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Morarji Desai PU College, Hosakote (2022)</p>
                <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Percentage: 91.16%</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] top-1.5 bg-blue-600 rounded-full h-3 w-3 border-2 border-white" />
                <h4 className="font-bold text-slate-900 text-xs leading-none">10th Grade (SSLC)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Morarji Desai School, Sulibele (2020)</p>
                <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Percentage: 83.52%</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
