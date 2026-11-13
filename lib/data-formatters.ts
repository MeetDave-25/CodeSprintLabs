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
