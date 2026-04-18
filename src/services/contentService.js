import Content from "../models/contentModel.js";
import Category from "../models/categoryModel.js";
import Tag from "../models/tagModel.js";
import ContentRevision from "../models/contentRevisionModel.js";
import { createError } from "../utils/httpErrors.js";
import { slugify } from "../utils/slugify.js";

const privilegedRoles = ["admin", "editor", "reviewer"];

const getNextRevisionVersion = async (contentId) => {
    const latest = await ContentRevision.findOne({ content: contentId }).sort({ version: -1 });
    return latest ? latest.version + 1 : 1;
};

export const createRevisionSnapshot = async (content, user, reason) => {
    const version = await getNextRevisionVersion(content._id);
    const snapshot = new ContentRevision({
        content: content._id,
        version,
        title: content.title,
        slug: content.slug,
        type: content.type,
        status: content.status,
        excerpt: content.excerpt,
        body: content.body,
        tags: content.tags,
        tagRefs: content.tagRefs,
        category: content.category,
        categoryRef: content.categoryRef,
        coverImage: content.coverImage,
        seo: content.seo,
        author: content.author,
        updatedBy: user?._id,
        reason
    });
    await snapshot.save();
    return snapshot;
};

const normalizeName = (value) => value?.trim();

const resolveCategory = async (categoryName, user) => {
    if (categoryName === undefined) return null;
    const normalized = normalizeName(categoryName);
    if (!normalized) return { category: "", categoryRef: null };

    const slug = slugify(normalized);
    let category = await Category.findOne({ slug });
    if (!category) {
        category = new Category({
            name: normalized,
            slug,
            createdBy: user?._id
        });
        await category.save();
    }

    return { category: category.name, categoryRef: category._id };
};

const resolveTags = async (tags, user) => {
    if (tags === undefined) return null;
    if (!Array.isArray(tags)) return { tags: [], tagRefs: [] };

    const uniqueNames = [...new Set(tags.map((tag) => normalizeName(tag)).filter(Boolean))];
    if (!uniqueNames.length) return { tags: [], tagRefs: [] };

    const tagDocs = [];
    for (const name of uniqueNames) {
        const slug = slugify(name);
        let tag = await Tag.findOne({ slug });
        if (!tag) {
            tag = new Tag({
                name,
                slug,
                createdBy: user?._id
            });
            await tag.save();
        }
        tagDocs.push(tag);
    }

    return {
        tags: tagDocs.map((tag) => tag.name),
        tagRefs: tagDocs.map((tag) => tag._id)
    };
};

const buildUniqueSlug = async (title, contentId) => {
    const base = slugify(title) || `content-${Date.now()}`;
    let slug = base;
    let counter = 1;

    while (await Content.findOne({ slug, _id: { $ne: contentId } })) {
        slug = `${base}-${counter}`;
        counter += 1;
    }

    return slug;
};

const canAccessDraft = (user, content) => {
    if (!user) return false;
    if (privilegedRoles.includes(user.role)) return true;
    return content.author.toString() === user._id.toString();
};

export const createContent = async (payload, user) => {
    if (!user) throw createError(401, "Not authorized");
    const slug = payload.slug || await buildUniqueSlug(payload.title);

    const categoryResult = await resolveCategory(payload.category, user);
    const tagResult = await resolveTags(payload.tags, user);

    const content = new Content({
        ...payload,
        ...(categoryResult || {}),
        ...(tagResult || {}),
        type: payload.type || payload.contentType,
        slug,
        author: user._id
    });

    if (content.status === "published" && !content.publishedAt) {
        content.publishedAt = new Date();
    }

    await content.save();
    await createRevisionSnapshot(content, user, "create");
    return content;
};

export const listContent = async (query, user) => {
    const filter = {};
    const status = query.status;

    if (!user) {
        filter.status = "published";
    } else if (privilegedRoles.includes(user.role)) {
        if (status && status !== "all") filter.status = status;
        if (query.mine === "true") filter.author = user._id;
    } else if (user.role === "author") {
        if (query.mine === "true") {
            filter.author = user._id;
            if (status && status !== "all") filter.status = status;
        } else {
            filter.$or = [
                { status: "published" },
                { author: user._id }
            ];
        }
    } else {
        filter.status = "published";
    }

    if (query.search) {
        filter.title = { $regex: query.search, $options: "i" };
    }

    return Content.find(filter)
        .populate("author", "userName email role")
        .sort({ createdAt: -1 });
};

export const getContentById = async (contentId, user) => {
    const content = await Content.findById(contentId).populate("author", "userName email role");
    if (!content) throw createError(404, "Content not found");

    if (content.status !== "published" && !canAccessDraft(user, content)) {
        throw createError(403, "Not authorized");
    }

    return content;
};

export const updateContent = async (contentId, payload, user) => {
    if (!user) throw createError(401, "Not authorized");
    const content = await Content.findById(contentId);
    if (!content) throw createError(404, "Content not found");

    if (!canAccessDraft(user, content)) {
        throw createError(403, "Not authorized");
    }

    const titleChanged = payload.title && payload.title !== content.title;

    const categoryResult = await resolveCategory(payload.category, user);
    const tagResult = await resolveTags(payload.tags, user);

    Object.assign(content, payload);
    if (categoryResult) {
        content.category = categoryResult.category;
        content.categoryRef = categoryResult.categoryRef;
    }
    if (tagResult) {
        content.tags = tagResult.tags;
        content.tagRefs = tagResult.tagRefs;
    }

    if (titleChanged && !payload.slug) {
        content.slug = await buildUniqueSlug(payload.title, contentId);
    }

    if (content.status === "published" && !content.publishedAt) {
        content.publishedAt = new Date();
    }

    await content.save();
    await createRevisionSnapshot(content, user, "update");
    return content;
};

export const deleteContent = async (contentId, user) => {
    if (!user) throw createError(401, "Not authorized");
    const content = await Content.findById(contentId);
    if (!content) throw createError(404, "Content not found");

    if (!canAccessDraft(user, content)) {
        throw createError(403, "Not authorized");
    }

    await content.deleteOne();
    return { deleted: true };
};

export const publishContent = async (contentId, user) => {
    if (!user) throw createError(401, "Not authorized");
    if (!privilegedRoles.includes(user.role)) {
        throw createError(403, "Not authorized");
    }

    const content = await Content.findById(contentId);
    if (!content) throw createError(404, "Content not found");

    content.status = "published";
    content.publishedAt = new Date();
    await content.save();
    await createRevisionSnapshot(content, user, "publish");
    return content;
};

export const listPublicContent = async (query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 50);
    const filter = { status: "published" };

    if (query.category) {
        filter.category = query.category;
    }

    if (query.tag) {
        const tags = query.tag.split(",").map((tag) => tag.trim()).filter(Boolean);
        if (tags.length) filter.tags = { $in: tags };
    }

    const searchTerm = query.search || query.q;
    if (searchTerm) {
        filter.$text = { $search: searchTerm };
    }

    const total = await Content.countDocuments(filter);

    let sort = { publishedAt: -1 };
    if (query.sort === "oldest") sort = { publishedAt: 1 };
    if (searchTerm) sort = { score: { $meta: "textScore" } };

    const projection = searchTerm ? { score: { $meta: "textScore" } } : undefined;

    const items = await Content.find(filter, projection)
        .select("title slug excerpt coverImage tags category type publishedAt author")
        .populate("author", "userName role")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        items,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

export const getPublicContentBySlug = async (slug) => {
    const content = await Content.findOne({ slug, status: "published" })
        .populate("author", "userName role");
    if (!content) throw createError(404, "Content not found");
    return content;
};
