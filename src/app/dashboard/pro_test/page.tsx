"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useQuery(api.queries.getCurrentUserProjects);

  console.log(projects);

  // if (!projects) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and access your coding projects
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/pro_test/create")}
            className="flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>

        {projects?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  No projects yet
                </h2>
                <p className="text-gray-600 mb-4">
                  Create your first project to get started
                </p>
                <Button
                  onClick={() => router.push("/dashboard/pro_test/create")}
                  className="flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Project</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => router.push(`/dashboard/pro_test/${project._id}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {project.name}
                  </CardTitle>
                  <FolderOpen className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {project.description || "No description"}
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}