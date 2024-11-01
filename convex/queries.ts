// queries.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log(identity)
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has access to project
    const collaborator = await ctx.db
      .query("collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!collaborator) {
      throw new Error("Unauthorized to view project");
    }

    return {
      ...project,
      role: collaborator.role,
    };
  },
});

export const getProjectFiles = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return files;
  },
});

export const getFilePresence = query({
  args: v.object({
    fileId: v.id("files"),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const staleThreshold = 30000; // 30 seconds

    return await ctx.db
      .query("presence")
      .withIndex("by_file_user", (q) => q.eq("fileId", args.fileId))
      .filter((q) => q.gt(q.field("lastSeen"), now - staleThreshold))
      .collect();
  },
});

export const getCurrentUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get all collaborator records for the current user
    const collaborations = await ctx.db
      .query("collaborators")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Get all project IDs from collaborations
    const projectIds = collaborations.map((collab) => collab.projectId);

    // If user has no projects, return empty array
    if (projectIds.length === 0) {
      return [];
    }

    // Fetch all projects the user has access to
    const projects = await Promise.all(
      projectIds.map(async (projectId) => {
        const project = await ctx.db.get(projectId);
        if (!project) return null;

        // Find the user's role for this project
        const collaboration = collaborations.find(
          (c) => c.projectId === projectId
        );

        return {
          ...project,
          role: collaboration?.role,
        };
      })
    );

    // Filter out any null values from deleted projects
    return projects.filter((project): project is NonNullable<typeof project> => 
      project !== null
    );
  },
});


export const getFileContent = query({
  args: {
    fileId: v.id("files")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // Check project access
    const collaborator = await ctx.db
      .query("collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", file.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!collaborator) throw new Error("Unauthorized to view file");

    return {
      content: file.content,
      language: file.language,
      lastEditedBy: file.lastEditedBy,
      updatedAt: file.updatedAt
    };
  }
});

export const getFileCursors = query({
  args: v.object({
    fileId: v.id("files")
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // Check project access
    const collaborator = await ctx.db
      .query("collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", file.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!collaborator) throw new Error("Unauthorized to view cursors");

    const now = Date.now();
    const staleThreshold = 3000;

    const cursors = await ctx.db
      .query("presence")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .filter((q) => q.gt(q.field("lastSeen"), now - staleThreshold))
      .collect();

    return cursors;
  }
});
