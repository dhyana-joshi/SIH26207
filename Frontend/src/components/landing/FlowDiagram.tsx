import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface FlowDiagramProps {
  inverted?: boolean;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ inverted = false }) => {
  const { t } = useLanguage();
  const steps = [
    { label: 'Curriculum', num: 1 },
    { label: 'Extra Skills', num: 2 },
    { label: 'Assess', num: 3 },
    { label: 'Practice', num: 4 },
    { label: 'Research', num: 5 },
    { label: 'Excel', num: 6 },
  ];

  return (
    <div className="w-full select-none py-1.5">
      {/* Upper Track: Connecting Line + 6 Centered Symmetrical Circles */}
      <div className="relative w-full">
        {/* Continuous Horizontal Line passing exactly through circle centers */}
        <div
          className={`absolute top-1/2 left-[8.33%] right-[8.33%] h-[2px] -translate-y-1/2 z-0 ${
            inverted
              ? 'bg-gradient-to-r from-white/20 via-white/45 to-white/20'
              : 'bg-gradient-to-r from-deepblue/20 via-deepblue/40 to-deepblue/20'
          }`}
        />

        {/* 6 Circles symmetrically spaced in a 6-column grid */}
        <div className="grid grid-cols-6 w-full relative z-10">
          {steps.map((step) => (
            <div key={step.num} className="flex justify-center items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 flex items-center justify-center font-display font-bold text-xs sm:text-sm md:text-base transition-all duration-150 shadow-md ${
                  inverted
                    ? 'bg-[#293046] border-white/40 text-cream hover:scale-105 hover:border-white'
                    : 'bg-white border-deepblue/25 text-deepblue hover:scale-105 hover:border-deepblue'
                }`}
              >
                {step.num}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lower Track: Step Labels below each circle */}
      <div className="grid grid-cols-6 w-full mt-2.5">
        {steps.map((step) => (
          <div key={step.num} className="text-center px-0.5 sm:px-1">
            <span
              className={`block text-[10px] sm:text-[11px] md:text-xs font-semibold leading-tight break-words ${
                inverted ? 'text-cream/90' : 'text-deepblue/90'
              }`}
            >
              {t(step.label, step.label)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EcosystemFlow: React.FC = () => {
  const { t } = useLanguage();
  const rows = [
    {
      who: 'Student',
      flow: 'Academic Curriculum + Personal Interests → Diagnostic Test → Adaptive Pathway → Daily Updates → Exam Readiness (Fit Score) → Research Discussion'
    },
    {
      who: 'Institute',
      flow: 'Academic Schedules → Student Progress & Potential → Marks Management → Weak Subject Detection → Targeted Practice → Mentoring'
    },
    {
      who: 'Academician',
      flow: 'Publishes Research Papers → Students Discover & Inquire → Technical Discussions & Mentoring → Direct Academic Impact'
    },
  ];
  return (
    <div className="space-y-3 w-full max-w-full">
      {rows.map((r) => (
        <div
          key={r.who}
          className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-xl border border-deepblue/12 bg-white/60 px-3.5 py-3 sm:px-4 sm:py-3.5 break-words w-full shadow-sm"
        >
          <div className="sm:w-36 shrink-0 font-display font-semibold text-deepblue text-sm sm:text-base">
            {t(r.who, r.who)}
          </div>
          <div className="text-xs sm:text-sm text-deepblue/75 leading-relaxed">{r.flow}</div>
        </div>
      ))}
    </div>
  );
};
