import { mutation, query } from "@/generated/server";
import { v } from "convex/values";

export const getFile = query({
  args: {
    fileId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    if (!args.fileId) {
      return null;
    }
    try {
      return await ctx.db.get(args.fileId);
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  },
});

export const updateFile = mutation({
  args: { fileId: v.id("files"), newContent: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, { content: args.newContent });
    return { success: true };
  },
});

export const createFile = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    content: v.optional(v.string()),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const newFileId = await ctx.db.insert("files", {
      projectId: args.projectId,
      name: args.name,
      content: args.content || "",
      language: args.language,
    });

    return { fileId: newFileId };
  },
});

export const listFilesForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});
