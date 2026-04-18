export const slugify = (value) => {
    if (!value || typeof value !== "string") return "";
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
};
