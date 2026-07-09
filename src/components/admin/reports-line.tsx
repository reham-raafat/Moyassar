import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/lib/i18n";

export function ReportsDualLine({
  data,
}: {
  data: { month: string; submitted: number; resolved: number }[];
}) {
  const { t } = useI18n();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <ReTooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="submitted"
          name={t.admin.submittedLine}
          stroke="#FF9800"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          name={t.admin.resolvedLine}
          stroke="#2E7D32"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
