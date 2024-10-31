import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  codeSnippets: defineTable({
    content: v.string(),
    title: v.string(),
  }),
  files: defineTable({
    content: v.string(),
    language: v.string(),
    name: v.string(),
    projectId: v.id("projects"),
  }),
  projects: defineTable({
    description: v.string(),
    name: v.string(),
    ownerId: v.string(),
    templateId: v.id("templates"),
  }),
  templates: defineTable({
    description: v.string(),
    files: v.array(
      v.object({
        content: v.string(),
        id: v.string(),
        language: v.string(),
        name: v.string(),
      })
    ),
    name: v.string(),
  }),
});