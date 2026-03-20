const BASE_URL = 'https://api.github.com';

// Loki-inspired color palette: emerald, gold, TVA amber, ancient teal, rune violet
export const EVENT_TYPES = {
  PushEvent:        { label: 'Push Commits',   color: '#00ff9d', emoji: '⚡' },
  PullRequestEvent: { label: 'Pull Request',   color: '#ffd700', emoji: '🔱' },
  IssuesEvent:      { label: 'Issues',         color: '#ff6b35', emoji: '🔥' },
  ForkEvent:        { label: 'Fork',           color: '#c084fc', emoji: '⚔️' },
  WatchEvent:       { label: 'Star / Watch',   color: '#facc15', emoji: '✦' },
  CreateEvent:      { label: 'Create Branch',  color: '#34d399', emoji: '🌿' },
  ReleaseEvent:     { label: 'Release',        color: '#a78bfa', emoji: '🪄' },
  DeleteEvent:      { label: 'Delete',         color: '#fb923c', emoji: '💥' },
  CommitCommentEvent: { label: 'Comment',      color: '#38bdf8', emoji: '💬' },
  GollumEvent:      { label: 'Wiki',           color: '#86efac', emoji: '📜' },
};

const MOCK_REPOS = [
  'torvalds/linux','facebook/react','microsoft/vscode','tensorflow/tensorflow',
  'vuejs/vue','denoland/deno','rust-lang/rust','golang/go','python/cpython',
  'kubernetes/kubernetes','vercel/next.js','sveltejs/svelte','angular/angular',
  'openai/openai-python','langchain-ai/langchain','huggingface/transformers',
  'shadcn-ui/ui','trpc/trpc','prisma/prisma','supabase/supabase',
];

function generateMockEvents(count = 500) {
  const events = [];
  const actors = [
    'linus','gaearon','benlesh','sindresorhus','addyosmani','tj','yyx990803',
    'nicolo-ribaudo','antfu','timneutkens','rauchg','ematipico','hi-ogawa',
  ];
  const types = Object.keys(EVENT_TYPES);
  // weight towards more common events
  const weightedTypes = [
    ...Array(8).fill('PushEvent'),
    ...Array(4).fill('CreateEvent'),
    ...Array(4).fill('WatchEvent'),
    ...Array(3).fill('PullRequestEvent'),
    ...Array(2).fill('IssuesEvent'),
    ...Array(2).fill('ForkEvent'),
    'ReleaseEvent','DeleteEvent','CommitCommentEvent','GollumEvent',
  ];

  for (let i = 0; i < count; i++) {
    const repo = MOCK_REPOS[Math.floor(Math.random() * MOCK_REPOS.length)];
    const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const minsAgo = Math.floor(Math.random() * 120);
    events.push({
      id: `mock-${i}`,
      type,
      actor: { login: actor },
      repo: { name: repo },
      created_at: new Date(Date.now() - minsAgo * 60000).toISOString(),
      payload: {
        commits: type === 'PushEvent' ? Array(Math.floor(Math.random() * 8) + 1).fill(null) : undefined,
        action: type === 'PullRequestEvent' ? 'opened' : undefined,
        size: type === 'PushEvent' ? Math.floor(Math.random() * 10) + 1 : undefined,
      },
    });
  }
  return events;
}

export async function fetchPublicEvents(repoFilter = null) {
  try {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let allEvents = [];
    let rateLimitRemaining = null;

    if (repoFilter) {
      // Single repo: fetch up to 3 pages
      const [owner, repo] = repoFilter.split('/');
      for (let page = 1; page <= 3; page++) {
        const res = await fetch(
          `${BASE_URL}/repos/${owner}/${repo}/events?per_page=100&page=${page}`,
          { headers }
        );
        if (res.status === 403 || res.status === 429) break;
        if (!res.ok) break;
        rateLimitRemaining = res.headers.get('X-RateLimit-Remaining');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;
        allEvents.push(...data);
        if (data.length < 100) break;
      }
    } else {
      // Global: fetch /events (pages 1-3) PLUS active org feeds to bypass the 300 global cap
      const endpointUrls = [
        `${BASE_URL}/events?per_page=100&page=1`,
        `${BASE_URL}/events?per_page=100&page=2`,
        `${BASE_URL}/events?per_page=100&page=3`,
        // Pull trending orgs to maximize density (each also capped at ~300)
        `${BASE_URL}/orgs/microsoft/events?per_page=100&page=1`,
        `${BASE_URL}/orgs/microsoft/events?per_page=100&page=2`,
        `${BASE_URL}/orgs/google/events?per_page=100&page=1`,
        `${BASE_URL}/orgs/google/events?per_page=100&page=2`,
        `${BASE_URL}/orgs/facebook/events?per_page=100&page=1`,
        `${BASE_URL}/orgs/vercel/events?per_page=100&page=1`,
        `${BASE_URL}/orgs/aws/events?per_page=100&page=1`,
        `${BASE_URL}/orgs/github/events?per_page=100&page=1`,
        `${BASE_URL}/orgs/apache/events?per_page=100&page=1`,
        `${BASE_URL}/orgs/mozilla/events?per_page=100&page=1`,
      ];

      const results = await Promise.allSettled(
        endpointUrls.map(url => fetch(url, { headers }))
      );

      // Deduplicate events by ID since global and org feeds might overlap
      const seenIds = new Set();

      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const res = result.value;
        if (res.status === 403 || res.status === 429 || !res.ok) continue;
        rateLimitRemaining = res.headers.get('X-RateLimit-Remaining');
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const ev of data) {
            if (!seenIds.has(ev.id)) {
              seenIds.add(ev.id);
              allEvents.push(ev);
            }
          }
        }
      }
    }

    if (allEvents.length < 20) {
      console.warn('Too few events from API — supplementing with mock data');
      allEvents = [...allEvents, ...generateMockEvents(300)];
    }

    return buildTreeData(allEvents, false, rateLimitRemaining ? Number(rateLimitRemaining) : null);
  } catch (err) {
    console.warn('Fetch error — using mock data:', err.message);
    return buildTreeData(generateMockEvents(500), true);
  }
}

export function buildTreeData(events, isMock = false, rateLimitRemaining = null) {
  const byType = {};

  for (const ev of events) {
    if (!EVENT_TYPES[ev.type]) continue;
    if (!byType[ev.type]) byType[ev.type] = { repos: {}, count: 0 };
    byType[ev.type].count++;
    const repoName = ev.repo?.name || 'unknown/repo';
    if (!byType[ev.type].repos[repoName]) {
      byType[ev.type].repos[repoName] = { events: [], count: 0 };
    }
    byType[ev.type].repos[repoName].events.push({
      id: ev.id,
      actor: ev.actor?.login || 'unknown',
      created_at: ev.created_at,
      commitCount: ev.payload?.size || ev.payload?.commits?.length || 1,
    });
    byType[ev.type].repos[repoName].count++;
  }

  const branches = Object.entries(byType)
    .map(([type, data]) => ({
      type,
      label: EVENT_TYPES[type].label,
      color: EVENT_TYPES[type].color,
      emoji: EVENT_TYPES[type].emoji,
      count: data.count,
      refs: Object.entries(data.repos)
        .map(([name, info]) => ({
          name,
          count: info.count,
          events: info.events.slice(0, 30), // up to 30 leaf nodes per repo
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // up to 20 repos per branch type
    }))
    .sort((a, b) => b.count - a.count);

  branches.forEach(b => {
    b.repos = b.refs;
    delete b.refs;
  });

  return {
    branches,
    totalEvents: events.length,
    isMock,
    rateLimitRemaining,
    fetchedAt: new Date().toISOString(),
  };
}
