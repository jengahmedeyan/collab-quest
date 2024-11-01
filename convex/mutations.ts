import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    template: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      template: args.template,
      ownerId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add owner as collaborator
    await ctx.db.insert("collaborators", {
      projectId,
      userId: identity.subject,
      role: "owner",
      email: identity.email!,
      inviteStatus: "accepted",
      invitedAt: Date.now(),
    });

    return projectId;
  },
});

export const inviteCollaborator = mutation({
  args: {
    projectId: v.id("projects"),
    email: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user has permission to invite
    const collaborator = await ctx.db
      .query("collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!collaborator || collaborator.role !== "owner") {
      throw new Error("Unauthorized to invite collaborators");
    }

    // Check if invitation already exists
    const existingInvite = await ctx.db
      .query("collaborators")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .unique();

    if (existingInvite) {
      throw new Error("Collaborator already invited");
    }

    const inviteId = await ctx.db.insert("collaborators", {
      projectId: args.projectId,
      userId: "",
      email: args.email,
      role: args.role,
      inviteStatus: "pending",
      invitedAt: Date.now(),
    });

    // TODO: Integrate with Resend to send invitation email
    
    return inviteId;
  },
});

export const createFile = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    content: v.optional(v.string()),
    path: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user has permission to create files in this project
    const collaborator = await ctx.db
      .query("collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!collaborator || collaborator.role === "viewer") {
      throw new Error("Unauthorized to create files in this project");
    }

    // Check if file with same name already exists in the project
    const existingFile = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => 
        q.eq(q.field("name"), args.name) && 
        q.eq(q.field("path"), args.path ?? "/")
      )
      .unique();

    if (existingFile) {
      throw new Error("File with this name already exists in this location");
    }

    // Create the file
    const fileId = await ctx.db.insert("files", {
      projectId: args.projectId,
      name: args.name,
      content: args.content ?? "",
      path: args.path ?? "/",
      language: args.language ?? inferLanguageFromFileName(args.name),
      createdBy: identity.subject,
      lastEditedBy: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Initialize cursor position for the creator
    await ctx.db.insert("cursors", {
      fileId,
      userId: identity.subject,
      position: {
        line: 0,
        column: 0,
      },
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
    cursorPosition: v.object({
      line: v.number(),
      column: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Update file content
    await ctx.db.patch(args.fileId, {
      content: args.content,
      lastEditedBy: identity.subject,
      updatedAt: Date.now(),
    });

    // Update cursor position
    await ctx.db.insert("cursors", {
      fileId: args.fileId,
      userId: identity.subject,
      position: args.cursorPosition,
      updatedAt: Date.now(),
    });
  },
});


function inferLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'java': 'java',
    'go': 'go',
    'rust': 'rust',
    'sql': 'sql',
  };

  return languageMap[extension ?? ''] ?? 'plaintext';
}


export const updateFileContent = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
    cursorPosition: v.object({
      line: v.number(),
      column: v.number(),
      selection: v.optional(v.object({
        startLine: v.number(),
        startColumn: v.number(),
        endLine: v.number(),
        endColumn: v.number(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // Update file content
    await ctx.db.patch(args.fileId, {
      content: args.content,
      lastEditedBy: identity.subject,
      updatedAt: Date.now(),
    });

    // Update presence
    await ctx.db.insert("presence", {
      fileId: args.fileId,
      userId: identity.subject,
      name: identity.name ?? "Anonymous",
      avatar: identity.pictureUrl ?? "",
      cursor: args.cursorPosition,
      lastSeen: Date.now(),
    });
  },
});