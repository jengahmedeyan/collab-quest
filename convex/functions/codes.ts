import { mutation, query } from "@/generated/server";
import { v } from "convex/values";

export const getCode = query({
  args: { snippetId: v.string() },

  handler: async (ctx, args) => {
    const codeSnippet = await ctx.db
      .query("codeSnippets")
      .filter((q) => q.eq(q.field("_id"), args.snippetId))
      .first();

    return codeSnippet;
  },
});

export const updateCode = mutation({
  args: { snippetId: v.id("codeSnippets"), newCode: v.string() },
  handler: async (ctx, args) => {
    await ctx.db
      .patch(args.snippetId, { content: args.newCode });
    
    return { success: true };
  },
});


export const createCodeSnippet = mutation({
  args: { title: v.string(), initialCode: v.optional(v.string()) },

  handler: async (ctx, args) => {
    const newSnippetId = await ctx.db.insert("codeSnippets", {
      title: args.title,
      content: args.initialCode || ""
    });

    return { snippetId: newSnippetId };
  },
});


