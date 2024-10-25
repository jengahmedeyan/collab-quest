export interface File {
  type: 'file';
  name: string;
  path: string;
}

export interface Folder {
  type: 'folder';
  name: string;
  path: string;
  isOpen: boolean;
  children: Array<File | Folder>;
}

export type FileSystemNode = File | Folder;
