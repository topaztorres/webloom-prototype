import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus, Compass, BookOpen } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Submit from "@/pages/submit";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      data-testid="button-theme-toggle"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function Header() {
  const [location, setLocation] = useLocation();
  const openIndex = () => {
    if (location !== "/") {
      setLocation("/");
    }
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("webloom:open-index"));
    }, 50);
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          data-testid="link-home"
          className="flex items-center hover-elevate -ml-2 rounded-md px-2 py-1"
        >
          <Logo />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Primary">
          <Link
            href="/"
            data-testid="link-nav-discover"
            className={`rounded-md px-3 py-1.5 text-sm font-medium hover-elevate ${
              location === "/" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Compass className="mr-1.5 inline size-3.5 -mt-0.5" />
            Discover
          </Link>
          <Link
            href="/submit"
            data-testid="link-nav-submit"
            className={`rounded-md px-3 py-1.5 text-sm font-medium hover-elevate ${
              location === "/submit" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Plus className="mr-1.5 inline size-3.5 -mt-0.5" />
            Add a thread
          </Link>
          <button
            type="button"
            data-testid="button-nav-index"
            onClick={openIndex}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover-elevate"
          >
            <BookOpen className="mr-1.5 inline size-3.5 -mt-0.5" />
            Index
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/submit"
            data-testid="button-header-submit"
            className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover-elevate sm:inline-flex"
          >
            <Plus className="size-3.5" />
            Add thread
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="font-mono text-xs text-muted-foreground">
            Built for following strange, useful, beautiful threads across the web.
          </p>
        </div>
      </div>
    </footer>
  );
}

function AppRouter() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="relative z-10 flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/submit" component={Submit} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
