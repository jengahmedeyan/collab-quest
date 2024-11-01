// app/projects/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateProject() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get templates from the database
  const templates = useQuery(api.templates.getTemplates) ?? [];
  const createProjectFromTemplate = useMutation(api.templates.createProjectFromTemplate);
  const initializeTemplates = useMutation(api.templates.initializeTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<unknown>(null);

  // Initialize templates when component mounts
  useEffect(() => {
    initializeTemplates();
  }, [initializeTemplates]);

  // Set initial selected template when templates load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create the project using the template
      const projectId = await createProjectFromTemplate({
        name,
        description,
        templateId: selectedTemplate.id,
      });

      // Redirect to the new project
      router.push(`/dashboard/pro_test/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setIsLoading(false);
    }
  };

  if (!templates.length || !selectedTemplate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Start a new coding project with optional templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your project"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Select Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        selectedTemplate?.id === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                      {template.files?.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {template.files.length} file(s) included
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/projects")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}