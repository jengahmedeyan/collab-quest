import { Id } from "@/generated/dataModel";
import { mutation, query } from "@/generated/server";
import { v } from "convex/values";
interface Template {
  _id: Id<"templates">;
  name: string;
  description?: string;
  files: {
    id: string;
    name: string;
    content: string;
    language: string;
  }[];
}

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.optional(v.string()),
    ownerId: v.string(),
  },
  
  handler: async (ctx, args) => {
    const newProjectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description || "",
      templateId: args.templateId,
      ownerId: args.ownerId
    });

    if (args.templateId) {
      const templateId = args.templateId as Id<"templates">;
      const template = await ctx.db.get(templateId) as Template;

      if (template && template.files) {
        const fileInserts: { 
          projectId: Id<"projects">; 
          name: string; 
          content?: string; 
          language: string; 
        }[] = template.files.map(file => ({
          projectId: newProjectId,
          name: file.name,
          content: file.content,
          language: file.language,
        }));

        await Promise.all(fileInserts.map(file => ctx.db.insert("files", file)));
      }
    }

    return { projectId: newProjectId };
  },
});


export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    files: v.array(v.object({
      id: v.string(),
      name: v.string(),
      content: v.string(),
      language: v.string(),
    })),
  },
  
  handler: async (ctx, args) => {
    const newTemplateId = await ctx.db.insert("templates", {
      name: args.name,
      description: args.description || "",
      files: args.files,
    });

    return { templateId: newTemplateId };
  },
});


export const getATemplate = query({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

export const listTemplates = query({
  handler: async (ctx) => {
    return await ctx.db.query("templates").collect();
  },
});

export const getAProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const listProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});
