import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { siteApi } from '../lib/api.js';
import SiteRenderer from '../renderer/SiteRenderer.jsx';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PublicSitePage() {
  const { username } = useParams();
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPublicSite() {
      try {
        setLoading(true);
        const data = await siteApi.getPublic(username);
        setSiteData(data);

        // Dynamically update document title and meta description
        const siteTitle = data.title || `${data.user?.name || username}'s Portfolio`;
        document.title = `${siteTitle} — Thirty Seconds`;

        // Extract description from hero or about block
        const heroBlock = data.site?.blocks?.find((b) => b.type === 'hero');
        const desc = heroBlock?.props?.subheading || `${siteTitle} built with Thirty Seconds`;
        
        let metaTag = document.querySelector('meta[name="description"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.name = 'description';
          document.head.appendChild(metaTag);
        }
        metaTag.content = desc;
      } catch (err) {
        setError(err.message || 'Unable to load portfolio.');
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchPublicSite();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center text-zinc-600">
        <Loader2 className="w-8 h-8 animate-spin text-[#111111] mb-3" />
        <p className="text-sm font-semibold">Loading portfolio...</p>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#111111] flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Portfolio Not Found</h1>
        <p className="text-sm text-zinc-600 max-w-md mb-6">
          {error || `No published portfolio found for @${username}.`}
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl bg-[#111111] text-white font-bold text-sm hover:bg-[#111111] transition-colors shadow-sm"
        >
          Build Your Own Portfolio Free
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      {/* Renders the published site JSON snapshot */}
      <SiteRenderer site={siteData.site} isEditor={false} />

      {/* Unobtrusive Floating Branding Pill */}
      <aside className="fixed bottom-4 right-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-900 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition-all hover:scale-105"
        >
          <span className="text-sm">⚡</span>
          <span>Built with Thirty Seconds</span>
        </Link>
      </aside>
    </div>
  );
}
