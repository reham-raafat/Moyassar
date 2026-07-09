import type { User, DisabilityType, Role } from "@/types";

// Deterministic mock user roster used for KPIs (Total Users, Active Users,
// New Users This Month) and the Users-by-Disability donut chart.

const NOW = new Date();
const iso = (d: Date) => d.toISOString();
const monthsAgo = (n: number) => {
  const d = new Date(NOW);
  d.setMonth(d.getMonth() - n);
  return iso(d);
};
const daysAgo = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return iso(d);
};

type Seed = {
  name: string;
  role?: Role;
  dis: DisabilityType[];
  createdMonthsAgo: number;
  lastActiveDays: number;
};

const SEEDS: Seed[] = [
  // Anchor users referenced elsewhere (ids kept stable)
  {
    name: "Ahmed Salah",
    role: "citizen",
    dis: ["mobility"],
    createdMonthsAgo: 5,
    lastActiveDays: 1,
  },
  {
    name: "Nour Hassan",
    role: "contributor",
    dis: ["visual"],
    createdMonthsAgo: 4,
    lastActiveDays: 2,
  },
  {
    name: "Dr. Mona Adel",
    role: "government_admin",
    dis: [],
    createdMonthsAgo: 6,
    lastActiveDays: 0,
  },
  {
    name: "Omar Khaled",
    role: "contributor",
    dis: ["hearing"],
    createdMonthsAgo: 3,
    lastActiveDays: 4,
  },
  {
    name: "Layla Ibrahim",
    role: "citizen",
    dis: ["mobility", "visual"],
    createdMonthsAgo: 2,
    lastActiveDays: 1,
  },
  // Broader roster
  { name: "Hossam Tarek", dis: ["mobility"], createdMonthsAgo: 7, lastActiveDays: 10 },
  { name: "Mariam Fathi", dis: ["visual"], createdMonthsAgo: 8, lastActiveDays: 3 },
  { name: "Karim Adel", dis: ["hearing"], createdMonthsAgo: 6, lastActiveDays: 6 },
  { name: "Salma Naguib", dis: ["mobility"], createdMonthsAgo: 9, lastActiveDays: 35 },
  { name: "Youssef Wael", dis: ["mobility", "hearing"], createdMonthsAgo: 5, lastActiveDays: 2 },
  { name: "Heba Mostafa", dis: ["visual"], createdMonthsAgo: 4, lastActiveDays: 12 },
  { name: "Tarek Magdy", dis: ["mobility"], createdMonthsAgo: 3, lastActiveDays: 7 },
  { name: "Reem Hassan", dis: ["cognitive"], createdMonthsAgo: 10, lastActiveDays: 60 },
  { name: "Mahmoud Sami", dis: ["hearing"], createdMonthsAgo: 2, lastActiveDays: 1 },
  { name: "Doaa Kamal", dis: ["visual", "cognitive"], createdMonthsAgo: 1, lastActiveDays: 4 },
  { name: "Sherif Ezz", dis: ["mobility"], createdMonthsAgo: 11, lastActiveDays: 45 },
  { name: "Aya Hossam", dis: ["mobility"], createdMonthsAgo: 8, lastActiveDays: 5 },
  { name: "Ali Mohamed", dis: ["hearing"], createdMonthsAgo: 0, lastActiveDays: 0 },
  { name: "Engy Adel", dis: ["visual"], createdMonthsAgo: 0, lastActiveDays: 0 },
  { name: "Khaled Yassin", dis: ["mobility", "visual"], createdMonthsAgo: 0, lastActiveDays: 1 },
  { name: "Rana Sherif", dis: ["mobility"], createdMonthsAgo: 0, lastActiveDays: 2 },
  { name: "Mostafa Galal", dis: ["cognitive"], createdMonthsAgo: 0, lastActiveDays: 3 },
  { name: "Noha Adel", dis: ["hearing"], createdMonthsAgo: 1, lastActiveDays: 6 },
  { name: "Walid Saad", dis: ["mobility"], createdMonthsAgo: 7, lastActiveDays: 90 },
  { name: "Yasmin Tarek", dis: ["visual"], createdMonthsAgo: 6, lastActiveDays: 18 },
  { name: "Bassem Anwar", dis: ["mobility", "hearing"], createdMonthsAgo: 5, lastActiveDays: 3 },
  { name: "Hala Mahmoud", dis: ["mobility"], createdMonthsAgo: 4, lastActiveDays: 9 },
  { name: "Mohab Galal", dis: ["hearing"], createdMonthsAgo: 2, lastActiveDays: 2 },
  { name: "Sara Adly", dis: ["visual"], createdMonthsAgo: 3, lastActiveDays: 1 },
  { name: "Hany Saber", dis: ["mobility"], createdMonthsAgo: 9, lastActiveDays: 28 },
  { name: "Nada Hany", dis: ["cognitive"], createdMonthsAgo: 10, lastActiveDays: 75 },
  { name: "Tamer Ezzat", dis: ["mobility", "visual"], createdMonthsAgo: 8, lastActiveDays: 14 },
  { name: "Rasha Magdy", dis: ["hearing"], createdMonthsAgo: 7, lastActiveDays: 4 },
  { name: "Adel Fawzy", dis: ["mobility"], createdMonthsAgo: 6, lastActiveDays: 11 },
  { name: "Nermine Hassan", dis: ["visual"], createdMonthsAgo: 5, lastActiveDays: 2 },
  { name: "Ihab Mansour", dis: ["hearing", "mobility"], createdMonthsAgo: 4, lastActiveDays: 6 },
  { name: "Ola Sayed", dis: ["mobility"], createdMonthsAgo: 3, lastActiveDays: 1 },
  { name: "Marwa Adly", dis: ["cognitive"], createdMonthsAgo: 2, lastActiveDays: 8 },
  { name: "Fady Nabil", dis: ["visual"], createdMonthsAgo: 1, lastActiveDays: 3 },
  { name: "Maged Roshdy", dis: ["mobility"], createdMonthsAgo: 11, lastActiveDays: 100 },
  { name: "Dina Wagdy", dis: ["mobility"], createdMonthsAgo: 0, lastActiveDays: 1 },
  { name: "Ihsan Naguib", dis: ["hearing", "visual"], createdMonthsAgo: 0, lastActiveDays: 0 },
  { name: "Sayed Lotfy", dis: ["mobility"], createdMonthsAgo: 0, lastActiveDays: 2 },
  { name: "Mai Fouad", dis: ["visual"], createdMonthsAgo: 6, lastActiveDays: 22 },
  { name: "Ramy Adel", dis: ["hearing"], createdMonthsAgo: 8, lastActiveDays: 40 },
  { name: "Lobna Hany", dis: ["mobility", "cognitive"], createdMonthsAgo: 9, lastActiveDays: 17 },
  { name: "Galal Saber", dis: ["mobility"], createdMonthsAgo: 10, lastActiveDays: 5 },
  { name: "Reham Adly", dis: ["visual"], createdMonthsAgo: 5, lastActiveDays: 3 },
  { name: "Mina Wagih", dis: ["hearing"], createdMonthsAgo: 2, lastActiveDays: 1 },
  { name: "Sahar Nabil", dis: ["mobility"], createdMonthsAgo: 1, lastActiveDays: 7 },
];

export const USERS: User[] = SEEDS.map((s, i) => ({
  id: `u-${String(i + 1).padStart(3, "0")}`,
  name: s.name,
  email: `${s.name
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z.]/g, "")}@example.com`,
  role: s.role ?? "citizen",
  disabilities: s.dis,
  created_at: monthsAgo(s.createdMonthsAgo),
  last_active_at: daysAgo(s.lastActiveDays),
}));

export function findUserByRole(role: Role) {
  return USERS.find((u) => u.role === role)!;
}
