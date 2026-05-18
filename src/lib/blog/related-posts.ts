import type { BlogPost } from '@/types/blog';

function keywordScore(source: BlogPost, candidate: BlogPost): number {
  const sourceTerms = new Set([...source.keywords, ...source.tags].map((term) => term.toLowerCase()));
  return [...candidate.keywords, ...candidate.tags].reduce((score, term) => {
    return sourceTerms.has(term.toLowerCase()) ? score + 1 : score;
  }, 0);
}

export function getRelatedBlogPosts(post: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
  const candidates = posts.filter((candidate) => candidate.slug !== post.slug && !candidate.draft);

  return candidates
    .map((candidate) => ({
      post: candidate,
      score:
        (candidate.category === post.category ? 100 : 0) +
        keywordScore(post, candidate) * 12 +
        (candidate.featured ? 4 : 0),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.updatedAt).getTime() - new Date(a.post.updatedAt).getTime();
    })
    .slice(0, limit)
    .map((candidate) => candidate.post);
}
