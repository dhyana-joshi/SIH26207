import React from 'react';
import { Button } from '../common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';

interface LandingNavProps {
  go: (page: string) => void;
  openAuth: (mode: 'login' | 'register') => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ go, openAuth }) => {
  const { currentUser, logout } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const userPortalKey = currentUser ? currentUser.role : null;

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur bg-deepblue/90 text-cream w-full max-w-full overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top,0px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
        <button
          onClick={() => go(userPortalKey || 'landing')}
          className="font-display text-xl font-semibold tracking-tight focus-ring rounded"
        >
          VidyaSarthi
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-xl text-xs border border-white/20 transition">
            <span className="text-sm">🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-cream text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              aria-label="Select Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="text-slate-900 bg-white">
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-cream/80">
                Hi, <strong className="text-cream">{currentUser.name}</strong>
              </span>
              <Button
                variant="outline"
                className="border-cream/40 text-cream hover:bg-white/10 text-xs px-3 py-1.5"
                onClick={() => go(currentUser.role)}
              >
                {t('nav.my_portal', 'My Portal')}
              </Button>
              <Button
                variant="ghost"
                className="text-xs text-cream/70 hover:text-cream px-2 py-1.5"
                onClick={logout}
              >
                {t('nav.sign_out', 'Log out')}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-cream/40 text-cream hover:bg-white/10 text-xs sm:text-sm px-3.5 py-1.5 font-semibold"
              onClick={() => openAuth('login')}
            >
              {t('nav.sign_in', 'Log in')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
