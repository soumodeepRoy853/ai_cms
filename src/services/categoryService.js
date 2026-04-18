import Category from "../models/categoryModel.js";
import Content from "../models/contentModel.js";
import { createError } from "../utils/httpErrors.js";
import { slugify } from "../utils/slugify.js";

const buildSlug = (name) => slugify(name || "");

export const createCategory = async (payload, user) => {
    const name = payload?.name?.trim();
    if (!name) throw createError(400, "Category name is required");

    const slug = buildSlug(name);
    const existing = await Category.findOne({ slug });
    if (existing) throw createError(409, "Category already exists");

    const category = new Category({
        name,
        slug,
        description: payload?.description || "",
        createdBy: user?._id
    });
    await category.save();
    return category;
};

export const listCategories = async (query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    const filter = {};

    if (query.search) {
        filter.name = { $regex: query.search, $options: "i" };
    }

    const total = await Category.countDocuments(filter);
    const items = await Category.find(filter)
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

export const updateCategory = async (categoryId, payload, user) => {
    const category = await Category.findById(categoryId);
    if (!category) throw createError(404, "Category not found");

    if (payload?.name) {
        const name = payload.name.trim();
        const slug = buildSlug(name);
        const existing = await Category.findOne({ slug, _id: { $ne: categoryId } });
        if (existing) throw createError(409, "Category already exists");
        category.name = name;
        category.slug = slug;
    }

    if (payload?.description !== undefined) {
        category.description = payload.description;
    }

    category.updatedBy = user?._id;
    await category.save();
    return category;
};

export const deleteCategory = async (categoryId) => {
    const category = await Category.findById(categoryId);
    if (!category) throw createError(404, "Category not found");

    const inUse = await Content.exists({ categoryRef: categoryId });
    if (inUse) throw createError(409, "Category is in use");

    await category.deleteOne();
    return { deleted: true };
};
