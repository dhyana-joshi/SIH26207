import React from 'react';
import { LandingNav } from './LandingNav';
import { FlowDiagram, EcosystemFlow } from './FlowDiagram';
import { Icon } from '../common/Icon';
import { PORTAL_META } from '../common/PortalShell';
import { useLanguage } from '../../context/LanguageContext';

interface LandingPageProps {
  go: (page: string) => void;
  openAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ go, openAuth }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-cream text-deepblue w-full max-w-full overflow-x-hidden min-h-screen">
      <LandingNav go={go} openAuth={openAuth} />

      {/* HERO — on deep blue (#313851) with cream (#F6F3ED) and soft slate (#C2CBD3) */}
      <section className="bg-deepblue text-cream w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center w-full min-w-0">
          <div className="rise w-full min-w-0">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.1] font-semibold max-w-xl break-words">
              {t('landing.hero_title', 'Master your curriculum. Explore personal passions. One unified ecosystem.')}
            </h1>
            <p className="mt-4 sm:mt-6 text-cream/80 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed break-words">
              {t('landing.hero_desc', 'VidyaSarthi brings formal education and flexible personal learning together. Follow your institute syllabus, track exam readiness with precision, build extra skills through adaptive pathways, and engage directly with cutting-edge academic research.')}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <a
                href="#portal-gateway"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-mutedsage text-deepblue hover:bg-white transition shadow-sm"
              >
                {t('landing.btn_gateway', 'Go to Dedicated Portal Gateway ↓')}
              </a>
              <button
                onClick={() => openAuth('register')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-cream/40 text-cream hover:bg-white/10 transition"
              >
                {t('landing.btn_register', 'Get Started (Register) →')}
              </button>
            </div>
          </div>
          <div className="rise w-full min-w-0 max-w-full" style={{ animationDelay: '.1s' }}>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 w-full min-w-0 max-w-full overflow-hidden shadow-2xl backdrop-blur-sm">
              <FlowDiagram inverted={true} />
              <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">100%</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">
                    {t('landing.stat_curriculum', 'Curriculum + Extra Learning')}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">Fit Score</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">
                    {t('landing.stat_readiness', 'Dynamic Exam Readiness')}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">Daily</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">
                    {t('landing.stat_weak', 'Targeted Weak Subject Practice')}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">Live</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">
                    {t('landing.stat_discussions', 'Academician Research Discussions')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CORE ROLES — EXACTLY 3 PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full overflow-hidden">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              {t('landing.pillars_title', 'Three pillars. One connected educational ecosystem.')}
            </h2>
            <p className="text-xs sm:text-sm text-deepblue/60 mt-1 max-w-md">
              {t('landing.pillars_desc', 'Connecting student learning journeys, institutional monitoring & guidance, and academic research sharing.')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
          {(['student', 'institute', 'academician'] as const).map((k) => {
            const m = PORTAL_META[k];
            return (
              <div
                key={k}
                className="text-left rounded-2xl border border-deepblue/12 bg-white p-6 sm:p-7 shadow-sm w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-mutedsage/50 flex items-center justify-center mb-4">
                  <Icon name={m.icon} className="w-6 h-6 text-deepblue" />
                </div>
                <div className="font-display text-xl font-semibold mb-2 text-deepblue">
                  {t(`landing.pillar_${k}_title`, `${m.label} Ecosystem`)}
                </div>
                <p className="text-xs sm:text-sm text-deepblue/65 leading-relaxed">
                  {t(`landing.pillar_${k}_desc`, m.blurb)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DUAL-TRACK LEARNING VALUE PROPOSITION */}
      <section className="bg-mutedsage/25 border-y border-deepblue/10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full min-w-0">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-deepblue uppercase tracking-wider">
              {t('landing.diff_tag', 'The VidyaSarthi Difference')}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-1">
              {t('landing.diff_title', 'Dual-Track Learning: Curriculum + Passion')}
            </h2>
            <p className="text-xs sm:text-sm text-deepblue/70 mt-2 leading-relaxed">
              {t('landing.diff_desc', 'Most platforms either trap students in a rigid course or ignore their official college curriculum. VidyaSarthi balances both:')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-[#E1D6AE] p-6 shadow-sm">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-sagedeep/10 text-sagedeep text-xs font-bold uppercase mb-3">
                {t('landing.track_a_badge', 'Track A: Academic Curriculum')}
              </div>
              <h3 className="font-display text-lg font-semibold text-deepblue mb-2">
                {t('landing.track_a_title', 'School & College Syllabus Management')}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-deepblue/75">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <span>
                    <strong>{t('landing.track_a_item1_strong', 'Syllabus Progress & Fit Score:')}</strong>{' '}
                    {t('landing.track_a_item1_text', 'Know exactly what percent of your syllabus is complete and your exam readiness.')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <span>
                    <strong>{t('landing.track_a_item2_strong', 'Weak-Subject Detection:')}</strong>{' '}
                    {t('landing.track_a_item2_text', 'System analyzes exam marks and triggers automated daily practice tests.')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <span>
                    <strong>{t('landing.track_a_item3_strong', 'Institute Timetable Sync:')}</strong>{' '}
                    {t('landing.track_a_item3_text', 'Classes, midterm exams, and practical schedules directly on your dashboard.')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <span>
                    <strong>{t('landing.track_a_item4_strong', 'Institute Mentoring & Queries:')}</strong>{' '}
                    {t('landing.track_a_item4_text', 'Ask academic doubts directly to faculty with resolved tracking.')}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-[#E1D6AE] p-6 shadow-sm">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-deepblue/10 text-deepblue text-xs font-bold uppercase mb-3">
                {t('landing.track_b_badge', 'Track B: Additional Learning')}
              </div>
              <h3 className="font-display text-lg font-semibold text-deepblue mb-2">
                {t('landing.track_b_title', 'Personal Interests, Emerging Tech & Skills')}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-deepblue/75">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <span>
                    <strong>{t('landing.track_b_item1_strong', 'Diverse Subjects:')}</strong>{' '}
                    {t('landing.track_b_item1_text', 'Python, AI, Robotics, Data Science, Web Dev, Finance, Design, Psychology, and more.')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <span>
                    <strong>{t('landing.track_b_item2_strong', 'Diagnostic Knowledge Assessment:')}</strong>{' '}
                    {t('landing.track_b_item2_text', 'Discrete initial test determines your starting point (Beginner/Intermediate/Advanced).')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <span>
                    <strong>{t('landing.track_b_item3_strong', 'Adaptive Pathways:')}</strong>{' '}
                    {t('landing.track_b_item3_text', 'Step-by-step topic nodes that dynamically advance or provide revision based on practice.')}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <span>
                    <strong>{t('landing.track_b_item4_strong', 'AI-Assisted Timetable:')}</strong>{' '}
                    {t('landing.track_b_item4_text', 'Intelligently blends institute schedules, extra learning, and personal sports/free time.')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM FLOW */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full min-w-0">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
          {t('landing.flow_title', 'How information moves between roles')}
        </h2>
        <p className="text-xs sm:text-sm text-deepblue/65 mb-6 sm:mb-8 max-w-xl">
          {t('landing.flow_desc', 'Nothing lives in isolation — academic schedules, daily learning updates, diagnostic tests, and research discussions feed into one continuous growth loop.')}
        </p>
        <EcosystemFlow />
      </section>

      {/* EXCLUSIVE DEDICATED PORTAL GATEWAY SECTION */}
      <section id="portal-gateway" className="bg-deepblue text-cream w-full overflow-hidden scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-mutedsage uppercase tracking-wider">
              {t('landing.gateway_tag', 'Unified Platform Access')}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold mt-1">
              {t('landing.gateway_title', 'Dedicated Portal Gateway')}
            </h2>
            <p className="text-xs sm:text-sm text-cream/70 mt-2">
              {t('landing.gateway_desc', 'Select your role below to enter your specialized workspace, tools, and analytics.')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
            {(['student', 'institute', 'academician'] as const).map((k) => {
              const m = PORTAL_META[k];
              return (
                <button
                  key={k}
                  onClick={() => go(k)}
                  className="rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 p-6 sm:p-7 text-left transition transform hover:-translate-y-1 hover:shadow-xl focus-ring w-full group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition">
                      <Icon name={m.icon} className="w-6 h-6 text-mutedsage" />
                    </div>
                    <div className="font-display font-bold text-xl text-cream mb-2">
                      {t(`nav.${k}_portal`, `${m.label} Portal`)}
                    </div>
                    <p className="text-xs text-cream/70 leading-relaxed mb-6">
                      {t(`landing.pillar_${k}_desc`, m.blurb)}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-mutedsage group-hover:text-cream transition">
                    <span>{t(`landing.btn_enter_${k}`, `Enter ${m.label} Portal`)}</span>
                    <Icon name="arrowr" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-xs text-deepblue/50 flex flex-wrap items-center justify-between gap-3 w-full border-t border-deepblue/10">
        <span>{t('landing.footer_text', '© 2026 VidyaSarthi — Flexible Educational Ecosystem & Skill Intelligence Platform.')}</span>
        <span>{t('landing.badge_roles', 'Students • Institutes • Academicians')}</span>
      </footer>
    </div>
  );
};
