
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getAppSettings } from '@/integrations/supabase/client';

const Navbar = () => {
  const { user } = useAuth();
  const [siteName, setSiteName] = useState('SimolyAI');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getAppSettings();
      if (settings) {
        setSiteName(settings.site_name || 'SimolyAI');
        if (settings.logo) {
          setLogoUrl(settings.logo);
        }
      }
    };

    loadSettings();
  }, []);

  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-100">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-purple-600 flex items-center">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 mr-2 site-logo" />
          ) : null}
          <span>{siteName}</span>
        </Link>
        <div className="hidden md:flex ml-10 space-x-8">
          <Link to="/about" className="text-gray-600 hover:text-gray-900">Chi Siamo</Link>
          <Link to="/guide" className="text-gray-600 hover:text-gray-900">Guida</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Prezzi</Link>
          <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contatti</Link>
        </div>
      </div>
      <div className="space-x-2">
        {user ? (
          <div className="flex space-x-2">
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link to="/account">
              <Button>Account</Button>
            </Link>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link to="/login">
              <Button variant="outline">Accedi</Button>
            </Link>
            <Link to="/register">
              <Button>Registrati</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
