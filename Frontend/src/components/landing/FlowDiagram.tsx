import React, { Fragment } from 'react';

interface FlowDiagramProps {
  inverted?: boolean;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ inverted = false }) => {
  const steps = ['Curriculum', 'Extra Skills', 'Assess', 'Practice', 'Research', 'Excel'];
  return (
    <div className="w-full max-w-full overflow-hidden px-1 py-1">
      <div className="flex items-center justify-between w-full max-w-full">
        {steps.map((s, i) => (
          <Fragment key={s}>
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center font-display text-xs sm:text-sm md:text-base transition-transform ${
                  inverted
                    ? 'bg-white/10 border-white/25 text-cream shadow-inner'
                    : 'bg-mutedsage/40 border-deepblue/15 text-deepblue'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] md:text-xs font-semibold mt-1 text-center leading-tight max-w-[58px] ${
                  inverted ? 'text-cream/80' : 'text-deepblue/80'
                }`}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 min-w-[4px] sm:min-w-[8px] max-w-[28px] h-[2px] -mt-3 sm:-mt-3.5 md:-mt-4 shrink transition-opacity ${
                  inverted
                    ? 'bg-gradient-to-r from-white/30 via-white/40 to-white/30'
                    : 'bg-gradient-to-r from-deepblue/25 via-deepblue/40 to-deepblue/25'
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export const EcosystemFlow: React.FC = () => {
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
          <div className="sm:w-36 shrink-0 font-display font-semibold text-deepblue text-sm sm:text-base">{r.who}</div>
          <div className="text-xs sm:text-sm text-deepblue/75 leading-relaxed">{r.flow}</div>
        </div>
      ))}
    </div>
  );
};
