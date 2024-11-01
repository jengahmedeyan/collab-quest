// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    template: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .searchIndex("search_projects", {
      searchField: "name",
      filterFields: ["ownerId"],
    }),
    // Add this to your schema:
 templateFiles: defineTable({
  name: v.string(),
  content: v.string(),
  language: v.string(),
  templateId: v.string(),
}),

templates: defineTable({
  id: v.string(),
  name: v.string(),
  description: v.string(),
}),
presence: defineTable({
  fileId: v.id("files"),
  userId: v.string(),
  name: v.string(),
  avatar: v.string(),
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
  lastSeen: v.number(),
})
  .index("by_file", ["fileId"]) 
  .index("by_file_user", ["fileId", "userId"]),


    files: defineTable({
      projectId: v.id("projects"),
      name: v.string(),
      content: v.string(),
      path: v.string(),
      language: v.string(),
      createdBy: v.string(),
      lastEditedBy: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_project", ["projectId"]),

  collaborators: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    email: v.string(),
    inviteStatus: v.union(v.literal("pending"), v.literal("accepted")),
    invitedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  cursors: defineTable({
    fileId: v.id("files"),
    userId: v.string(),
    position: v.object({
      line: v.number(),
      column: v.number(),
    }),
    updatedAt: v.number(),
  })
    .index("by_file", ["fileId"])
    .index("by_user", ["userId"]),
});