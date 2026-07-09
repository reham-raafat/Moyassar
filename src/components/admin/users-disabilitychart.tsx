import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ReTooltip } from "recharts";
import { useI18n } from "@/lib/i18n";

const COLORS = ["#0F4C81", "#00897B", "#FF9800", "#7E57C2"];

export function UsersDisabilityChart({
  data,
}: {
  data: { key: "mobility" | "visual" | "hearing" | "multiple" | "none"; count: number }[];
}) {
  const { t } = useI18n();
  const label = (k: string) =>
    k === "multiple" ? t.admin.multiple : ((t.aud as Record<string, string>)[k] ?? k);
  const rows = data.map((d) => ({ name: label(d.key), value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <ReTooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
