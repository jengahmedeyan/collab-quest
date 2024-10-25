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
    // Step 1: Insert the new project into the projects table
    const newProjectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description || "",
      templateId: args.templateId,
      ownerId: args.ownerId
    });

    // Step 2: Check if templateId is provided
    if (args.templateId) {
      // Step 3: Fetch the template and assert its type
      const templateId = args.templateId as Id<"templates">; // Cast to Id<"templates">
      const template = await ctx.db.get(templateId) as Template;

      // Step 4: Insert files from the template into the project_files table
      if (template && template.files) {
        // Create an array of file objects with the necessary fields
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

