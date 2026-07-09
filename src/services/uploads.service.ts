import { apiUpload } from "./api";

export const uploadsService = {
  async uploadMultiple(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const { urls } = await apiUpload<{ urls: string[] }>("/uploads/multiple", formData);
    return urls;
  },
};
