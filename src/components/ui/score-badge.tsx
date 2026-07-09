export function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const tone =
    score >= 75
      ? "bg-success text-success-foreground"
      : score >= 50
        ? "bg-accent text-accent-foreground"
        : "bg-destructive text-destructive-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}
      aria-label={`${label ?? "score"}: ${score} out of 100`}
    >
      {score}/100
    </span>
  );
}
