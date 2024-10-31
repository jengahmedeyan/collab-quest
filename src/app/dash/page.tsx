'use client'

import React, { useState, useEffect } from 'react'
import {Plus, MoreHorizontal, FileIcon, PackageIcon, Pencil, Eye, Download, Trash,FilePlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Editor } from "@monaco-editor/react"
import { api } from "@/convex/_generated/api"
import { useMutation, useQuery} from "convex/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SignInButton, } from "@clerk/nextjs";
import { Unauthenticated } from "convex/react";
import debounce from 'lodash.debounce'



interface File {
  id: string
  name: string
  type: 'file' | 'package'
  content: string
  language: string
}

export default function Page() {
  const [files, setFiles] = useState<File[]>([
    { id: '1', name: 'main.py', type: 'file', content: 'print("Hello")', language: 'python' },
    { id: 'jd7epcqcvmb73w87f4pnha8dtn72wjxc', name: 'index.js', type: 'file', content: 'console.log("Hello")', language: 'javascript' },
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const updateCode = useMutation(api.functions.codes.updateCode);
  const fetchFileData = useQuery(api.functions.codes.getCode, {
    snippetId: selectedFile?.id || '',
  });
  


  const debouncedUpdateCode = debounce((newCode: string | unknown) => {
    if (selectedFile) {
      updateCode({
        newCode,
        snippetId: selectedFile.id
      })
    }
  }, 500);

  const handleEditorChange = (value: string | undefined) => {
    if (selectedFile && value !== undefined) {
      setFiles(files.map(f => f.id === selectedFile.id ? { ...f, content: value } : f));      
      debouncedUpdateCode(value);
    }
  };
  

  const handleFileAction = (action: string, file: File) => {
    switch (action) {
      case 'rename':
        const newName = prompt('Enter new name:', file.name)
        if (newName) {
          setFiles(files.map(f => f.id === file.id ? { ...f, name: newName } : f))
        }
        break
      case 'open':
        setSelectedFile(file);
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${file.name}?`)) {
          setFiles(files.filter(f => f.id !== file.id))
          if (selectedFile?.id === file.id) {
            setSelectedFile(null)
          }
        }
        break
    }
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (fetchFileData && selectedFile && fetchFileData.content) {
      setFiles((prevFiles) =>
        prevFiles.map(f =>
          f.id === selectedFile.id
            ? { ...f, content: fetchFileData.content }
            : f
        )
      );
    }
  }, [fetchFileData, selectedFile]);
  
  useEffect(() => {
    return () => {
      debouncedUpdateCode.cancel();
    };
  }, []);
  
  
  const fileContent = selectedFile?.content;
  

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
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

                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-1">
              {filteredFiles.map(file => (
                <DropdownMenu key={file.id}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center text-sm py-1 px-2 hover:bg-accent rounded cursor-pointer">
                      {file.type === 'file' ? (
                        <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                      ) : (
                        <PackageIcon className="h-4 w-4 mr-2 text-yellow-500" />
                      )}
                      <span>{file.name}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover text-popover-foreground w-56">
                    <div className="p-2">
                      <Input type="text" placeholder="Search actions" className="mb-2" />
                    </div>
                    <DropdownMenuItem onSelect={() => handleFileAction('rename', file)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleFileAction('open', file)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleFileAction('delete', file)} className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">

      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
        {/* Header */}
        <header className="border-b border-border p-2 flex items-center">
          <div className="flex-1 flex items-center space-x-2">
            {selectedFile && (
              <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
                {selectedFile.name}
              </div>
            )}
            <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </header>

        {/* Code editor area */}
        <div className="flex-1">
          {selectedFile ? (
            <Editor
              height="100%"
              defaultLanguage={selectedFile.language}
              language={selectedFile.language}
              theme="vs-light"
              value={fileContent}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on',
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
