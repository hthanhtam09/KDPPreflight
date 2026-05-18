const WORDS_PER_MINUTE = 220;

export function calculateReadingTime(markdown: string): { label: string; minutes: number } {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/[#>*_`~|[\](){}-]/g, ' ');

  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return {
    label: `${minutes} min read`,
    minutes,
  };
}
