/**
 * GNOSTIRI Progress Runtime
 * Domains served: High School, University, and Extras.
 *
 * Architectural decision:
 * This is a browser-native ES module for the Jekyll static-site architecture.
 * It exports progressTracker for Profile, Quiz, Tutor, and Dashboard modules.
 * Progress is stored locally under domain-scoped keys so High School,
 * University, and Extras data never share the same storage bucket.
 *
 * No secrets, credentials, Firebase assumptions, React imports, or bundler-only
 * syntax are used here.
 */

const VALID_DOMAINS = new Set(['high-school', 'university', 'extras']);
const STORAGE_PREFIX = 'gnostiri:v1';
const LEGACY_DOMAIN_KEY = 'axiom-domain';
const APP_STATE_KEY = 'gnostiri-app-state';

function safeStorage() {
  try {
    const testKey = `${STORAGE_PREFIX}:storage-test`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    console.warn('[GNOSTIRI progress] localStorage is unavailable:', error);
    return null;
  }
}

const storage = safeStorage();

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn('[GNOSTIRI progress] Failed to parse stored value:', error);
    return fallback;
  }
}

function readLocal(key, fallback = null) {
  if (!storage) return fallback;
  return storage.getItem(key) ?? fallback;
}

function writeLocal(key, value) {
  if (!storage) return;
  storage.setItem(key, value);
}

function removeLocal(key) {
  if (!storage) return;
  storage.removeItem(key);
}

function normalizeDomain(domain) {
  if (VALID_DOMAINS.has(domain)) return domain;

  const path = window.location.pathname;

  if (path.includes('/high-school/')) return 'high-school';
  if (path.includes('/university/')) return 'university';
  if (path.includes('/extras/')) return 'extras';

  const saved = readLocal(LEGACY_DOMAIN_KEY);
  if (VALID_DOMAINS.has(saved)) return saved;

  const appState = safeParse(readLocal(APP_STATE_KEY), null);
  if (appState && VALID_DOMAINS.has(appState.domain)) return appState.domain;

  return 'high-school';
}

function getGuestId() {
  const key = `${STORAGE_PREFIX}:guestId`;
  let id = readLocal(key);

  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    writeLocal(key, id);
  }

  return id;
}

function getUserScope() {
  /*
    Later authenticated phases can map this to a Firebase Auth UID.
    Phase 1 remains deterministic and static-site safe.
  */
  return getGuestId();
}

function storageKey(domain, bucket) {
  return `${STORAGE_PREFIX}:user:${getUserScope()}:domain:${normalizeDomain(domain)}:${bucket}`;
}

function readBucket(domain, bucket, fallback) {
  return safeParse(readLocal(storageKey(domain, bucket)), fallback);
}

function writeBucket(domain, bucket, value) {
  writeLocal(storageKey(domain, bucket), JSON.stringify(value));
  return value;
}

function emitProgressUpdated(detail) {
  document.dispatchEvent(
    new CustomEvent('gnostiri:progress-updated', {
      detail
    })
  );
}

function nowIso() {
  return new Date().toISOString();
}

function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function computeMasteryFromScores(scores) {
  if (!Array.isArray(scores) || !scores.length) return 0;

  const average =
    scores.reduce((sum, item) => sum + Number(item.percent || 0), 0) /
    scores.length;

  return clampPercent(average);
}

function topicKey(parts) {
  return [
    parts.domain,
    parts.subject,
    parts.topic,
    parts.subtopic
  ]
    .filter(Boolean)
    .join(':');
}

function normalizeWeakTopic(topic, fallback) {
  if (!topic) return null;

  if (typeof topic === 'string') {
    return {
      key: topic,
      domain: fallback.domain,
      subject: fallback.subject || null,
      topic,
      subtopic: null
    };
  }

  if (typeof topic === 'object') {
    const normalized = {
      domain: fallback.domain,
      subject: topic.subject || fallback.subject || null,
      topic: topic.topic || topic.title || fallback.topic || null,
      subtopic: topic.subtopic || null
    };

    return {
      ...normalized,
      key: topic.key || topicKey(normalized)
    };
  }

  return null;
}

function makeActivityId() {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const progressTracker = {
  validDomains: Array.from(VALID_DOMAINS),

  getActiveDomain() {
    return normalizeDomain();
  },

  getSnapshot(domain) {
    const resolvedDomain = normalizeDomain(domain);
    const study = readBucket(resolvedDomain, 'studyProgress', {});
    const quizzes = readBucket(resolvedDomain, 'quizHistory', []);
    const weakTopics = readBucket(resolvedDomain, 'weakTopics', {});
    const activity = readBucket(resolvedDomain, 'activity', []);
    const bookmarks = readBucket(resolvedDomain, 'bookmarks', []);

    return {
      schemaVersion: 1,
      domain: resolvedDomain,
      userScope: getUserScope(),
      studyProgress: study,
      quizHistory: quizzes,
      weakTopics,
      activity,
      bookmarks,
      stats: {
        chaptersRead: Object.values(study).filter(
          item => Number(item.percent || 0) >= 90
        ).length,
        quizzesTaken: quizzes.length,
        mastery: computeMasteryFromScores(quizzes),
        weakTopicCount: Object.keys(weakTopics).length,
        bookmarkCount: bookmarks.length
      },
      updatedAt: nowIso()
    };
  },

  saveStudyProgress(input = {}) {
    const domain = normalizeDomain(input.domain);
    const path = input.path || window.location.pathname;
    const percent = clampPercent(input.percent ?? input.progress ?? 0);
    const id = input.id || path;

    const study = readBucket(domain, 'studyProgress', {});
    study[id] = {
      id,
      path,
      domain,
      title: input.title || document.title || path,
      subject: input.subject || null,
      topic: input.topic || null,
      subtopic: input.subtopic || null,
      percent,
      completed: percent >= 90,
      updatedAt: nowIso()
    };

    writeBucket(domain, 'studyProgress', study);

    this.recordActivity({
      domain,
      type: 'study',
      title: study[id].title,
      path,
      percent
    });

    emitProgressUpdated({
      domain,
      type: 'study',
      item: study[id],
      snapshot: this.getSnapshot(domain)
    });

    return study[id];
  },

  submitQuizScore(input = {}) {
    const domain = normalizeDomain(input.domain);
    const history = readBucket(domain, 'quizHistory', []);

    const total =
      Number(input.total) ||
      Number(input.questionCount) ||
      Number(input.questions) ||
      0;

    const correct = Number(input.correct || 0);

    const percent =
      input.percent !== undefined
        ? clampPercent(input.percent)
        : total > 0
          ? clampPercent((correct / total) * 100)
          : 0;

    const result = {
      id: input.id || `quiz-${Date.now()}`,
      domain,
      subject: input.subject || null,
      topic: input.topic || null,
      subtopic: input.subtopic || null,
      quizId: input.quizId || input.slug || null,
      title: input.title || input.quizTitle || 'Quiz',
      correct,
      total,
      percent,
      weakTopics: Array.isArray(input.weakTopics) ? input.weakTopics : [],
      mistakes: Array.isArray(input.mistakes) ? input.mistakes : [],
      completedAt: nowIso()
    };

    history.push(result);
    writeBucket(domain, 'quizHistory', history);

    if (result.weakTopics.length) {
      const weakTopics = readBucket(domain, 'weakTopics', {});

      result.weakTopics
        .map(topic =>
          normalizeWeakTopic(topic, {
            domain,
            subject: result.subject,
            topic: result.topic
          })
        )
        .filter(Boolean)
        .forEach(topic => {
          if (!topic.key) return;

          weakTopics[topic.key] = {
            key: topic.key,
            domain,
            subject: topic.subject,
            topic: topic.topic,
            subtopic: topic.subtopic,
            count: Number(weakTopics[topic.key]?.count || 0) + 1,
            lastSeenAt: nowIso()
          };
        });

      writeBucket(domain, 'weakTopics', weakTopics);
    }

    this.recordActivity({
      domain,
      type: 'quiz',
      title: result.title,
      percent: result.percent,
      path: window.location.pathname
    });

    emitProgressUpdated({
      domain,
      type: 'quiz',
      item: result,
      snapshot: this.getSnapshot(domain)
    });

    return result;
  },

  addBookmark(input = {}) {
    const domain = normalizeDomain(input.domain);
    const bookmarks = readBucket(domain, 'bookmarks', []);
    const path = input.path || window.location.pathname;

    if (!bookmarks.some(item => item.path === path)) {
      bookmarks.push({
        domain,
        path,
        title: input.title || document.title || path,
        subject: input.subject || null,
        topic: input.topic || null,
        addedAt: nowIso()
      });
    }

    writeBucket(domain, 'bookmarks', bookmarks);

    emitProgressUpdated({
      domain,
      type: 'bookmark',
      snapshot: this.getSnapshot(domain)
    });

    return bookmarks;
  },

  removeBookmark(path = window.location.pathname, domain) {
    const resolvedDomain = normalizeDomain(domain);
    const bookmarks = readBucket(resolvedDomain, 'bookmarks', []);
    const filtered = bookmarks.filter(item => item.path !== path);

    writeBucket(resolvedDomain, 'bookmarks', filtered);

    emitProgressUpdated({
      domain: resolvedDomain,
      type: 'bookmark-remove',
      snapshot: this.getSnapshot(resolvedDomain)
    });

    return filtered;
  },

  recordActivity(input = {}) {
    const domain = normalizeDomain(input.domain);
    const activity = readBucket(domain, 'activity', []);

    activity.unshift({
      id: makeActivityId(),
      domain,
      type: input.type || 'activity',
      title: input.title || 'Learning activity',
      path: input.path || window.location.pathname,
      percent: input.percent ?? null,
      createdAt: nowIso()
    });

    const trimmed = activity.slice(0, 50);
    writeBucket(domain, 'activity', trimmed);

    return trimmed;
  },

  clearDomain(domain) {
    const resolvedDomain = normalizeDomain(domain);

    ['studyProgress', 'quizHistory', 'weakTopics', 'activity', 'bookmarks'].forEach(bucket => {
      removeLocal(storageKey(resolvedDomain, bucket));
    });

    emitProgressUpdated({
      domain: resolvedDomain,
      type: 'clear',
      snapshot: this.getSnapshot(resolvedDomain)
    });
  }
};

/**
 * Backward-compatible helper for older GNOSTIRI scripts.
 * Stores study progress in the active domain bucket.
 */
export function saveProgress(sectionId, progressData = {}) {
  const domain = progressData.domain || progressTracker.getActiveDomain();

  return progressTracker.saveStudyProgress({
    id: sectionId,
    domain,
    title: progressData.title,
    path: progressData.path,
    percent: progressData.percent ?? progressData.progress ?? 0,
    subject: progressData.subject,
    topic: progressData.topic,
    subtopic: progressData.subtopic
  });
}

/**
 * Backward-compatible helper for older GNOSTIRI scripts.
 * Loads one study progress item from a domain-scoped bucket.
 */
export function loadProgress(sectionId, domain) {
  const snapshot = progressTracker.getSnapshot(domain);
  return snapshot.studyProgress[sectionId] || null;
}

/**
 * Backward-compatible helper for Tutor activity tracking.
 * Emits the same global progress event consumed by Tutor/dashboard modules.
 */
export function trackTutorProgress(userId, topic) {
  const domain = progressTracker.getActiveDomain();

  progressTracker.recordActivity({
    domain,
    type: 'tutor',
    title: topic ? `Tutor focus: ${topic}` : 'Tutor activity',
    path: window.location.pathname
  });

  emitProgressUpdated({
    domain,
    type: 'tutor',
    userId,
    topic,
    snapshot: progressTracker.getSnapshot(domain)
  });
}
