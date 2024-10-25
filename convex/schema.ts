import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  codeSnippets: defineTable({
    content: v.string(),
    title: v.string(),
  }),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.optional(v.string()),
    ownerId: v.string()
  }),
  templates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    files: v.array(v.object({
      id: v.string(),
      name: v.string(),
      content: v.string(),
      language: v.string(),
    }))
  }),
  files: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    content: v.optional(v.string()),
    language: v.string(),
  }),
});
