import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  PageHeader,
  StatBlock,
  Tag,
  ProgressBar,
  Modal,
  SearchInput,
  EmptyState,
  VerifiedBadge
} from '../common/UIComponents';
import { Icon } from '../common/Icon';
import { studentApi } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import {
  StudentLearningProfile,
  LearningPathway,
  PathwayTopic,
  SyllabusProgressItem,
  DailySyllabusUpdate,
  InstituteScheduleItem,
  PersonalScheduleItem,
  PracticeTestQuestion,
  PracticeTestRecord,
  InstituteQueryItem,
  InstituteGuidanceItem,
  ResearchPaper,
  EducationalOpportunity,
  UpcomingExamMeterData,
  SkillGrowthMetrics,
  PotentialBreakdown,
  KnowledgeGapFeedbackItem,
  BacklogItem,
  TabularScheduleMatrix
} from '../../types';

// =========================================================================
// 0. STUDENT CURRICULUM INTAKE MODAL
// =========================================================================

export const StudentIntakeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProfile?: StudentLearningProfile | null;
}> = ({ isOpen, onClose, onSuccess, initialProfile }) => {
  const [classYear, setClassYear] = useState(initialProfile?.academic_class || '');
  const [curriculum, setCurriculum] = useState(initialProfile?.board_curriculum || '');
  const [selectedAcademic, setSelectedAcademic] = useState<string[]>(
    initialProfile?.academic_subjects_list && initialProfile.academic_subjects_list.length > 0
      ? initialProfile.academic_subjects_list
      : []
  );
  const [customAcademic, setCustomAcademic] = useState('');
  const [selectedExtra, setSelectedExtra] = useState<string[]>(
    initialProfile?.additional_skills_list && initialProfile.additional_skills_list.length > 0
      ? initialProfile.additional_skills_list
      : []
  );
  const [customExtra, setCustomExtra] = useState('');
  const [sportsPreference, setSportsPreference] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(initialProfile?.preferred_language || 'English');
  const [knowledgeLevel, setKnowledgeLevel] = useState(initialProfile?.knowledge_level || 'Intermediate');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const ACADEMIC_PRESETS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Data Structures & Algorithms', 'Operating Systems',
    'Database Management Systems', 'Economics', 'Financial Accounting'
  ];

  const EXTRA_PRESETS = [
    'Artificial Intelligence & Machine Learning', 'Web Development',
    'Cybersecurity', 'Python Programming', 'Robotics & IoT',
    'Cloud Computing', 'UI/UX Design', 'Quantitative Finance'
  ];

  const CLASS_OPTIONS = [
    'Class 9', 'Class 10', 'Class 11', 'Class 12',
    '1st Year B.Tech / B.E.', '2nd Year B.Tech / B.E.', '3rd Year B.Tech / B.E.', '4th Year B.Tech / B.E.',
    '1st Year B.Sc / B.Com / BCA', '2nd Year B.Sc / B.Com / BCA', '3rd Year B.Sc / B.Com / BCA',
    'Postgraduate / Masters', 'Other'
  ];

  const CURRICULUM_OPTIONS = [
    'CBSE', 'ICSE / ISC', 'Gujarat State Board (GSEB)', 'Maharashtra State Board (HSC)',
    'Computer Science & Engineering (University Syllabus)',
    'Electronics & Communication Engineering',
    'Mechanical / Civil Engineering',
    'Commerce & Business Administration (University Syllabus)',
    'Medical & Health Sciences (NEET / University Syllabus)',
    'Other / Autonomous Curriculum'
  ];

  const toggleAcademic = (sub: string) => {
    setSelectedAcademic((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleExtra = (sub: string) => {
    setSelectedExtra((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleAddCustomAcademic = () => {
    if (customAcademic.trim() && !selectedAcademic.includes(customAcademic.trim())) {
      setSelectedAcademic([...selectedAcademic, customAcademic.trim()]);
      setCustomAcademic('');
    }
  };

  const handleAddCustomExtra = () => {
    if (customExtra.trim() && !selectedExtra.includes(customExtra.trim())) {
      setSelectedExtra([...selectedExtra, customExtra.trim()]);
      setCustomExtra('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classYear) {
      alert('Please select your academic class/year.');
      return;
    }
    if (!curriculum) {
      alert('Please select your board or university curriculum.');
      return;
    }
    if (selectedAcademic.length === 0) {
      alert('Please select at least one core academic subject.');
      return;
    }
    setSubmitting(true);
    try {
      await studentApi.completeOnboarding({
        class_year: classYear,
        college: initialProfile?.college || 'Institute',
        curriculum,
        academic_subjects: selectedAcademic.join(', '),
        interested_subjects: selectedExtra.join(', '),
        additional_skills: selectedExtra.join(', '),
        preferred_language: preferredLanguage,
        knowledge_level: knowledgeLevel,
        sports_preference: sportsPreference
      });
      onSuccess();
      onClose();
    } catch {
      alert('Failed to save curriculum intake. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Curriculum & Learning Routine Intake" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
          <strong>Personalize Your VidyaSarthi Learning Plan:</strong> Tell us your academic grade, core subjects, extra emerging skills, and sports routine. Our system will generate your calibrated dual-track roadmaps, conflict-free timetable, and diagnostic tests.
        </div>

        {/* 1. Grade and Curriculum */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Academic Class / Year <span className="text-rose-600">*</span></label>
            <select
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              <option value="">-- Select Class / Year --</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Board / Curriculum <span className="text-rose-600">*</span></label>
            <select
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              <option value="">-- Select Board / Curriculum --</option>
              {CURRICULUM_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Track 1: Core Academic Subjects */}
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Track 1: Enrolled College / School Academic Subjects (Select All That Apply)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {ACADEMIC_PRESETS.map((sub) => {
              const active = selectedAcademic.includes(sub);
              return (
                <button
                  type="button"
                  key={sub}
                  onClick={() => toggleAcademic(sub)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                    active
                      ? 'bg-sagedeep text-pcream border-sagedeep font-bold'
                      : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
                  }`}
                >
                  {active ? '✓ ' : '+ '}{sub}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAcademic}
              onChange={(e) => setCustomAcademic(e.target.value)}
              placeholder="Add other academic subject..."
              className="flex-1 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
            />
            <Button variant="outline" size="sm" type="button" onClick={handleAddCustomAcademic}>
              Add
            </Button>
          </div>
        </div>

        {/* 3. Track 2: Extra Skills / Electives */}
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Track 2: Extra Skills & Emerging Technologies (Personal Growth)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {EXTRA_PRESETS.map((sub) => {
              const active = selectedExtra.includes(sub);
              return (
                <button
                  type="button"
                  key={sub}
                  onClick={() => toggleExtra(sub)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                    active
                      ? 'bg-purple-700 text-white border-purple-700 font-bold'
                      : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-purple-50'
                  }`}
                >
                  {active ? '✓ ' : '+ '}{sub}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customExtra}
              onChange={(e) => setCustomExtra(e.target.value)}
              placeholder="Add other skill or interest..."
              className="flex-1 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
            />
            <Button variant="outline" size="sm" type="button" onClick={handleAddCustomExtra}>
              Add
            </Button>
          </div>
        </div>

        {/* 4. Sports & Extracurriculars Routine */}
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Daily Sports, Fitness & Free-Time Schedule
          </label>
          <input
            type="text"
            required
            value={sportsPreference}
            onChange={(e) => setSportsPreference(e.target.value)}
            placeholder="e.g. Cricket practice 4:30 PM - 5:30 PM daily, Gym 6:00 AM - 7:00 AM"
            className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            The AI timetable scheduler automatically reserves this block exclusively for your sports/hobbies without scheduling study or revision conflicts.
          </p>
        </div>

        {/* 5. Language & Starting Knowledge Level */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Preferred Learning Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Self-Assessed Knowledge Level</label>
            <select
              value={knowledgeLevel}
              onChange={(e) => setKnowledgeLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              <option value="Beginner">Beginner (Foundations First)</option>
              <option value="Intermediate">Intermediate (Core & Application)</option>
              <option value="Advanced">Advanced (Deep Dive & Research)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Calibrating Plan...' : '⚡ Save & Generate Dual-Track Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// PICTORIAL METERS: EXAM READINESS & SKILL VELOCITY GAUGE
// =========================================================================

export const UpcomingExamSyllabusGauge: React.FC<{
  currentPct: number;
  targetPct?: number;
  examTitle?: string;
  examDate?: string;
  daysRemaining?: number;
  pacingStatus?: string;
}> = ({
  currentPct = 68.5,
  targetPct = 70,
  examTitle = 'Midterm Examination: Physics & Mathematics',
  examDate = 'Oct 15, 2026',
  daysRemaining = 19,
  pacingStatus = 'On Track'
}) => {
  const { t } = useLanguage();
  const cur = Math.max(0, Math.min(100, Math.round(currentPct * 10) / 10));
  const tgt = Math.max(1, Math.min(100, Math.round(targetPct * 10) / 10));
  const fractionOfTarget = Math.min(100, Math.round((cur / tgt) * 100));

  const r = 62;
  const cx = 90;
  const cy = 76;
  const arcLen = Math.PI * r;
  // Subtract half stroke-width (5.5) when 0 < cur < 100 so the round stroke cap lands right at the needle tip
  const fillOffset = Math.min(
    arcLen,
    Math.max(0, arcLen * (1 - cur / 100) + (cur > 0 && cur < 100 ? 5.5 : 0))
  );

  const isTargetAchieved = cur >= tgt;
  const toneColor = isTargetAchieved
    ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
    : cur >= tgt * 0.8
    ? 'text-amber-800 bg-amber-100 border-amber-300'
    : 'text-rose-800 bg-rose-100 border-rose-300';

  return (
    <Card className="p-5 flex flex-col justify-between overflow-hidden relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <h3 className="font-display font-bold text-sm text-[#2C3524]">
            {t('meter.exam_target', 'Exam Syllabus Target Meter')}
          </h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${toneColor}`}>
          {pacingStatus}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
        {/* Semi-circular Radial Speedometer SVG */}
        <div className="relative w-48 h-28 shrink-0 flex items-end justify-center">
          <svg viewBox="0 0 180 95" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="examGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E07A5F" />
                <stop offset="45%" stopColor="#F4A261" />
                <stop offset="70%" stopColor="#A3B18A" />
                <stop offset="100%" stopColor="#588157" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <path
              d="M 28 76 A 62 62 0 0 1 152 76"
              fill="none"
              stroke="#E1D6AE"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Progress Arc */}
            <path
              d="M 28 76 A 62 62 0 0 1 152 76"
              fill="none"
              stroke="url(#examGaugeGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={arcLen}
              strokeDashoffset={fillOffset}
              className="transition-all duration-1000 ease-out"
            />

            {/* Sharp Precision Pointer Needle */}
            <g transform={`rotate(${(cur / 100) * 180 - 90}, ${cx}, ${cy})`}>
              <polygon
                points={`${cx - 2.5},${cy} ${cx},${cy - 62} ${cx + 2.5},${cy} ${cx},${cy + 7}`}
                fill="#2C3524"
              />
              <circle cx={cx} cy={cy} r="5" fill="#2C3524" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="2" fill="#E07A5F" />
            </g>

            <text x="24" y="90" fontSize="9" fill="#556248" fontWeight="bold">0%</text>
            <text x="146" y="90" fontSize="9" fill="#556248" fontWeight="bold">100%</text>
          </svg>

          {/* Center value readout */}
          <div className="absolute bottom-0 text-center">
            <div className="font-display font-extrabold text-2xl text-[#2C3524] leading-tight">
              {cur}%
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium">Syllabus Covered</div>
          </div>
        </div>

        {/* Exam Pacing Details */}
        <div className="space-y-2 text-xs flex-1 w-full bg-pcream/40 p-3 rounded-xl border border-[#E1D6AE]">
          <div className="flex items-center justify-between gap-2 font-semibold text-[#2C3524]">
            <span className="truncate" title={examTitle}>📅 {examTitle}</span>
            <span className="text-[11px] font-mono text-sagedeep font-bold shrink-0 whitespace-nowrap">
              {daysRemaining}d left
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Exam Date: <strong>{examDate}</strong> • Target: <strong>{tgt}% of syllabus</strong>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#2C3524] mb-1">
              <span>Exam Threshold Pacing</span>
              <span className="shrink-0 whitespace-nowrap">{cur}% / {tgt}% ({fractionOfTarget}%)</span>
            </div>
            <div className="w-full bg-[#E1D6AE] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isTargetAchieved ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
                style={{ width: `${fractionOfTarget}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const SkillGrowthVelocityGauge: React.FC<{
  currentPct: number;
  baselinePct: number;
  growthDelta: number;
  milestoneStage?: string;
  milestones?: { label: string; pct: number; achieved: boolean }[];
}> = ({
  currentPct = 78,
  baselinePct = 22,
  growthDelta = 56,
  milestoneStage = 'Exam Ready & Proficient',
  milestones
}) => {
  const { t } = useLanguage();
  const cur = Math.max(0, Math.min(100, Math.round(currentPct * 10) / 10));
  const base = Math.max(0, Math.min(100, Math.round(baselinePct * 10) / 10));
  const delta = Math.max(0, Math.round(growthDelta * 10) / 10);

  const r = 62;
  const cx = 90;
  const cy = 76;
  const arcLen = Math.PI * r;

  const strokeOffset = Math.min(
    arcLen,
    Math.max(0, arcLen * (1 - cur / 100) + (cur > 0 && cur < 100 ? 5.5 : 0))
  );

  const defaultMilestones = [
    { label: 'Intake Baseline', pct: 22, achieved: true },
    { label: 'Foundations', pct: 45, achieved: cur >= 45 },
    { label: 'Applied Mastery', pct: 65, achieved: cur >= 65 },
    { label: 'Exam Ready', pct: 75, achieved: cur >= 75 },
    { label: 'Top Tier Scholar', pct: 90, achieved: cur >= 90 }
  ];
  const activeMilestones = milestones && milestones.length > 0 ? milestones : defaultMilestones;

  return (
    <Card className="p-5 flex flex-col justify-between overflow-hidden relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <h3 className="font-display font-bold text-sm text-[#2C3524]">
            {t('meter.skill_growth', 'Skill Readiness & Growth Meter')}
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-300 bg-emerald-100 text-emerald-800">
          +{delta}% {t('meter.distance_traveled', 'Distance Traveled')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
        {/* Semi-circular Radial SVG Gauge with Pointer Needle */}
        <div className="relative w-48 h-28 shrink-0 flex items-end justify-center">
          <svg viewBox="0 0 180 95" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="growthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3A86FF" />
                <stop offset="60%" stopColor="#4361EE" />
                <stop offset="100%" stopColor="#2A9D8F" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 28 76 A 62 62 0 0 1 152 76"
              fill="none"
              stroke="#E1D6AE"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Traveled Growth Path */}
            <path
              d="M 28 76 A 62 62 0 0 1 152 76"
              fill="none"
              stroke="url(#growthGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={arcLen}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-1000 ease-out"
            />

            {/* Sharp Precision Pointer Needle */}
            <g transform={`rotate(${(cur / 100) * 180 - 90}, ${cx}, ${cy})`}>
              <polygon
                points={`${cx - 2.5},${cy} ${cx},${cy - 62} ${cx + 2.5},${cy} ${cx},${cy + 7}`}
                fill="#2C3524"
              />
              <circle cx={cx} cy={cy} r="5" fill="#2C3524" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="2" fill="#2A9D8F" />
            </g>

            <text x="24" y="90" fontSize="9" fill="#556248" fontWeight="bold">0%</text>
            <text x="146" y="90" fontSize="9" fill="#556248" fontWeight="bold">100%</text>
          </svg>

          {/* Center value readout */}
          <div className="absolute bottom-0 text-center">
            <div className="font-display font-extrabold text-2xl text-[#2C3524] leading-tight">
              {cur}%
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium">Skill Competency</div>
          </div>
        </div>

        {/* Milestone Progression & Distance Traveled info */}
        <div className="space-y-2 text-xs flex-1 w-full bg-blue-50/50 p-3 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between font-semibold text-blue-950">
            <span>🚀 Starting Point: {base}%</span>
            <span className="text-emerald-700 font-bold">Current: {cur}%</span>
          </div>
          <p className="text-[11px] text-blue-900/80 leading-snug">
            Advanced <strong>{delta} percentage points</strong> from intake baseline via practice mastery and continuous syllabus logs.
          </p>
          <div className="pt-1">
            <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
              Active Milestone Tier: {milestoneStage}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {activeMilestones.map((m, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    m.achieved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white/80 text-[var(--text-muted)] border border-blue-100'
                  }`}
                >
                  {m.achieved ? '✓' : '○'} {m.label} ({m.pct}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const EducationalPotentialCard: React.FC<{
  potentialScore: number;
  potentialTier?: string;
  potentialBreakdown?: PotentialBreakdown;
  potentialInsights?: string;
  isFirstTime?: boolean;
}> = ({
  potentialScore = 78,
  potentialTier = 'High Potential (Accelerating)',
  potentialBreakdown,
  potentialInsights,
  isFirstTime = false
}) => {
  const consistency = potentialBreakdown?.consistency_effort ?? 19.5;
  const practice = potentialBreakdown?.practice_mastery ?? 20.2;
  const growth = potentialBreakdown?.growth_velocity ?? 23.9;
  const skill = potentialBreakdown?.skill_investment ?? 15.0;

  return (
    <Card className="p-5 border border-[#E1D6AE] bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-[#2C3524]">
              Educational Potential Index
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sagedeep/10 text-sagedeep border border-sagedeep/20">
              {isFirstTime ? 'Intake Pending' : potentialTier}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Formulaic index evaluating daily consistency streak, practice mastery, baseline delta, and extracurricular skill hours.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-display font-extrabold text-2xl text-sagedeep">
            {isFirstTime ? 0 : potentialScore}
          </span>
          <span className="text-xs text-[var(--text-muted)] font-bold"> / 100</span>
        </div>
      </div>

      {/* 4-Factor Metric Breakdown Bars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-pcream/30 border border-[#E1D6AE]">
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-[#2C3524]">Consistency & Effort</span>
            <span className="font-bold text-sagedeep">{isFirstTime ? 0 : consistency} / 25</span>
          </div>
          <ProgressBar value={isFirstTime ? 0 : (consistency / 25) * 100} colorClass="bg-sagedeep" />
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Daily logs & schedule adherence</span>
        </div>

        <div className="p-3 rounded-xl bg-pcream/30 border border-[#E1D6AE]">
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-[#2C3524]">Practice Mastery</span>
            <span className="font-bold text-blue-700">{isFirstTime ? 0 : practice} / 30</span>
          </div>
          <ProgressBar value={isFirstTime ? 0 : (practice / 30) * 100} colorClass="bg-blue-600" />
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Quiz accuracy & concept retention</span>
        </div>

        <div className="p-3 rounded-xl bg-pcream/30 border border-[#E1D6AE]">
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-[#2C3524]">Growth Velocity</span>
            <span className="font-bold text-purple-700">{isFirstTime ? 0 : growth} / 25</span>
          </div>
          <ProgressBar value={isFirstTime ? 0 : (growth / 25) * 100} colorClass="bg-purple-600" />
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Distance traveled from intake</span>
        </div>

        <div className="p-3 rounded-xl bg-pcream/30 border border-[#E1D6AE]">
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-[#2C3524]">Skill Learning</span>
            <span className="font-bold text-amber-700">{isFirstTime ? 0 : skill} / 20</span>
          </div>
          <ProgressBar value={isFirstTime ? 0 : (skill / 20) * 100} colorClass="bg-amber-600" />
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Extra technical tracks logged</span>
        </div>
      </div>

      {potentialInsights && !isFirstTime && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <span>💡</span>
          <span>{potentialInsights}</span>
        </div>
      )}
    </Card>
  );
};

// =========================================================================
// SCHEDULE STATUS & TIME PARSING HELPERS
// =========================================================================

export const getCurrentDayOfWeek = (): string => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[new Date().getDay()];
};

export const parseTimeToMinutes = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  const matchAmPm = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (matchAmPm) {
    let hours = parseInt(matchAmPm[1], 10);
    const minutes = parseInt(matchAmPm[2], 10);
    const period = matchAmPm[3] ? matchAmPm[3].toUpperCase() : null;
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const parts = clean.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
  }
  return null;
};

export const getSlotTimeStatus = (
  dayOfWeek?: string,
  startTime?: string,
  endTime?: string,
  isExplicitlyCompleted?: boolean | number
): {
  isToday: boolean;
  isPassed: boolean;
  isActive: boolean;
  isFuture: boolean;
} => {
  const today = getCurrentDayOfWeek();
  const isToday = !dayOfWeek || dayOfWeek.trim().toLowerCase() === today.toLowerCase();

  if (Boolean(isExplicitlyCompleted)) {
    return { isToday, isPassed: true, isActive: false, isFuture: false };
  }

  if (!isToday) {
    return { isToday: false, isPassed: false, isActive: false, isFuture: true };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (endMinutes !== null && currentMinutes >= endMinutes) {
    return { isToday: true, isPassed: true, isActive: false, isFuture: false };
  }
  if (startMinutes !== null && endMinutes !== null && currentMinutes >= startMinutes && currentMinutes < endMinutes) {
    return { isToday: true, isPassed: false, isActive: true, isFuture: false };
  }
  return { isToday: true, isPassed: false, isActive: false, isFuture: true };
};

// =========================================================================
// 1. STUDENT OVERVIEW DASHBOARD
// =========================================================================

export const StudentOverview: React.FC<{
  onTabChange: (tab: string) => void;
  onOpenPractice: (subject?: string) => void;
  onOpenDailyUpdate: () => void;
  onOpenDiagnostic: (subject: string) => void;
  onSelectPathway?: (subject: string) => void;
}> = ({ onTabChange, onOpenPractice, onOpenDailyUpdate, onOpenDiagnostic, onSelectPathway }) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<StudentLearningProfile | null>(null);
  const [syllabusList, setSyllabusList] = useState<SyllabusProgressItem[]>([]);
  const [weakInfo, setWeakInfo] = useState<{ weak_subjects: any[]; recommendation: string } | null>(null);
  const [schedules, setSchedules] = useState<{ personal: PersonalScheduleItem[]; institute: InstituteScheduleItem[] }>({
    personal: [],
    institute: []
  });
  const [potentialScore, setPotentialScore] = useState<number>(0);
  const [potentialTier, setPotentialTier] = useState<string>('Foundation Building');
  const [potentialBreakdown, setPotentialBreakdown] = useState<PotentialBreakdown | undefined>(undefined);
  const [potentialInsights, setPotentialInsights] = useState<string>('');
  const [upcomingExam, setUpcomingExam] = useState<UpcomingExamMeterData | null>(null);
  const [skillGrowth, setSkillGrowth] = useState<SkillGrowthMetrics | null>(null);
  const [progressRate, setProgressRate] = useState<number>(0.0);
  const [loading, setLoading] = useState(true);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeDismissed, setIntakeDismissed] = useState(false);

  const loadOverview = async () => {
    try {
      const [profRes, syllRes, weakRes, schedRes] = await Promise.allSettled([
        studentApi.getProfile(),
        studentApi.getSyllabus(),
        studentApi.getWeakSubjects(),
        studentApi.getSchedules()
      ]);

      let profData: StudentLearningProfile | null = null;
      if (profRes.status === 'fulfilled' && profRes.value?.profile) {
        profData = profRes.value.profile;
        setProfile(profData);
      }
      let syllData: SyllabusProgressItem[] = [];
      if (syllRes.status === 'fulfilled' && syllRes.value) {
        syllData = syllRes.value.syllabus_progress || [];
        setSyllabusList(syllData);
        if (syllRes.value.potential_score !== undefined) setPotentialScore(syllRes.value.potential_score);
        if (syllRes.value.potential_tier) setPotentialTier(syllRes.value.potential_tier);
        if (syllRes.value.potential_breakdown) setPotentialBreakdown(syllRes.value.potential_breakdown);
        if (syllRes.value.potential_insights) setPotentialInsights(syllRes.value.potential_insights);
        if (syllRes.value.syllabus_progress_rate !== undefined) setProgressRate(syllRes.value.syllabus_progress_rate);
        if (syllRes.value.upcoming_exam) setUpcomingExam(syllRes.value.upcoming_exam);
        if (syllRes.value.skill_growth) setSkillGrowth(syllRes.value.skill_growth);
      }
      if (weakRes.status === 'fulfilled' && weakRes.value) {
        setWeakInfo({
          weak_subjects: weakRes.value.weak_subjects || [],
          recommendation: weakRes.value.recommendation || ''
        });
      }
      if (schedRes.status === 'fulfilled' && schedRes.value) {
        setSchedules({
          personal: schedRes.value.personal_schedules || [],
          institute: schedRes.value.institute_schedules || []
        });
      }

      // Check if user is first-time (intake required)
      const isFirst = !profData?.academic_class || !profData?.board_curriculum || syllData.length === 0;
      if (isFirst && !intakeDismissed) {
        setShowIntakeModal(true);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const isFirstTime = !profile?.academic_class || !profile?.board_curriculum || syllabusList.length === 0;

  const avgFitScore = syllabusList.length
    ? Math.round(syllabusList.reduce((acc, s) => acc + (s.exam_readiness_score || 0), 0) / syllabusList.length)
    : 0;

  const avgSyllabusProgress = syllabusList.length
    ? Math.round(syllabusList.reduce((acc, s) => acc + (s.completed_percentage || 0), 0) / syllabusList.length)
    : 0;

  const getFitBadge = (score: number) => {
    if (score >= 90) return { label: 'High Mastery', tone: 'sage' as const };
    if (score >= 75) return { label: 'Exam Ready', tone: 'sage' as const };
    if (score >= 50) return { label: 'Moderate Prep', tone: 'amber' as const };
    return { label: 'At Risk', tone: 'rose' as const };
  };

  const fitBadge = getFitBadge(avgFitScore);

  return (
    <div className="space-y-6">
      {/* First-Time Student Intake Banner */}
      {isFirstTime && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <span>⚡</span> {t('greeting.action_required', 'Action Required • Initial Profile Intake')}
            </div>
            <h2 className="font-display text-lg font-bold text-amber-950">
              {t('greeting.welcome', 'Welcome to VidyaSarthi')}, {profile?.name || 'Student'}!
            </h2>
            <p className="text-xs text-amber-900/80 max-w-2xl leading-relaxed">
              {t('greeting.intake_desc', 'Your profile currently has no curriculum subjects enrolled. Complete your initial intake to select your grade/class, academic subjects, extra skills, and sports routine.')}
            </p>
          </div>
          <Button
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 shadow-sm"
            onClick={() => setShowIntakeModal(true)}
          >
            {t('action.complete_intake', 'Complete Intake')} →
          </Button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E1D6AE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-sagedeep px-2.5 py-0.5 rounded-full bg-sagedeep/10">
              {profile?.academic_class || 'Intake Pending'} • {profile?.college || 'Institute of Technology'}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Board: {profile?.board_curriculum || 'Pending Intake'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2C3524]">
            {isFirstTime
              ? `${t('greeting.welcome', 'Welcome to VidyaSarthi')}, ${profile?.name || 'Student'}!`
              : `${t('greeting.welcome_back', 'Welcome back')}, ${profile?.name || 'Student'}!`}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {isFirstTime
              ? t('greeting.intake_desc', 'Complete your initial curriculum intake below to calibrate your dual-track syllabus, AI timetable, and diagnostic tests.')
              : t('greeting.dual_track_desc', 'Dual-track academic & skill dashboard. You are on track for upcoming mid-terms.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isFirstTime ? (
            <Button variant="primary" onClick={() => setShowIntakeModal(true)}>
              <Icon name="pencil" className="w-4 h-4 mr-1.5" />
              {t('action.complete_intake', 'Complete Intake')}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onOpenDailyUpdate}>
                <Icon name="pencil" className="w-4 h-4 mr-1.5" />
                {t('action.daily_update', "Log Today's Topics")}
              </Button>
              <Button variant="primary" onClick={() => onOpenPractice()}>
                <Icon name="target" className="w-4 h-4 mr-1.5" />
                {t('action.today_quiz', "Today's Practice Test")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock
          label={t('meter.overall_fit', 'Overall Fit Score (Exam Readiness)')}
          value={isFirstTime ? '0%' : `${avgFitScore}%`}
          change={isFirstTime ? 'Intake Pending' : fitBadge.label}
          tone={isFirstTime ? 'amber' : fitBadge.tone}
        />
        <StatBlock
          label={t('meter.syllabus_covered', 'Syllabus Completed')}
          value={isFirstTime ? '0%' : `${avgSyllabusProgress}%`}
          change={isFirstTime ? 'No subjects enrolled' : 'Across all enrolled subjects'}
          tone={isFirstTime ? 'amber' : 'default'}
        />
        <StatBlock
          label={t('meter.potential_index', 'Educational Potential Index')}
          value={isFirstTime ? '0 / 100' : `${potentialScore} / 100`}
          change={isFirstTime ? 'Pending Assessment' : potentialTier}
          tone={isFirstTime ? 'amber' : 'sage'}
        />
        <StatBlock
          label={t('meter.progress_rate', 'Daily Progress Rate')}
          value={isFirstTime ? '+0.0%/day' : `+${progressRate}%/day`}
          change={isFirstTime ? 'Pending Activity' : 'Target: +1.5%/day'}
          tone={isFirstTime ? 'amber' : 'sage'}
        />
      </div>

      {/* Pictorial Visual Meters: Upcoming Exam Syllabus & Skill Growth Velocity */}
      {!isFirstTime && (
        <div className="grid lg:grid-cols-2 gap-6">
          <UpcomingExamSyllabusGauge
            currentPct={upcomingExam?.current_completed_pct ?? avgSyllabusProgress}
            targetPct={upcomingExam?.target_syllabus_pct ?? 70}
            examTitle={upcomingExam?.title ?? 'Midterm Examination: Physics & Mathematics'}
            examDate={upcomingExam?.date ?? 'Oct 15, 2026'}
            daysRemaining={upcomingExam?.days_remaining ?? 19}
            pacingStatus={upcomingExam?.pacing_status ?? 'On Track'}
          />

          <SkillGrowthVelocityGauge
            currentPct={skillGrowth?.current_competency_pct ?? (avgFitScore || 72)}
            baselinePct={skillGrowth?.starting_baseline_pct ?? 22}
            growthDelta={skillGrowth?.growth_delta_pct ?? ((avgFitScore || 72) - 22)}
            milestoneStage={skillGrowth?.milestone_stage ?? 'Exam Ready & Proficient'}
            milestones={skillGrowth?.milestones}
          />
        </div>
      )}

      {/* Educational Potential Formulaic Breakdown Card */}
      <EducationalPotentialCard
        potentialScore={potentialScore}
        potentialTier={potentialTier}
        potentialBreakdown={potentialBreakdown}
        potentialInsights={potentialInsights}
        isFirstTime={isFirstTime}
      />

      {/* Student Intake Modal */}
      <StudentIntakeModal
        isOpen={showIntakeModal}
        onClose={() => {
          setShowIntakeModal(false);
          setIntakeDismissed(true);
        }}
        onSuccess={() => loadOverview()}
        initialProfile={profile}
      />

      {/* Weak Subject Remediation Alert */}
      {weakInfo && weakInfo.weak_subjects && weakInfo.weak_subjects.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Icon name="alert-triangle" className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-rose-900 text-base">
                    Weak Subject Alert: Focus Required
                  </h3>
                  <Tag tone="rose">{weakInfo.weak_subjects.length} Subjects Identified</Tag>
                </div>
                <p className="text-xs text-rose-800 mt-1 max-w-2xl">
                  {weakInfo.recommendation ||
                    'Based on recent examinations and practice scores, the following subjects need targeted remediation before the next exam.'}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weakInfo.weak_subjects.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200"
                    >
                      {s.subject || s.subject_name || s}: Avg {Math.round(s.score || s.exam_avg || 45)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-rose-700 hover:bg-rose-800 border-rose-700 text-white shrink-0"
              onClick={() => onOpenPractice(weakInfo.weak_subjects[0]?.subject || weakInfo.weak_subjects[0])}
            >
              Start Weak-Topic Practice Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Dual Column Layout: Today's Plan & Academic Subject Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Integrated Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#2C3524]">
                  Today's Balanced Schedule
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Blended college classes, focused revision, extra learning, and leisure/sports.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onTabChange('schedule')}>
                View Full Timetable →
              </Button>
            </div>

            <div className="space-y-3">
              {schedules.personal.length === 0 && schedules.institute.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                  No schedule items for today. Click "AI Generate Timetable" or add your daily slots.
                </div>
              ) : (
                <>
                  {/* College classes */}
                  {schedules.institute.slice(0, 3).map((item) => {
                    const status = getSlotTimeStatus(getCurrentDayOfWeek(), item.start_time, item.end_time, item.is_completed);

                    return (
                      <div
                        key={`inst-${item.id}`}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          status.isPassed
                            ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 shadow-xs'
                            : status.isActive
                            ? 'border-blue-400 bg-blue-50/90 text-blue-950 ring-2 ring-blue-300'
                            : 'border-blue-200 bg-blue-50/50 text-blue-950'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              status.isPassed
                                ? 'bg-emerald-600 text-white'
                                : status.isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.start_time || '09:00'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {status.isPassed && <span className="text-emerald-700 font-extrabold mr-1">✓</span>}
                                {item.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-bold">
                                {item.schedule_type}
                              </span>
                            </div>
                            <div className="text-xs text-blue-800/80">
                              {item.subject_name} • Venue: {item.venue_or_link || 'Room 102'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {status.isPassed ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              ✓ Done
                            </span>
                          ) : status.isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 animate-pulse">
                              ⏳ Active Now
                            </span>
                          ) : (
                            <Tag tone="blue">Institute</Tag>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Personal and Extracurricular items */}
                  {schedules.personal.slice(0, 4).map((p) => {
                    const isBacklog = p.activity_type === 'backlog_recovery';
                    const isSport =
                      p.activity_type === 'free_time' ||
                      p.title.toLowerCase().includes('cricket') ||
                      p.title.toLowerCase().includes('sport') ||
                      p.title.toLowerCase().includes('gym');
                    const isExtra = p.activity_type === 'extra_learning';
                    const isRevision = p.activity_type === 'revision' || p.activity_type === 'practice';
                    const status = getSlotTimeStatus(getCurrentDayOfWeek(), p.start_time, p.end_time, p.is_completed || p.is_reviewed);

                    return (
                      <div
                        key={`pers-${p.id}`}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          status.isPassed
                            ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 shadow-xs'
                            : status.isActive
                            ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-300 text-amber-950'
                            : isBacklog
                            ? 'border-amber-300 bg-amber-50/60'
                            : isSport
                            ? 'border-emerald-200 bg-emerald-50/60'
                            : isExtra
                            ? 'border-purple-200 bg-purple-50/60'
                            : isRevision
                            ? 'border-amber-200 bg-amber-50/60'
                            : 'border-[#E1D6AE] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              status.isPassed
                                ? 'bg-emerald-600 text-white'
                                : status.isActive
                                ? 'bg-amber-600 text-white'
                                : isBacklog
                                ? 'bg-amber-500 text-white'
                                : isSport
                                ? 'bg-emerald-100 text-emerald-800'
                                : isExtra
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-[#F2E8CF] text-[#2C3524]'
                            }`}
                          >
                            {p.start_time}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {status.isPassed && <span className="text-emerald-700 font-extrabold mr-1">✓</span>}
                                {p.title}
                              </span>
                              {isBacklog && <Tag tone="amber">🔄 Backlog</Tag>}
                              {isSport && <Tag tone="sage">Sports / Free Time</Tag>}
                              {isExtra && <Tag tone="purple">Track 2: Extra Skill</Tag>}
                              {isRevision && <Tag tone="amber">Revision</Tag>}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {p.start_time} - {p.end_time} {p.subject_name ? `• ${p.subject_name}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {status.isPassed ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              ✓ Done
                            </span>
                          ) : status.isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                              ⏳ Active Now
                            </span>
                          ) : (
                            <div className="text-xs font-semibold text-sagedeep">Upcoming</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </Card>

          {/* Quick Learning Pathways Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#2C3524]">
                  Dual-Track Progress Breakdown
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Balancing college requirements with extra personal skills.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onTabChange('pathways')}>
                Explore Roadmaps →
              </Button>
            </div>

            <div className="space-y-4">
              {syllabusList.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-[#E1D6AE] bg-white">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2.5">
                    <Icon name="compass" className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-sm text-[#2C3524]">No Subjects Enrolled Yet</h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-4">
                    Complete your curriculum intake to populate your core academic subjects, dual-track roadmaps, and diagnostic tests.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setShowIntakeModal(true)}>
                    Start Curriculum Intake →
                  </Button>
                </div>
              ) : (
                syllabusList.slice(0, 4).map((s) => {
                  const badge = getFitBadge(s.exam_readiness_score || 0);
                  return (
                    <div key={s.id} className="p-3.5 rounded-xl border border-[#E1D6AE] bg-[#F2E8CF]/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-semibold text-sm text-[#2C3524]">{s.subject_name}</div>
                        <div className="flex items-center gap-2">
                          <Tag tone={badge.tone}>Fit: {s.exam_readiness_score}%</Tag>
                          <span className="text-xs font-semibold text-[#2C3524]">
                            {s.completed_percentage}% Covered
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={s.completed_percentage} max={100} />
                      <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--text-muted)]">
                        <span>Practice Avg: {s.practice_avg_score || 0}%</span>
                        <span>College Exam Avg: {s.exam_avg_score || 0}%</span>
                        <button
                          onClick={() => onOpenDiagnostic(s.subject_name)}
                          className="text-sagedeep font-semibold hover:underline"
                        >
                          Recalibrate Pathway →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Quick Access & Mentoring */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="p-5">
            <h4 className="font-display font-semibold text-base mb-3 text-[#2C3524]">
              Study Actions
            </h4>
            <div className="space-y-2">
              <button
                onClick={onOpenDailyUpdate}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">Daily Syllabus Update</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Log topics finished today</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">+</span>
              </button>

              <button
                onClick={() => onTabChange('schedule')}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Icon name="calendar" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">AI Timetable Adjuster</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Add sports/hobbies without conflict</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">→</span>
              </button>

              <button
                onClick={() => onTabChange('mentoring')}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Icon name="message" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">Ask College Faculty</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Clear academic doubts</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">→</span>
              </button>

              <button
                onClick={() => onTabChange('research')}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Icon name="book" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">Research Papers</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Engage with university researchers</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">→</span>
              </button>
            </div>
          </Card>

          {/* Educational Potential Index Card */}
          <Card className="p-5 bg-gradient-to-br from-white to-[#F2E8CF]/40 border border-[#E1D6AE]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-sagedeep tracking-wider">
                Potential & Effort Index
              </span>
              <span className="text-xl font-bold font-display text-sagedeep">{potentialScore}/100</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Calculated from study consistency, practice test improvements, extra skill hours, and weak subject remediation.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#2C3524]">
                <span>Daily Log Consistency Streak</span>
                <span className="font-semibold text-emerald-700">7 Days 🔥</span>
              </div>
              <div className="flex justify-between text-[#2C3524]">
                <span>Practice-to-Exam Gain</span>
                <span className="font-semibold text-sagedeep">+14%</span>
              </div>
              <div className="flex justify-between text-[#2C3524]">
                <span>Track 2 Extra Hours Logged</span>
                <span className="font-semibold text-purple-700">12.5 hrs</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. DUAL-TRACK LEARNING & ADAPTIVE PATHWAYS
// =========================================================================

const TopicDeepDiveModal: React.FC<{
  topic: PathwayTopic | null;
  subjectName: string;
  onClose: () => void;
  onStatusChange: (status: 'mastered' | 'needs_revision' | 'in_progress') => void;
}> = ({ topic, subjectName, onClose, onStatusChange }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (!topic) return null;

  const getSubjectSpecificMilestoneQuiz = (subj: string, topicTitle: string, keyConcept?: string) => {
    const s = (subj || '').toLowerCase();
    if (s.includes('dsa') || s.includes('data structure') || s.includes('algorithm')) {
      return [
        {
          q: `In Data Structures & Algorithms, what is the primary algorithmic goal when working with "${topicTitle}"?`,
          options: {
            A: 'Optimizing time and auxiliary space complexity (e.g. achieving O(log n) or O(1) operations)',
            B: 'Storing all data in unindexed plain text files',
            C: 'Increasing worst-case asymptotic bounds to O(n!)',
            D: 'Bypassing memory pointers altogether'
          },
          ans: 'A',
          explanation: `${topicTitle} is designed to maintain structural invariants that guarantee fast lookup, insertion, or traversal complexity.`
        },
        {
          q: `Which property best characterizes the invariant "${keyConcept || 'T(n) = O(n log n)'}" in ${subj}?`,
          options: {
            A: 'It bounds the growth rate of operations as input size N scales',
            B: 'It only applies when N = 1',
            C: 'It depends on monitor refresh rate',
            D: 'It eliminates recursion stack frames'
          },
          ans: 'A',
          explanation: 'Asymptotic invariants and recurrence relations mathematically bound how runtime and memory scale with input size N.'
        }
      ];
    }
    if (s.includes('operating system') || s === 'os') {
      return [
        {
          q: `In Operating Systems, how does the kernel manage "${topicTitle}" efficiently?`,
          options: {
            A: 'Through hardware-assisted context switching, page tables, or synchronization primitives',
            B: 'By letting user-mode applications overwrite kernel memory directly',
            C: 'By disabling all CPU interrupts permanently',
            D: 'By running only a single thread without virtual memory'
          },
          ans: 'A',
          explanation: `The OS kernel enforces protection, fair scheduling, and virtual memory mapping for ${topicTitle}.`
        },
        {
          q: `What system metric is directly improved by optimizing "${topicTitle}"?`,
          options: {
            A: 'CPU throughput, turnaround time, and memory utilization without deadlock',
            B: 'HTML stylesheet rendering speed',
            C: 'SQL table column count',
            D: 'Static compiler syntax checking'
          },
          ans: 'A',
          explanation: 'OS primitives minimize context-switch overhead, prevent thrashing/deadlocks, and reduce response latency.'
        }
      ];
    }
    if (s.includes('dbms') || s.includes('database') || s.includes('sql')) {
      return [
        {
          q: `In Database Management Systems, why is "${topicTitle}" critical for data integrity and performance?`,
          options: {
            A: 'It guarantees ACID properties, eliminates redundancy, or accelerates disk block lookups via B+ Trees',
            B: 'It stores all relational tables inside browser cookies',
            C: 'It disables concurrent transactions',
            D: 'It removes primary and foreign keys'
          },
          ans: 'A',
          explanation: `${topicTitle} ensures consistent, durable, and high-throughput query execution in relational and distributed databases.`
        },
        {
          q: `How does the database engine apply "${keyConcept || 'ACID & B+ Tree Indexing'}" during query execution?`,
          options: {
            A: 'By optimizing query execution plans and maintaining write-ahead logs (WAL)',
            B: 'By scanning every disk sector sequentially on every read',
            C: 'By dropping unindexed tables',
            D: 'By ignoring lock isolation levels'
          },
          ans: 'A',
          explanation: 'Cost-based query optimizers and transaction managers rely on indexing and isolation protocols for safe concurrent access.'
        }
      ];
    }
    if (s.includes('web') || s.includes('react') || s.includes('frontend') || s.includes('fullstack')) {
      return [
        {
          q: `In Modern Web Development, how does "${topicTitle}" improve application architecture?`,
          options: {
            A: 'It ensures predictable state management, non-blocking I/O, and responsive rendering',
            B: 'It forces a full browser page reload on every keystroke',
            C: 'It blocks the JavaScript main thread indefinitely',
            D: 'It disables HTTPS encryption'
          },
          ans: 'A',
          explanation: `${topicTitle} is essential for building scalable, interactive, and secure full-stack web applications.`
        },
        {
          q: `What is the practical impact of "${keyConcept || 'Component State & Event Loop'}" in production web apps?`,
          options: {
            A: 'Minimizes unnecessary DOM mutations and handles concurrent API requests cleanly',
            B: 'Replaces TCP/IP with local file transfers',
            C: 'Prevents CSS flexbox layout calculation',
            D: 'Executes SQL queries directly inside HTML tags'
          },
          ans: 'A',
          explanation: 'Declarative rendering and asynchronous event handling keep web interfaces fast and responsive.'
        }
      ];
    }
    return [
      {
        q: `What is the core significance of "${topicTitle}" in ${subjectName}?`,
        options: {
          A: 'It establishes rigorous analytical principles, boundary conditions, and predictive modeling',
          B: 'It replaces systematic analysis with arbitrary guesswork',
          C: 'It only applies to static, non-changing systems',
          D: 'It prevents quantitative verification'
        },
        ans: 'A',
        explanation: `In ${subjectName}, ${topicTitle} provides the foundational laws and structure required for solving complex problems.`
      },
      {
        q: `How does "${keyConcept || 'the governing formulation'}" translate to practical problem solving in ${subjectName}?`,
        options: {
          A: 'It maps system variables, rates of change, or structural transitions into solvable steps',
          B: 'It has no connection to real-world applications',
          C: 'It ignores conservation and invariance laws',
          D: 'It cannot be verified experimentally or computationally'
        },
        ans: 'A',
        explanation: 'The governing formulation directly connects theoretical concepts to real-world analysis and implementation.'
      }
    ];
  };

  const sampleQuiz = getSubjectSpecificMilestoneQuiz(subjectName, topic.title, topic.key_concept);

  const handleSelect = (qIdx: number, optKey: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optKey }));
  };

  return (
    <Modal title={`Milestone Laboratory: ${topic.title}`} onClose={onClose}>
      <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sagedeep/10 text-sagedeep font-bold uppercase text-[10px]">
              {subjectName}
            </span>
            <Tag tone="blue">Level: {topic.difficulty || 'Core'}</Tag>
            <Tag tone="purple">{topic.est_hours || 4} Hours</Tag>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)] font-medium">Status:</span>
            <span className="font-bold text-[#2C3524] capitalize">{topic.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* 1. Key Concept & Formula Box */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
            <span>∑</span> Core Mathematical Law & Governing Equation
          </div>
          <div className="p-3 rounded-lg bg-white border border-emerald-200 font-mono text-xs text-emerald-900 overflow-x-auto shadow-inner">
            {topic.key_concept || 'f(x) = lim_{h->0} [f(x+h) - f(x)] / h'}
          </div>
          <p className="text-[11px] text-emerald-900/80 leading-relaxed">
            {topic.summary || 'Fundamental analytical formulation governing rates of change, spatial transformation, and cumulative convergence.'}
          </p>
        </div>

        {/* 2. Real-World Engineering & Computer Science Application */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-300 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-950 font-bold text-xs uppercase tracking-wider">
            <span>🚀</span> Practical Industry Application
          </div>
          <p className="text-xs text-blue-900 font-medium">
            {topic.real_world_app || 'Used in Machine Learning loss optimization, 3D graphics rendering, and embedded control systems.'}
          </p>
        </div>

        {/* 3. Interactive Self-Assessment Mini-Quiz */}
        <div className="p-4 rounded-xl bg-[#F2E8CF]/40 border border-[#E1D6AE] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#2C3524] text-xs uppercase tracking-wider">
              Interactive Milestone Verification Quiz
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">2 Questions</span>
          </div>

          <div className="space-y-3">
            {sampleQuiz.map((qItem, qIdx) => (
              <div key={qIdx} className="p-3 rounded-xl bg-white border border-[#E1D6AE] space-y-2">
                <div className="font-semibold text-[#2C3524]">{qIdx + 1}. {qItem.q}</div>
                <div className="space-y-1.5">
                  {Object.entries(qItem.options).map(([k, val]) => {
                    const isSelected = selectedAnswers[qIdx] === k;
                    const isCorrect = k === qItem.ans;
                    let btnStyle = 'border-[#E1D6AE] bg-white text-[#2C3524] hover:bg-black/5';
                    if (quizSubmitted) {
                      if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      else if (isSelected && !isCorrect) btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                    } else if (isSelected) {
                      btnStyle = 'border-sagedeep bg-sagedeep/10 text-sagedeep font-bold';
                    }

                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleSelect(qIdx, k)}
                        className={`w-full text-left p-2 rounded-lg border text-xs transition flex items-center gap-2 ${btnStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-black/5">
                          {k}
                        </span>
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-[var(--text-muted)]">
                    💡 <strong>Explanation:</strong> {qItem.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            {!quizSubmitted ? (
              <Button
                size="sm"
                variant="primary"
                disabled={Object.keys(selectedAnswers).length < sampleQuiz.length}
                onClick={() => setQuizSubmitted(true)}
              >
                Verify Answers
              </Button>
            ) : (
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                ✓ Quiz Completed! Great job practicing this milestone.
              </span>
            )}
          </div>
        </div>

        {/* 4. Mastery Action Buttons */}
        <div className="pt-3 border-t border-[#E1D6AE] flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-[var(--text-muted)]">Update Milestone Progress:</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onStatusChange('needs_revision');
                onClose();
              }}
            >
              ⚠️ Needs Revision
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onStatusChange('in_progress');
                onClose();
              }}
            >
              ⏳ In Progress
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onStatusChange('mastered');
                onClose();
              }}
            >
              ✓ Mark Mastered
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const StudentPathwaysView: React.FC<{
  initialSubject?: string | null;
  onOpenDiagnostic: (subject: string) => void;
}> = ({ initialSubject, onOpenDiagnostic }) => {
  const [activeTrack, setActiveTrack] = useState<'academic' | 'additional'>('academic');
  const [pathways, setPathways] = useState<LearningPathway[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTopicModal, setActiveTopicModal] = useState<PathwayTopic | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPathways = async () => {
      try {
        const res = await studentApi.getPathways();
        if (isMounted && res?.pathways) {
          setPathways(res.pathways);
          if (res.pathways.length > 0) {
            if (initialSubject) {
              const match = res.pathways.find(
                (p) =>
                  p.subject_name.toLowerCase().includes(initialSubject.toLowerCase()) ||
                  initialSubject.toLowerCase().includes(p.subject_name.toLowerCase())
              );
              if (match) {
                setActiveTrack(match.pathway_type || 'academic');
                setSelectedSubject(match.subject_name);
                return;
              }
            }
            setSelectedSubject(res.pathways[0].subject_name);
          }
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPathways();
    return () => { isMounted = false; };
  }, [initialSubject]);

  useEffect(() => {
    if (!initialSubject || pathways.length === 0) return;
    const match = pathways.find(
      (p) =>
        p.subject_name.toLowerCase().includes(initialSubject.toLowerCase()) ||
        initialSubject.toLowerCase().includes(p.subject_name.toLowerCase())
    );
    if (match) {
      setActiveTrack(match.pathway_type || 'academic');
      setSelectedSubject(match.subject_name);
    }
  }, [initialSubject, pathways]);

  const filteredPathways = pathways.filter((p) => p.pathway_type === activeTrack);
  const currentPathway = filteredPathways.find((p) => p.subject_name === selectedSubject) || filteredPathways[0];

  const handleTopicStatusChange = async (topicId: string, currentStatus: string) => {
    if (!currentPathway) return;
    const newStatus =
      currentStatus === 'mastered'
        ? 'needs_revision'
        : currentStatus === 'needs_revision'
        ? 'in_progress'
        : 'mastered';

    try {
      await studentApi.updateTopicStatus(currentPathway.subject_name, topicId, newStatus);
      setPathways((prev) =>
        prev.map((p) => {
          if (p.subject_name === currentPathway.subject_name) {
            return {
              ...p,
              topics: p.topics.map((t) => (t.id === topicId ? { ...t, status: newStatus as any } : t))
            };
          }
          return p;
        })
      );
    } catch {
      alert('Could not update topic status.');
    }
  };

  const handleModalStatusChange = async (newStatus: 'mastered' | 'needs_revision' | 'in_progress') => {
    if (!currentPathway || !activeTopicModal) return;
    try {
      await studentApi.updateTopicStatus(currentPathway.subject_name, activeTopicModal.id, newStatus);
      setPathways((prev) =>
        prev.map((p) => {
          if (p.subject_name === currentPathway.subject_name) {
            return {
              ...p,
              topics: p.topics.map((t) => (t.id === activeTopicModal.id ? { ...t, status: newStatus } : t))
            };
          }
          return p;
        })
      );
    } catch {
      alert('Could not update topic status.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mastered':
        return <Tag tone="sage">Mastered ✓</Tag>;
      case 'in_progress':
        return <Tag tone="amber">In Progress</Tag>;
      case 'needs_revision':
        return <Tag tone="rose">Needs Revision ⚠️</Tag>;
      case 'next':
        return <Tag tone="blue">Recommended Next</Tag>;
      default:
        return <Tag tone="default">Pending</Tag>;
    }
  };

  // Progression metrics
  const totalTopics = currentPathway?.topics?.length || 0;
  const masteredCount = currentPathway?.topics?.filter((t) => t.status === 'mastered').length || 0;
  const inProgressCount = currentPathway?.topics?.filter((t) => t.status === 'in_progress').length || 0;
  const revisionCount = currentPathway?.topics?.filter((t) => t.status === 'needs_revision').length || 0;
  const progressPct = totalTopics ? Math.round((masteredCount / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dual-Track Adaptive Learning Pathways"
        desc="Dynamically sequenced curricula calibrated through diagnostic tests, formula breakdowns, and real-world applications."
        action={
          <div className="flex gap-2">
            {currentPathway && (
              <Button variant="outline" onClick={() => onOpenDiagnostic(currentPathway.subject_name)}>
                <Icon name="target" className="w-4 h-4 mr-1.5" />
                Retake Diagnostic Test
              </Button>
            )}
          </div>
        }
      />

      {/* Track Selection Switcher */}
      <div className="flex border-b border-[#E1D6AE] gap-4">
        <button
          onClick={() => {
            setActiveTrack('academic');
            const match = pathways.find((p) => p.pathway_type === 'academic');
            if (match) setSelectedSubject(match.subject_name);
          }}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTrack === 'academic'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          Track 1: College / School Syllabus
        </button>

        <button
          onClick={() => {
            setActiveTrack('additional');
            const match = pathways.find((p) => p.pathway_type === 'additional');
            if (match) setSelectedSubject(match.subject_name);
          }}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTrack === 'additional'
              ? 'border-purple-700 text-purple-800'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          Track 2: Extra Subjects & Emerging Skills
        </button>
      </div>

      {/* Subject Pills */}
      <div className="flex flex-wrap gap-2">
        {filteredPathways.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedSubject(p.subject_name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              selectedSubject === p.subject_name
                ? 'bg-sagedeep text-pcream border-sagedeep shadow-sm'
                : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/50'
            }`}
          >
            {p.subject_name} ({p.current_level || 'Intermediate'})
          </button>
        ))}
      </div>

      {currentPathway ? (
        <div className="space-y-6">
          {/* Pathway Header Info */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-xl text-[#2C3524]">
                    {currentPathway.subject_name}
                  </h3>
                  <Tag tone={activeTrack === 'academic' ? 'sage' : 'purple'}>
                    {activeTrack === 'academic' ? 'Core Curriculum' : 'Extra Elective'}
                  </Tag>
                  <Tag tone="blue">Level: {currentPathway.current_level}</Tag>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Estimated Total Hours: {currentPathway.estimated_hours} hrs • Recommended Sequence: {currentPathway.recommended_sequence}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenDiagnostic(currentPathway.subject_name)}
                >
                  Diagnostic Assessment
                </Button>
              </div>
            </div>

            {/* Pathway Progress Bar & Stats */}
            <div className="mt-4 pt-4 border-t border-[#E1D6AE]/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#2C3524]">
                  Pathway Competency: {progressPct}% Mastered ({masteredCount} of {totalTopics} Milestones)
                </span>
                <div className="flex items-center gap-2">
                  {inProgressCount > 0 && <span className="text-amber-700 font-semibold">{inProgressCount} In Progress</span>}
                  {revisionCount > 0 && <span className="text-rose-700 font-semibold">{revisionCount} Needs Revision</span>}
                </div>
              </div>
              <ProgressBar value={progressPct} max={100} />
            </div>
          </Card>

          {/* Interactive Topic Roadmap Nodes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-base text-[#2C3524]">
                Calibrated Milestones & Competency Nodes
              </h4>
              <span className="text-xs text-[var(--text-muted)]">
                Click any milestone to launch formula proofs, deep-dive intuition & mini-quizzes
              </span>
            </div>

            <div className="grid gap-3">
              {currentPathway.topics.map((t, index) => (
                <div
                  key={t.id || index}
                  className="bg-white rounded-xl border border-[#E1D6AE] p-4 space-y-3 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          t.status === 'mastered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'needs_revision'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-[#F2E8CF] text-sagedeep'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#2C3524]">{t.title}</span>
                          {getStatusBadge(t.status)}
                          <Tag tone="blue">{t.difficulty || 'Core'}</Tag>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {t.est_hours || 3} hrs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setActiveTopicModal(t)}
                      >
                        🔬 Deep-Dive & Quiz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleTopicStatusChange(t.id, t.status)}
                      >
                        {t.status === 'mastered'
                          ? 'Flag Revision ⚠️'
                          : t.status === 'needs_revision'
                          ? 'Set In Progress'
                          : 'Mark Mastered ✓'}
                      </Button>
                    </div>
                  </div>

                  {/* Key Concept / Mathematical Law Box */}
                  {t.key_concept && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex items-start gap-2">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950 font-bold shrink-0 mt-0.5">
                        Formula / Law
                      </span>
                      <span className="font-mono text-emerald-900 font-medium overflow-x-auto">{t.key_concept}</span>
                    </div>
                  )}

                  {/* Real World Application Box */}
                  {t.real_world_app && (
                    <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs flex items-start gap-2">
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-200 text-blue-950 font-bold shrink-0 mt-0.5">
                        Industry App
                      </span>
                      <span className="text-blue-900">{t.real_world_app}</span>
                    </div>
                  )}

                  {/* Summary */}
                  {t.summary && (
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-1">
                      {t.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deep-Dive Modal */}
          {activeTopicModal && (
            <TopicDeepDiveModal
              topic={activeTopicModal}
              subjectName={currentPathway.subject_name}
              onClose={() => setActiveTopicModal(null)}
              onStatusChange={(newStatus) => handleModalStatusChange(newStatus)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          title="No Pathways Available"
          desc="Complete your profile onboarding to generate your customized dual-track learning pathways."
        />
      )}
    </div>
  );
};

// =========================================================================
// 3. DIAGNOSTIC ASSESSMENT MODAL
// =========================================================================

export const DiagnosticModal: React.FC<{
  subject: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
}> = ({ subject, onClose, onSuccess }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchQ = async () => {
      try {
        const res = await studentApi.getDiagnosticQuestions(subject);
        if (isMounted && res?.questions) {
          setQuestions(res.questions);
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchQ();
    return () => { isMounted = false; };
  }, [subject]);

  const handleSelectOption = (key: string) => {
    const q = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id || currentIdx]: key }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await studentApi.submitDiagnosticTest(subject, answers);
      setResult(res);
      onSuccess(res);
    } catch {
      alert('Error submitting diagnostic test.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Modal title={`Diagnostic Test: ${subject}`} onClose={onClose}>
        <div className="p-8 text-center text-sm text-[var(--text-muted)]">
          Generating personalized diagnostic questions...
        </div>
      </Modal>
    );
  }

  if (result) {
    return (
      <Modal title={`Diagnostic Assessment Result: ${subject}`} onClose={onClose}>
        <div className="space-y-5 p-2">
          <div className="p-4 rounded-xl bg-sagedeep/10 border border-sagedeep/20 text-center">
            <span className="text-xs uppercase font-bold text-sagedeep tracking-wider">Assessed Knowledge Level</span>
            <div className="text-2xl font-bold font-display text-sagedeep mt-1">
              {result.knowledge_level} ({result.score}%)
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Your adaptive pathway for {subject} has been re-indexed.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase">Mastered Topics</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(result.topics_mastered || []).map((t: string, idx: number) => (
                  <Tag key={idx} tone="sage">{t}</Tag>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-rose-800 uppercase">Topics Requiring Revision</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(result.topics_needs_improvement || []).map((t: string, idx: number) => (
                  <Tag key={idx} tone="rose">{t}</Tag>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#E1D6AE]">
            <Button
              variant="primary"
              className="bg-sagedeep text-pcream hover:bg-sagedeep/90 font-bold"
              onClick={() => {
                onSuccess({ subject, ...result });
                onClose();
              }}
            >
              Suggest Roadmaps & View Pathway →
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIdx];
  const selectedKey = answers[q?.id || currentIdx];

  return (
    <Modal title={`Diagnostic Assessment: ${subject}`} onClose={onClose}>
      <div className="space-y-5 p-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <Tag tone="blue">Level: {q?.level || 'Intermediate'}</Tag>
        </div>

        <ProgressBar value={currentIdx + 1} max={questions.length} />

        {q && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#2C3524] leading-relaxed">
              {q.question_text}
            </div>

            <div className="space-y-2">
              {Object.entries(q.options || {}).map(([key, text]) => (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center gap-3 ${
                    selectedKey === key
                      ? 'border-sagedeep bg-sagedeep/10 text-sagedeep font-bold'
                      : 'border-[#E1D6AE] bg-white text-[#2C3524] hover:bg-black/5'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    selectedKey === key ? 'bg-sagedeep text-pcream' : 'bg-black/5 text-[#2C3524]'
                  }`}>
                    {key}
                  </span>
                  <span>{String(text)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E1D6AE]">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
          >
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              variant="primary"
              disabled={!selectedKey}
              onClick={() => setCurrentIdx((i) => i + 1)}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!selectedKey || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit Diagnostic'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// =========================================================================
// 4. SYLLABUS PROGRESS & FIT SCORE (EXAM READINESS)
// =========================================================================

export const StudentSyllabusView: React.FC<{
  onOpenDailyUpdate: () => void;
  onOpenDiagnostic: (subject: string) => void;
  onOpenReportGap: () => void;
}> = ({ onOpenDailyUpdate, onOpenDiagnostic, onOpenReportGap }) => {
  const [syllabusList, setSyllabusList] = useState<SyllabusProgressItem[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailySyllabusUpdate[]>([]);
  const [upcomingExam, setUpcomingExam] = useState<UpcomingExamMeterData | null>(null);
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGapFeedbackItem[]>([]);
  const [potentialScore, setPotentialScore] = useState<number>(76);
  const [progressRate, setProgressRate] = useState<number>(1.6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSyllabus = async () => {
      try {
        const res = await studentApi.getSyllabus();
        if (isMounted && res) {
          setSyllabusList(res.syllabus_progress || []);
          setDailyUpdates(res.daily_updates || []);
          if (res.potential_score) setPotentialScore(res.potential_score);
          if (res.syllabus_progress_rate) setProgressRate(res.syllabus_progress_rate);
          if (res.upcoming_exam) setUpcomingExam(res.upcoming_exam);
          if (res.knowledge_gaps) setKnowledgeGaps(res.knowledge_gaps);
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSyllabus();
    return () => { isMounted = false; };
  }, []);

  const getFitBadge = (score: number) => {
    if (score >= 90) return { label: 'High Mastery', tone: 'sage' as const };
    if (score >= 75) return { label: 'Exam Ready', tone: 'sage' as const };
    if (score >= 50) return { label: 'Moderate Prep', tone: 'amber' as const };
    return { label: 'At Risk', tone: 'rose' as const };
  };

  const avgSyllabusPct = syllabusList.length
    ? Math.round(syllabusList.reduce((acc, s) => acc + (s.completed_percentage || 0), 0) / syllabusList.length)
    : 68;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabus Progress & Fit Score (Exam Readiness)"
        desc="Transparent calculation of exam preparedness: syllabus coverage, historical performance, practice accuracy, and revision pace."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onOpenReportGap}>
              Report Knowledge Gap
            </Button>
            <Button variant="primary" onClick={onOpenDailyUpdate}>
              + Log Daily Syllabus Update
            </Button>
          </div>
        }
      />

      {/* Pictorial Exam Syllabus Completed Meter & Readiness Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingExamSyllabusGauge
          currentPct={upcomingExam?.current_completed_pct ?? avgSyllabusPct}
          targetPct={upcomingExam?.target_syllabus_pct ?? 70}
          examTitle={upcomingExam?.title ?? 'Midterm Examination: Physics & Mathematics'}
          examDate={upcomingExam?.date ?? 'Oct 15, 2026'}
          daysRemaining={upcomingExam?.days_remaining ?? 19}
          pacingStatus={upcomingExam?.pacing_status ?? 'On Track'}
        />

        <div className="p-5 rounded-2xl bg-white border border-[#E1D6AE] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sagedeep"></span>
              <h3 className="font-display font-bold text-sm text-[#2C3524]">
                Fit Score (Exam Readiness) Formula
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Your preparedness is dynamically calibrated across all enrolled subjects with real-time weights:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#F2E8CF]/40 border border-[#E1D6AE]">
                <strong className="text-sagedeep">35%</strong> Syllabus Coverage
              </div>
              <div className="p-2 rounded-lg bg-[#F2E8CF]/40 border border-[#E1D6AE]">
                <strong className="text-blue-700">25%</strong> Historical Exam Avg
              </div>
              <div className="p-2 rounded-lg bg-[#F2E8CF]/40 border border-[#E1D6AE]">
                <strong className="text-purple-700">20%</strong> Practice Test Score
              </div>
              <div className="p-2 rounded-lg bg-[#F2E8CF]/40 border border-[#E1D6AE]">
                <strong className="text-amber-700">20%</strong> Revision & Time Factor
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E1D6AE] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Active Rate of Progress:</span>
            <span className="font-bold text-sagedeep font-mono">+{progressRate}% per day</span>
          </div>
        </div>
      </div>

      {/* Subject by Subject Fit Score & Progress Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#E1D6AE] flex items-center justify-between">
          <h3 className="font-display font-semibold text-base text-[#2C3524]">
            Enrolled Academic Subjects
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Daily updates automatically recalibrate your readiness
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2E8CF]/50 text-[#2C3524] border-b border-[#E1D6AE] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Syllabus Covered</th>
                <th className="py-3 px-4">Fit Score (Readiness)</th>
                <th className="py-3 px-4">Practice Avg</th>
                <th className="py-3 px-4">Exam Avg</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1D6AE]">
              {syllabusList.map((s) => {
                const badge = getFitBadge(s.exam_readiness_score);
                return (
                  <tr key={s.id} className="hover:bg-white/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-[#2C3524]">
                      {s.subject_name}
                      {s.is_weak_subject ? (
                        <span className="ml-2 text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold">
                          Weak Subject
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>{s.completed_topics}/{s.total_topics} topics</span>
                          <span className="font-bold">{s.completed_percentage}%</span>
                        </div>
                        <ProgressBar value={s.completed_percentage} max={100} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-sagedeep">{s.exam_readiness_score}%</span>
                        <Tag tone={badge.tone}>{badge.label}</Tag>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{s.practice_avg_score || 0}%</td>
                    <td className="py-3.5 px-4 font-medium">{s.exam_avg_score || 0}%</td>
                    <td className="py-3.5 px-4">
                      {s.exam_readiness_score >= 75 ? (
                        <span className="text-emerald-700 font-semibold">Ready for Exam</span>
                      ) : (
                        <span className="text-amber-800 font-semibold">Needs Revision</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenDiagnostic(s.subject_name)}
                        className="text-sagedeep font-semibold hover:underline"
                      >
                        Recalibrate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daily Progress Updates History */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">
          Recent Daily Syllabus Log History
        </h3>
        {dailyUpdates.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] py-4 text-center">
            No daily updates logged yet. Use the "Log Daily Syllabus Update" button to record today's study.
          </div>
        ) : (
          <div className="space-y-3">
            {dailyUpdates.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-xl border border-[#E1D6AE] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2C3524]">{u.subject_name}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Logged: {u.log_date}</span>
                  </div>
                  <div className="text-[var(--text-muted)] mt-1">
                    <strong>Topics completed:</strong> {u.completed_topics || 'None'}
                    {u.revision_topics && (
                      <span className="ml-2">
                        • <strong>Revision:</strong> {u.revision_topics}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-1 rounded bg-black/5 font-semibold text-[#2C3524]">
                    ⏱️ {u.study_minutes} mins
                  </span>
                  <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold">
                    🎯 {u.practice_count} questions
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* My Reported Knowledge Gaps & Curriculum Feedback */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-base text-[#2C3524]">
              My Reported Knowledge Gaps & Curriculum Feedback
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Identified friction points forwarded to instructors for review, revision classes, and conceptual reinforcement.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenReportGap}>
            + Report New Gap
          </Button>
        </div>

        {knowledgeGaps.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] py-4 text-center">
            No knowledge gaps reported yet. If you struggle with any concept or find missing prerequisites, click "Report New Gap".
          </div>
        ) : (
          <div className="space-y-3">
            {knowledgeGaps.map((g) => {
              const typeColor =
                g.feedback_type === 'concept_not_understood'
                  ? 'rose'
                  : g.feedback_type === 'needs_practical_example'
                  ? 'blue'
                  : g.feedback_type === 'missing_prerequisite'
                  ? 'amber'
                  : 'purple';

              const formatType = (t: string) => {
                return t
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase());
              };

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-[#E1D6AE] bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs hover:border-sagedeep/50 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#2C3524]">{g.subject_name}</span>
                      <span className="text-[#2C3524] font-medium">• {g.topic_name}</span>
                      <Tag tone={typeColor as any}>{formatType(g.feedback_type)}</Tag>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs leading-relaxed bg-[#F6F3ED]/60 p-2.5 rounded-lg border border-[#E1D6AE]/60">
                      "{g.description}"
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {g.created_at ? g.created_at.substring(0, 10) : 'Recent'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        g.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {g.status ? g.status.replace(/_/g, ' ') : 'Under Review'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// =========================================================================
// 5. DAILY SYLLABUS UPDATE MODAL
// =========================================================================

export const DailySyllabusModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [subjectName, setSubjectName] = useState('Data Structures & Algorithms');
  const [completedTopics, setCompletedTopics] = useState('');
  const [revisionTopics, setRevisionTopics] = useState('');
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [practiceCount, setPracticeCount] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.addDailyUpdate({
        subject_name: subjectName,
        completed_topics: completedTopics,
        revision_topics: revisionTopics,
        study_minutes: Number(studyMinutes),
        practice_count: Number(practiceCount),
        notes
      });
      onSuccess();
      onClose();
    } catch {
      alert('Could not submit daily update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Log Today's Syllabus Progress" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Subject</label>
          <select
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          >
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Discrete Mathematics">Discrete Mathematics</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Topics Completed Today (comma-separated)
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Red-Black Trees, Binary Search Tree Deletion"
            value={completedTopics}
            onChange={(e) => setCompletedTopics(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Topics Revised Today (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Linked List Reversal, Stack Applications"
            value={revisionTopics}
            onChange={(e) => setRevisionTopics(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Study Duration (Minutes)</label>
            <input
              type="number"
              min={10}
              max={600}
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Practice Questions Solved</label>
            <input
              type="number"
              min={0}
              max={100}
              value={practiceCount}
              onChange={(e) => setPracticeCount(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Notes / Insights</label>
          <textarea
            rows={2}
            placeholder="Any specific doubts or concepts that were challenging?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Syllabus Update'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 6. AI-ASSISTED FLEXIBLE SCHEDULE & BACKLOG RECOVERY ENGINE
// =========================================================================

export const StudentScheduleView: React.FC = () => {
  const { t, tDay, tSubject, tStatus } = useLanguage();
  const [personalItems, setPersonalItems] = useState<PersonalScheduleItem[]>([]);
  const [instituteItems, setInstituteItems] = useState<InstituteScheduleItem[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [tabularMatrix, setTabularMatrix] = useState<TabularScheduleMatrix | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(() => getCurrentDayOfWeek());
  const [viewMode, setViewMode] = useState<'cards' | 'tabular'>('cards');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExtraTimeModal, setShowExtraTimeModal] = useState(false);
  const [showAddBacklogModal, setShowAddBacklogModal] = useState(false);
  const [reviewingSession, setReviewingSession] = useState<PersonalScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const res = await studentApi.getSchedules();
      if (res) {
        setPersonalItems(res.personal_schedules || []);
        setInstituteItems(res.institute_schedules || []);
        setBacklogs(res.backlogs || []);
        if (res.tabular_matrix) {
          setTabularMatrix(res.tabular_matrix);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = getCurrentDayOfWeek();

  const dayInstituteItems = instituteItems.filter(
    (item) => item.schedule_type !== 'exam' && !item.title.toLowerCase().includes('exam') &&
      (item.day_of_week === selectedDay || (!item.day_of_week && selectedDay === 'Monday'))
  );

  const upcomingExams = instituteItems.filter(
    (item) => item.schedule_type === 'exam' || item.title.toLowerCase().includes('exam')
  );

  const filteredPersonal = personalItems.filter((p) => p.day_of_week === selectedDay);

  const pendingBacklogs = backlogs.filter((b) => b.status !== 'cleared' && b.status !== 'completed');
  const totalBacklogHours = Math.round(pendingBacklogs.reduce((acc, b) => acc + (b.estimated_hours || 0), 0) * 10) / 10;

  const handleDeleteItem = async (id: number) => {
    try {
      await studentApi.deletePersonalScheduleItem(id);
      setPersonalItems((prev) => prev.filter((p) => p.id !== id));
      fetchSchedule();
    } catch {
      alert('Could not delete schedule item.');
    }
  };

  const handleUpdateBacklogStatus = async (id: number, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      await studentApi.updateBacklogStatus(id, status);
      fetchSchedule();
    } catch {
      alert('Could not update backlog status.');
    }
  };

  const handleDeleteBacklog = async (id: number) => {
    try {
      await studentApi.deleteBacklog(id);
      setBacklogs((prev) => prev.filter((b) => b.id !== id));
      fetchSchedule();
    } catch {
      alert('Could not delete backlog item.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI-Assisted Flexible Schedule & Backlog Recovery"
        desc="Integrate institute classes with dedicated Backlog Recovery slots, sports/hobbies, and track 2 skills. Time-passed sessions automatically turn green with completion ticks."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowAddBacklogModal(true)}>
              🔄 + Report Backlog Topic
            </Button>
            <Button variant="outline" onClick={() => setShowExtraTimeModal(true)}>
              ⏱️ Log Track 2 Skill Time
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              + Add Routine Slot
            </Button>
            <Button variant="primary" onClick={() => setShowAIModal(true)}>
              ⚡ AI Auto-Balance Routine
            </Button>
          </div>
        }
      />

      {/* Backlog Recovery Engine Overview Card */}
      <Card className="p-4 border-amber-300 bg-amber-50/50 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-lg shrink-0">
              🔄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-sm text-amber-950">
                  Backlog Recovery Engine
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  {pendingBacklogs.length} Deficit Topics ({totalBacklogHours} hrs deficit)
                </span>
                <span className="text-[11px] text-amber-800 font-semibold hidden sm:inline">
                  • Scheduled alongside institute classes & sports
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Missed a lecture or couldn't complete self-study? Backlog topics are automatically assigned to dedicated evening recovery slots (07:30 - 08:30 PM) so you catch up without academic burnout.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-400 text-amber-900 hover:bg-amber-100 text-xs font-semibold"
              onClick={() => setShowAddBacklogModal(true)}
            >
              + Add Backlog Topic
            </Button>
          </div>
        </div>

        {/* Pending Backlogs List */}
        {pendingBacklogs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-200/80 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pendingBacklogs.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-amber-200 bg-white flex flex-col justify-between gap-2 shadow-xs text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-amber-950 text-sm">{b.topic_title}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        b.priority === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : b.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {b.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {b.subject_name} • Est. {b.estimated_hours}h • Slot: <strong className="text-amber-900">{b.scheduled_day || 'Upcoming'}</strong>
                  </div>
                  {b.notes && <div className="text-[10px] text-amber-800/80 mt-1 italic">{b.notes}</div>}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-100">
                  <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                    <span>🔄 Recovery Slot:</span> {b.scheduled_day || 'Next Daily Slot'} 7:30 PM
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateBacklogStatus(b.id, 'completed')}
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-[10px]"
                      title="Mark Backlog Cleared"
                    >
                      ✓ Cleared
                    </button>
                    <button
                      onClick={() => handleDeleteBacklog(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 font-bold text-[10px]"
                      title="Delete Backlog"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* View Mode Switcher & Real-time Indicator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1D6AE] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'cards'
                ? 'bg-sagedeep text-pcream shadow-sm'
                : 'bg-white text-[#2C3524] border border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
            }`}
          >
            <span>📅 Daily Interactive Slots</span>
          </button>
          <button
            onClick={() => setViewMode('tabular')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'tabular'
                ? 'bg-sagedeep text-pcream shadow-sm'
                : 'bg-white text-[#2C3524] border border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
            }`}
          >
            <span>📊 Weekly Master Matrix (Tabular Form)</span>
          </button>
        </div>

        <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
          <span>{t('Today is', 'Today is')} <strong className="text-sagedeep">{tDay(today)}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-800 font-medium">{t('Passed slots turn green with ✓', 'Passed slots turn green with ✓')}</span>
        </div>
      </div>

      {/* VIEW MODE 1: DAILY INTERACTIVE SLOTS */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="flex overflow-x-auto gap-2 pb-1">
            {days.map((d) => {
              const isToday = d === today;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition border flex items-center gap-1.5 ${
                    selectedDay === d
                      ? 'bg-sagedeep text-pcream border-sagedeep shadow-sm'
                      : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
                  }`}
                >
                  <span>{tDay(d)}</span>
                  {isToday && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-white uppercase">
                      {t('Today', 'Today')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: College Scheduled Classes & Labs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-base text-[#2C3524]">
                    Institute Official Schedule ({selectedDay})
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Synced directly from faculty</p>
                </div>
                <Tag tone="blue">Institute Synchronized</Tag>
              </div>

              <div className="space-y-3">
                {dayInstituteItems.length === 0 ? (
                  <div className="text-xs text-[var(--text-muted)] py-6 text-center bg-[#F6F3ED]/40 rounded-xl border border-dashed border-[#E1D6AE]">
                    No official classes scheduled for {selectedDay}. (Reserved for backlog recovery, project work & sports).
                  </div>
                ) : (
                  dayInstituteItems.map((item) => {
                    const status = getSlotTimeStatus(selectedDay, item.start_time, item.end_time, item.is_completed);

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all text-xs ${
                          status.isPassed
                            ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 shadow-xs'
                            : status.isActive
                            ? 'border-blue-400 bg-blue-50/90 text-blue-950 ring-2 ring-blue-300'
                            : 'border-blue-200 bg-blue-50/40 text-blue-950'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                status.isPassed
                                  ? 'bg-emerald-600 text-white'
                                  : status.isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-900'
                              }`}
                            >
                              {item.start_time}
                            </div>
                            <div>
                              <div className="font-bold text-sm flex items-center gap-1.5">
                                {status.isPassed && <span className="text-emerald-700 font-extrabold">✓</span>}
                                <span>{item.title}</span>
                              </div>
                              <div className="text-[11px] opacity-80">
                                {item.start_time} - {item.end_time || 'Next Hour'} • {item.subject_name} • {item.venue_or_link || 'Classroom'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {status.isPassed ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                ✓ Done
                              </span>
                            ) : status.isActive ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 animate-pulse">
                                ⏳ Active Now
                              </span>
                            ) : (
                              <Tag tone="blue">{item.schedule_type}</Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Right: Personal Routine, Backlog Recovery & Self-Study */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-base text-[#2C3524]">
                    Personal Learning & Recovery Slots ({selectedDay})
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Includes Backlog Recovery & Self-Study Check-ins</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
                  + Add Slot
                </Button>
              </div>

              <div className="space-y-3">
                {filteredPersonal.length === 0 ? (
                  <div className="text-xs text-[var(--text-muted)] py-6 text-center bg-[#F6F3ED]/40 rounded-xl border border-dashed border-[#E1D6AE]">
                    No personal slots set for {selectedDay}. Click "+ Add Slot" or "⚡ AI Auto-Balance Routine".
                  </div>
                ) : (
                  filteredPersonal.map((p) => {
                    const isBacklog = p.activity_type === 'backlog_recovery';
                    const isSelfStudy = p.activity_type === 'self_study' || p.activity_type === 'revision' || p.activity_type === 'practice';
                    const isSport =
                      p.activity_type === 'free_time' ||
                      p.title.toLowerCase().includes('cricket') ||
                      p.title.toLowerCase().includes('sport') ||
                      p.title.toLowerCase().includes('gym');
                    const isExtra = p.activity_type === 'extra_learning';

                    const status = getSlotTimeStatus(selectedDay, p.start_time, p.end_time, p.is_completed || p.is_reviewed);

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xl border transition-all text-xs ${
                          status.isPassed
                            ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 shadow-xs'
                            : status.isActive
                            ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-300 text-amber-950'
                            : isBacklog
                            ? 'border-amber-300 bg-amber-50/60 text-amber-950'
                            : isSport
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : isExtra
                            ? 'border-purple-200 bg-purple-50/50'
                            : isSelfStudy
                            ? 'border-indigo-200 bg-indigo-50/50 text-indigo-950'
                            : 'border-[#E1D6AE] bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                status.isPassed
                                  ? 'bg-emerald-600 text-white'
                                  : status.isActive
                                  ? 'bg-amber-600 text-white'
                                  : isBacklog
                                  ? 'bg-amber-500 text-white'
                                  : isSport
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isExtra
                                  ? 'bg-purple-100 text-purple-800'
                                  : isSelfStudy
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-[#F2E8CF] text-sagedeep'
                              }`}
                            >
                              {p.start_time}
                            </div>
                            <div>
                              <div className="font-bold text-sm flex items-center gap-1.5">
                                {status.isPassed && <span className="text-emerald-700 font-extrabold">✓</span>}
                                <span>{p.title}</span>
                              </div>
                              <div className="text-[11px] opacity-80">
                                {p.start_time} - {p.end_time} {p.subject_name ? `• ${p.subject_name}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {status.isPassed ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                ✓ Done
                              </span>
                            ) : status.isActive ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                                ⏳ Active Now
                              </span>
                            ) : isBacklog ? (
                              <Tag tone="amber">🔄 Backlog Recovery</Tag>
                            ) : isSport ? (
                              <Tag tone="sage">Sports / Leisure</Tag>
                            ) : isExtra ? (
                              <Tag tone="purple">Extra Skill</Tag>
                            ) : (
                              <Tag tone="blue">Self-Study</Tag>
                            )}

                            <button
                              onClick={() => handleDeleteItem(p.id)}
                              className="text-slate-400 hover:text-rose-600 font-bold p-1 text-xs"
                              title="Remove slot"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Self-Study / Backlog Recovery Post-Session Check-in Prompts */}
                        {(isSelfStudy || isBacklog) && status.isPassed && (
                          <div className="mt-3 pt-2.5 border-t border-emerald-200">
                            {!p.is_reviewed ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-100/70 p-2.5 rounded-lg border border-emerald-300">
                                <div>
                                  <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                                    <span>⏰ Session Ended: How much work was actually completed?</span>
                                  </div>
                                  <div className="text-[11px] text-emerald-800 mt-0.5">
                                    Check-in your progress. Incomplete topics will automatically shift into tomorrow's Backlog Recovery slot!
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0"
                                  onClick={() => setReviewingSession(p)}
                                >
                                  📝 Check-in Work Done
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-950 bg-emerald-100/50 p-2 rounded-lg">
                                <span className="font-semibold flex items-center gap-1">
                                  <span>✓ Logged: {p.completion_percentage ?? 100}% finished</span>
                                  {p.work_summary && <span className="font-normal opacity-80">({p.work_summary})</span>}
                                </span>
                                {p.completion_percentage && p.completion_percentage < 100 ? (
                                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                                    Remaining {100 - p.completion_percentage}% shifted to Backlogs
                                  </span>
                                ) : (
                                  <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                                    100% Fully Completed
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEKLY MASTER MATRIX (TABULAR FORM) */}
      {viewMode === 'tabular' && (
        <TabularTimetableGrid
          matrix={tabularMatrix}
          instituteSchedules={instituteItems}
          personalSchedules={personalItems}
          onReviewSession={(item) => setReviewingSession(item)}
        />
      )}

      {/* Upcoming Scheduled Examinations & Practical Milestones */}
      {upcomingExams.length > 0 && (
        <Card className="p-5 border-amber-300 bg-amber-50/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
              <h3 className="font-display font-bold text-sm text-[#2C3524]">
                Upcoming Scheduled Examinations & Practical Milestones
              </h3>
            </div>
            <Tag tone="amber">Institutional Milestone</Tag>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {upcomingExams.map((exam) => (
              <div
                key={`exam-${exam.id}`}
                className="p-3.5 rounded-xl border border-amber-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-900 flex flex-col items-center justify-center font-bold text-[11px] shrink-0">
                    <span>{exam.date ? exam.date.substring(5) : 'OCT'}</span>
                    <span className="text-[9px] uppercase font-normal">{exam.start_time}</span>
                  </div>
                  <div>
                    <div className="font-bold text-amber-950 text-sm">{exam.title}</div>
                    <div className="text-[var(--text-muted)]">
                      {exam.subject_name} • Venue: {exam.venue_or_link || 'Main Examination Hall'}
                    </div>
                    {exam.notes && (
                      <div className="text-[10px] text-amber-800/80 mt-0.5">{exam.notes}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                    {exam.date}
                  </span>
                  <Tag tone="rose">Exam</Tag>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Post-Session Self-Study Review Modal */}
      {reviewingSession && (
        <SelfStudyReviewModal
          scheduleItem={reviewingSession}
          onClose={() => setReviewingSession(null)}
          onSuccess={() => {
            fetchSchedule();
            setReviewingSession(null);
          }}
        />
      )}

      {/* Add Backlog Topic Modal */}
      {showAddBacklogModal && (
        <AddBacklogModal
          onClose={() => setShowAddBacklogModal(false)}
          onSuccess={() => {
            fetchSchedule();
            setShowAddBacklogModal(false);
          }}
        />
      )}

      {/* Add Custom Slot Modal */}
      {showAddModal && (
        <AddScheduleSlotModal
          dayOfWeek={selectedDay}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchSchedule();
            setShowAddModal(false);
          }}
        />
      )}

      {/* AI Timetable Generator Modal */}
      {showAIModal && (
        <AITimetableModal
          onClose={() => setShowAIModal(false)}
          onSuccess={() => {
            fetchSchedule();
            setShowAIModal(false);
          }}
        />
      )}

      {/* Track Extra Learning Time Modal */}
      {showExtraTimeModal && (
        <TrackExtraTimeModal
          onClose={() => setShowExtraTimeModal(false)}
          onSuccess={() => {
            fetchSchedule();
            setShowExtraTimeModal(false);
          }}
        />
      )}
    </div>
  );
};

// =========================================================================
// TABULAR TIMETABLE GRID COMPONENT
// =========================================================================

export const TabularTimetableGrid: React.FC<{
  matrix?: TabularScheduleMatrix | null;
  instituteSchedules: InstituteScheduleItem[];
  personalSchedules: PersonalScheduleItem[];
  onReviewSession?: (item: PersonalScheduleItem) => void;
}> = ({ matrix, instituteSchedules, personalSchedules, onReviewSession }) => {
  const { t, tDay, tSubject, tStatus } = useLanguage();
  const today = getCurrentDayOfWeek();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const standardSlots = [
    { slot: '08:00 - 09:00', label: 'Morning Warmup / Revision', start: '08:00', end: '09:00' },
    { slot: '09:00 - 10:00', label: 'College Lecture Slot 1', start: '09:00', end: '10:00' },
    { slot: '10:15 - 11:15', label: 'College Lecture Slot 2', start: '10:15', end: '11:15' },
    { slot: '11:30 - 12:30', label: 'College Lecture Slot 3', start: '11:30', end: '12:30' },
    { slot: '14:00 - 15:30', label: 'Afternoon Lab / Practical', start: '14:00', end: '15:30' },
    { slot: '16:30 - 17:30', label: 'Sports & Extracurricular Fitness', start: '16:30', end: '17:30' },
    { slot: '19:30 - 20:30', label: 'Backlog Recovery & Deep Revision', start: '19:30', end: '20:30' },
    { slot: '21:00 - 22:00', label: 'Track 2 Extra Skill Learning', start: '21:00', end: '22:00' }
  ];

  const slots = matrix?.time_slots && matrix.time_slots.length > 0 ? matrix.time_slots : standardSlots;

  return (
    <Card className="p-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display font-bold text-base text-[#2C3524] flex items-center gap-2">
            <span>{t('Weekly Master Timetable (Tabular Matrix)', 'Weekly Master Timetable (Tabular Matrix)')}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-900 border border-blue-200">
              {t('Synced with Institute & Personal Routine', 'Synced with Institute & Personal Routine')}
            </span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('Full 7-day responsive grid. Completed slots on today\'s schedule turn', 'Full 7-day responsive grid. Completed slots on today\'s schedule turn')} <strong className="text-emerald-700">{t('green with ✓', 'green with ✓')}</strong>.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 font-medium">
            {t('Institute Class', '🏛️ Institute Class')}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
            {t('Backlog Recovery', '🔄 Backlog Recovery')}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium">
            {t('Sports / Leisure', '🏏 Sports / Leisure')}
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-medium">
            {t('Extra Skill Track 2', '🚀 Extra Skill Track 2')}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold">
            {t('Done Today', '✓ Done Today')}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#E1D6AE] rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#F2E8CF]/80 text-[#2C3524] text-xs font-bold border-b border-[#E1D6AE]">
              <th className="p-3 w-32 border-r border-[#E1D6AE] bg-[#E1D6AE]/40">{t('Time Slot', 'Time Slot')}</th>
              {days.map((day) => {
                const isCurrent = day === today;
                return (
                  <th
                    key={day}
                    className={`p-3 text-center border-r border-[#E1D6AE] last:border-r-0 ${
                      isCurrent ? 'bg-sagedeep text-pcream' : ''
                    }`}
                  >
                    <div className="font-display">{tDay(day)}</div>
                    {isCurrent && <div className="text-[9px] font-normal uppercase text-amber-300">{t('Today', 'Today')}</div>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1D6AE]/60 text-xs">
            {slots.map((slotInfo, rowIdx) => (
              <tr key={slotInfo.slot} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#F6F3ED]/30'}>
                {/* Time slot header cell */}
                <td className="p-2.5 font-mono font-bold text-[#2C3524] border-r border-[#E1D6AE] bg-[#F2E8CF]/30 text-[11px] align-top">
                  <div className="text-[#2C3524] font-extrabold">{slotInfo.slot}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-sans font-normal mt-0.5 leading-tight">
                    {t(slotInfo.label, slotInfo.label)}
                  </div>
                </td>

                {/* Day columns */}
                {days.map((day) => {
                  // Check if cell is in matrix
                  const rowData = matrix?.rows?.find((r) => r.slot_info.slot === slotInfo.slot);
                  const matrixCell = rowData?.days?.[day];

                  // Also check local personal and institute schedules for fallback matching
                  const instMatch = instituteSchedules.find(
                    (i) => i.day_of_week === day && (i.start_time === slotInfo.start || i.start_time?.startsWith(slotInfo.start.substring(0, 2)))
                  );
                  const persMatch = personalSchedules.find(
                    (p) => p.day_of_week === day && (p.start_time === slotInfo.start || p.start_time?.startsWith(slotInfo.start.substring(0, 2)))
                  );

                  const cellTitle = matrixCell?.title || persMatch?.title || instMatch?.title;
                  const cellSubject = matrixCell?.subject_name || persMatch?.subject_name || instMatch?.subject_name;
                  const isBacklog = matrixCell?.is_backlog || persMatch?.activity_type === 'backlog_recovery';
                  const isPersonal = Boolean(persMatch) || matrixCell?.source === 'personal';
                  const isSport =
                    cellTitle?.toLowerCase().includes('cricket') ||
                    cellTitle?.toLowerCase().includes('sport') ||
                    cellTitle?.toLowerCase().includes('fitness') ||
                    persMatch?.activity_type === 'free_time';
                  const isExtra = persMatch?.activity_type === 'extra_learning' || cellTitle?.toLowerCase().includes('skill');

                  const isExplicitlyDone = Boolean(persMatch?.is_completed || persMatch?.is_reviewed || instMatch?.is_completed);
                  const status = getSlotTimeStatus(day, slotInfo.start, slotInfo.end, isExplicitlyDone);

                  return (
                    <td
                      key={day}
                      className={`p-2 border-r border-[#E1D6AE]/60 last:border-r-0 align-top transition-colors ${
                        day === today ? 'bg-[#F2E8CF]/15' : ''
                      }`}
                    >
                      {cellTitle ? (
                        <div
                          className={`p-2 rounded-lg border text-[11px] transition-all flex flex-col justify-between min-h-[58px] ${
                            status.isPassed
                              ? 'border-emerald-400 bg-emerald-100/90 text-emerald-950 font-medium shadow-xs'
                              : status.isActive
                              ? 'border-blue-400 bg-blue-100/90 text-blue-950 ring-2 ring-blue-300'
                              : isBacklog
                              ? 'border-amber-300 bg-amber-100 text-amber-950'
                              : isSport
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                              : isExtra
                              ? 'border-purple-200 bg-purple-50 text-purple-950'
                              : isPersonal
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-950'
                              : 'border-blue-200 bg-blue-50 text-blue-950'
                          }`}
                        >
                          <div>
                            <div className="font-bold flex items-center justify-between gap-1 leading-tight">
                              <span className="truncate">{cellTitle}</span>
                              {status.isPassed && (
                                <span className="text-emerald-700 font-black text-xs shrink-0" title="Completed">
                                  ✓
                                </span>
                              )}
                              {status.isActive && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" title="Active"></span>
                              )}
                            </div>
                            {cellSubject && (
                              <div className="text-[10px] opacity-80 mt-0.5 truncate">{tSubject(cellSubject)}</div>
                            )}
                          </div>

                          <div className="mt-1 pt-1 border-t border-current/10 flex items-center justify-between text-[9px]">
                            {status.isPassed ? (
                              <span className="font-bold text-emerald-800">✓ {t('Done', 'Done')}</span>
                            ) : isBacklog ? (
                              <span className="font-bold text-amber-900">{t('Backlog Recovery', '🔄 Backlog Recovery')}</span>
                            ) : isSport ? (
                              <span className="text-emerald-800">{t('Sports / Leisure', '🏏 Leisure')}</span>
                            ) : isExtra ? (
                              <span className="text-purple-800">{t('Extra Skill Track 2', '🚀 Track 2')}</span>
                            ) : isPersonal ? (
                              <span className="text-indigo-800">{t('Self-Study', '📖 Study')}</span>
                            ) : (
                              <span className="text-blue-800">{t('Institute Class', '🏛️ Class')}</span>
                            )}

                            {persMatch && (persMatch.activity_type === 'self_study' || isBacklog) && status.isPassed && !persMatch.is_reviewed && onReviewSession && (
                              <button
                                onClick={() => onReviewSession(persMatch)}
                                className="text-[9px] font-bold text-emerald-900 underline hover:text-emerald-950"
                              >
                                {t('Check-in Work Done', 'Check-in')}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[58px] flex items-center justify-center text-[10px] text-slate-300 italic border border-dashed border-slate-200/60 rounded-lg">
                          —
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// =========================================================================
// SELF-STUDY POST-SESSION CHECK-IN MODAL
// =========================================================================

export const SelfStudyReviewModal: React.FC<{
  scheduleItem: PersonalScheduleItem;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ scheduleItem, onClose, onSuccess }) => {
  const [completionPct, setCompletionPct] = useState<number>(scheduleItem.completion_percentage ?? 75);
  const [workSummary, setWorkSummary] = useState<string>(scheduleItem.work_summary ?? '');
  const [shiftToBacklog, setShiftToBacklog] = useState<boolean>(true);
  const [backlogTopic, setBacklogTopic] = useState<string>(
    scheduleItem.subject_name ? `${scheduleItem.subject_name}: ${scheduleItem.title}` : scheduleItem.title
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const remainingPct = 100 - completionPct;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentIdx = days.indexOf(scheduleItem.day_of_week);
  const nextDay = currentIdx >= 0 && currentIdx < 6 ? days[currentIdx + 1] : 'Monday';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.reviewStudySession({
        schedule_id: scheduleItem.id,
        completion_percentage: completionPct,
        work_summary: workSummary,
        shift_to_backlog: remainingPct > 0 ? shiftToBacklog : false,
        backlog_topic: backlogTopic
      });
      alert(
        remainingPct > 0 && shiftToBacklog
          ? `Session logged! Remaining ${remainingPct}% has been automatically scheduled to your Backlog Recovery slot on ${nextDay} (07:30 PM).`
          : 'Self-study session successfully reviewed and marked completed!'
      );
      onSuccess();
    } catch {
      alert('Could not submit session review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Self-Study Session Completion Check-in" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
          <div>
            <div className="font-bold text-emerald-950 text-sm">{scheduleItem.title}</div>
            <div className="text-[11px] text-emerald-800">
              {scheduleItem.day_of_week} • {scheduleItem.start_time} - {scheduleItem.end_time} {scheduleItem.subject_name ? `• ${scheduleItem.subject_name}` : ''}
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
            Time Slot Finished
          </span>
        </div>

        <div>
          <label className="block font-bold text-[#2C3524] mb-1">
            How much of this session was actually completed?
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={completionPct}
              onChange={(e) => setCompletionPct(Number(e.target.value))}
              className="flex-1 accent-emerald-600"
            />
            <span className="font-mono font-bold text-sm text-emerald-900 px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 min-w-[55px] text-center">
              {completionPct}%
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2 mt-2">
            {[25, 50, 75, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCompletionPct(val)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                  completionPct === val
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {val}% {val === 100 ? '(Finished)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Notes / What topics were covered?
          </label>
          <textarea
            rows={2}
            value={workSummary}
            onChange={(e) => setWorkSummary(e.target.value)}
            placeholder="e.g. Completed 8 calculus exercises; 4 word problems remain unfinished."
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        {/* Dynamic Backlog Adjustment Notification */}
        {remainingPct > 0 ? (
          <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🔄</span>
              <div className="font-bold text-amber-950">
                Incomplete Portion: {remainingPct}% remaining
              </div>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              We will automatically create a Backlog item and allocate a dedicated <strong>Backlog Recovery slot on tomorrow ({nextDay}) at 07:30 PM</strong> without disrupting your college classes or sports routine!
            </p>

            <label className="flex items-center gap-2 pt-1 font-semibold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={shiftToBacklog}
                onChange={(e) => setShiftToBacklog(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded"
              />
              <span>Automatically shift remaining work to tomorrow's Backlog Recovery schedule</span>
            </label>

            {shiftToBacklog && (
              <div className="mt-1 pt-1 border-t border-amber-200">
                <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                  Backlog Topic Label
                </label>
                <input
                  type="text"
                  value={backlogTopic}
                  onChange={(e) => setBacklogTopic(e.target.value)}
                  className="w-full p-2 rounded border border-amber-300 bg-white text-[#2C3524] text-[11px]"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <div className="font-bold text-xs">
              100% Complete! No backlog generated. Great execution!
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Recording...' : 'Save & Adjust Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// ADD BACKLOG TOPIC MODAL
// =========================================================================

export const AddBacklogModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [topicTitle, setTopicTitle] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(1.5);
  const [priority, setPriority] = useState('high');
  const [scheduledDay, setScheduledDay] = useState('Tomorrow');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      alert('Please specify the backlog topic title.');
      return;
    }
    setSubmitting(true);
    try {
      await studentApi.addBacklog({
        subject_name: subjectName,
        topic_title: topicTitle,
        estimated_hours: Number(estimatedHours),
        priority,
        scheduled_day: scheduledDay,
        notes
      });
      alert(`Backlog topic recorded! An optimal Backlog Recovery slot has been reserved in your schedule.`);
      onSuccess();
    } catch {
      alert('Could not record backlog topic.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Report & Schedule Backlog Topic" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
        <p className="text-[var(--text-muted)]">
          Fell behind on a chapter or missed an institute lecture? Report it here so the AI engine fits dedicated Backlog Recovery slots into your schedule without conflicting with your regular classes or sports.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Subject</label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Mathematics, Operating Systems"
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Estimated Hours Needed</label>
            <input
              type="number"
              step={0.5}
              min={0.5}
              max={10}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Topic Title</label>
          <input
            type="text"
            required
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            placeholder="e.g. Diagonalization of Matrices & Eigenvector Applications"
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            >
              <option value="critical">Critical (Exam Block)</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Target Recovery Day</label>
            <select
              value={scheduledDay}
              onChange={(e) => setScheduledDay(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            >
              <option value="Tomorrow">Tomorrow</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Notes / Why It's Behind</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Missed lecture due to sick leave; need to review textbook chapter 4 exercises."
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Scheduling...' : 'Reserve Backlog Recovery Slot'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal to Add Custom Routine Slot
const AddScheduleSlotModal: React.FC<{
  dayOfWeek: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ dayOfWeek, onClose, onSuccess }) => {
  const [title, setTitle] = useState('Cricket Practice & Fitness');
  const [activityType, setActivityType] = useState('free_time');
  const [subjectName, setSubjectName] = useState('');
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('17:30');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.addPersonalScheduleItem({
        title,
        activity_type: activityType as any,
        subject_name: subjectName,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime
      });
      onSuccess();
    } catch {
      alert('Could not add schedule slot.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Add Routine Slot for ${dayOfWeek}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-1">
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Activity Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Cricket 4:30 - 5:30 PM / Web Development"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            >
              <option value="free_time">Sports / Extracurricular / Leisure</option>
              <option value="backlog_recovery">Backlog Recovery</option>
              <option value="self_study">Focused Self-Study</option>
              <option value="extra_learning">Track 2: Extra Skill Learning</option>
              <option value="revision">Subject Revision</option>
              <option value="practice">Targeted Practice Test</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Subject (optional)</label>
            <input
              type="text"
              placeholder="e.g. Algorithms or AI"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Start Time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">End Time</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add Slot'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal for AI Auto-Balancing Routine & Timetable Generation
const AITimetableModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [freeTimePreference, setFreeTimePreference] = useState('Cricket practice 4:30 PM to 5:30 PM daily');
  const [dailyHours, setDailyHours] = useState(4);
  const [includeBacklogs, setIncludeBacklogs] = useState(true);
  const [backlogIntensity, setBacklogIntensity] = useState('balanced');
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGenerate = async () => {
    setSubmitting(true);
    try {
      const res = await studentApi.aiGenerateTimetable({
        free_time_preference: freeTimePreference,
        daily_available_hours: dailyHours,
        include_backlogs: includeBacklogs,
        backlog_intensity: backlogIntensity
      });
      setGeneratedResult(res);
    } catch {
      alert('Could not generate timetable.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = () => {
    alert('AI Timetable generated, backlogs synchronized, and weekly routine locked!');
    onSuccess();
  };

  return (
    <Modal title="AI-Assisted Timetable & Backlog Auto-Balancer" onClose={onClose}>
      <div className="space-y-4 text-xs p-1 max-h-[80vh] overflow-y-auto">
        {!generatedResult ? (
          <>
            <p className="text-[var(--text-muted)]">
              The AI dynamically synchronizes your <strong>college classes, pending backlogs, self-study, and sports</strong> into a conflict-free weekly schedule.
            </p>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Specify Your Sports / Personal Free Time
              </label>
              <input
                type="text"
                value={freeTimePreference}
                onChange={(e) => setFreeTimePreference(e.target.value)}
                placeholder="e.g., Cricket 4:30 PM - 5:30 PM, Gym 6:00 AM - 7:00 AM"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Daily Available Self-Study & Revision Hours
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 space-y-2">
              <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBacklogs}
                  onChange={(e) => setIncludeBacklogs(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span>Automatically allocate dedicated Backlog Recovery slots for all pending backlogs</span>
              </label>
              <p className="text-[11px] text-amber-800">
                Schedules 7:30 PM - 8:30 PM slots to cover syllabus topics you fell behind on without overlapping college lectures or sports.
              </p>

              {includeBacklogs && (
                <div className="pt-2 flex items-center gap-4">
                  <span className="font-semibold text-amber-950">Recovery Intensity:</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="intensity"
                      value="balanced"
                      checked={backlogIntensity === 'balanced'}
                      onChange={() => setBacklogIntensity('balanced')}
                      className="accent-amber-600"
                    />
                    <span>Balanced (1 hr/day)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="intensity"
                      value="intensive"
                      checked={backlogIntensity === 'intensive'}
                      onChange={() => setBacklogIntensity('intensive')}
                      className="accent-amber-600"
                    />
                    <span>Intensive (2 hrs/day)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleGenerate} disabled={submitting}>
                {submitting ? 'Generating Schedule...' : '⚡ Generate Tabular Schedule'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  ✓ Tabular Master Schedule Generated!
                </h4>
                <p className="text-[11px] text-emerald-800">
                  {generatedResult.generated_items} slots allocated across 7 days. Backlogs scheduled into dedicated evening slots!
                </p>
              </div>
              <Tag tone="sage">Tabular Matrix Ready</Tag>
            </div>

            {/* Generated Timetable in Proper Tabular Form */}
            {generatedResult.tabular_matrix && (
              <div className="max-h-[360px] overflow-auto border border-[#E1D6AE] rounded-xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[#F2E8CF] text-[#2C3524] font-bold border-b border-[#E1D6AE]">
                      <th className="p-2 border-r border-[#E1D6AE]">Slot</th>
                      {generatedResult.tabular_matrix.days.map((d: string) => (
                        <th key={d} className="p-2 border-r border-[#E1D6AE] last:border-r-0 text-center font-bold">
                          {d.substring(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1D6AE]/60">
                    {generatedResult.tabular_matrix.rows.map((row: any) => (
                      <tr key={row.slot_info.slot}>
                        <td className="p-2 font-mono font-bold bg-[#F2E8CF]/20 border-r border-[#E1D6AE]">
                          {row.slot_info.slot}
                        </td>
                        {generatedResult.tabular_matrix.days.map((d: string) => {
                          const cell = row.days[d];
                          const isBacklog = cell?.is_backlog;
                          const isSport = cell?.activity_type === 'free_time' || cell?.title?.toLowerCase().includes('cricket');

                          return (
                            <td key={d} className="p-1 border-r border-[#E1D6AE]/60 last:border-r-0 align-top">
                              {cell ? (
                                <div
                                  className={`p-1 rounded text-[9px] font-medium leading-tight ${
                                    isBacklog
                                      ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold'
                                      : isSport
                                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                      : cell.source === 'institute'
                                      ? 'bg-blue-100 text-blue-950 border border-blue-200'
                                      : 'bg-indigo-100 text-indigo-950 border border-indigo-200'
                                  }`}
                                >
                                  <div className="truncate font-semibold">{cell.title}</div>
                                  <div className="text-[8px] opacity-75">{cell.subject_name || cell.activity_type}</div>
                                </div>
                              ) : (
                                <div className="text-center text-slate-300">—</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-[#E1D6AE]">
              <Button variant="outline" onClick={() => setGeneratedResult(null)}>
                ← Adjust Parameters
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleApply}>
                  ✓ Apply & Save Timetable
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Modal for Tracking Extra Learning Time (Track 2)
const TrackExtraTimeModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [skill, setSkill] = useState('Full Stack Web Dev (React & Node)');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.trackExtraTime({
        skill_or_subject: skill,
        duration_minutes: Number(duration),
        notes
      });
      alert('Track 2 Extra Learning session logged!');
      onSuccess();
    } catch {
      alert('Could not log extra learning time.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Log Track 2 Extra Skill Learning" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-2">
        <p className="text-[var(--text-muted)]">
          Record time spent developing skills beyond your college syllabus. This boosts your Educational Potential Index without causing academic burnout.
        </p>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Skill / Elective</label>
          <input
            type="text"
            required
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g., Deep Learning, UI/UX Design, Cloud Architecture"
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Duration (Minutes)</label>
          <input
            type="number"
            min={15}
            max={360}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Progress Notes / Milestones</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Built authentication flow, solved 2 algorithmic challenges, etc."
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Record Extra Learning Time'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 7. WEAK-SUBJECT DETECTION & TARGETED PRACTICE TESTS
// =========================================================================

export const StudentPracticeView: React.FC<{
  onStartQuiz: (subject?: string) => void;
}> = ({ onStartQuiz }) => {
  const [weakInfo, setWeakInfo] = useState<{ weak_subjects: any[]; recommendation: string } | null>(null);
  const [practiceVsExam, setPracticeVsExam] = useState<{
    practice_history: PracticeTestRecord[];
    exam_history: any[];
    comparison_summary: any[];
  }>({
    practice_history: [],
    exam_history: [],
    comparison_summary: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPracticeData = async () => {
      try {
        const [wRes, pveRes] = await Promise.allSettled([
          studentApi.getWeakSubjects(),
          studentApi.getPracticeVsExam()
        ]);

        if (!isMounted) return;
        if (wRes.status === 'fulfilled' && wRes.value) {
          setWeakInfo(wRes.value);
        }
        if (pveRes.status === 'fulfilled' && pveRes.value) {
          setPracticeVsExam({
            practice_history: pveRes.value.practice_history || [],
            exam_history: pveRes.value.exam_history || [],
            comparison_summary: pveRes.value.comparison_summary || []
          });
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPracticeData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weak-Subject Remediation & Practice Tests"
        desc="Daily diagnostic practice tests automatically targeted at topics with low exam scores to lift academic readiness."
        action={
          <Button variant="primary" onClick={() => onStartQuiz()}>
            <Icon name="target" className="w-4 h-4 mr-1.5" />
            Take Today's Practice Test
          </Button>
        }
      />

      {/* Weak Subject Detection Banner */}
      {weakInfo && weakInfo.weak_subjects && weakInfo.weak_subjects.length > 0 && (
        <Card className="p-6 bg-rose-50/70 border-rose-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                <h3 className="font-display font-bold text-rose-950 text-base">
                  Active Weak-Subject Alerts
                </h3>
              </div>
              <p className="text-xs text-rose-900 mt-1 max-w-2xl">
                {weakInfo.recommendation || 'Remediation is recommended in the following subjects before next examination.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {weakInfo.weak_subjects.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-rose-800 border border-rose-200 shadow-xs"
                  >
                    {s.subject || s.subject_name || s}: Avg {Math.round(s.score || s.exam_avg || 45)}%
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-rose-700 hover:bg-rose-800 border-rose-700 text-white shrink-0"
              onClick={() => onStartQuiz(weakInfo.weak_subjects[0]?.subject || weakInfo.weak_subjects[0])}
            >
              Start 10-Question Targeted Quiz
            </Button>
          </div>
        </Card>
      )}

      {/* Practice vs. Real Exam Performance Correlation */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#E1D6AE] flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-[#2C3524]">
              Practice vs. Real Exam Performance Correlation
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Verifies if daily practice tests are successfully translating into higher college exam marks.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2E8CF]/50 text-[#2C3524] border-b border-[#E1D6AE] uppercase font-semibold">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Practice Average</th>
                <th className="py-3 px-4">Official Exam Marks</th>
                <th className="py-3 px-4">Variance / Gain</th>
                <th className="py-3 px-4">Readiness Verdict</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1D6AE]">
              {practiceVsExam.comparison_summary.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[var(--text-muted)]">
                    No comparison data available yet. Complete a practice quiz to view correlation.
                  </td>
                </tr>
              ) : (
                practiceVsExam.comparison_summary.map((row, idx) => {
                  const gain = Math.round(row.practice_avg - row.exam_avg);
                  return (
                    <tr key={idx} className="hover:bg-white/60 transition">
                      <td className="py-3 px-4 font-bold text-[#2C3524]">{row.subject}</td>
                      <td className="py-3 px-4 font-semibold text-sagedeep">{Math.round(row.practice_avg)}%</td>
                      <td className="py-3 px-4 font-semibold text-[#2C3524]">{Math.round(row.exam_avg)}%</td>
                      <td className="py-3 px-4 font-bold">
                        {gain >= 0 ? (
                          <span className="text-emerald-700">+{gain}% Improvement</span>
                        ) : (
                          <span className="text-rose-700">{gain}% Deficit</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {row.practice_avg >= 75 ? (
                          <Tag tone="sage">High Confidence</Tag>
                        ) : (
                          <Tag tone="rose">Needs Practice</Tag>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => onStartQuiz(row.subject)}>
                          Practice Topic
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Practice Test History */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">
          Completed Practice Tests History
        </h3>
        <div className="space-y-3">
          {practiceVsExam.practice_history.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] py-4 text-center">
              No practice tests logged yet.
            </div>
          ) : (
            practiceVsExam.practice_history.map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded-xl border border-[#E1D6AE] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2C3524]">{record.subject_name}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {record.topic_name || 'General Practice'} • {record.taken_at}
                    </span>
                  </div>
                  {record.mistakes_summary && (
                    <div className="text-rose-700 mt-1 text-[11px]">
                      Mistakes analyzed: {record.mistakes_summary}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded bg-sagedeep/10 text-sagedeep font-bold">
                    Score: {record.score}%
                  </span>
                  <Tag tone={record.accuracy >= 75 ? 'sage' : 'amber'}>
                    Accuracy: {record.accuracy}%
                  </Tag>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// =========================================================================
// 8. INTERACTIVE PRACTICE TEST MODAL (MCQ QUIZ)
// =========================================================================

export const PracticeTestModal: React.FC<{
  initialSubject?: string;
  onClose: () => void;
  onComplete: () => void;
}> = ({ initialSubject, onClose, onComplete }) => {
  const [subject, setSubject] = useState(initialSubject || 'Data Structures & Algorithms');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Data Structures & Algorithms',
    'Operating Systems',
    'Database Management Systems',
    'Web Development',
    'Artificial Intelligence',
    'Python Programming',
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
  ]);
  const [questions, setQuestions] = useState<PracticeTestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    studentApi.getProfile().then((res) => {
      if (res?.profile) {
        const enrolled = [
          ...(res.profile.academic_subjects ? res.profile.academic_subjects.split(',') : []),
          ...(res.profile.extra_subjects ? res.profile.extra_subjects.split(',') : []),
        ]
          .map((s) => s.trim())
          .filter(Boolean);
        if (enrolled.length > 0) {
          setAvailableSubjects((prev) => Array.from(new Set([...enrolled, ...prev])));
          if (!initialSubject) {
            setSubject(enrolled[0]);
          }
        }
      }
    }).catch(() => {});
  }, [initialSubject]);

  useEffect(() => {
    let isMounted = true;
    const fetchQ = async () => {
      setLoading(true);
      setCurrentIdx(0);
      setAnswers({});
      setResult(null);
      try {
        const res = await studentApi.getTodayPracticeTest(subject);
        if (isMounted && res?.questions) {
          setQuestions(res.questions);
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchQ();
    return () => { isMounted = false; };
  }, [subject]);

  const handleSelectOption = (key: string) => {
    const q = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id || currentIdx]: key }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await studentApi.submitPracticeTest({
        subject_name: subject,
        topic_name: questions[0]?.topic || 'Targeted Practice',
        answers
      });
      setResult(res);
      onComplete();
    } catch {
      alert('Could not submit practice test.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Modal title={`Targeted Practice Quiz: ${subject}`} onClose={onClose}>
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          Generating targeted practice questions for {subject}...
        </div>
      </Modal>
    );
  }

  if (result) {
    return (
      <Modal title={`Quiz Results: ${subject}`} onClose={onClose}>
        <div className="space-y-4 p-2 text-xs">
          <div className="p-4 rounded-xl bg-sagedeep/10 border border-sagedeep/20 text-center">
            <span className="text-xs uppercase font-bold text-sagedeep tracking-wider">Your Practice Score</span>
            <div className="text-3xl font-bold font-display text-sagedeep mt-1">
              {result.score}%
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Accuracy: {result.accuracy} • Updated Practice Average: {result.new_practice_average}
            </p>
          </div>

          {result.mistakes && result.mistakes.length > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-rose-800 uppercase">Review Explanations & Mistakes</div>
              {result.mistakes.map((m: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                  {typeof m === 'string' ? m : `${m.question}: ${m.explanation || m.correction}`}
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 flex justify-end">
            <Button variant="primary" onClick={onClose}>
              Done & Return to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIdx];
  const selectedKey = answers[q?.id || currentIdx];

  return (
    <Modal title={`Targeted Practice: ${subject}`} onClose={onClose}>
      <div className="space-y-4 p-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E1D6AE]">
          <label className="text-xs font-semibold text-[#2C3524]">Quiz Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-1.5 rounded-lg border border-[#E1D6AE] bg-white text-xs font-semibold text-[#2C3524]"
          >
            {availableSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <Tag tone="sage">{q?.topic || 'Core Concept'}</Tag>
        </div>

        <ProgressBar value={currentIdx + 1} max={questions.length} />

        {q && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#2C3524] leading-relaxed">
              {q.question_text}
            </div>

            <div className="space-y-2">
              {Object.entries(q.options || {}).map(([key, text]) => (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center gap-3 ${
                    selectedKey === key
                      ? 'border-sagedeep bg-sagedeep/10 text-sagedeep font-bold'
                      : 'border-[#E1D6AE] bg-white text-[#2C3524] hover:bg-black/5'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    selectedKey === key ? 'bg-sagedeep text-pcream' : 'bg-black/5 text-[#2C3524]'
                  }`}>
                    {key}
                  </span>
                  <span>{String(text)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E1D6AE]">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
          >
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              variant="primary"
              disabled={!selectedKey}
              onClick={() => setCurrentIdx((i) => i + 1)}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!selectedKey || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting Quiz...' : 'Submit & View Score'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// =========================================================================
// 9. MULTILINGUAL & VISUAL / PRACTICAL LEARNING
// =========================================================================

export const StudentLearningView: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    const langMap: Record<SupportedLanguage, string> = {
      en: 'English',
      hi: 'Hindi',
      gu: 'Gujarati',
      mr: 'Marathi',
      ta: 'Tamil',
      te: 'Telugu',
      bn: 'Bengali'
    };
    return langMap[language] || 'English';
  });
  const [activeTab, setActiveTab] = useState<'calculus' | 'matrix' | 'algorithms' | 'multilingual'>('calculus');

  // Sync with global language changes
  useEffect(() => {
    const langMap: Record<SupportedLanguage, string> = {
      en: 'English',
      hi: 'Hindi',
      gu: 'Gujarati',
      mr: 'Marathi',
      ta: 'Tamil',
      te: 'Telugu',
      bn: 'Bengali'
    };
    if (langMap[language] && langMap[language] !== selectedLang) {
      setSelectedLang(langMap[language]);
    }
  }, [language, selectedLang]);

  const handleLanguageChange = (langName: string) => {
    setSelectedLang(langName);
    const codeMap: Record<string, SupportedLanguage> = {
      'English': 'en',
      'Hindi': 'hi',
      'Gujarati': 'gu',
      'Marathi': 'mr',
      'Tamil': 'ta',
      'Telugu': 'te',
      'Bengali': 'bn'
    };
    if (codeMap[langName]) {
      setLanguage(codeMap[langName]);
    }
    studentApi.updateProfile({ preferred_language: langName }).catch(() => {});
  };

  // Localized UI labels for all 7 languages inside StudentLearningView
  const LEARNING_UI_I18N: Record<string, {
    pageTitle: string;
    pageDesc: string;
    langLabel: string;
    tabCalculus: string;
    tabMatrix: string;
    tabAlgorithms: string;
    tabMultilingual: string;
    calcTitle: string;
    calcDesc: string;
    parabola: string;
    cubic: string;
    clickHint: string;
    selectPoint: string;
    liveCalcTitle: string;
    instSlope: string;
    defIntegral: string;
    tangentEqAt: string;
    aiLinkBadge: string;
    aiLinkTitle: string;
    aiLinkDesc1: string;
    aiLinkDesc2: string;
    matrixTitle: string;
    matrixDesc: string;
    matrixBoxTitle: string;
    detCalcTitle: string;
    singularMsg: string;
    invertedMsg: string;
    preserveMsg: string;
    cgBadge: string;
    cgTitle: string;
    cgDesc: string;
    bstTitle: string;
    bstDesc: string;
    insertNode: string;
    inOrderLabel: string;
    lruTitle: string;
    lruDesc: string;
    liveCacheMem: string;
    opStream: string;
    dictTitle: string;
    dictDesc: string;
    activeDialect: string;
  }> = {
    English: {
      pageTitle: 'Interactive Multilingual & Visual/Practical Learning',
      pageDesc: 'Interactive calculus and differential geometry visualizers, 2D matrix transformation sandboxes, algorithms, and multilingual concept breakdowns.',
      langLabel: 'Language:',
      tabCalculus: '📈 Calculus & Tangent Explorer',
      tabMatrix: '🔄 2D Matrix Transformation Sandbox',
      tabAlgorithms: '⚡ Algorithms & System Sandboxes',
      tabMultilingual: '🌐 Multilingual Concept Glossary',
      calcTitle: 'Interactive Calculus & Rate of Change Visualizer',
      calcDesc: 'Move the slider to observe how instantaneous slope (derivative) and accumulated area (integral) change in real time.',
      parabola: 'Parabola',
      cubic: 'Cubic',
      clickHint: 'Interactive: Click anywhere on graph',
      selectPoint: 'Select Input Point x₀:',
      liveCalcTitle: 'Live Analytical Calculations',
      instSlope: 'Instantaneous Slope',
      defIntegral: 'Definite Integral',
      tangentEqAt: 'Tangent Line Equation at',
      aiLinkBadge: 'AI & Machine Learning Link',
      aiLinkTitle: 'Gradient Descent & Backpropagation',
      aiLinkDesc1: 'In neural networks, the loss function Loss(w) is minimized by stepping opposite to the derivative:',
      aiLinkDesc2: "Notice that when f'(x) = 0 (at local extrema), the tangent is completely horizontal and weight updates settle at minimum error!",
      matrixTitle: '2D Linear Transformation & Determinant Geometry',
      matrixDesc: 'Watch basis vectors î and ĵ transform space. The determinant det(A) represents the signed area scaling factor.',
      matrixBoxTitle: 'Transformation Matrix A',
      detCalcTitle: 'Determinant Calculation:',
      singularMsg: '⚠️ Singular Matrix (Rank 1): 2D space collapsed into a 1D line! No inverse matrix exists.',
      invertedMsg: '🔄 Orientation Inverted (Negative Determinant): Coordinate space has been mirrored/flipped.',
      preserveMsg: '✓ Preserves Orientation: Scales unit area by factor of',
      cgBadge: 'Computer Graphics & Vision Link',
      cgTitle: '3D Camera Viewports & GPU Shaders',
      cgDesc: 'Every video game and computer vision model transforms millions of 3D polygon coordinates into 2D screen pixels per second by multiplying vertices with Model-View-Projection (MVP) 4x4 affine matrices!',
      bstTitle: 'Interactive Binary Search Tree (BST)',
      bstDesc: 'Add numbers to watch binary partitioning maintain the in-order invariant in O(log n) time.',
      insertNode: 'Insert Node',
      inOrderLabel: 'In-Order Sorted Traversal:',
      lruTitle: 'Interactive LRU Cache Simulator',
      lruDesc: 'Doubly linked list + hash map achieving O(1) reads and writes with capacity 3.',
      liveCacheMem: 'Live Cache Memory (MRU → LRU):',
      opStream: 'Operation Stream:',
      dictTitle: 'Multilingual Technical & Mathematical Dictionary',
      dictDesc: 'Demystifying advanced engineering, mathematical, and algorithmic principles in your regional mother tongue.',
      activeDialect: 'Active Dialect:'
    },
    Hindi: {
      pageTitle: 'इंटरैक्टिव बहुभाषी और दृश्य/व्यावहारिक शिक्षा',
      pageDesc: 'इंटरैक्टिव कैलकुलस और अवकल ज्यामिति विज़ुअलाइज़र, 2D आव्यूह रूपांतरण सैंडबॉक्स, एल्गोरिदम और मातृभाषा में अवधारणा विश्लेषण।',
      langLabel: 'भाषा:',
      tabCalculus: '📈 कैलकुलस और स्पर्शरेखा एक्सप्लोरर',
      tabMatrix: '🔄 2D आव्यूह रूपांतरण सैंडबॉक्स',
      tabAlgorithms: '⚡ एल्गोरिदम और सिस्टम सैंडबॉक्स',
      tabMultilingual: '🌐 बहुभाषी अवधारणा शब्दकोश',
      calcTitle: 'इंटरैक्टिव कैलकुलस और परिवर्तन दर विज़ुअलाइज़र',
      calcDesc: 'वास्तविक समय में तात्कालिक ढलान (अवकलन) और संचित क्षेत्रफल (समाकलन) में बदलाव देखने के लिए स्लाइडर चलाएं।',
      parabola: 'परवलय (Parabola)',
      cubic: 'त्रिघात (Cubic)',
      clickHint: 'इंटरैक्टिव: ग्राफ़ पर कहीं भी क्लिक करें',
      selectPoint: 'इनपुट बिंदु x₀ चुनें:',
      liveCalcTitle: 'लाइव विश्लेषणात्मक गणनाएँ',
      instSlope: 'तात्कालिक ढलान',
      defIntegral: 'निश्चित समाकलन',
      tangentEqAt: 'स्पर्शरेखा समीकरण बिंदु',
      aiLinkBadge: 'AI और मशीन लर्निंग लिंक',
      aiLinkTitle: 'ग्रेडिएंट डिसेंट और बैकप्रोपैगेशन',
      aiLinkDesc1: 'न्यूरल नेटवर्क में, लॉस फंक्शन Loss(w) को अवकलन की विपरीत दिशा में कदम बढ़ाकर न्यूनतम किया जाता है:',
      aiLinkDesc2: "ध्यान दें कि जब f'(x) = 0 होता है, तो स्पर्शरेखा क्षैतिज होती है और न्यूनतम त्रुटि प्राप्त होती है!",
      matrixTitle: '2D रैखिक रूपांतरण और सारणिक (Determinant) ज्यामिति',
      matrixDesc: 'आधार सदिश î और ĵ को स्थान बदलते हुए देखें। सारणिक det(A) क्षेत्रफल स्केलिंग गुणांक दर्शाता है।',
      matrixBoxTitle: 'रूपांतरण आव्यूह A',
      detCalcTitle: 'सारणिक (Determinant) गणना:',
      singularMsg: '⚠️ अव्युत्क्रमणीय आव्यूह (Rank 1): 2D स्थान 1D रेखा में सिमट गया है! कोई व्युत्क्रम अस्तित्व में नहीं है।',
      invertedMsg: '🔄 अभिविन्यास उलट गया (ऋणात्मक सारणिक): निर्देशांक स्थान दर्पण/फ्लिप हो गया है।',
      preserveMsg: '✓ अभिविन्यास सुरक्षित रखता है: इकाई क्षेत्रफल का गुणांक',
      cgBadge: 'कंप्यूटर ग्राफिक्स और विज़न लिंक',
      cgTitle: '3D कैमरा व्यूपोर्ट और GPU शेडर्स',
      cgDesc: 'प्रत्येक वीडियो गेम और कंप्यूटर विज़न मॉडल प्रति सेकंड लाखों 3D निर्देशांकों को 4x4 आव्यूह से गुणा करके 2D स्क्रीन पिक्सेल में बदलता है!',
      bstTitle: 'इंटरैक्टिव बाइनरी सर्च ट्री (BST)',
      bstDesc: 'O(log n) समय में क्रमबद्ध विभाजन देखने के लिए संख्याएँ जोड़ें।',
      insertNode: 'नोड जोड़ें',
      inOrderLabel: 'इन-ऑर्डर क्रमबद्ध ट्रैवर्सल:',
      lruTitle: 'इंटरैक्टिव LRU कैश सिम्युलेटर',
      lruDesc: 'डबली लिंक्ड लिस्ट + हैश मैप द्वारा क्षमता 3 के साथ O(1) रीड और राइट।',
      liveCacheMem: 'लाइव कैश मेमोरी (MRU → LRU):',
      opStream: 'ऑपरेशन लॉग:',
      dictTitle: 'बहुभाषी तकनीकी और गणितीय शब्दकोश',
      dictDesc: 'आपकी क्षेत्रीय मातृभाषा में उन्नत इंजीनियरिंग, गणितीय और एल्गोरिदम सिद्धांतों की सरल व्याख्या।',
      activeDialect: 'सक्रिय भाषा:'
    },
    Gujarati: {
      pageTitle: 'ઇન્ટરેક્ટિવ બહુભાષી અને વિઝ્યુઅલ/પ્રાયોગિક શિક્ષણ',
      pageDesc: 'ઇન્ટરેક્ટિવ કલનશાસ્ત્ર (Calculus) વિઝ્યુઅલાઇઝર, 2D શ્રેણિક રૂપાંતરણ સેન્ડબોક્સ, અલ્ગોરિધમ્સ અને માતૃભાષામાં ખ્યાલ સમજૂતી.',
      langLabel: 'ભાષા:',
      tabCalculus: '📈 કલનશાસ્ત્ર અને સ્પર્શક એક્સપ્લોરર',
      tabMatrix: '🔄 2D શ્રેણિક રૂપાંતરણ સેન્ડબોક્સ',
      tabAlgorithms: '⚡ અલ્ગોરિધમ્સ અને સિસ્ટમ સેન્ડબોક્સ',
      tabMultilingual: '🌐 બહુભાષી ખ્યાલ શબ્દકોશ',
      calcTitle: 'ઇન્ટરેક્ટિવ કલનશાસ્ત્ર અને પરિવર્તન દર વિઝ્યુઅલાઇઝર',
      calcDesc: 'તાત્કાલિક ઢોળાવ (વિકલન) અને સંચિત ક્ષેત્રફળ (સંકલન) માં રીઅલ-ટાઇમ ફેરફાર જોવા માટે સ્લાઇડર ખસેડો.',
      parabola: 'પરવલય (Parabola)',
      cubic: 'ત્રિઘાત (Cubic)',
      clickHint: 'ઇન્ટરેક્ટિવ: ગ્રાફ પર ગમે ત્યાં ક્લિક કરો',
      selectPoint: 'ઇનપુટ બિંદુ x₀ પસંદ કરો:',
      liveCalcTitle: 'લાઇવ વિશ્લેષણાત્મક ગણતરીઓ',
      instSlope: 'તાત્કાલિક ઢોળાવ',
      defIntegral: 'નિશ્ચિત સંકલન',
      tangentEqAt: 'સ્પર્શક રેખાનું સમીકરણ',
      aiLinkBadge: 'AI અને મશીન લર્નિંગ લિંક',
      aiLinkTitle: 'ગ્રેડિયન્ટ ડિસેન્ટ અને બેકપ્રોપેગેશન',
      aiLinkDesc1: 'ન્યુરલ નેટવર્કમાં, લોસ ફંક્શન Loss(w) ને વિકલનની વિરુદ્ધ દિશામાં પગલું ભરીને લઘુત્તમ કરવામાં આવે છે:',
      aiLinkDesc2: "નોંધ કરો કે જ્યારે f'(x) = 0 હોય, ત્યારે સ્પર્શક સમક્ષિતિજ હોય છે અને લઘુત્તમ ભૂલ મળે છે!",
      matrixTitle: '2D સુરેખ રૂપાંતરણ અને નિશ્ચાયક (Determinant) ભૂમિતિ',
      matrixDesc: 'એકમ સદિશો î અને ĵ ને અવકાશ બદલતા જુઓ. નિશ્ચાયક det(A) ક્ષેત્રફળ સ્કેલિંગ પરિબળ દર્શાવે છે.',
      matrixBoxTitle: 'રૂપાંતરણ શ્રેણિક A',
      detCalcTitle: 'નિશ્ચાયક (Determinant) ગણતરી:',
      singularMsg: '⚠️ અવ્યુત્ક્રમણીય શ્રેણિક (Rank 1): 2D અવકાશ 1D રેખામાં સંકોચાઈ ગયું છે! વ્યસ્ત શ્રેણિક અસ્તિત્વમાં નથી.',
      invertedMsg: '🔄 દિશા ઉલટાઈ ગઈ (ઋણ નિશ્ચાયક): યામ અવકાશ પ્રતિબિંબિત/ફ્લિપ થઈ ગયું છે.',
      preserveMsg: '✓ દિશા જાળવી રાખે છે: એકમ ક્ષેત્રફળનું પ્રમાણ',
      cgBadge: 'કોમ્પ્યુટર ગ્રાફિક્સ અને વિઝન લિંક',
      cgTitle: '3D કેમેરા વ્યૂપોર્ટ અને GPU શેડર્સ',
      cgDesc: 'દરેક વિડિયો ગેમ અને કોમ્પ્યુટર વિઝન મોડેલ લાખો 3D બિંદુઓને 4x4 શ્રેણિક વડે ગુણીને 2D સ્ક્રીન પિક્સેલમાં ફેરવે છે!',
      bstTitle: 'ઇન્ટરેક્ટિવ બાઇનરી સર્ચ ટ્રી (BST)',
      bstDesc: 'O(log n) સમયમાં ક્રમબદ્ધ વિભાજન જોવા માટે સંખ્યાઓ ઉમેરો.',
      insertNode: 'નોડ ઉમેરો',
      inOrderLabel: 'ઇન-ઓર્ડર ક્રમબદ્ધ ટ્રાવર્સલ:',
      lruTitle: 'ઇન્ટરેક્ટિવ LRU કેશ સિમ્યુલેટર',
      lruDesc: 'ડબલી લિંક્ડ લિસ્ટ + હેશ મેપ દ્વારા ક્ષમતા 3 સાથે O(1) રીડ અને રાઇટ.',
      liveCacheMem: 'લાઇવ કેશ મેમરી (MRU → LRU):',
      opStream: 'ઓપરેશન લોગ:',
      dictTitle: 'બહુભાષી તકનીકી અને ગાણિતિક શબ્દકોશ',
      dictDesc: 'તમારી પ્રાદેશિક માતૃભાષામાં અદ્યતન એન્જિનિયરિંગ, ગાણિતિક અને અલ્ગોરિધમિક સિદ્ધાંતોની સરળ સમજૂતી.',
      activeDialect: 'સક્રિય ભાષા:'
    },
    Marathi: {
      pageTitle: 'इंटरॅक्टिव्ह बहुभाषिक आणि दृश्य/प्रात्यक्षिक शिक्षण',
      pageDesc: 'इंटरॅक्टिव्ह कलन (Calculus) व्हिज्युअलायझर, 2D मॅट्रिक्स रूपांतरण सँडबॉक्स, अल्गोरिदम आणि मातृभाषेत संकल्पनांचे स्पष्टीकरण.',
      langLabel: 'भाषा:',
      tabCalculus: '📈 कलन आणि स्पर्शिका एक्सप्लोरर',
      tabMatrix: '🔄 2D मॅट्रिक्स रूपांतरण सँडबॉक्स',
      tabAlgorithms: '⚡ अल्गोरिदम आणि सिस्टम सँडबॉक्स',
      tabMultilingual: '🌐 बहुभाषिक संकल्पना शब्दकोश',
      calcTitle: 'इंटरॅक्टिव्ह कलन आणि बदल दर व्हिज्युअलायझर',
      calcDesc: 'तात्कालिक उतार (अवकलन) आणि संचित क्षेत्रफळ (समाकलन) मधील बदल पाहण्यासाठी स्लायडर हलवा.',
      parabola: 'परवलय (Parabola)',
      cubic: 'घन (Cubic)',
      clickHint: 'इंटरॅक्टिव्ह: आलेखावर कुठेही क्लिक करा',
      selectPoint: 'इनपुट बिंदू x₀ निवडा:',
      liveCalcTitle: 'थेट विश्लेषणात्मक गणना',
      instSlope: 'तात्कालिक उतार',
      defIntegral: 'निश्चित समाकलन',
      tangentEqAt: 'स्पर्शिका रेषेचे समीकरण',
      aiLinkBadge: 'AI आणि मशीन लर्निंग लिंक',
      aiLinkTitle: 'ग्रेडियंट डिसेंट आणि बॅकप्रोपगेशन',
      aiLinkDesc1: 'न्यूरल नेटवर्कमध्ये, लॉस फंक्शन Loss(w) अवकलनाच्या विरुद्ध दिशेने पाऊल टाकून कमी केले जाते:',
      aiLinkDesc2: "लक्षात घ्या की जेव्हा f'(x) = 0 असते, तेव्हा स्पर्शिका क्षितिजसमांतर असते आणि किमान त्रुटी मिळते!",
      matrixTitle: '2D रेषीय रूपांतरण आणि निश्चयक (Determinant) भूमिती',
      matrixDesc: 'मूळ सदिश î आणि ĵ अवकाश कसे बदलतात ते पहा. निश्चयक det(A) क्षेत्रफळ स्केलिंग दर्शवतो.',
      matrixBoxTitle: 'रूपांतरण मॅट्रिक्स A',
      detCalcTitle: 'निश्चयक (Determinant) गणना:',
      singularMsg: '⚠️ सिंगुलर मॅट्रिक्स (Rank 1): 2D अवकाश 1D रेषेत संकुचित झाले! व्यस्त मॅट्रिक्स अस्तित्वात नाही.',
      invertedMsg: '🔄 दिशा उलटली (ऋण निश्चयक): समन्वय अवकाश परावर्तित/फ्लिप झाले आहे.',
      preserveMsg: '✓ दिशा कायम ठेवते: एकक क्षेत्रफळाचे प्रमाण',
      cgBadge: 'संगणक ग्राफिक्स आणि व्हिजन लिंक',
      cgTitle: '3D कॅमेरा व्ह्यूपोर्ट आणि GPU शेडर्स',
      cgDesc: 'प्रत्येक व्हिडिओ गेम आणि कॉम्प्युटर व्हिजन मॉडेल लाखो 3D निर्देशांकांना 4x4 मॅट्रिक्सने गुणून 2D स्क्रीन पिक्सेलमध्ये रूपांतरित करते!',
      bstTitle: 'इंटरॅक्टिव्ह बायनरी शोध ट्री (BST)',
      bstDesc: 'O(log n) वेळेत क्रमबद्ध विभाजन पाहण्यासाठी संख्या जोडा.',
      insertNode: 'नोड जोडा',
      inOrderLabel: 'इन-ऑर्डर क्रमबद्ध ट्रॅव्हर्सल:',
      lruTitle: 'इंटरॅक्टिव्ह LRU कॅश सिम्युलेटर',
      lruDesc: 'डबली लिंक्ड लिस्ट + हॅश मॅपद्वारे क्षमता 3 सह O(1) वाचन आणि लेखन.',
      liveCacheMem: 'थेट कॅश मेमरी (MRU → LRU):',
      opStream: 'ऑपरेशन लॉग:',
      dictTitle: 'बहुभाषिक तांत्रिक आणि गणिती शब्दकोश',
      dictDesc: 'तुमच्या प्रादेशिक मातृभाषेत प्रगत अभियांत्रिकी, गणिती आणि अल्गोरिदमिक तत्त्वांचे सोपे स्पष्टीकरण.',
      activeDialect: 'सक्रिय भाषा:'
    },
    Tamil: {
      pageTitle: 'ஊடாடும் பன்மொழி மற்றும் காட்சி/செயல்முறை கற்றல்',
      pageDesc: 'ஊடாடும் நுண்கணித காட்சிப்படுத்திகள், 2D அணி உருமாற்ற சான்ட்பாக்ஸ்கள், வழிமுறைகள் மற்றும் தாய்மொழியில் கருத்து விளக்கங்கள்.',
      langLabel: 'மொழி:',
      tabCalculus: '📈 நுண்கணிதம் & தொடுகோடு ஆய்வி',
      tabMatrix: '🔄 2D அணி உருமாற்ற சான்ட்பாக்ஸ்',
      tabAlgorithms: '⚡ வழிமுறைகள் & கணினி சான்ட்பாக்ஸ்',
      tabMultilingual: '🌐 பன்மொழி கருத்து அகராதி',
      calcTitle: 'ஊடாடும் நுண்கணிதம் மற்றும் மாற்ற விகித காட்சிப்படுத்தி',
      calcDesc: 'உடனடி சாய்வு (வகைக்கெழு) மற்றும் பரப்பளவு (தொகையீடு) எவ்வாறு மாறுகிறது என்பதைக் காண ஸ்லைடரை நகர்த்தவும்.',
      parabola: 'பரவளையம் (Parabola)',
      cubic: 'முப்படி (Cubic)',
      clickHint: 'ஊடாடும்: வரைபடத்தில் எங்கு வேண்டுமானாலும் கிளிக் செய்யவும்',
      selectPoint: 'உள்ளீட்டு புள்ளி x₀ ஐத் தேர்ந்தெடுக்கவும்:',
      liveCalcTitle: 'நேரடி பகுப்பாய்வு கணக்கீடுகள்',
      instSlope: 'உடனடி சாய்வு',
      defIntegral: 'வரையறுக்கப்பட்ட தொகையீடு',
      tangentEqAt: 'தொடுகோட்டு சமன்பாடு',
      aiLinkBadge: 'AI & இயந்திர கற்றல் இணைப்பு',
      aiLinkTitle: 'கிரேடியன்ட் டிசென்ட் & பேக்ரோபகேஷன்',
      aiLinkDesc1: 'நரம்பியல் வலையமைப்புகளில், இழப்புச் சார்பு Loss(w) வகைக்கெழுவிற்கு எதிர் திசையில் குறைக்கப்படுகிறது:',
      aiLinkDesc2: "f'(x) = 0 ஆக இருக்கும்போது தொடுகோடு கிடைமட்டமாக மாறி குறைந்தபட்ச பிழையை அடைகிறது!",
      matrixTitle: '2D நேரியல் உருமாற்றம் & அணிக்கோவை வடிவியல்',
      matrixDesc: 'அடிப்படை வெக்டார்கள் î மற்றும் ĵ வெளியை மாற்றுவதைப் பாருங்கள். det(A) பரப்பளவு மாற்றத்தைக் குறிக்கிறது.',
      matrixBoxTitle: 'உருமாற்ற அணி A',
      detCalcTitle: 'அணிக்கோவை (Determinant) கணக்கீடு:',
      singularMsg: '⚠️ ஒருமை அணி (Rank 1): 2D வெளி 1D கோடாக சுருங்கியது! நேர்மாறு அணி இல்லை.',
      invertedMsg: '🔄 திசை தலைகீழானது (எதிர்மறை அணிக்கோவை): ஆயத்தொலைவு வெளி பிரதிபலிக்கப்பட்டது.',
      preserveMsg: '✓ திசையைப் பாதுகாக்கிறது: அலகு பரப்பளவு பெருக்கல் காரணி',
      cgBadge: 'கணினி வரைகலை & பார்வை இணைப்பு',
      cgTitle: '3D கேமரா காட்சிகள் & GPU ஷேடர்கள்',
      cgDesc: 'ஒவ்வொரு வீடியோ கேமும் 3D ஆயத்தொலைவுகளை 4x4 அணிகளால் பெருக்கி 2D திரை பிக்சல்களாக மாற்றுகிறது!',
      bstTitle: 'ஊடாடும் இருமை தேடல் மரம் (BST)',
      bstDesc: 'O(log n) நேரத்தில் வரிசைப்படுத்தப்பட்ட தேடலைக் காண எண்களைச் சேர்க்கவும்.',
      insertNode: 'முனை சேர்',
      inOrderLabel: 'வரிசைப்படுத்தப்பட்ட பயணம் (In-Order):',
      lruTitle: 'ஊடாடும் LRU கேச் சிமுலேட்டர்',
      lruDesc: 'இரட்டை இணைப்புப் பட்டியல் + ஹேஷ் மேப் மூலம் O(1) வேகத்தில் தரவு சேமிப்பு.',
      liveCacheMem: 'நேரடி கேச் நினைவகம் (MRU → LRU):',
      opStream: 'செயல்பாட்டு பதிவு:',
      dictTitle: 'பன்மொழி தொழில்நுட்ப மற்றும் கணித அகராதி',
      dictDesc: 'உங்கள் தாய்மொழியில் மேம்பட்ட பொறியியல், கணிதம் மற்றும் கணினி வழிமுறைகளின் எளிய விளக்கம்.',
      activeDialect: 'செயலில் உள்ள மொழி:'
    },
    Telugu: {
      pageTitle: 'ఇంటరాక్టివ్ బహుభాషా & దృశ్య/ఆచరణాత్మక అభ్యాసం',
      pageDesc: 'ఇంటరాక్టివ్ కలన గణిత విజువలైజర్లు, 2D మాత్రిక పరివర్తన శాండ్‌బాక్స్‌లు, అల్గారిథమ్‌లు మరియు మాతృభాషలో భావనల వివరణ.',
      langLabel: 'భాష:',
      tabCalculus: '📈 కలన గణితం & స్పర్శరేఖ ఎక్స్‌ప్లోరర్',
      tabMatrix: '🔄 2D మాత్రిక పరివర్తన శాండ్‌బాక్స్',
      tabAlgorithms: '⚡ అల్గారిథమ్‌లు & సిస్టమ్ శాండ్‌బాక్స్',
      tabMultilingual: '🌐 బహుభాషా భావనల నిఘంటువు',
      calcTitle: 'ఇంటరాక్టివ్ కలన గణితం & మార్పు రేటు విజువలైజర్',
      calcDesc: 'తక్షణ వాలు (అవకలనం) మరియు వైశాల్యం (సమాకలనం) రియల్ టైమ్‌లో ఎలా మారుతాయో చూడటానికి స్లైడర్‌ను కదపండి.',
      parabola: 'పరావలయం (Parabola)',
      cubic: 'ఘన (Cubic)',
      clickHint: 'ఇంటరాక్టివ్: గ్రాఫ్‌పై ఎక్కడైనా క్లిక్ చేయండి',
      selectPoint: 'ఇన్‌పుట్ బిందువు x₀ ఎంచుకోండి:',
      liveCalcTitle: 'లైవ్ విశ్లేషణాత్మక గణనలు',
      instSlope: 'తక్షణ వాలు',
      defIntegral: 'నిశ్చిత సమాకలనం',
      tangentEqAt: 'స్పర్శరేఖ సమీకరణం',
      aiLinkBadge: 'AI & మెషిన్ లెర్నింగ్ లింక్',
      aiLinkTitle: 'గ్రేడియంట్ డిసెంట్ & బ్యాక్‌ప్రొపగేషన్',
      aiLinkDesc1: 'న్యూరల్ నెట్‌వర్క్‌లలో, లాస్ ఫంక్షన్ Loss(w) అవకలనానికి వ్యతిరేక దిశలో అడుగు వేయడం ద్వారా కనిష్టీకరించబడుతుంది:',
      aiLinkDesc2: "f'(x) = 0 అయినప్పుడు స్పర్శరేఖ సమాంతరంగా మారి కనిష్ట దోషం వద్ద స్థిరపడుతుంది!",
      matrixTitle: '2D లీనియర్ పరివర్తన & నిర్ధారణ (Determinant) జ్యామితి',
      matrixDesc: 'ఆధార సదిశలు î మరియు ĵ స్థలాన్ని ఎలా మారుస్తాయో చూడండి. det(A) వైశాల్య స్కేలింగ్ కారకాన్ని సూచిస్తుంది.',
      matrixBoxTitle: 'పరివర్తన మాత్రిక A',
      detCalcTitle: 'నిర్ధారణ (Determinant) గణన:',
      singularMsg: '⚠️ సింగులర్ మాత్రిక (Rank 1): 2D స్థలం 1D రేఖగా కుదించబడింది! విలోమ మాత్రిక లేదు.',
      invertedMsg: '🔄 దిశ తారుమారైంది (రుణాత్మక నిర్ధారణ): నిరూపక స్థలం ప్రతిబింబించబడింది.',
      preserveMsg: '✓ దిశను నిలుపుకుంటుంది: యూనిట్ వైశాల్య గుణకం',
      cgBadge: 'కంప్యూటర్ గ్రాఫిక్స్ & విజన్ లింక్',
      cgTitle: '3D కెమెరా వ్యూపోర్ట్‌లు & GPU షేడర్లు',
      cgDesc: 'ప్రతి వీడియో గేమ్ మరియు కంప్యూటర్ విజన్ మోడల్ 3D నిరూపకాలను 4x4 మాత్రికలతో గుణించి 2D స్క్రీన్ పిక్సెల్‌లుగా మారుస్తుంది!',
      bstTitle: 'ఇంటరాక్టివ్ బైనరీ శోధన వృక్షం (BST)',
      bstDesc: 'O(log n) సమయంలో క్రమబద్ధ శోధనను చూడటానికి సంఖ్యలను జోడించండి.',
      insertNode: 'నోడ్ జోడించు',
      inOrderLabel: 'ఇన్-ఆర్డర్ క్రమబద్ధ ట్రావర్సల్:',
      lruTitle: 'ఇంటరాక్టివ్ LRU క్యాష్ సిమ్యులేటర్',
      lruDesc: 'డబ్లీ లింక్డ్ లిస్ట్ + హ్యాష్ మ్యాప్ ద్వారా O(1) వేగంతో రీడ్ మరియు రైట్.',
      liveCacheMem: 'లైవ్ క్యాష్ మెమరీ (MRU → LRU):',
      opStream: 'ఆపరేషన్ లాగ్:',
      dictTitle: 'బహుభాషా సాంకేతిక & గణిత నిఘంటువు',
      dictDesc: 'మీ ప్రాంతీయ మాతృభాషలో ఇంజనీరింగ్, గణిత మరియు అల్గారిథమిక్ సూత్రాల సులభ వివరణ.',
      activeDialect: 'ప్రస్తుత భాష:'
    },
    Bengali: {
      pageTitle: 'ইন্টারঅ্যাক্টিভ বহুভাষিক এবং ভিজ্যুয়াল/ব্যবহারিক শিক্ষা',
      pageDesc: 'ইন্টারঅ্যাক্টিভ ক্যালকুলাস ভিজ্যুয়ালাইজার, 2D ম্যাট্রিক্স রূপান্তর স্যান্ডবক্স, অ্যালগরিদম এবং মাতৃভাষায় ধারণার বিশ্লেষণ।',
      langLabel: 'ভাষা:',
      tabCalculus: '📈 ক্যালকুলাস ও স্পর্শক এক্সপ্লোরার',
      tabMatrix: '🔄 2D ম্যাট্রিক্স রূপান্তর স্যান্ডবক্স',
      tabAlgorithms: '⚡ অ্যালগরিদম ও সিস্টেম স্যান্ডবক্স',
      tabMultilingual: '🌐 বহুভাষিক ধারণা অভিধান',
      calcTitle: 'ইন্টারঅ্যাক্টিভ ক্যালকুলাস এবং পরিবর্তনের হার ভিজ্যুয়ালাইজার',
      calcDesc: 'তাৎক্ষণিক ঢাল (অন্তরকলন) এবং সঞ্চিত ক্ষেত্রফল (সমাকলন) কীভাবে পরিবর্তিত হয় তা দেখতে স্লাইডারটি সরান।',
      parabola: 'পরাবৃত্ত (Parabola)',
      cubic: 'ত্রিঘাত (Cubic)',
      clickHint: 'ইন্টারঅ্যাক্টিভ: গ্রাফের যেকোনো স্থানে ক্লিক করুন',
      selectPoint: 'ইনপুট বিন্দু x₀ নির্বাচন করুন:',
      liveCalcTitle: 'লাইভ বিশ্লেষণাত্মক গণনা',
      instSlope: 'তাৎক্ষণিক ঢাল',
      defIntegral: 'নির্দিষ্ট সমাকলন',
      tangentEqAt: 'স্পর্শক রেখার সমীকরণ',
      aiLinkBadge: 'AI ও মেশিন লার্নিং সংযোগ',
      aiLinkTitle: 'গ্রেডিয়েন্ট ডিসেন্ট ও ব্যাকপ্রোপাগেশন',
      aiLinkDesc1: 'নিউরাল নেটওয়ার্কে, লস ফাংশন Loss(w) অন্তরকলনের বিপরীত দিকে ধাপ ফেলে সর্বনিম্ন করা হয়:',
      aiLinkDesc2: "লক্ষ্য করুন যখন f'(x) = 0 হয়, তখন স্পর্শক সম্পূর্ণ অনুভূমিক হয় এবং সর্বনিম্ন ত্রুটি অর্জিত হয়!",
      matrixTitle: '2D রৈখিক রূপান্তর ও নির্ণায়ক (Determinant) জ্যামিতি',
      matrixDesc: 'ভিত্তি ভেক্টর î এবং ĵ কীভাবে স্থান পরিবর্তন করে তা দেখুন। নির্ণায়ক det(A) ক্ষেত্রফল স্কেলিং নির্দেশ করে।',
      matrixBoxTitle: 'রূপান্তর ম্যাট্রিক্স A',
      detCalcTitle: 'নির্ণায়ক (Determinant) গণনা:',
      singularMsg: '⚠️ সিঙ্গুলার ম্যাট্রিক্স (Rank 1): 2D স্থান 1D রেখায় সংকুচিত হয়েছে! কোনো বিপরীত ম্যাট্রিক্স নেই।',
      invertedMsg: '🔄 দিক উল্টে গেছে (ঋণাত্মক নির্ণায়ক): স্থানাঙ্ক স্থান প্রতিফলিত/ফ্লিপ হয়েছে।',
      preserveMsg: '✓ দিক বজায় রাখে: একক ক্ষেত্রফলের গুণিতক',
      cgBadge: 'কম্পিউটার গ্রাফিক্স ও ভিশন সংযোগ',
      cgTitle: '3D ক্যামেরা ভিউপোর্ট ও GPU শেডার্স',
      cgDesc: 'প্রতিটি ভিডিও গেম এবং কম্পিউটার ভিশন মডেল লক্ষ লক্ষ 3D স্থানাঙ্ককে 4x4 ম্যাট্রিক্স দিয়ে গুণ করে 2D স্ক্রিন পিক্সেলে রূপান্তর করে!',
      bstTitle: 'ইন্টারঅ্যাক্টিভ বাইনারি সার্চ ট্রি (BST)',
      bstDesc: 'O(log n) সময়ে ক্রমবদ্ধ বিভাজন দেখতে সংখ্যা যোগ করুন।',
      insertNode: 'নোড যোগ করুন',
      inOrderLabel: 'ইন-অর্ডার ক্রমবদ্ধ ট্র্যাভার্সাল:',
      lruTitle: 'ইন্টারঅ্যাক্টিভ LRU ক্যাশ সিমুলেটর',
      lruDesc: 'ডাবলি লিঙ্কড লিস্ট + হ্যাশ ম্যাপের মাধ্যমে O(1) সময়ে ডেটা রিড ও রাইট।',
      liveCacheMem: 'লাইভ ক্যাশ মেমরি (MRU → LRU):',
      opStream: 'অপারেশন লগ:',
      dictTitle: 'বহুভাষিক প্রযুক্তিগত ও গাণিতিক অভিধান',
      dictDesc: 'আপনার আঞ্চলিক মাতৃভাষায় উন্নত ইঞ্জিনিয়ারিং, গাণিতিক এবং অ্যালগরিদমিক নীতিগুলির সহজ ব্যাখ্যা।',
      activeDialect: 'সক্রিয় ভাষা:'
    }
  };

  const ui = LEARNING_UI_I18N[selectedLang] || LEARNING_UI_I18N['English'];

  // 1. Calculus State
  const [calcFunc, setCalcFunc] = useState<'poly' | 'trig' | 'cubic'>('poly');
  const [x0, setX0] = useState<number>(1.0);

  // 2. Matrix State
  const [matA, setMatA] = useState<number>(1.0);
  const [matB, setMatB] = useState<number>(0.5);
  const [matC, setMatC] = useState<number>(0.0);
  const [matD, setMatD] = useState<number>(1.0);

  // 3. BST Sandbox State
  const [bstNodes, setBstNodes] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  const [newBstVal, setNewBstVal] = useState<string>('');

  // 4. LRU Cache State
  const [lruCache, setLruCache] = useState<{ key: string; val: string }[]>([
    { key: 'user:1', val: 'Alice' },
    { key: 'user:2', val: 'Bob' },
    { key: 'user:3', val: 'Charlie' }
  ]);
  const [cacheLog, setCacheLog] = useState<string[]>(['Cache initialized with capacity 3']);
  const [cacheKeyInput, setCacheKeyInput] = useState('');
  const [cacheValInput, setCacheValInput] = useState('');

  // Calculus Calculations (Bounded to [-4.5, 4.5] range to prevent SVG overflow)
  let fx = 0;
  let dfx = 0;
  let integral = 0;
  let funcLabel = '';
  let derivLabel = '';

  const evalFunc = (x: number) => {
    if (calcFunc === 'poly') return 0.5 * x * x - 2;
    if (calcFunc === 'trig') return 2.5 * Math.sin(x);
    return 0.2 * Math.pow(x, 3) - x;
  };

  if (calcFunc === 'poly') {
    funcLabel = 'f(x) = 0.5x² - 2';
    derivLabel = "f'(x) = x";
    fx = evalFunc(x0);
    dfx = x0;
    integral = (0.5 * Math.pow(x0, 3) / 3) - 2 * x0;
  } else if (calcFunc === 'trig') {
    funcLabel = 'f(x) = 2.5 sin(x)';
    derivLabel = "f'(x) = 2.5 cos(x)";
    fx = evalFunc(x0);
    dfx = 2.5 * Math.cos(x0);
    integral = 2.5 * (1 - Math.cos(x0));
  } else {
    funcLabel = 'f(x) = 0.2x³ - x';
    derivLabel = "f'(x) = 0.6x² - 1";
    fx = evalFunc(x0);
    dfx = 0.6 * Math.pow(x0, 2) - 1;
    integral = (0.05 * Math.pow(x0, 4)) - (0.5 * Math.pow(x0, 2));
  }

  // Generate SVG curve points for calculus (strictly clamped to viewport)
  const width = 360;
  const height = 220;
  const xMin = -3.0;
  const xMax = 3.0;
  const yMin = -4.5;
  const yMax = 4.5;

  const toSvgX = (x: number) => {
    const clamped = Math.max(xMin, Math.min(xMax, x));
    return ((clamped - xMin) / (xMax - xMin)) * width;
  };
  const toSvgY = (y: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, y));
    return height - ((clamped - yMin) / (yMax - yMin)) * height;
  };

  let curvePoints = '';
  for (let x = xMin; x <= xMax; x += 0.05) {
    const y = evalFunc(x);
    const sx = toSvgX(x);
    const sy = toSvgY(y);
    curvePoints += `${x === xMin ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
  }

  // Tangent line bounded within plot window
  const tanSpan = 1.3;
  const tanX1 = Math.max(xMin, x0 - tanSpan);
  const tanY1 = Math.max(yMin, Math.min(yMax, evalFunc(x0) + dfx * (tanX1 - x0)));
  const tanX2 = Math.min(xMax, x0 + tanSpan);
  const tanY2 = Math.max(yMin, Math.min(yMax, evalFunc(x0) + dfx * (tanX2 - x0)));

  // Shaded integral area polygon
  let areaPoly = `M ${toSvgX(0).toFixed(1)} ${toSvgY(0).toFixed(1)} `;
  const step = x0 >= 0 ? 0.05 : -0.05;
  if (Math.abs(x0) > 0.01) {
    for (let x = 0; Math.abs(x) <= Math.abs(x0); x += step) {
      const y = evalFunc(x);
      areaPoly += `L ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)} `;
    }
  }
  areaPoly += `L ${toSvgX(x0).toFixed(1)} ${toSvgY(0).toFixed(1)} Z`;

  // Matrix Determinant & Basis Vectors
  const det = matA * matD - matB * matC;
  const originX = 170;
  const originY = 130;
  const scale = 50;

  // Transformed vectors
  const iX = originX + matA * scale;
  const iY = originY - matC * scale;
  const jX = originX + matB * scale;
  const jY = originY - matD * scale;
  const cornerX = originX + (matA + matB) * scale;
  const cornerY = originY - (matC + matD) * scale;

  // Matrix Presets
  const applyMatrixPreset = (name: string) => {
    if (name === 'identity') { setMatA(1); setMatB(0); setMatC(0); setMatD(1); }
    else if (name === 'rot45') { setMatA(0.71); setMatB(-0.71); setMatC(0.71); setMatD(0.71); }
    else if (name === 'rot90') { setMatA(0); setMatB(-1); setMatC(1); setMatD(0); }
    else if (name === 'shearX') { setMatA(1); setMatB(1); setMatC(0); setMatD(1); }
    else if (name === 'shearY') { setMatA(1); setMatB(0); setMatC(1); setMatD(1); }
    else if (name === 'reflect') { setMatA(-1); setMatB(0); setMatC(0); setMatD(1); }
    else if (name === 'singular') { setMatA(1); setMatB(1); setMatC(1); setMatD(1); }
  };

  // BST Handler
  const handleAddBstNode = () => {
    const num = parseInt(newBstVal.trim(), 10);
    if (!isNaN(num) && !bstNodes.includes(num)) {
      setBstNodes([...bstNodes, num].sort((a, b) => a - b));
      setNewBstVal('');
    }
  };

  // LRU Handlers
  const handleLruPut = () => {
    if (!cacheKeyInput.trim()) return;
    const key = cacheKeyInput.trim();
    const val = cacheValInput.trim() || 'Data';
    let nextCache = lruCache.filter((c) => c.key !== key);
    let evictedMsg = '';
    if (nextCache.length >= 3) {
      const evicted = nextCache.shift();
      evictedMsg = ` -> Evicted LRU key '${evicted?.key}'`;
    }
    nextCache.push({ key, val });
    setLruCache(nextCache);
    setCacheLog((prev) => [`PUT key="${key}" val="${val}"${evictedMsg}`, ...prev.slice(0, 4)]);
    setCacheKeyInput('');
    setCacheValInput('');
  };

  const handleLruGet = (key: string) => {
    const item = lruCache.find((c) => c.key === key);
    if (item) {
      const nextCache = [...lruCache.filter((c) => c.key !== key), item];
      setLruCache(nextCache);
      setCacheLog((prev) => [`GET key="${key}" -> HIT: "${item.val}" (Promoted to MRU)`, ...prev.slice(0, 4)]);
    } else {
      setCacheLog((prev) => [`GET key="${key}" -> MISS (Not in cache)`, ...prev.slice(0, 4)]);
    }
  };

  // Multilingual Dictionary
  const DICTIONARY: Record<string, any[]> = {
    English: [
      { term: 'Differential Calculus', native: 'Calculus (dy/dx)', translit: 'Differentiation', desc: 'The mathematical study of continuous instantaneous rates of change and tangent slopes.' },
      { term: 'Riemann Integration', native: 'Definite Integral (∫ f(x)dx)', translit: 'Integration', desc: 'Accumulation of continuous quantities, calculating net area under curve and cumulative totals.' },
      { term: 'Matrix Transformation', native: 'Linear Algebra (Ax = b)', translit: 'Transformation', desc: 'Mapping coordinate bases from one space to another via linear combinations.' },
      { term: 'Binary Search Tree', native: 'Data Structures (BST)', translit: 'Hierarchical Tree', desc: 'A hierarchical node tree where left child < root < right child, providing O(log n) lookups.' },
      { term: 'Gradient Descent', native: 'Optimization (∇L)', translit: 'Weight Update', desc: 'Iterative optimization algorithm for finding local minima of differentiable loss functions in AI.' },
      { term: 'LRU Cache Eviction', native: 'System Memory (O(1))', translit: 'Least Recently Used', desc: 'Combines a doubly linked list and hash map to evict the oldest unused page in constant time.' }
    ],
    Hindi: [
      { term: 'Differential Calculus', native: 'अवकलन (Differentiation)', translit: 'Avakalan', desc: 'तात्कालिक परिवर्तन की दर और स्पर्शरेखा ढलान का गणितीय अध्ययन।' },
      { term: 'Riemann Integration', native: 'समाकलन (Integration)', translit: 'Samakalan', desc: 'सतत मात्राओं का संचय, वक्र के नीचे कुल क्षेत्रफल और संचयी योग की गणना।' },
      { term: 'Matrix Transformation', native: 'आव्यूह रूपांतरण (Matrix Transform)', translit: 'Aavyooh Roopantaran', desc: 'रैखिक संयोजनों के माध्यम से निर्देशांक आधार को एक स्थान से दूसरे स्थान पर मैप करना।' },
      { term: 'Binary Search Tree', native: 'द्वि-आधारी खोज वृक्ष (BST)', translit: 'Dvi-Aadhari Khoj Vriksh', desc: 'पदानुक्रमित नोड ट्री जहाँ बायाँ नोड < मूल < दायाँ नोड, जो O(log n) खोज प्रदान करता है।' },
      { term: 'Gradient Descent', native: 'प्रवणता अवरोहण (Gradient Descent)', translit: 'Pravanata Avarohan', desc: 'न्यूरल नेटवर्क में त्रुटि (Loss) को न्यूनतम करने के लिए अवकलन की विपरीत दिशा में भार अद्यतन।' },
      { term: 'LRU Cache Eviction', native: 'एलआरयू कैश स्मृति (LRU Cache)', translit: 'Kam Upayog Smriti', desc: 'डबली लिंक्ड लिस्ट और हैश मैप का उपयोग करके O(1) समय में सबसे पुरानी मेमोरी प्रविष्टि हटाना।' }
    ],
    Gujarati: [
      { term: 'Differential Calculus', native: 'વિકલન (Differentiation)', translit: 'Vikalan', desc: 'ક્ષણિક પરિવર્તનનો દર અને સ્પર્શક ઢોળાવનો ગણિતીય અભ્યાસ.' },
      { term: 'Riemann Integration', native: 'સંકલન (Integration)', translit: 'Sankalan', desc: 'સતત જથ્થાઓનો સંગ્રહ અને વક્ર નીચેના કુલ ક્ષેત્રફળની ગણતરી.' },
      { term: 'Matrix Transformation', native: 'શ્રેણિક રૂપાંતરણ (Matrix Transform)', translit: 'Shrenik Roopantaran', desc: 'સુરેખ સંયોજનો દ્વારા યામ પદ્ધતિનું એક સ્થાનથી બીજા સ્થાન પર રૂપાંતરણ.' },
      { term: 'Binary Search Tree', native: 'દ્વિ-અંકી શોધ વૃક્ષ (BST)', translit: 'Dvi-Anki Shodh Vriksh', desc: 'એક વૃક્ષ સંરચના જ્યાં ડાબી બાજુનું ઘટક < મૂળ < જમણી બાજુનું ઘટક હોય છે.' },
      { term: 'Gradient Descent', native: 'ઢોળાવ અવરોહણ (Gradient Descent)', translit: 'Dholav Avarohan', desc: 'AI મોડેલમાં ભૂલ (Loss) ઘટાડવા માટે વિકલનની વિરુદ્ધ દિશામાં પુનરાવર્તિત ઑપ્ટિમાઇઝેશન.' },
      { term: 'LRU Cache Eviction', native: 'LRU કેશ મેમરી (O(1) Cache)', translit: 'ochhu Vaparayel Smruti', desc: 'ડબલી લિંક્ડ લિસ્ટ અને હેશ મેપ વડે O(1) સમયમાં સૌથી જૂની બિનવપરાયેલ માહિતી દૂર કરવી.' }
    ],
    Marathi: [
      { term: 'Differential Calculus', native: 'अवकलन (Differentiation)', translit: 'Avakalan', desc: 'तात्कालिक बदल दर आणि स्पर्शिका उताराचा गणिती अभ्यास.' },
      { term: 'Riemann Integration', native: 'समाकलन (Integration)', translit: 'Samakalan', desc: 'वक्राखालील एकूण क्षेत्रफळ आणि संचयी परिमाणांची गणना.' },
      { term: 'Matrix Transformation', native: 'मॅट्रिक्स रूपांतरण (Matrix Transform)', translit: 'Matrix Roopantaran', desc: 'रेषीय संयोजनांद्वारे समन्वय प्रणालीचे रूपांतरण.' },
      { term: 'Binary Search Tree', native: 'बायनरी शोध ट्री (BST)', translit: 'Binary Shodh Tree', desc: 'एक डेटा रचना जिथे डावा घटक < मूळ < उजवा घटक असतो.' },
      { term: 'Gradient Descent', native: 'उतार अवरोहण (Gradient Descent)', translit: 'Utar Avarohan', desc: 'मशीन लर्निंगमध्ये त्रुटी कमी करण्यासाठी अवकलनाच्या विरुद्ध दिशेने केलेले ऑप्टिमायझेशन.' },
      { term: 'LRU Cache Eviction', native: 'एलआरयू कॅश मेमरी (LRU Cache)', translit: 'Kiman Vaparleli Smruti', desc: 'हॅश मॅप आणि दुहेरी यादी वापरून O(1) वेळेत सर्वात जुनी कॅश नोंद काढून टाकणे.' }
    ],
    Tamil: [
      { term: 'Differential Calculus', native: 'வகை நுண்கணிதம் (Differentiation)', translit: 'Nunkalitham', desc: 'உடனடி மாற்ற விகிதம் மற்றும் தொடுகோட்டு சாய்வு பற்றிய கணித ஆய்வு.' },
      { term: 'Riemann Integration', native: 'தொகையீட்டு கணிதம் (Integration)', translit: 'Thogaiyeedu', desc: 'தொடர்ச்சியான அளவுகளின் குவிப்பு மற்றும் வளைவின் கீழ் பரப்பளவைக் கணக்கிடுதல்.' },
      { term: 'Matrix Transformation', native: 'அணி உருமாற்றம் (Matrix Transform)', translit: 'Ani Urumaattram', desc: 'நேரியல் சேர்க்கைகள் மூலம் ஒருங்கிணைப்பு தளங்களை ஒரு இடத்திலிருந்து மற்றொன்றுக்கு மாற்றுதல்.' },
      { term: 'Binary Search Tree', native: 'இருமை தேடல் மரம் (BST)', translit: 'Irumai Thedal Maram', desc: 'இடது குழந்தை < வேர் < வலது குழந்தை என்ற படிநிலை தரவு அமைப்பு (O(log n) தேடல்).' },
      { term: 'Gradient Descent', native: 'சரிவு இறக்கம் (Gradient Descent)', translit: 'Sarivu Irakkam', desc: 'செயற்கை நுண்ணறிவில் பிழையைக் குறைக்க வகைக்கெழுவிற்கு எதிர் திசையில் நகரும் முறை.' },
      { term: 'LRU Cache Eviction', native: 'LRU கேச் நினைவகம் (O(1))', translit: 'Kuraivaga Payanpaduthiya Ninaivagam', desc: 'இரட்டை இணைப்புப் பட்டியல் மூலம் O(1) நேரத்தில் பழைய தரவை நீக்கும் முறை.' }
    ],
    Telugu: [
      { term: 'Differential Calculus', native: 'అవకలన గణితం (Calculus)', translit: 'Avakalana Ganitam', desc: 'తక్షణ మార్పు రేటు మరియు స్పర్శరేఖ వాలుపై గణిత పరిశీలన.' },
      { term: 'Riemann Integration', native: 'సమాకలన గణితం (Integration)', translit: 'Samakalana Ganitam', desc: 'నిరంతర పరిమాణాల కూర్పు మరియు వక్రరేఖ కింద విస్తీర్ణాన్ని లెక్కించడం.' },
      { term: 'Matrix Transformation', native: 'మాత్రిక పరివర్తన (Matrix Transform)', translit: 'Matrika Parivartana', desc: 'లీనియర్ కాంబినేషన్ల ద్వారా సమన్వయ స్థానాన్ని మార్చే పద్ధతి.' },
      { term: 'Binary Search Tree', native: 'బైనరీ శోధన వృక్షం (BST)', translit: 'Binary Shodhana Vruksham', desc: 'ఎడమ నోడ్ < మూలం < కుడి నోడ్ నిబంధనతో పనిచేసే సోపానక్రమ శోధన నిర్మాణం.' },
      { term: 'Gradient Descent', native: 'గ్రేడియంట్ డిసెంట్ (అవరోహణ)', translit: 'Valu Avarohana', desc: 'మెషిన్ లెర్నింగ్‌లో దోషాన్ని తగ్గించడానికి అవకలనానికి వ్యతిరేక దిశలో జరిపే ఆప్టిమైజేషన్.' },
      { term: 'LRU Cache Eviction', native: 'LRU క్యాష్ మెమరీ (O(1))', translit: 'Takkuvaupayoginchina Smruti', desc: 'డబ్లీ లింక్డ్ లిస్ట్ మరియు హ్యాష్ మ్యాప్‌తో O(1) సమయంలో పాత డేటాను తొలగించే పద్ధతి.' }
    ],
    Bengali: [
      { term: 'Differential Calculus', native: 'অন্তরকলন (Differentiation)', translit: 'Ontor-kolon', desc: 'তাৎক্ষণিক পরিবর্তনের হার ও স্পর্শক ঢাল বিষয়ক গাণিতিক অধ্যয়ন।' },
      { term: 'Riemann Integration', native: 'সমাকলন (Integration)', translit: 'Somakolon', desc: 'ধারাবাহিক রাশির একত্রীকরণ ও বক্ররেখার নিচের ক্ষেত্রফল পরিমাপ।' },
      { term: 'Matrix Transformation', native: 'ম্যাট্রিক্স রূপান্তর (Matrix Transform)', translit: 'Matrix Rupantor', desc: 'রৈখিক রূপান্তরের মাধ্যমে স্থানাঙ্ক ব্যবস্থার বিন্যাস পরিবর্তন।' },
      { term: 'Binary Search Tree', native: 'বাইনারি অনুসন্ধান ট্রি (BST)', translit: 'Binary Onushondhan Tree', desc: 'একটি স্তরভিত্তিক ডেটা কাঠামো যেখানে বাম সন্তান < মূল < ডান সন্তান বজায় থাকে।' },
      { term: 'Gradient Descent', native: 'গ্রেডিয়েন্ট ডিসেন্ট (ঢাল অবরোহণ)', translit: 'Dhal Oborohon', desc: 'নিউরাল নেটওয়ার্কে ত্রুটি কমাতে অন্তরকলনের বিপরীত দিকে ধাপে ধাপে অপ্টিমাইজেশন।' },
      { term: 'LRU Cache Eviction', native: 'এলআরইউ ক্যাশ মেমরি (LRU Cache)', translit: 'Kom Byabohrito Smriti', desc: 'ডাবলি লিঙ্কড লিস্ট ও হ্যাশ ম্যাপের সাহায্যে O(1) সময়ে সবচেয়ে পুরনো ডেটা অপসারণ।' }
    ]
  };

  const activeDict = DICTIONARY[selectedLang] || DICTIONARY['English'];

  const handleGraphInteraction = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newX0 = xMin + ratio * (xMax - xMin);
    setX0(parseFloat(newX0.toFixed(2)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={ui.pageTitle}
        desc={ui.pageDesc}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#2C3524]">{ui.langLabel}</span>
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="p-1.5 rounded-lg border border-[#E1D6AE] bg-white text-xs font-semibold text-[#2C3524]"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
            </select>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-[#E1D6AE] gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculus')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'calculus'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {ui.tabCalculus}
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'matrix'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {ui.tabMatrix}
        </button>
        <button
          onClick={() => setActiveTab('algorithms')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'algorithms'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {ui.tabAlgorithms}
        </button>
        <button
          onClick={() => setActiveTab('multilingual')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'multilingual'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {ui.tabMultilingual}
        </button>
      </div>

      {/* 1. CALCULUS EXPLORER */}
      {activeTab === 'calculus' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* SVG Plotter (2 Cols) */}
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-semibold text-lg text-[#2C3524]">
                  {ui.calcTitle}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {ui.calcDesc}
                </p>
              </div>

              {/* Function Selector */}
              <div className="flex gap-1.5 bg-[#F2E8CF]/60 p-1 rounded-xl">
                <button
                  onClick={() => setCalcFunc('poly')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    calcFunc === 'poly' ? 'bg-sagedeep text-pcream shadow-sm' : 'text-[#2C3524]'
                  }`}
                >
                  {ui.parabola}
                </button>
                <button
                  onClick={() => setCalcFunc('trig')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    calcFunc === 'trig' ? 'bg-sagedeep text-pcream shadow-sm' : 'text-[#2C3524]'
                  }`}
                >
                  sin(x)
                </button>
                <button
                  onClick={() => setCalcFunc('cubic')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    calcFunc === 'cubic' ? 'bg-sagedeep text-pcream shadow-sm' : 'text-[#2C3524]'
                  }`}
                >
                  {ui.cubic}
                </button>
              </div>
            </div>

            {/* Live Interactive SVG Graph */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative select-none">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                  Curve: <strong className="text-sky-300">{funcLabel}</strong>
                </span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/50">
                  {ui.clickHint}
                </span>
              </div>
              <svg
                width="100%"
                height={240}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-hidden rounded-xl bg-slate-900/90 cursor-crosshair border border-slate-800/80"
                onClick={handleGraphInteraction}
                onMouseMove={(e) => {
                  if (e.buttons === 1) handleGraphInteraction(e);
                }}
              >
                <defs>
                  <clipPath id="calcPlotClip">
                    <rect x="0" y="0" width={width} height={height} rx="8" />
                  </clipPath>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                <g clipPath="url(#calcPlotClip)">
                  {/* Subtle Grid Lines */}
                  {[-2, -1, 1, 2].map((gx) => (
                    <line
                      key={`gx-${gx}`}
                      x1={toSvgX(gx)}
                      y1={0}
                      x2={toSvgX(gx)}
                      y2={height}
                      stroke="#334155"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                    />
                  ))}
                  {[-3, -1.5, 1.5, 3].map((gy) => (
                    <line
                      key={`gy-${gy}`}
                      x1={0}
                      y1={toSvgY(gy)}
                      x2={width}
                      y2={toSvgY(gy)}
                      stroke="#334155"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                    />
                  ))}

                  {/* Axes */}
                  <line x1={0} y1={toSvgY(0)} x2={width} y2={toSvgY(0)} stroke="#64748b" strokeWidth="1.5" />
                  <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={height} stroke="#64748b" strokeWidth="1.5" />

                  {/* Shaded Area Under Curve */}
                  <path d={areaPoly} fill="url(#areaGrad)" />

                  {/* Function Curve */}
                  <path d={curvePoints} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Tangent Line */}
                  <line
                    x1={toSvgX(tanX1)}
                    y1={toSvgY(tanY1)}
                    x2={toSvgX(tanX2)}
                    y2={toSvgY(tanY2)}
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    strokeDasharray="4 2"
                  />

                  {/* Point at x0 with ripple effect */}
                  <circle cx={toSvgX(x0)} cy={toSvgY(fx)} r="9" fill="#f43f5e" fillOpacity="0.25" />
                  <circle cx={toSvgX(x0)} cy={toSvgY(fx)} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />

                  {/* Dynamic Tooltip on the Point */}
                  <g transform={`translate(${Math.max(10, Math.min(width - 95, toSvgX(x0) - 45))}, ${toSvgY(fx) > 40 ? toSvgY(fx) - 30 : toSvgY(fx) + 12})`}>
                    <rect width="95" height="22" rx="4" fill="#0f172a" fillOpacity="0.92" stroke="#38bdf8" strokeWidth="1" />
                    <text x="47" y="15" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      ({x0.toFixed(2)}, {fx.toFixed(2)})
                    </text>
                  </g>
                </g>
              </svg>
              <div className="w-full flex justify-between text-[11px] text-slate-400 font-mono mt-2">
                <span>x = -3.0</span>
                <span className="text-emerald-400 font-semibold">Area: ∫₀^{x0.toFixed(1)} = {integral.toFixed(2)}</span>
                <span className="text-rose-400 font-semibold">Slope m = {dfx.toFixed(2)}</span>
                <span>x = +3.0</span>
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#2C3524]">{ui.selectPoint}</span>
                <span className="font-mono font-bold text-sagedeep">{x0.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.5"
                max="2.5"
                step="0.05"
                value={x0}
                onChange={(e) => setX0(parseFloat(e.target.value))}
                className="w-full accent-sagedeep cursor-pointer"
              />
            </div>
          </Card>

          {/* Analytical Breakdown & Real-World AI Insights */}
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h5 className="font-display font-semibold text-sm text-[#2C3524] uppercase tracking-wider">
                {ui.liveCalcTitle}
              </h5>

              <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1.5">
                <div className="text-sky-400 font-bold">{funcLabel}</div>
                <div className="text-rose-400 font-bold">{derivLabel}</div>
                <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                  <div>f({x0.toFixed(2)}) = <span className="text-emerald-400 font-bold">{fx.toFixed(2)}</span></div>
                  <div>{ui.instSlope} f'({x0.toFixed(2)}) = <span className="text-rose-400 font-bold">{dfx.toFixed(2)}</span></div>
                  <div>{ui.defIntegral} = <span className="text-amber-400 font-bold">{integral.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F2E8CF]/50 border border-[#E1D6AE] text-xs space-y-1">
                <div className="font-bold text-[#2C3524]">{ui.tangentEqAt} ({x0.toFixed(1)}, {fx.toFixed(1)}):</div>
                <div className="font-mono text-xs text-sagedeep font-bold">
                  y = {dfx.toFixed(2)} · (x - {x0.toFixed(2)}) + {fx.toFixed(2)}
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 uppercase tracking-wider">
                <span>🤖</span> {ui.aiLinkBadge}
              </div>
              <h6 className="font-semibold text-sm text-blue-950">{ui.aiLinkTitle}</h6>
              <p className="text-xs text-blue-900/80 leading-relaxed">
                {ui.aiLinkDesc1}
                <br />
                <code className="bg-white/80 px-2 py-0.5 rounded font-mono text-blue-950 font-bold mt-1 inline-block">
                  w_new = w_old - η · f'(w_old)
                </code>
                <br />
                {ui.aiLinkDesc2}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* 2. 2D MATRIX TRANSFORMATION SANDBOX */}
      {activeTab === 'matrix' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-semibold text-lg text-[#2C3524]">
                  {ui.matrixTitle}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {ui.matrixDesc}
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('identity')}>
                  Identity
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('rot45')}>
                  45° Rotate
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('rot90')}>
                  90° Rotate
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('shearX')}>
                  X-Shear
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('reflect')}>
                  Reflect
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('singular')}>
                  0-Area
                </Button>
              </div>
            </div>

            {/* SVG Coordinate Grid */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 340 260"
                className="w-full h-auto max-h-[260px] select-none cursor-crosshair overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const svgX = ((e.clientX - rect.left) / rect.width) * 340;
                  const svgY = ((e.clientY - rect.top) / rect.height) * 260;
                  const nx = Math.max(-2, Math.min(2, parseFloat(((svgX - originX) / scale).toFixed(2))));
                  const ny = Math.max(-2, Math.min(2, parseFloat(((originY - svgY) / scale).toFixed(2))));
                  if (e.shiftKey) {
                    setMatB(nx);
                    setMatD(ny);
                  } else {
                    setMatA(nx);
                    setMatC(ny);
                  }
                }}
              >
                <defs>
                  <clipPath id="matrixPlotClip">
                    <rect x="10" y="10" width="320" height="240" rx="8" />
                  </clipPath>
                </defs>

                <g clipPath="url(#matrixPlotClip)">
                  {/* Grid Lines */}
                  {[-3, -2, -1, 1, 2, 3].map((g) => (
                    <React.Fragment key={g}>
                      <line x1={originX + g * scale} y1={10} x2={originX + g * scale} y2={250} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1={10} y1={originY + g * scale} x2={330} y2={originY + g * scale} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    </React.Fragment>
                  ))}

                  {/* Main Axes */}
                  <line x1={10} y1={originY} x2={330} y2={originY} stroke="#64748b" strokeWidth="1.5" />
                  <line x1={originX} y1={10} x2={originX} y2={250} stroke="#64748b" strokeWidth="1.5" />

                  {/* Transformed Unit Square (Parallelogram) */}
                  <polygon
                    points={`${originX},${originY} ${iX},${iY} ${cornerX},${cornerY} ${jX},${jY}`}
                    fill="#10b981"
                    fillOpacity="0.25"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />

                  {/* Transformed Basis Vector î' (Red) */}
                  <line x1={originX} y1={originY} x2={iX} y2={iY} stroke="#f43f5e" strokeWidth="3" />
                  <circle cx={iX} cy={iY} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />

                  {/* Transformed Basis Vector ĵ' (Blue) */}
                  <line x1={originX} y1={originY} x2={jX} y2={jY} stroke="#38bdf8" strokeWidth="3" />
                  <circle cx={jX} cy={jY} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              </svg>
              <div className="w-full flex flex-wrap justify-between gap-2 text-[11px] font-mono text-slate-400 mt-1">
                <span className="text-rose-400 font-bold">î' = [{matA.toFixed(2)}, {matC.toFixed(2)}]ᵀ (Click grid)</span>
                <span className="text-sky-400 font-bold">ĵ' = [{matB.toFixed(2)}, {matD.toFixed(2)}]ᵀ (Shift+Click)</span>
                <span className="text-emerald-400 font-bold">Area = |det(A)| = {Math.abs(det).toFixed(2)}</span>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-rose-700">a (î_x scale):</span>
                  <span className="font-mono font-bold">{matA.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matA}
                  onChange={(e) => setMatA(parseFloat(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-sky-700">b (ĵ_x shear):</span>
                  <span className="font-mono font-bold">{matB.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matB}
                  onChange={(e) => setMatB(parseFloat(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-rose-700">c (î_y shear):</span>
                  <span className="font-mono font-bold">{matC.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matC}
                  onChange={(e) => setMatC(parseFloat(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-sky-700">d (ĵ_y scale):</span>
                  <span className="font-mono font-bold">{matD.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matD}
                  onChange={(e) => setMatD(parseFloat(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>
          </Card>

          {/* Determinant & Graphic Applications */}
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h5 className="font-display font-semibold text-sm text-[#2C3524] uppercase tracking-wider">
                {ui.matrixBoxTitle}
              </h5>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-center flex items-center justify-center gap-4 text-base shadow-inner">
                <span>[</span>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <span className="text-rose-400 font-bold">{matA.toFixed(2)}</span>
                  <span className="text-sky-400 font-bold">{matB.toFixed(2)}</span>
                  <span className="text-rose-400 font-bold">{matC.toFixed(2)}</span>
                  <span className="text-sky-400 font-bold">{matD.toFixed(2)}</span>
                </div>
                <span>]</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F2E8CF]/60 border border-[#E1D6AE] text-xs space-y-1.5">
                <div className="font-bold text-[#2C3524]">{ui.detCalcTitle}</div>
                <div className="font-mono text-xs text-sagedeep font-bold">
                  det(A) = (a·d) - (b·c) = ({matA.toFixed(1)}·{matD.toFixed(1)}) - ({matB.toFixed(1)}·{matC.toFixed(1)}) = {det.toFixed(2)}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  {det === 0 ? (
                    <strong className="text-rose-700">{ui.singularMsg}</strong>
                  ) : det < 0 ? (
                    <strong className="text-amber-700">{ui.invertedMsg}</strong>
                  ) : (
                    <strong className="text-emerald-700">{ui.preserveMsg} {det.toFixed(2)}.</strong>
                  )}
                </p>
              </div>
            </Card>

            <Card className="p-5 space-y-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <span>🎮</span> {ui.cgBadge}
              </div>
              <h6 className="font-semibold text-sm text-emerald-950">{ui.cgTitle}</h6>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                {ui.cgDesc}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* 3. ALGORITHMS & SYSTEMS SANDBOX */}
      {activeTab === 'algorithms' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* BST Sandbox */}
          <Card className="p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-semibold text-base text-[#2C3524]">
                  {ui.bstTitle}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {ui.bstDesc}
                </p>
              </div>
              <Tag tone="sage">O(log n)</Tag>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter integer (e.g. 45)..."
                value={newBstVal}
                onChange={(e) => setNewBstVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddBstNode();
                }}
                className="flex-1 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
              />
              <Button size="sm" variant="primary" onClick={handleAddBstNode}>
                {ui.insertNode}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBstNodes([20, 30, 40, 50, 60, 70, 80])}
              >
                Reset
              </Button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 text-white font-mono text-xs flex flex-col items-center justify-center shadow-inner overflow-hidden">
              {(() => {
                type TreeNode = { val: number; x: number; y: number; depth: number; left?: TreeNode; right?: TreeNode };
                const buildBalanced = (arr: number[], depth: number, xMinBound: number, xMaxBound: number): TreeNode | undefined => {
                  if (!arr.length || depth > 3) return undefined;
                  const mid = Math.floor(arr.length / 2);
                  const x = (xMinBound + xMaxBound) / 2;
                  const y = 28 + depth * 52;
                  return {
                    val: arr[mid],
                    x,
                    y,
                    depth,
                    left: buildBalanced(arr.slice(0, mid), depth + 1, xMinBound, x),
                    right: buildBalanced(arr.slice(mid + 1), depth + 1, x, xMaxBound)
                  };
                };
                const root = buildBalanced(bstNodes, 0, 16, 344);
                const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
                const nodes: TreeNode[] = [];
                const traverse = (n?: TreeNode) => {
                  if (!n) return;
                  nodes.push(n);
                  if (n.left) {
                    edges.push({ x1: n.x, y1: n.y, x2: n.left.x, y2: n.left.y });
                    traverse(n.left);
                  }
                  if (n.right) {
                    edges.push({ x1: n.x, y1: n.y, x2: n.right.x, y2: n.right.y });
                    traverse(n.right);
                  }
                };
                traverse(root);

                return (
                  <>
                    <svg viewBox="0 0 360 205" className="w-full h-auto max-h-[205px] select-none overflow-hidden">
                      {edges.map((e, idx) => (
                        <line
                          key={idx}
                          x1={e.x1}
                          y1={e.y1}
                          x2={e.x2}
                          y2={e.y2}
                          stroke="#475569"
                          strokeWidth="2"
                        />
                      ))}
                      {nodes.map((n) => {
                        const fill = n.depth === 0 ? '#059669' : n.depth === 1 ? '#2563eb' : '#7c3aed';
                        return (
                          <g
                            key={n.val}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                            onClick={() => {
                              if (bstNodes.length > 1) {
                                setBstNodes(bstNodes.filter((v) => v !== n.val));
                              }
                            }}
                          >
                            <circle cx={n.x} cy={n.y} r="15" fill={fill} stroke="#e2e8f0" strokeWidth="1.5" />
                            <text
                              x={n.x}
                              y={n.y + 4}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {n.val}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Click any node to remove it • Enter a number above to insert into BST
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-3 rounded-xl bg-[#F2E8CF]/50 border border-[#E1D6AE] text-xs">
              <span className="font-semibold text-[#2C3524]">{ui.inOrderLabel}</span>
              <div className="font-mono text-xs text-sagedeep font-bold mt-1 break-all">
                [{bstNodes.join(', ')}]
              </div>
            </div>
          </Card>

          {/* LRU Cache Sandbox */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-semibold text-base text-[#2C3524]">
                  {ui.lruTitle}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {ui.lruDesc}
                </p>
              </div>
              <Tag tone="purple">Capacity: 3</Tag>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key (e.g. user:4)"
                value={cacheKeyInput}
                onChange={(e) => setCacheKeyInput(e.target.value)}
                className="w-1/3 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
              />
              <input
                type="text"
                placeholder="Val (e.g. David)"
                value={cacheValInput}
                onChange={(e) => setCacheValInput(e.target.value)}
                className="flex-1 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
              />
              <Button size="sm" variant="primary" onClick={handleLruPut}>
                PUT
              </Button>
            </div>

            {/* Visual Cache Slots */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#2C3524] uppercase">{ui.liveCacheMem}</div>
              <div className="grid grid-cols-3 gap-2">
                {lruCache.map((item, idx) => (
                  <div
                    key={item.key}
                    onClick={() => handleLruGet(item.key)}
                    className="p-3 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 transition cursor-pointer text-center"
                  >
                    <div className="text-[10px] text-purple-700 font-bold uppercase">{idx === lruCache.length - 1 ? 'MRU' : idx === 0 ? 'LRU (Next to Evict)' : 'Cached'}</div>
                    <div className="font-mono text-xs font-bold text-purple-950 mt-1">{item.key}</div>
                    <div className="text-[11px] text-purple-800">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Log */}
            <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] space-y-1">
              <div className="text-slate-500 font-bold uppercase text-[9px]">{ui.opStream}</div>
              {cacheLog.map((log, i) => (
                <div key={i} className="text-emerald-400">↳ {log}</div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 4. MULTILINGUAL GLOSSARY */}
      {activeTab === 'multilingual' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E1D6AE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-semibold text-lg text-[#2C3524]">
                {ui.dictTitle}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {ui.dictDesc}
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-sagedeep text-pcream">
              {ui.activeDialect} {selectedLang}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {activeDict.map((item, idx) => (
              <Card key={idx} className="p-5 space-y-2 border border-[#E1D6AE]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sagedeep uppercase tracking-wider">{item.term}</span>
                  <Tag tone="sage">{item.translit}</Tag>
                </div>
                <h5 className="font-display font-bold text-xl text-[#2C3524]">{item.native}</h5>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1 border-t border-[#E1D6AE]/50">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 10. INSTITUTE MENTORING & ACADEMIC QUERIES
// =========================================================================

export const StudentMentoringView: React.FC = () => {
  const [queries, setQueries] = useState<InstituteQueryItem[]>([]);
  const [guidance, setGuidance] = useState<InstituteGuidanceItem[]>([]);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [qRes, gRes] = await Promise.allSettled([
        studentApi.getQueries(),
        studentApi.getGuidance()
      ]);
      if (qRes.status === 'fulfilled' && qRes.value) {
        setQueries(qRes.value.queries || []);
      }
      if (gRes.status === 'fulfilled' && gRes.value) {
        setGuidance(gRes.value.guidance || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institute Mentoring & Academic Queries"
        desc="Raise academic doubts, syllabus queries, or exam questions directly to your college faculty and view their responses."
        action={
          <Button variant="primary" onClick={() => setShowRaiseModal(true)}>
            + Ask Faculty a Question
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Queries & Faculty Responses */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-semibold text-base text-[#2C3524]">
            Your Queries & Faculty Responses
          </h3>

          {queries.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
              You haven't raised any queries yet. Click "+ Ask Faculty a Question" to clear your doubts.
            </Card>
          ) : (
            queries.map((q) => (
              <Card key={q.id} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#2C3524]">{q.title}</span>
                    <Tag tone="blue">{q.subject_name}</Tag>
                  </div>
                  <Tag tone={q.status === 'answered' ? 'sage' : 'amber'}>
                    {q.status === 'answered' ? 'Answered by Faculty ✓' : 'Pending Review'}
                  </Tag>
                </div>

                <p className="text-xs text-[#2C3524] mb-3 leading-relaxed">
                  {q.question_text}
                </p>

                {q.response_text ? (
                  <div className="p-3.5 rounded-xl bg-sagedeep/10 border border-sagedeep/20 text-xs">
                    <div className="font-bold text-sagedeep mb-1">Faculty Response:</div>
                    <p className="text-[#2C3524] leading-relaxed">{q.response_text}</p>
                    {q.answered_at && (
                      <div className="text-[10px] text-[var(--text-muted)] mt-1.5">
                        Answered on {q.answered_at}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-[var(--text-muted)] italic">
                    Faculty has received this query and will respond shortly.
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Right Col: Faculty Guidance & Tips */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-base text-[#2C3524]">
            Faculty Guidance Broadcasts
          </h3>
          {guidance.length === 0 ? (
            <Card className="p-6 text-center text-xs text-[var(--text-muted)]">
              No faculty guidance broadcasted yet.
            </Card>
          ) : (
            guidance.map((g) => (
              <Card key={g.id} className="p-4 bg-white border border-[#E1D6AE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-xs text-[#2C3524]">{g.subject_name}</span>
                  <Tag tone="purple">{g.guidance_type}</Tag>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {g.message}
                </p>
                <div className="text-[10px] text-[var(--text-muted)] mt-2">
                  Broadcasted: {g.created_at}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {showRaiseModal && (
        <RaiseQueryModal
          onClose={() => setShowRaiseModal(false)}
          onSuccess={() => {
            loadData();
            setShowRaiseModal(false);
          }}
        />
      )}
    </div>
  );
};

const RaiseQueryModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [queryType, setQueryType] = useState('academic_doubt');
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.raiseQuery({
        subject_name: subject,
        query_type: queryType,
        title,
        question_text: questionText
      });
      alert('Academic query submitted to your institute faculty.');
      onSuccess();
    } catch {
      alert('Could not submit query.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Ask College Faculty a Question" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-2">
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Discrete Mathematics">Discrete Mathematics</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Query Type</label>
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="academic_doubt">Concept / Syllabus Doubt</option>
            <option value="examination">Exam Preparation Question</option>
            <option value="schedule">Schedule or Assignment Conflict</option>
            <option value="guidance">General Academic Mentoring</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Query Subject / Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Clarification on Dijkstra's vs Bellman-Ford algorithm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Detailed Explanation</label>
          <textarea
            rows={3}
            required
            placeholder="Explain specifically what you find unclear or what topic was discussed in lecture that you need help with."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Send Query to Faculty'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 11. ACADEMICIAN RESEARCH COLLABORATION
// =========================================================================

export const StudentResearchView: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPapers = async () => {
    try {
      const res = await studentApi.getResearchPapers();
      if (res?.papers) {
        setPapers(res.papers);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleAskQuestion = async (paperId: number | string) => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await studentApi.askResearchQuestion(paperId, questionText);
      alert('Question sent directly to the academic researcher!');
      setQuestionText('');
      setSelectedPaper(null);
      fetchPapers();
    } catch {
      alert('Could not submit research question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academician Research Collaboration"
        desc="Discover research papers published by university professors and academicians. Ask questions and participate directly in academic research discussions."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {papers.map((p) => (
          <Card key={p.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag tone="sage">{p.field || 'Research'}</Tag>
                {p.year && <span className="text-xs text-[var(--text-muted)] font-mono">{p.year}</span>}
              </div>
              <h3 className="font-display font-bold text-base text-[#2C3524] mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed line-clamp-3">
                {p.abstract || 'Academic paper exploring advanced paradigms and domain contributions.'}
              </p>
              <div className="text-[11px] text-[#2C3524] font-medium mb-4">
                <strong>Author:</strong> {p.author || 'University Researcher'}
              </div>

              {/* Discussions count */}
              {p.discussions && p.discussions.length > 0 && (
                <div className="p-3 rounded-lg bg-[#F2E8CF]/50 border border-[#E1D6AE] mb-4 text-xs space-y-2">
                  <div className="font-semibold text-sagedeep text-[11px]">
                    Academic Discussions ({p.discussions.length})
                  </div>
                  {p.discussions.slice(0, 2).map((d: any, idx: number) => (
                    <div key={idx} className="border-b border-[#E1D6AE]/50 pb-1.5 last:border-0 last:pb-0">
                      <div className="font-medium text-[#2C3524]">Q: {d.q || d.question}</div>
                      {d.response && (
                        <div className="text-sagedeep mt-0.5 text-[11px]">
                          <strong>Prof Response:</strong> {d.response}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E1D6AE]">
              {p.pdf_url ? (
                <a
                  href={p.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-sagedeep hover:underline"
                >
                  Download Paper PDF ↗
                </a>
              ) : (
                <span className="text-xs text-[var(--text-muted)]">Verified Publication</span>
              )}

              <Button size="sm" variant="primary" onClick={() => setSelectedPaper(p)}>
                Ask Researcher a Question
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedPaper && (
        <Modal title={`Ask Researcher: ${selectedPaper.title}`} onClose={() => setSelectedPaper(null)}>
          <div className="space-y-4 text-xs p-2">
            <p className="text-[var(--text-muted)]">
              Submit an academic inquiry or research feedback directly to {selectedPaper.author || 'the professor'}.
            </p>

            <textarea
              rows={4}
              required
              placeholder="State your question about their methodology, theoretical derivation, or potential collaboration."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
              <Button variant="outline" onClick={() => setSelectedPaper(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={submitting || !questionText.trim()}
                onClick={() => handleAskQuestion(selectedPaper.id)}
              >
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// =========================================================================
// 12. EDUCATIONAL OPPORTUNITIES
// =========================================================================

export const StudentOpportunitiesView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<EducationalOpportunity[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    studentApi.getOpportunities().then((res) => {
      if (isMounted && res?.opportunities) {
        setOpportunities(res.opportunities);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const types = [
    { key: 'all', label: 'All Opportunities' },
    { key: 'competition', label: 'Competitions & Hackathons' },
    { key: 'fellowship', label: 'Research Fellowships' },
    { key: 'scholarship', label: 'Scholarships' },
    { key: 'workshop', label: 'Workshops & Summer Schools' }
  ];

  const filtered = opportunities.filter((o) => filterType === 'all' || o.opportunity_type === filterType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matched Educational Opportunities"
        desc="Academic competitions, research fellowships, higher education scholarships, and advanced workshops matched to your syllabus and extra skills."
      />

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterType(t.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filterType === t.key
                ? 'bg-sagedeep text-pcream border-sagedeep'
                : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((opp) => (
          <Card key={opp.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Tag tone="purple">{opp.opportunity_type}</Tag>
                {opp.deadline && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Deadline: {opp.deadline}
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-base text-[#2C3524] mb-1">
                {opp.title}
              </h3>
              <div className="text-xs font-semibold text-sagedeep mb-3">
                {opp.provider_or_institute}
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                {opp.description}
              </p>

              <div className="space-y-1 text-xs text-[#2C3524]">
                <div><strong>Eligibility:</strong> {opp.eligibility}</div>
                <div><strong>Relevant Subjects:</strong> {opp.matched_subjects}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E1D6AE] mt-4 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert(`Details and application link for ${opp.title} have been saved to your profile.`)}
              >
                Apply / Register Now →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 13. KNOWLEDGE-GAP REPORTING MODAL
// =========================================================================

export const KnowledgeGapModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [subject, setSubject] = useState('Operating Systems');
  const [topic, setTopic] = useState('');
  const [feedbackType, setFeedbackType] = useState('unclear_explanation');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.reportKnowledgeGap({
        subject_name: subject,
        topic_name: topic,
        feedback_type: feedbackType,
        description
      });
      alert('Feedback submitted to your institute. Faculty can review aggregated student knowledge gaps.');
      onSuccess();
      onClose();
    } catch {
      alert('Could not report knowledge gap.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Report Topic Knowledge Gap to Institute" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-2">
        <p className="text-[var(--text-muted)]">
          If you feel a topic was taught too quickly, lacked practical demonstrations, or was unclear, submit this anonymous feedback to help faculty schedule revision lectures.
        </p>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="Operating Systems">Operating Systems</option>
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Discrete Mathematics">Discrete Mathematics</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Topic Name</label>
          <input
            type="text"
            required
            placeholder="e.g., Deadlock Detection & Banker's Algorithm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Feedback Category</label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="unclear_explanation">Explanation was difficult to understand</option>
            <option value="pacing_too_fast">Pacing in lecture was too fast</option>
            <option value="needs_solved_examples">Need more solved numerical examples</option>
            <option value="practical_lab_missing">Needs hands-on practical lab demo</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Details & Suggestions</label>
          <textarea
            rows={3}
            required
            placeholder="Explain specifically what you'd like faculty to cover in a revision session."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Anonymous Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 14. STUDENT PROFILE & ACADEMIC ONBOARDING
// =========================================================================

export const StudentProfileView: React.FC<{
  onOpenDiagnostic: (subject: string) => void;
  onOpenReportGap: () => void;
}> = ({ onOpenDiagnostic, onOpenReportGap }) => {
  const [profile, setProfile] = useState<StudentLearningProfile | null>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);

  // Form states
  const [academicClass, setAcademicClass] = useState('');
  const [boardCurriculum, setBoardCurriculum] = useState('');
  const [college, setCollege] = useState('');
  const [academicSubjects, setAcademicSubjects] = useState('');
  const [academicInterests, setAcademicInterests] = useState('');
  const [extraSubjects, setExtraSubjects] = useState('');
  const [additionalSkills, setAdditionalSkills] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const [profRes, catRes] = await Promise.allSettled([
          studentApi.getProfile(),
          studentApi.getSubjectCatalog()
        ]);
        if (!isMounted) return;
        if (profRes.status === 'fulfilled' && profRes.value?.profile) {
          const p = profRes.value.profile;
          setProfile(p);
          setAcademicClass(p.academic_class || '');
          setBoardCurriculum(p.board_curriculum || '');
          setCollege(p.college || '');
          setAcademicSubjects(p.academic_subjects || '');
          setAcademicInterests(p.academic_interests || '');
          setExtraSubjects(p.extra_subjects || '');
          setAdditionalSkills(p.additional_skills || '');
          setPreferredLanguage(p.preferred_language || 'English');
        }
        if (catRes.status === 'fulfilled' && catRes.value?.subjects) {
          setCatalog(catRes.value.subjects);
        }
      } catch {
        // fallback
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.updateProfile({
        academic_class: academicClass,
        board_curriculum: boardCurriculum,
        college,
        academic_subjects: academicSubjects,
        academic_interests: academicInterests,
        extra_subjects: extraSubjects,
        additional_skills: additionalSkills,
        preferred_language: preferredLanguage
      });
      alert('Academic profile updated successfully!');
      setEditing(false);
      // Reload profile
      const updated = await studentApi.getProfile();
      if (updated?.profile) setProfile(updated.profile);
    } catch {
      alert('Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Educational Profile & Onboarding"
        desc="Manage your academic curriculum, Track 2 elective interests, additional skills, and language preference."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onOpenReportGap}>
              Report Knowledge Gap
            </Button>
            <Button variant="primary" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Cancel Editing' : 'Edit Academic Profile'}
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-sagedeep/20 flex items-center justify-center font-display text-2xl font-bold text-sagedeep">
            {profile?.name ? profile.name[0] : 'S'}
          </div>

          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#2C3524]">{profile?.name}</h2>
              <VerifiedBadge />
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {profile?.college} • Student ID: {profile?.university_roll_no || '2024CS102'}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Tag tone="sage">{profile?.academic_class || 'Semester 4'}</Tag>
              <Tag tone="blue">Board: {profile?.board_curriculum || 'Standard'}</Tag>
              <Tag tone="purple">Language: {profile?.preferred_language || 'English'}</Tag>
            </div>
          </div>
        </div>
      </Card>

      {editing ? (
        <Card className="p-6">
          <h3 className="font-display font-semibold text-base text-[#2C3524] mb-4">
            Edit Academic Information & Subject Preferences
          </h3>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#2C3524] mb-1">
                  Academic Class / Grade / Year
                </label>
                <input
                  type="text"
                  required
                  value={academicClass}
                  onChange={(e) => setAcademicClass(e.target.value)}
                  placeholder="e.g. B.Tech Semester 4, Grade 12"
                  className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C3524] mb-1">
                  Board / Curriculum
                </label>
                <input
                  type="text"
                  required
                  value={boardCurriculum}
                  onChange={(e) => setBoardCurriculum(e.target.value)}
                  placeholder="e.g. State University Syllabus, CBSE"
                  className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C3524] mb-1">
                  Preferred Learning Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                College / School / Institute Name
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Maharaja Sayajirao University of Baroda"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Enrolled Academic Subjects (Track 1, comma-separated)
              </label>
              <input
                type="text"
                required
                value={academicSubjects}
                onChange={(e) => setAcademicSubjects(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms, Operating Systems, Database Management Systems"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Extra Subjects / Electives to Learn (Track 2, comma-separated)
              </label>
              <input
                type="text"
                value={extraSubjects}
                onChange={(e) => setExtraSubjects(e.target.value)}
                placeholder="e.g. Full Stack Web Development, Artificial Intelligence & Machine Learning"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Additional Skills Developing (comma-separated)
              </label>
              <input
                type="text"
                value={additionalSkills}
                onChange={(e) => setAdditionalSkills(e.target.value)}
                placeholder="e.g. React, Python, Cloud Architecture, Git"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
              <Button variant="outline" type="button" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving Profile...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-display font-semibold text-base text-[#2C3524] mb-3">
              Track 1: College Curriculum Setup
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Class/Grade:</span>{' '}
                <strong className="text-[#2C3524]">{profile?.academic_class}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Curriculum:</span>{' '}
                <strong className="text-[#2C3524]">{profile?.board_curriculum}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Core Subjects:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(profile?.academic_subjects || '').split(',').map((s: string, idx: number) => {
                    const clean = s.trim();
                    if (!clean) return null;
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                      >
                        {clean}
                        <button
                          onClick={() => onOpenDiagnostic(clean)}
                          title="Take Diagnostic"
                          className="hover:underline text-[10px] text-emerald-600 font-bold"
                        >
                          [Test]
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-display font-semibold text-base text-[#2C3524] mb-3">
              Track 2: Extra Learning & Skills Setup
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Extra Electives / Topics:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(profile?.extra_subjects || 'Web Dev, Cloud, AI').split(',').map((s: string, idx: number) => {
                    const clean = s.trim();
                    if (!clean) return null;
                    return <Tag key={idx} tone="purple">{clean}</Tag>;
                  })}
                </div>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Developing Skills:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(profile?.additional_skills || 'React, SQL, Python').split(',').map((s: string, idx: number) => {
                    const clean = s.trim();
                    if (!clean) return null;
                    return <Tag key={idx} tone="sage">{clean}</Tag>;
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
