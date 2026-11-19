import crypto from "node:crypto";

export const generateSlug = (text: string) => {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, "");

  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
};
