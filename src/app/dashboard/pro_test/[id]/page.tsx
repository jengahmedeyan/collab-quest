"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Editor, { useMonaco } from "@monaco-editor/react";
import { debounce } from "lodash";
import { type editor } from "monaco-editor";
import { Id } from "@/convex/_generated/dataModel";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as Id<"projects">;
  const { user } = useUser();
  const [selectedFileId, setSelectedFileId] = useState<Id<"files"> | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const monaco = useMonaco();
  
  // Fetch project and files with proper typing
  const project = useQuery(api.queries.getProject, { projectId });
  const files = useQuery(api.queries.getProjectFiles, { projectId });
  
  // Fetch file content when a file is selected
  const fileData = useQuery(
    api.queries.getFileContent,
    selectedFileId ? { fileId: selectedFileId } : "skip"
  );

  // Fetch real-time presence data
  const presence = useQuery(
    api.queries.getFilePresence,
    selectedFileId ? { fileId: selectedFileId } : "skip"
  );

  // Mutations
  const updateFileContent = useMutation(api.mutations.updateFileContent);
  const updatePresence = useMutation(api.presence.updatePresence);

  // Set initial selected file
  useEffect(() => {
    if (files?.length && !selectedFileId) {
      setSelectedFileId(files[0]._id);
    }
  }, [files, selectedFileId]);

  // Handle cursor decorations for other users
  useEffect(() => {
    if (!monaco || !editorRef.current || !presence || !user) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Clear previous decorations using tracked IDs
    if (decorationsRef.current.length > 0) {
      editor.removeDecorations(decorationsRef.current);
      decorationsRef.current = [];
    }

    // Add new decorations for each user's cursor
    const newDecorations = presence
      .filter(p => p.userId !== user.id)
      .map(p => ({
        range: new monaco.Range(
          p.cursor.line + 1,
          p.cursor.column + 1,
          p.cursor.line + 1,
          p.cursor.column + 1
        ),
        options: {
          className: 'cursor-decoration',
          hoverMessage: { value: p.name },
          beforeContentClassName: `cursor-${p.userId}`,
        }
      }));

    // Apply new decorations and store their IDs
    decorationsRef.current = editor.deltaDecorations([], newDecorations);
  }, [presence, monaco, user]);

  // Update presence on cursor movement
  const handleCursorChange = debounce(() => {
    if (!editorRef.current || !selectedFileId || !user) return;

    const position = editorRef.current.getPosition();
    const selection = editorRef.current.getSelection();

    if (position) {
      updatePresence({
        fileId: selectedFileId,  // This is now properly typed as Id<"files">
        cursor: {
          line: position.lineNumber - 1,
          column: position.column - 1,
          selection: selection ? {
            startLine: selection.startLineNumber - 1,
            startColumn: selection.startColumn - 1,
            endLine: selection.endLineNumber - 1,
            endColumn: selection.endColumn - 1,
          } : undefined,
        },
        name: user.fullName || user.username || "Anonymous",
        avatar: user.imageUrl,
        userId: user.id,
        lastSeen: Date.now(),
      });
    }
  }, 50);

  // Handle content changes
  const handleEditorChange = debounce((value: string | undefined) => {
    if (!value || !selectedFileId) return;
    
    const position = editorRef.current?.getPosition();
    const selection = editorRef.current?.getSelection();

    if (position) {
      updateFileContent({
        fileId: selectedFileId,
        content: value,
        cursorPosition: {
          line: position.lineNumber - 1,
          column: position.column - 1,
          selection: selection ? {
            startLine: selection.startLineNumber - 1,
            startColumn: selection.startColumn - 1,
            endLine: selection.endLineNumber - 1,
            endColumn: selection.endColumn - 1,
          } : undefined,
        },
      });
    }
  }, 300);

  // Loading states
  if (!files || !project) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }




  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none p-4 border-b">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        
        {/* File selector */}
        <div className="flex gap-2 mt-2 mb-4">
          {files.map(file => (
            <button
              key={file._id}
              onClick={() => setSelectedFileId(file._id)}
              className={`px-3 py-1 rounded ${
                selectedFileId === file._id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* Presence indicators */}
        <div className="flex gap-2">
          {presence?.filter((p, index, self) => 
            index === self.findIndex(t => t.userId === p.userId)
          ).map(p => (
            <div
              key={`presence-${p.userId}`}
              className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100"
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 relative">
        {selectedFileId ? (
          <Editor
            height="100%"
            language={fileData?.language ?? "javascript"}
            value={fileData?.content ?? ""}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
              editor.onDidChangeCursorPosition(handleCursorChange);
            }}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
            }}
            theme="vs-dark"
            loading={<div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a file to start editing
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .cursor-decoration {
          position: absolute;
          width: 2px !important;
          background: #007acc;
        }
        .cursor-decoration::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #007acc;
        }
        ${presence?.map(p => `
          .cursor-${p.userId} {
            background-color: ${getRandomColor(p.userId)};
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}

// Generate a consistent color for each user
function getRandomColor(seed: string) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
  ];
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return colors[Math.abs(hash) % colors.length];
}