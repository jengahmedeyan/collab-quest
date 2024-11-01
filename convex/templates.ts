
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const templates = [
  {
    id: "blank",
    name: "Blank Project",
    description: "Start with an empty project",
    files: [],
  },
  {
    id: "html",
    name: "HTML/CSS/JS",
    description: "Basic web project setup",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to My Project</h1>
    <script src="script.js"></script>
</body>
</html>`,
        language: "html"
      },
      {
        name: "styles.css",
        content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    line-height: 1.6;
}

h1 {
    color: #333;
}`,
        language: "css"
      },
      {
        name: "script.js",
        content: `// Your JavaScript code here
console.log('Hello, World!');`,
        language: "javascript"
      }
    ],
  },
  {
    id: "react",
    name: "React Component",
    description: "Basic React component setup",
    files: [
      {
        name: "App.tsx",
        content: `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>React Counter</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default App;`,
        language: "typescript"
      },
      {
        name: "App.css",
        content: `.App {
  text-align: center;
  padding: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}`,
        language: "css"
      }
    ],
  }
];

// Function to initialize templates in the database
export const initializeTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Insert templates
    for (const template of templates) {
      // Check if template already exists
      const existing = await ctx.db
        .query("templates")
        .filter((q) => q.eq(q.field("id"), template.id))
        .unique();

      if (!existing) {
        // Insert template
        await ctx.db.insert("templates", {
          id: template.id,
          name: template.name,
          description: template.description,
        });

        // Insert template files
        for (const file of template.files) {
          await ctx.db.insert("templateFiles", {
            name: file.name,
            content: file.content,
            language: file.language,
            templateId: template.id,
          });
        }
      }
    }
  },
});

// Query to get all templates
export const getTemplates = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db.query("templates").collect();
    const templatesWithFiles = await Promise.all(
      templates.map(async (template) => {
        const files = await ctx.db
          .query("templateFiles")
          .filter((q) => q.eq(q.field("templateId"), template.id))
          .collect();
        return {
          ...template,
          files,
        };
      })
    );
    return templatesWithFiles;
  },
});

// Mutation to create a project from a template
export const createProjectFromTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      template: args.templateId,
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

    // Get template files
    const templateFiles = await ctx.db
      .query("templateFiles")
      .filter((q) => q.eq(q.field("templateId"), args.templateId))
      .collect();

    // Create files from template
    for (const file of templateFiles) {
      await ctx.db.insert("files", {
        projectId,
        name: file.name,
        content: file.content,
        path: "/",
        language: file.language,
        createdBy: identity.subject,
        lastEditedBy: identity.subject,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return projectId;
  },
});