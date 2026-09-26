import sqlite3
from config import Config

def get_db():
    conn = sqlite3.connect(Config.DATABASE_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
    -- 1. Institutes (Universities / Colleges / Schools)
    CREATE TABLE IF NOT EXISTS institutes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        admin_tpo_contact TEXT,
        city TEXT DEFAULT 'Vadodara',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Students
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        college TEXT,
        skills TEXT DEFAULT '',
        github_url TEXT,
        leetcode_url TEXT,
        codeforces_url TEXT,
        resume_url TEXT,
        prior_experience TEXT,
        institute_id INTEGER,
        university_roll_no TEXT,
        verification_status TEXT DEFAULT 'unverified' CHECK(verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
        verified_at TIMESTAMP,
        class_year TEXT DEFAULT NULL,
        curriculum TEXT DEFAULT NULL,
        academic_subjects TEXT DEFAULT '',
        interested_subjects TEXT DEFAULT '',
        additional_skills TEXT DEFAULT '',
        preferred_language TEXT DEFAULT 'English',
        knowledge_level TEXT DEFAULT 'Intermediate',
        potential_score REAL DEFAULT 0.0,
        syllabus_progress_rate REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
    );

    -- 3. Student Documents (ID cards, marksheets, verification proof)
    CREATE TABLE IF NOT EXISTS student_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        document_type TEXT NOT NULL CHECK(document_type IN ('certificate', 'report', 'academic_record', 'student_id_card')),
        file_url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 4. Academicians (Faculty / Professors / Researchers)
    CREATE TABLE IF NOT EXISTS academicians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        institute_id INTEGER,
        expertise_domain TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
    );

    -- 5. Diagnostic Tests (Initial subject knowledge diagnostic test)
    CREATE TABLE IF NOT EXISTS diagnostic_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        level TEXT NOT NULL CHECK(level IN ('Basic', 'Intermediate', 'Advanced', 'Comprehensive')),
        score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        topics_understood TEXT DEFAULT '[]',
        topics_partially_understood TEXT DEFAULT '[]',
        topics_needs_improvement TEXT DEFAULT '[]',
        estimated_knowledge_level TEXT NOT NULL,
        recommended_focus TEXT DEFAULT '',
        assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 6. Student Adaptive Learning Pathways
    CREATE TABLE IF NOT EXISTS student_learning_pathways (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        pathway_type TEXT NOT NULL CHECK(pathway_type IN ('academic', 'additional')),
        current_level TEXT DEFAULT 'Intermediate',
        estimated_hours INTEGER DEFAULT 40,
        difficulty TEXT DEFAULT 'Intermediate',
        topics_json TEXT NOT NULL, -- JSON array of topic nodes with status: mastered, in_progress, next, revision
        recommended_sequence TEXT DEFAULT '',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subject_name),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 7. Student Topic Progress
    CREATE TABLE IF NOT EXISTS student_topic_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('mastered', 'in_progress', 'needs_revision', 'pending')),
        last_studied TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subject_name, topic_name),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 8. Syllabus Progress & Exam Readiness (Fit Score)
    CREATE TABLE IF NOT EXISTS student_syllabus_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        total_topics INTEGER DEFAULT 10,
        completed_topics INTEGER DEFAULT 5,
        revision_topics INTEGER DEFAULT 2,
        completed_percentage REAL DEFAULT 50.0,
        exam_readiness_score REAL DEFAULT 65.0, -- Fit score (0-100%)
        practice_avg_score REAL DEFAULT 60.0,
        exam_avg_score REAL DEFAULT 65.0,
        topics_understood_pct REAL DEFAULT 60.0,
        revision_status_pct REAL DEFAULT 50.0,
        is_weak_subject INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subject_name),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 9. Daily Syllabus Updates (Student daily learning & syllabus log)
    CREATE TABLE IF NOT EXISTS daily_syllabus_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        completed_topics TEXT DEFAULT '',
        revision_topics TEXT DEFAULT '',
        practice_count INTEGER DEFAULT 0,
        study_minutes INTEGER DEFAULT 60,
        notes TEXT DEFAULT '',
        log_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 10. Institute Academic Schedules
    CREATE TABLE IF NOT EXISTS institute_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institute_id INTEGER NOT NULL,
        schedule_type TEXT NOT NULL CHECK(schedule_type IN ('class', 'examination', 'test', 'practical', 'assignment', 'event')),
        title TEXT NOT NULL,
        subject_name TEXT NOT NULL,
        date TEXT NOT NULL, -- YYYY-MM-DD
        start_time TEXT NOT NULL, -- HH:MM AM/PM
        end_time TEXT NOT NULL,
        venue_or_link TEXT DEFAULT 'Room 101 / Online',
        target_class TEXT DEFAULT 'All Batches',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );

    -- 11. Student Personal Timetable / Schedules (AI-assisted + Flexible Modification)
    CREATE TABLE IF NOT EXISTS student_personal_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        activity_type TEXT NOT NULL CHECK(activity_type IN ('institute_class', 'institute_exam', 'extra_learning', 'personal', 'free_time', 'revision', 'practice', 'backlog_recovery', 'self_study')),
        subject_name TEXT DEFAULT '',
        day_of_week TEXT NOT NULL, -- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
        start_time TEXT NOT NULL, -- '09:00 AM'
        end_time TEXT NOT NULL,   -- '10:00 AM'
        is_completed INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 12. Extra Skill Learning Time Tracking Logs
    CREATE TABLE IF NOT EXISTS extra_learning_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        skill_or_subject TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        log_date DATE NOT NULL,
        adherence INTEGER DEFAULT 1,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 13. Examinations (Created by Institutes)
    CREATE TABLE IF NOT EXISTS examinations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institute_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        exam_type TEXT NOT NULL CHECK(exam_type IN ('midterm', 'final', 'unit_test', 'practical_exam')),
        subject_name TEXT NOT NULL,
        max_marks REAL NOT NULL DEFAULT 100.0,
        exam_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );

    -- 14. Student Academic Marks (Historical Record)
    CREATE TABLE IF NOT EXISTS student_marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER,
        subject_name TEXT NOT NULL,
        exam_title TEXT NOT NULL,
        exam_type TEXT DEFAULT 'midterm',
        marks_obtained REAL NOT NULL,
        max_marks REAL NOT NULL DEFAULT 100.0,
        percentage REAL NOT NULL,
        remarks TEXT DEFAULT '',
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE SET NULL
    );

    -- 15. Practice Tests & Performance Tracking (Weak Subjects & General)
    CREATE TABLE IF NOT EXISTS practice_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        difficulty TEXT DEFAULT 'Intermediate',
        is_weak_subject_test INTEGER DEFAULT 0,
        mistakes_summary TEXT DEFAULT '',
        taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 16. Institute Queries (Students raise doubts/guidance to Institute)
    CREATE TABLE IF NOT EXISTS institute_queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        institute_id INTEGER NOT NULL,
        subject_name TEXT DEFAULT 'General',
        query_type TEXT NOT NULL CHECK(query_type IN ('academic_doubt', 'schedule', 'examination', 'guidance', 'mentoring', 'other')),
        title TEXT NOT NULL,
        question_text TEXT NOT NULL,
        response_text TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'answered', 'resolved')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answered_at TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );

    -- 17. Institute Mentoring & Guidance Suggestions
    CREATE TABLE IF NOT EXISTS institute_guidance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institute_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        guidance_type TEXT NOT NULL CHECK(guidance_type IN ('study_priority', 'weak_subject_practice', 'resource_suggestion', 'academic_feedback')),
        subject_name TEXT DEFAULT 'General',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 18. Research Papers (Academician Research Hub)
    CREATE TABLE IF NOT EXISTS research_papers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        academician_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        field TEXT NOT NULL,
        abstract TEXT NOT NULL,
        pdf_url TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (academician_id) REFERENCES academicians(id) ON DELETE CASCADE
    );

    -- 19. Research Discussions (Student <-> Academician Paper Questions)
    CREATE TABLE IF NOT EXISTS research_discussions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        academician_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        response TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'answered')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answered_at TIMESTAMP,
        FOREIGN KEY (paper_id) REFERENCES research_papers(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (academician_id) REFERENCES academicians(id) ON DELETE CASCADE
    );

    -- 20. Educational & Developmental Opportunities
    CREATE TABLE IF NOT EXISTS educational_opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        opportunity_type TEXT NOT NULL CHECK(opportunity_type IN ('competition', 'workshop', 'research', 'course', 'scholarship', 'academic_program', 'project', 'internship')),
        subject_field TEXT NOT NULL,
        required_level TEXT DEFAULT 'All Levels',
        description TEXT NOT NULL,
        provider TEXT NOT NULL,
        deadline TEXT DEFAULT '',
        action_link TEXT DEFAULT '#',
        eligibility TEXT DEFAULT 'Open to all enrolled students',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 21. Student Knowledge-Gap & Missing Concept Feedbacks
    CREATE TABLE IF NOT EXISTS knowledge_gap_feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        feedback_type TEXT NOT NULL CHECK(feedback_type IN ('missing_topic', 'concept_not_understood', 'missing_prerequisite', 'needs_practical_example', 'real_world_gap', 'curriculum_disconnection')),
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'reported' CHECK(status IN ('reported', 'reviewed', 'addressed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- 22. In-App Notifications System
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_role TEXT NOT NULL CHECK(user_role IN ('student', 'institute', 'academician')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        notification_type TEXT NOT NULL DEFAULT 'info' CHECK(notification_type IN ('info', 'success', 'warning', 'alert')),
        link_tab TEXT DEFAULT '',
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 23. Student Backlogs & Deficit Recovery Registry
    CREATE TABLE IF NOT EXISTS student_backlogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        topic_title TEXT NOT NULL,
        estimated_hours REAL DEFAULT 2.0,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'cleared')),
        scheduled_day TEXT DEFAULT '',
        priority TEXT DEFAULT 'high' CHECK(priority IN ('critical', 'high', 'medium', 'low')),
        origin TEXT DEFAULT 'manual',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Legacy Support Tables (Preserved for compatibility)
    CREATE TABLE IF NOT EXISTS postings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        academician_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        required_skills TEXT NOT NULL,
        posting_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (academician_id) REFERENCES academicians(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        posting_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'applied',
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, posting_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (posting_id) REFERENCES postings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_skill_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        percentage REAL NOT NULL,
        assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, skill_name),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mentorship_feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        academician_id INTEGER NOT NULL,
        feedback_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (academician_id) REFERENCES academicians(id) ON DELETE CASCADE
    );
    """)
    conn.commit()

    # Dynamic migrations for students table in existing SQLite databases
    cursor.execute("PRAGMA table_info(students)")
    existing_cols = {row['name'] for row in cursor.fetchall()}
    student_new_cols = [
        ('class_year', "TEXT DEFAULT '3rd Year B.Tech'"),
        ('curriculum', "TEXT DEFAULT 'Computer Science & Engineering'"),
        ('academic_subjects', "TEXT DEFAULT 'Mathematics, Physics, Data Structures, Operating Systems'"),
        ('interested_subjects', "TEXT DEFAULT 'Artificial Intelligence, Python Programming, Robotics'"),
        ('additional_skills', "TEXT DEFAULT 'Web Development, Problem Solving'"),
        ('preferred_language', "TEXT DEFAULT 'English'"),
        ('knowledge_level', "TEXT DEFAULT 'Intermediate'"),
        ('potential_score', "REAL DEFAULT 75.0"),
        ('syllabus_progress_rate', "REAL DEFAULT 7.5"),
    ]
    for col_name, col_def in student_new_cols:
        if col_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE students ADD COLUMN {col_name} {col_def}")
                print(f"[Database Migration] Added column '{col_name}' to students table.")
            except Exception as e:
                print(f"[Database Migration Warning] Could not add column '{col_name}': {e}")

    # Dynamic migrations for student_personal_schedules table
    try:
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='student_personal_schedules'")
        t_row = cursor.fetchone()
        if t_row and 'backlog_recovery' not in t_row['sql']:
            cursor.execute("ALTER TABLE student_personal_schedules RENAME TO student_personal_schedules_old")
            cursor.execute("""
            CREATE TABLE student_personal_schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                activity_type TEXT NOT NULL CHECK(activity_type IN ('institute_class', 'institute_exam', 'extra_learning', 'personal', 'free_time', 'revision', 'practice', 'backlog_recovery', 'self_study')),
                subject_name TEXT DEFAULT '',
                day_of_week TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                is_completed INTEGER DEFAULT 0,
                notes TEXT DEFAULT '',
                completion_percentage INTEGER DEFAULT 0,
                work_summary TEXT DEFAULT '',
                is_reviewed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
            """)
            cursor.execute("""
            INSERT OR IGNORE INTO student_personal_schedules (
                id, student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, is_completed, notes
            )
            SELECT id, student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, is_completed, notes
            FROM student_personal_schedules_old
            """)
            cursor.execute("DROP TABLE student_personal_schedules_old")
            print("[Database Migration] Upgraded student_personal_schedules schema to support backlog_recovery.")
    except Exception as e:
        print(f"[Database Migration Warning] student_personal_schedules table migration: {e}")

    cursor.execute("PRAGMA table_info(student_personal_schedules)")
    existing_sched_cols = {row['name'] for row in cursor.fetchall()}
    sched_new_cols = [
        ('completion_percentage', "INTEGER DEFAULT 0"),
        ('work_summary', "TEXT DEFAULT ''"),
        ('is_reviewed', "INTEGER DEFAULT 0"),
    ]
    for col_name, col_def in sched_new_cols:
        if col_name not in existing_sched_cols:
            try:
                cursor.execute(f"ALTER TABLE student_personal_schedules ADD COLUMN {col_name} {col_def}")
                print(f"[Database Migration] Added column '{col_name}' to student_personal_schedules.")
            except Exception as e:
                print(f"[Database Migration Warning] Could not add column '{col_name}': {e}")

    conn.commit()
    conn.close()
    print("[Database] Educational ecosystem tables & migrations initialized successfully!")

def calculate_student_potential_score(cursor, student_id):
    """
    Dynamically computes formulaic educational potential score (0 - 100) and breakdown:
    - Consistency & Routine Adherence (0 - 25 pts)
    - Practice & Assessment Performance (0 - 30 pts)
    - Growth Velocity from Starting Baseline (0 - 25 pts)
    - Curricular Breadth & Extra Skill Investment (0 - 20 pts)
    """
    cursor.execute("SELECT academic_subjects, class_year, curriculum, knowledge_level, potential_score FROM students WHERE id = ?", (student_id,))
    st_row = cursor.fetchone()
    if not st_row:
        return {
            'potential_score': 0.0,
            'potential_tier': 'Pending Intake',
            'breakdown': {
                'consistency_effort': 0.0,
                'practice_mastery': 0.0,
                'growth_velocity': 0.0,
                'skill_investment': 0.0
            },
            'growth_delta': 0.0,
            'baseline_score': 0.0,
            'current_score': 0.0,
            'insights': 'Student profile not initialized.'
        }

    # If student has not enrolled in any academic subjects or finished onboarding:
    if not st_row['academic_subjects'] or not st_row['class_year'] or not st_row['curriculum']:
        return {
            'potential_score': 0.0,
            'potential_tier': 'Pending Intake',
            'breakdown': {
                'consistency_effort': 0.0,
                'practice_mastery': 0.0,
                'growth_velocity': 0.0,
                'skill_investment': 0.0
            },
            'growth_delta': 0.0,
            'baseline_score': 0.0,
            'current_score': 0.0,
            'insights': 'Complete initial curriculum intake to calculate your potential index.'
        }

    # 1. Consistency & Routine Adherence (max 25.0)
    cursor.execute("SELECT count(*) FROM daily_syllabus_updates WHERE student_id = ?", (student_id,))
    daily_count = cursor.fetchone()[0] or 0
    cursor.execute("SELECT count(*) FROM student_personal_schedules WHERE student_id = ? AND is_completed = 1", (student_id,))
    completed_sched = cursor.fetchone()[0] or 0
    consistency_pts = min(25.0, round((daily_count * 2.0) + (completed_sched * 1.0), 1))

    # 2. Practice & Assessment Performance (max 30.0)
    cursor.execute("SELECT AVG(score) FROM practice_tests WHERE student_id = ?", (student_id,))
    res_pr = cursor.fetchone()[0]
    cursor.execute("SELECT AVG(score) FROM diagnostic_tests WHERE student_id = ?", (student_id,))
    res_dg = cursor.fetchone()[0]
    if res_pr is not None and res_dg is not None:
        combined_test_avg = (float(res_pr) * 0.6) + (float(res_dg) * 0.4)
        practice_pts = min(30.0, round(combined_test_avg * 0.30, 1))
    elif res_pr is not None:
        practice_pts = min(30.0, round(float(res_pr) * 0.30, 1))
    elif res_dg is not None:
        practice_pts = min(30.0, round(float(res_dg) * 0.30, 1))
    else:
        practice_pts = 0.0

    # 3. Growth Velocity / Syllabus & Competency Progression (max 25.0)
    cursor.execute("SELECT AVG(completed_percentage), AVG(exam_readiness_score) FROM student_syllabus_progress WHERE student_id = ?", (student_id,))
    prog_row = cursor.fetchone()
    avg_completed_pct = float(prog_row[0]) if (prog_row and prog_row[0] is not None) else 0.0
    curr_readiness = float(prog_row[1]) if (prog_row and prog_row[1] is not None) else 0.0

    kl = (st_row['knowledge_level'] or 'Intermediate').lower()
    baseline_score = 20.0 if kl == 'beginner' else 35.0 if kl == 'intermediate' else 50.0
    growth_delta = max(0.0, round(curr_readiness - baseline_score, 1)) if curr_readiness > 0 else 0.0
    growth_pts = min(25.0, round((avg_completed_pct * 0.15) + (growth_delta * 0.25), 1))

    # 4. Extra Skill Learning (max 20.0)
    cursor.execute("SELECT SUM(duration_minutes) FROM extra_learning_logs WHERE student_id = ?", (student_id,))
    res_mins = cursor.fetchone()[0]
    total_mins = float(res_mins) if res_mins is not None else 0.0
    skill_pts = min(20.0, round(total_mins / 15.0, 1))

    total_score = min(100.0, round(consistency_pts + practice_pts + growth_pts + skill_pts, 1))

    if total_score >= 80:
        tier = "High Potential (Accelerating)"
    elif total_score >= 65:
        tier = "Promising Growth"
    elif total_score >= 45:
        tier = "Developing Momentum"
    else:
        tier = "Foundation Building"

    # Update in database
    cursor.execute("UPDATE students SET potential_score = ? WHERE id = ?", (total_score, student_id))

    return {
        'potential_score': total_score,
        'potential_tier': tier,
        'breakdown': {
            'consistency_effort': round(consistency_pts, 1),
            'practice_mastery': round(practice_pts, 1),
            'growth_velocity': round(growth_pts, 1),
            'skill_investment': round(skill_pts, 1)
        },
        'growth_delta': round(growth_delta, 1),
        'baseline_score': round(baseline_score, 1),
        'current_score': round(curr_readiness, 1),
        'insights': f"{tier}: Consistent daily study effort ({round(consistency_pts, 1)}/25 pts) with +{int(growth_delta)}% skill growth above intake baseline ({int(baseline_score)}%)."
    }