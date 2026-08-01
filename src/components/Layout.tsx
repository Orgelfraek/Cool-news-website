import { Outlet, Link } from "react-router";
import { Moon, Sun, LogIn, LogOut, PenSquare } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/src/hooks/useAuth";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const { user, login, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            Daily Chronicle
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  Publish
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16 py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
        &copy; {new Date().getFullYear()} Daily Chronicle. All rights reserved.
      </footer>
    </div>
  );
}