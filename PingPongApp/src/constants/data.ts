export interface User {
  name: string;
  rank: number;
  elo: number;
  winRate?: string;
  streak?: number;
  matches?: number;
  avatar: string;
}

export interface Match {
  id: string | number;
  opponent: string;
  date?: string;
  avatar: string;
  elo?: number;
  name?: string; 
}

export interface HistoryItem {
  id: number;
  opponent: string;
  score: string;
  result: 'W' | 'L';
  date: string;
}

export interface Location {
  id: number;
  name: string;
  dist: string;
  traffic: string;
  color: string;
}

export interface DateItem {
  id: number;
  day: string;
  date: number;
}

export const MY_STATS: User = { 
  name: "Julian C.", 
  rank: 14, 
  elo: 1540, 
  winRate: '68%', 
  streak: 5, 
  matches: 42, 
  avatar: "https://i.pravatar.cc/150?u=julian" 
};

export const MOCK_OPPONENT: Match = { 
  id: 2, 
  name: "David W.", 
  opponent: "David W.",
  elo: 1510, 
  avatar: "https://i.pravatar.cc/150?u=david" 
};

export const PENDING_MATCHES_LIST: Match[] = [
  { id: 'm1', opponent: 'David W.', date: 'Today, 10:00 AM', avatar: "https://i.pravatar.cc/150?u=david" },
  { id: 'm2', opponent: 'Chris P.', date: 'Yesterday', avatar: "https://i.pravatar.cc/150?u=chris" },
];

export const HISTORY: HistoryItem[] = [
  { id: 1, opponent: "Sarah L.", score: "11-9, 11-7", result: "W", date: "Yesterday" },
  { id: 2, opponent: "Mike T.", score: "9-11, 8-11", result: "L", date: "3 days ago" },
  { id: 3, opponent: "Alex Z.", score: "11-5, 11-2", result: "W", date: "1 week ago" },
];

// Generate next 7 days
export const DATES: DateItem[] = Array.from({length: 7}, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return { 
    id: i, 
    day: d.toLocaleDateString('en-US', { weekday: 'short' }), 
    date: d.getDate() 
  };
});

// Generate Time Slots
export const TIME_SLOTS: string[] = [];
let startHour = 6; 
for (let i = 0; i < 32; i++) { 
  const totalMin = startHour * 60 + i * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const period = h >= 12 && h < 24 ? 'PM' : 'AM';
  const dispH = h > 12 ? h - 12 : (h === 0 || h === 24 ? 12 : h);
  const dispM = m === 0 ? '00' : '30';
  TIME_SLOTS.push(`${dispH}:${dispM} ${period}`);
}