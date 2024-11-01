import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const updatePresence = mutation({
  args: v.object({
    fileId: v.id("files"),
    cursor: v.object({
      line: v.number(),
      column: v.number(),
      selection: v.optional(v.object({
        startLine: v.number(),
        startColumn: v.number(),
        endLine: v.number(),
        endColumn: v.number(),
      })),
    }),
    name: v.string(),
    avatar: v.string(),
    userId: v.string(),
    lastSeen: v.number(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Find existing presence for this user in this file
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_file_user", (q) => 
        q.eq("fileId", args.fileId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      // Update existing presence
      await ctx.db.replace(existing._id, {
        fileId: args.fileId,
        userId: args.userId,
        name: args.name,
        avatar: args.avatar,
        cursor: args.cursor,
        lastSeen: args.lastSeen,
      });
    } else {
      // Insert new presence
      await ctx.db.insert("presence", {
        fileId: args.fileId,
        userId: args.userId,
        name: args.name,
        avatar: args.avatar,
        cursor: args.cursor,
        lastSeen: args.lastSeen,
      });
    }
  },
});