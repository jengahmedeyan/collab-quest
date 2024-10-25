import { ModeToggle } from "./toggleTheme";

export default function Page() {
  return(
    <div className="border-b">
    <div className="flex h-8 items-center px-4">
      <div className="ml-auto flex items-center space-x-4">
        <ModeToggle/>
      </div>
    </div>
  </div>
  )
}