import { mockRequest } from "./api";
import { GOVERNORATES, getGovernorate } from "@/mock/governorates";
import type { Governorate } from "@/types";

export const governoratesService = {
  list(): Promise<Governorate[]> {
    return mockRequest(GOVERNORATES, 100);
  },
  get(key: string): Promise<Governorate | undefined> {
    return mockRequest(getGovernorate(key), 80);
  },
};
