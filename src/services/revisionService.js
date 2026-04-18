import ContentRevision from "../models/contentRevisionModel.js";
import { getContentById } from "../services/contentService.js";

export const listRevisions = async (contentId, user) => {
    await getContentById(contentId, user);

    return ContentRevision.find({ content: contentId })
        .sort({ version: -1 });
};

export const getRevisionById = async (revisionId, user) => {
    const revision = await ContentRevision.findById(revisionId);
    if (!revision) return null;

    await getContentById(revision.content, user);
    return revision;
};
