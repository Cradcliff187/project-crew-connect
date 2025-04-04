
// Add these helper functions right after the formatDuration function in TimeEntryList.tsx

const groupEntriesByDate = (entries: TimeEntry[]) => {
  const grouped = new Map<string, TimeEntry[]>();

  entries.forEach(entry => {
    const dateKey = entry.date_worked;
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)?.push(entry);
  });

  grouped.forEach((entriesForDate, date) => {
    grouped.set(date, [...entriesForDate].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    ));
  });

  return new Map([...grouped.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])));
};

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const getTimeOfDayColor = (timeOfDay: TimeOfDay): string => {
  switch (timeOfDay) {
    case 'morning': return 'bg-blue-100 text-blue-800';
    case 'afternoon': return 'bg-amber-100 text-amber-800';
    case 'evening': return 'bg-purple-100 text-purple-800';
    case 'night': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};
