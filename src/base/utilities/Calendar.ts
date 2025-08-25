export function formatEventsTable(events: any[], title: string) {
  const lines: string[] = [];

  for (const event of events) {
    lines.push(
      `• 🎯 ${event.title} -   📅    ${event.date}     🕒     ${event.time} ${event.countdown}`
    );
  }

  return `${title}\n${lines.join("\n")}`;
}

export function getCountdown(date: Date) {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "⏳ Event ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return days > 0
    ? `⏳ Starts in ${days}d ${remainingHours}h`
    : `⏳ Starts in ${remainingHours}h`;
}
