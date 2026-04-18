import Tag from "../models/tagModel.js";
import Content from "../models/contentModel.js";
import { createError } from "../utils/httpErrors.js";
import { slugify } from "../utils/slugify.js";

const buildSlug = (name) => slugify(name || "");

export const createTag = async (payload, user) => {
    const name = payload?.name?.trim();
    if (!name) throw createError(400, "Tag name is required");

    const slug = buildSlug(name);
    const existing = await Tag.findOne({ slug });
    if (existing) throw createError(409, "Tag already exists");

    const tag = new Tag({
        name,
        slug,
        description: payload?.description || "",
        createdBy: user?._id
    });
    await tag.save();
    return tag;
};

export const listTags = async (query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 50), 1), 200);
    const filter = {};

    if (query.search) {
        filter.name = { $regex: query.search, $options: "i" };
    }

    const total = await Tag.countDocuments(filter);
    const items = await Tag.find(filter)
        .sort({ name: 1 })
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

export const updateTag = async (tagId, payload, user) => {
    const tag = await Tag.findById(tagId);
    if (!tag) throw createError(404, "Tag not found");

    if (payload?.name) {
        const name = payload.name.trim();
        const slug = buildSlug(name);
        const existing = await Tag.findOne({ slug, _id: { $ne: tagId } });
        if (existing) throw createError(409, "Tag already exists");
        tag.name = name;
        tag.slug = slug;
    }

    if (payload?.description !== undefined) {
        tag.description = payload.description;
    }

    tag.updatedBy = user?._id;
    await tag.save();
    return tag;
};

export const deleteTag = async (tagId) => {
    const tag = await Tag.findById(tagId);
    if (!tag) throw createError(404, "Tag not found");

    const inUse = await Content.exists({ tagRefs: tagId });
    if (inUse) throw createError(409, "Tag is in use");

    await tag.deleteOne();
    return { deleted: true };
};
