"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  EllipsisVertical,
  FileIcon,
  PackageIcon,
  Pencil,
  Eye,
  Download,
  Trash,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Editor } from "@monaco-editor/react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams } from "next/navigation";
import debounce from 'lodash.debounce';

interface File {
  _id: string;
  name: string;
  type: "file" | "package";
  content: string;
  language: string;
}

export default function Page() {
  const { id } = useParams();

  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const updateCode = useMutation(api.functions.file.updateFile);

  const fetchFileData = useQuery(api.functions.file.getFile, {
      fileId: selectedFile?._id
  });
  const fetchedFiles = useQuery(api.functions.file.listFilesForProject, { projectId: id });

  useEffect(() => {
    if (fetchedFiles && Array.isArray(fetchedFiles)) {
      setFiles(fetchedFiles);
    }
  }, [fetchedFiles]);

  const debouncedSave = debounce((fileId: string, newContent: string) => {
    updateCode({ fileId, newContent });
  }, 500);

  const handleEditorChange = (value: string | undefined) => {
    if (selectedFile && value !== undefined) {
      setSelectedFile({ ...selectedFile, content: value });
      debouncedSave(selectedFile._id, value);
    }
  };

  const debouncedUpdateCode = debounce((newCode: string | unknown) => {
    if (selectedFile) {
      updateCode({
        fileId: selectedFile._id,
        newContent: newCode,
      });
    }
  }, 500);
  
  const handleFileAction = (action: string, file: File) => {
    switch (action) {
      case "rename":
        const newName = prompt("Enter new name:", file.name);
        if (newName) {
          setFiles(
            files.map((f) => (f._id === file._id ? { ...f, name: newName } : f))
          );
        }
        break;
      case "open":
        setSelectedFile(file);
        break;
      case "delete":
        if (confirm(`Are you sure you want to delete ${file.name}?`)) {
          setFiles(files.filter((f) => f._id !== file._id));
          if (selectedFile?._id === file._id) {
            setSelectedFile(null);
          }
        }
        break;
    }
  };

  const filteredFiles = (files || []).filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-4">
          <Input
            type="text"
            placeholder="Search"
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Files</span>
              <div className="flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <FilePlus className="h-4 w-4" />
                        <span className="sr-only">New File</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New File</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between text-sm py-1 px-2 hover:bg-accent rounded cursor-pointer"
                >
                  <div
                    className="flex items-center flex-1"
                    onClick={() => handleFileAction("open", file)}
                  >
                    {file.type === "file" ? (
                      <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                    ) : (
                      <PackageIcon className="h-4 w-4 mr-2 text-yellow-500" />
                    )}
                    <span>{file.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="group relative inline-flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem
                        onSelect={() => handleFileAction("rename", file)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleFileAction("open", file)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleFileAction("delete", file)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border p-2 flex items-center">
          <div className="flex-1 flex items-center space-x-2">
            {selectedFile && (
              <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                {selectedFile.name}
              </div>
            )}
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          {selectedFile ? (
            <Editor
              height="100%"
              language={selectedFile.language}
              value={selectedFile.content}
              onChange={handleEditorChange}
              options={{
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a file to edit
            </div>
          )}
        </main>
      </div>
    </div>
  );
}