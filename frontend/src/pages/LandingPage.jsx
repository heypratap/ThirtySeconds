import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, FileText, PencilLine } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const startLink = isAuthenticated ? '/dashboard' : '/register';
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <nav className="max-w-5xl mx-auto px-5 h-20 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight">thirty seconds</Link>
        <Link to={startLink} className="bg-[#111111] text-white px-4 py-2 rounded-xl text-sm font-bold">{isAuthenticated ? 'My resumes' : 'Get started'}</Link>
      </nav>
      <section className="max-w-5xl mx-auto px-5 pt-14 pb-20">
        <p className="inline-block bg-[#B6FF4D] px-3 py-1 rounded-full text-xs font-bold mb-6">SIMPLE RESUME BUILDER</p>
        <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-end">
          <div><h1 className="text-5xl sm:text-7xl font-bold tracking-[-0.06em] leading-[.94]">Build a resume<br />that feels like you.</h1><p className="mt-7 max-w-md text-base leading-relaxed">Add your details, choose the sections you need, and publish a clean resume link. Nothing complicated.</p><Link to={startLink} className="mt-8 inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-4 rounded-2xl font-bold">Make my resume <ArrowRight className="w-4 h-4" /></Link></div>
          <div className="space-y-4"><div className="min-h-48 rounded-[28px] bg-[#B6FF4D] p-6 flex flex-col justify-between"><p className="text-sm font-bold">Data points</p><div><p className="text-5xl font-bold tracking-[-0.06em]">01</p><p className="mt-3 text-sm font-bold max-w-[220px]">Start with the important details about you.</p></div></div><div className="rounded-[28px] bg-[#111111] text-white p-6 flex items-center justify-between"><div><p className="text-sm font-bold">Sections</p><p className="mt-1 text-sm text-white/70">Skills, work and education.</p></div><p className="text-5xl font-bold tracking-[-0.06em]">06+</p></div></div>
        </div>
      </section>
      <section className="border-t border-[#111111] max-w-5xl mx-auto px-5 py-12 grid md:grid-cols-2 gap-5"><div className="rounded-3xl border border-[#111111] p-6"><FileText className="w-5 h-5 mb-10" /><h2 className="text-xl font-bold">Fill in your details</h2><p className="mt-2 text-sm leading-relaxed">Use easy blocks for your profile, experience, education, projects and skills.</p></div><div className="rounded-3xl bg-[#B6FF4D] p-6"><PencilLine className="w-5 h-5 mb-10" /><h2 className="text-xl font-bold">Edit when you need to</h2><p className="mt-2 text-sm leading-relaxed">Change text, reorder sections and share your finished resume from one simple page.</p></div></section>
    </main>
  );
}
