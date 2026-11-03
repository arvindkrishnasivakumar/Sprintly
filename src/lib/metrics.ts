type MetricTask = { status: string; storyPoints: number; dueDate: Date | null };
export function sprintMetrics(
  tasks: MetricTask[],
  endDate: Date,
  now = new Date(),
) {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const done = tasks.filter((t) => t.status === "DONE");
  return {
    total: tasks.length,
    completed: done.length,
    percentage: tasks.length
      ? Math.round((done.length / tasks.length) * 100)
      : 0,
    points: tasks.reduce((s, t) => s + t.storyPoints, 0),
    completedPoints: done.reduce((s, t) => s + t.storyPoints, 0),
    overdue: tasks.filter(
      (t) => t.status !== "DONE" && t.dueDate && t.dueDate.getTime() < today,
    ).length,
    daysRemaining: Math.max(
      0,
      Math.floor((endDate.getTime() - today) / 86400000) + 1,
    ),
  };
}
