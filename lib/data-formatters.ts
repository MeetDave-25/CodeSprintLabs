export function safeJson(val: any, fallback: any = []) {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch {
            return fallback;
        }
    }
    return fallback;
}

export function formatInternship(item: any, tasks: any[] = []) {
    if (!item) return null;
    return {
        id: String(item.id),
        _id: String(item.id),
        title: item.title || '',
        companyName: item.companyName || '',
        location: item.location || 'Remote',
        type: item.type || 'Remote',
        stipend: item.stipend || 'Unpaid',
        applicationDeadline: item.applicationDeadline ? new Date(item.applicationDeadline).toISOString() : null,
        startDate: item.startDate ? new Date(item.startDate).toISOString() : null,
        endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
        companyLogo: item.companyLogo || null,
        responsibilities: safeJson(item.responsibilities, []),
        skills: safeJson(item.skills, []),
        isFeatured: Boolean(item.isFeatured),
        domain: item.domain || '',
        description: item.description || '',
        duration: item.duration || '',
        languages: safeJson(item.languages, []),
        difficulty: item.difficulty || 'Beginner',
        enrolled: Number(item.enrolled) || 0,
        maxStudents: Number(item.maxStudents) || 100,
        isActive: Boolean(item.isActive),
        image: item.image || null,
        requirements: safeJson(item.requirements, []),
        learningOutcomes: safeJson(item.learningOutcomes, []),
        whatYouWillLearn: safeJson(item.whatYouWillLearn || item.learningOutcomes, []),
        syllabus: safeJson(item.syllabus, []),
        createdBy: item.createdBy || null,
        price: item.price !== null && item.price !== undefined ? Number(item.price) : 0,
        tasks: (tasks || []).map(formatTask),
        created_at: item.created_at,
        updated_at: item.updated_at,
    };
}

export function formatTask(t: any) {
    if (!t) return null;
    return {
        id: String(t.id),
        _id: String(t.id),
        title: t.title || '',
        description: t.description || '',
        domain: t.domain || null,
        language: t.language || null,
        difficulty: t.difficulty || 'Easy',
        dayNumber: Number(t.dayNumber) || 1,
        points: Number(t.points) || 0,
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
        requirements: safeJson(t.requirements, []),
        internshipId: t.internshipId ? String(t.internshipId) : null,
        courseId: t.courseId ? String(t.courseId) : null,
        moduleId: t.moduleId || null,
        source: t.source || 'internship',
        isActive: Boolean(t.isActive),
        created_at: t.created_at,
        updated_at: t.updated_at,
    };
}

export function formatCourse(c: any) {
    if (!c) return null;
    return {
        id: String(c.id),
        _id: String(c.id),
        title: c.title || '',
        description: c.description || '',
        instructor: c.instructor || '',
        price: c.price !== null && c.price !== undefined ? Number(c.price) : 0,
        duration: c.duration || '',
        level: c.level || 'Beginner',
        category: c.category || 'General',
        thumbnail: c.thumbnail || null,
        enrolled: Number(c.enrolled) || 0,
        rating: c.rating !== null && c.rating !== undefined ? Number(c.rating) : 0,
        modules: safeJson(c.modules, []),
        isActive: Boolean(c.isActive),
        createdBy: c.createdBy || null,
        created_at: c.created_at,
        updated_at: c.updated_at,
    };
}

export function formatSubmission(s: any) {
    if (!s) return null;
    return {
        id: String(s.id),
        _id: String(s.id),
        studentId: s.studentId ? String(s.studentId) : null,
        studentName: s.studentName || '',
        taskId: s.taskId ? String(s.taskId) : null,
        taskTitle: s.taskTitle || '',
        githubLink: s.githubLink || null,
        fileUrl: s.fileUrl || null,
        screenshotUrl: s.screenshotUrl || null,
        notes: s.notes || null,
        submittedAt: s.submittedAt ? new Date(s.submittedAt).toISOString() : null,
        status: s.status || 'pending',
        feedback: s.feedback || null,
        reviewedBy: s.reviewedBy ? String(s.reviewedBy) : null,
        reviewedAt: s.reviewedAt ? new Date(s.reviewedAt).toISOString() : null,
        pointsAwarded: Number(s.pointsAwarded) || 0,
        created_at: s.created_at,
        updated_at: s.updated_at,
    };
}

export function formatCertificate(cert: any) {
    if (!cert) return null;
    return {
        id: String(cert.id),
        _id: String(cert.id),
        studentId: cert.studentId ? String(cert.studentId) : null,
        studentName: cert.studentName || '',
        internshipId: cert.internshipId ? String(cert.internshipId) : null,
        internshipTitle: cert.internshipTitle || null,
        courseId: cert.courseId ? String(cert.courseId) : null,
        courseTitle: cert.courseTitle || null,
        issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString() : null,
        certificateUrl: cert.certificateUrl || null,
        verificationCode: cert.verificationCode || '',
        issuedBy: cert.issuedBy || 'CodeSprint Labs',
        marks: cert.marks !== null && cert.marks !== undefined ? Number(cert.marks) : null,
        grade: cert.grade || null,
        created_at: cert.created_at,
        updated_at: cert.updated_at,
    };
}

export function formatTeamMember(m: any) {
    if (!m) return null;
    return {
        id: String(m.id),
        _id: String(m.id),
        name: m.name || '',
        role: m.role || '',
        bio: m.bio || '',
        email: m.email || '',
        phone: m.phone || '',
        image: m.image || '',
        linkedin: m.linkedin || '',
        github: m.github || '',
        twitter: m.twitter || '',
        gradient: m.gradient || 'from-purple-600 to-pink-600',
        order: Number(m.order) || 0,
        isActive: Boolean(m.isActive),
    };
}

