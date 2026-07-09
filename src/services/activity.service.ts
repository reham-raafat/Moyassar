import { mockRequest } from "./api";
import { ACTIVITY } from "@/mock/activity";
import type { ActivityEvent } from "@/types";

export const activityService = {
  recent(limit = 12): Promise<ActivityEvent[]> {
    const rows = [...ACTIVITY].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, limit);
    return mockRequest(rows, 150);
  },
};
