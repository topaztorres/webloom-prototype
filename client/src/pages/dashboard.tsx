import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SiteWithTags } from "@shared/schema";
import { CATEGORIES } from "@shared/schema";
import {
  Sparkles,
  ExternalLink,
  Globe,
  Users,
  Layers,
  Eye,
  Compass,
  Loader2,
  ArrowRight,
  BookOpen,
  BarChart3,
  ChevronDown,
  Network,
  Table2,
} from "lucide-react";

type Stats = {
  total: number;
  totalVisits: number;
  contributors: number;
  categories: { name: string; count: number }[];
};

function formatHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function relTime(ms: number) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lastOpenedId, setLastOpenedId] = useState<number | undefined>();
  const [showShelf, setShowShelf] = useState(false);
  const [showFieldNotes, setShowFieldNotes] = useState(false);
  const [indexView, setIndexView] = useState<"map" | "database">("map");
  const shelfRef = useRef<HTMLElement | null>(null);

  const sitesQuery = useQuery<SiteWithTags[]>({
    queryKey: ["/api/sites"],
  });
  const statsQuery = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const visit = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/sites/${id}/visit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const surprise = useMutation({
    mutationFn: async () => {
      const params = lastOpenedId ? `?exclude=${lastOpenedId}` : "";
      const res = await apiRequest("GET", `/api/sites/random${params}`);
      return (await res.json()) as SiteWithTags;
    },
    onSuccess: (site) => {
      const win = window.open(site.url, "_blank", "noopener,noreferrer");
      if (!win) {
        toast({
          title: "Pop-up blocked",
          description: `Allow pop-ups, or open it manually: ${site.url}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: `Off to: ${site.title}`,
          description: formatHost(site.url),
        });
      }
      setLastOpenedId(site.id);
      visit.mutate(site.id);
    },
    onError: () => {
      toast({
        title: "Nothing to wander to",
        description: "Add a site to get the carousel spinning.",
        variant: "destructive",
      });
    },
  });

  const filtered = useMemo(() => {
    if (!sitesQuery.data) return [];
    if (activeCategory === "All") return sitesQuery.data;
    return sitesQuery.data.filter((s) => s.category === activeCategory);
  }, [sitesQuery.data, activeCategory]);

  const categoryCounts = useMemo(() => {
    return CATEGORIES.map((name) => ({
      name,
      count: statsQuery.data?.categories.find((x) => x.name === name)?.count ?? 0,
    }));
  }, [statsQuery.data]);

  const recent = useMemo(() => {
    if (!sitesQuery.data) return [];
    return [...sitesQuery.data]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [sitesQuery.data]);

  const topContributors = useMemo(() => {
    if (!sitesQuery.data) return [];
    const counts = new Map<string, number>();
    sitesQuery.data.forEach((s) => {
      counts.set(s.submittedBy, (counts.get(s.submittedBy) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [sitesQuery.data]);

  const isLoading = sitesQuery.isLoading || statsQuery.isLoading;

  useEffect(() => {
    const openIndex = () => {
      setShowShelf(true);
      window.setTimeout(() => {
        shelfRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    };
    window.addEventListener("webloom:open-index", openIndex);
    return () => window.removeEventListener("webloom:open-index", openIndex);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-card-border bg-card px-6 py-8 text-center sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 size-96 -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--primary) / 0.30), transparent 68%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/2 size-80 -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--accent) / 0.20), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl">
          <div className="mx-auto mb-7 flex size-44 items-center justify-center rounded-full border border-border bg-background/35 shadow-2xl sm:size-56">
            <div className="relative flex size-28 items-center justify-center rounded-full border border-accent/60 bg-card/70 sm:size-36">
              <div className="absolute inset-5 rounded-full border border-dashed border-accent/45" />
              <div className="absolute inset-10 rounded-full border border-primary/50" />
              <Sparkles className="relative size-9 text-accent sm:size-11" />
            </div>
          </div>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              A portal to the open web
            </div>
            <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-[3.35rem]">
              Pull one{" "}
              <span className="text-accent">thread</span>
              {" "}and see where the web blooms.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
              One focused button for human-submitted places worth wandering into.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                data-testid="button-surprise-me"
                disabled={surprise.isPending || isLoading || (sitesQuery.data?.length ?? 0) === 0}
                onClick={() => surprise.mutate()}
                className="glow-action h-16 gap-3 rounded-2xl px-9 text-base font-semibold"
              >
                {surprise.isPending ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Wandering...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Pull a thread
                    <span className="ml-1 hidden font-mono text-xs font-normal opacity-80 sm:inline">
                      [ space ]
                    </span>
                  </>
                )}
              </Button>
              <Link
                href="/submit"
                data-testid="button-hero-submit"
                className="inline-flex h-16 items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-7 text-base font-medium text-foreground hover-elevate"
              >
                Add a thread
                <ArrowRight className="size-4" />
              </Link>
            </div>
            {lastOpenedId && (
              <p
                className="mt-4 font-mono text-xs text-muted-foreground"
                data-testid="text-last-opened"
              >
                last stop:{" "}
                {sitesQuery.data?.find((s) => s.id === lastOpenedId)?.title}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              data-testid="button-toggle-field-notes"
              onClick={() => setShowFieldNotes((v) => !v)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/55 px-4 py-2 text-sm font-medium text-foreground hover-elevate"
            >
              <BarChart3 className="size-4 text-accent" />
              Field notes
              <span className="font-mono text-xs text-muted-foreground">
                {statsQuery.data?.total ?? "—"} threads
              </span>
              <ChevronDown className={`size-4 transition-transform ${showFieldNotes ? "rotate-180" : ""}`} />
            </button>
            <button
              type="button"
              data-testid="button-toggle-index"
              onClick={() => {
                setShowShelf((v) => !v);
                if (!showShelf) {
                  window.setTimeout(() => {
                    shelfRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/55 px-4 py-2 text-sm font-medium text-foreground hover-elevate"
            >
              <BookOpen className="size-4 text-accent" />
              {showShelf ? "Hide index" : "Open the index"}
              <ChevronDown className={`size-4 transition-transform ${showShelf ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Stats panel — expandable */}
          {showFieldNotes && (
          <div className="relative mx-auto mt-5 max-w-2xl text-left">
            <div className="postcard p-5 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Field notes
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  live
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCell
                  icon={<Globe className="size-4" />}
                  label="Sites in the pool"
                  value={statsQuery.data?.total}
                  testid="stat-total"
                />
                <StatCell
                  icon={<Eye className="size-4" />}
                  label="Total visits"
                  value={statsQuery.data?.totalVisits}
                  testid="stat-visits"
                />
                <StatCell
                  icon={<Users className="size-4" />}
                  label="Contributors"
                  value={statsQuery.data?.contributors}
                  testid="stat-contributors"
                />
                <StatCell
                  icon={<Layers className="size-4" />}
                  label="Categories"
                  value={statsQuery.data?.categories.length}
                  testid="stat-categories"
                />
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section ref={shelfRef} className="mt-8 scroll-mt-20">
        <button
          type="button"
          data-testid="button-shelf-dropdown"
          onClick={() => setShowShelf((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-card-border bg-card p-5 text-left hover-elevate"
        >
          <span>
            <span className="block font-display text-xl font-bold tracking-tight">
              Webloom Index
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Browse categories, recent additions, contributors, and the full shelf.
            </span>
          </span>
          <span className="ml-4 inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            {filtered.length} site{filtered.length === 1 ? "" : "s"}
            <ChevronDown className={`size-4 transition-transform ${showShelf ? "rotate-180" : ""}`} />
          </span>
        </button>

        {showShelf && (
        <div className="mt-6">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-card-border bg-card/65 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Choose how to explore
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the map for a visual wander, or switch to database view for the full shelf.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-border bg-background/60 p-1">
            <button
              type="button"
              data-testid="button-index-map-view"
              onClick={() => setIndexView("map")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                indexView === "map"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="size-4" />
              Thread map
            </button>
            <button
              type="button"
              data-testid="button-index-database-view"
              onClick={() => setIndexView("database")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                indexView === "database"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table2 className="size-4" />
              Database
            </button>
          </div>
        </div>

        {indexView === "map" ? (
          <ThreadMap
            categories={categoryCounts}
            recent={recent}
            isLoading={isLoading}
            onPull={() => surprise.mutate()}
            pulling={surprise.isPending}
            onCategory={(category) => {
              setActiveCategory(category);
              setIndexView("database");
            }}
            onVisit={(site) => {
              window.open(site.url, "_blank", "noopener,noreferrer");
              visit.mutate(site.id);
            }}
          />
        ) : (
        <>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Browse the shelf
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter by neighborhood of the web.
            </p>
          </div>
          <div className="hidden font-mono text-xs text-muted-foreground sm:block">
            {filtered.length} site{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        <div
          className="-mx-1 flex flex-wrap gap-2 px-1"
          role="tablist"
          aria-label="Categories"
        >
          <CategoryChip
            label="All"
            count={sitesQuery.data?.length}
            active={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
          />
          {CATEGORIES.map((c) => {
            const count = statsQuery.data?.categories.find((x) => x.name === c)?.count ?? 0;
            return (
              <CategoryChip
                key={c}
                label={c}
                count={count}
                active={activeCategory === c}
                onClick={() => setActiveCategory(c)}
              />
            );
          })}
        </div>
        </>
        )}
        </div>
        )}
      </section>

      {/* MAIN GRID + ACTIVITY */}
      {showShelf && indexView === "database" && (
      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SiteCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState category={activeCategory} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((s) => (
                <SiteCard
                  key={s.id}
                  site={s}
                  onVisit={() => {
                    window.open(s.url, "_blank", "noopener,noreferrer");
                    visit.mutate(s.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR: Recent + Contributors */}
        <aside className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
              <Compass className="size-4 text-accent" />
              Just added
            </h3>
            <div className="route-dash mb-3" />
            {sitesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <ul className="space-y-3" data-testid="list-recent">
                {recent.map((s) => (
                  <li key={s.id} className="text-sm">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => visit.mutate(s.id)}
                      className="block rounded-md hover-elevate -m-1 p-1"
                      data-testid={`link-recent-${s.id}`}
                    >
                      <div className="line-clamp-1 font-medium text-foreground">
                        {s.title}
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground">
                        <span className="truncate">{formatHost(s.url)}</span>
                        <span className="shrink-0">{relTime(s.createdAt)}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
              <Users className="size-4 text-accent" />
              Wanderers
            </h3>
            <div className="route-dash mb-3" />
            {topContributors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Be the first.</p>
            ) : (
              <ul className="space-y-2" data-testid="list-contributors">
                {topContributors.map(([name, count]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between text-sm"
                    data-testid={`contributor-${name}`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={name} />
                      <span className="font-medium">{name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {count} site{count === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </section>
      )}
    </div>
  );
}

/* -------------- subcomponents -------------- */

function ThreadMap({
  categories,
  recent,
  isLoading,
  pulling,
  onPull,
  onCategory,
  onVisit,
}: {
  categories: { name: string; count: number }[];
  recent: SiteWithTags[];
  isLoading: boolean;
  pulling: boolean;
  onPull: () => void;
  onCategory: (category: string) => void;
  onVisit: (site: SiteWithTags) => void;
}) {
  const positions = [
    "left-[7%] top-[14%]",
    "right-[7%] top-[16%]",
    "left-[4%] top-[48%]",
    "right-[4%] top-[50%]",
    "left-[15%] bottom-[12%]",
    "right-[15%] bottom-[12%]",
    "left-[36%] top-[7%]",
    "right-[35%] bottom-[6%]",
    "left-[40%] top-[43%]",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div
        className="relative min-h-[520px] overflow-hidden rounded-3xl border border-card-border bg-card p-5"
        data-testid="panel-thread-map"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 48%, hsl(var(--primary) / 0.22), transparent 34%), repeating-linear-gradient(0deg, hsl(var(--foreground) / 0.035) 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, hsl(var(--foreground) / 0.035) 0 1px, transparent 1px 26px)",
          }}
        />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] bg-gradient-to-r from-transparent via-accent/55 to-transparent" />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-px w-[76%] -translate-x-1/2 -translate-y-1/2 rotate-[82deg] bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 -translate-y-1/2 rotate-[142deg] bg-gradient-to-r from-transparent via-accent/45 to-transparent" />

        <div className="relative z-10 mb-4 max-w-md">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Network className="size-3 text-accent" />
            Visual index
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight">
            Explore by constellation.
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Each node is a neighborhood of the shared web. Pick one to open its shelf.
          </p>
        </div>

        <div className="absolute left-1/2 top-1/2 z-20 flex size-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 shadow-2xl">
          <div className="absolute inset-5 rounded-full border border-dashed border-accent/50" />
          <Button
            type="button"
            data-testid="button-map-pull-thread"
            disabled={pulling || isLoading}
            onClick={onPull}
            className="glow-action relative h-14 rounded-2xl px-5 text-sm font-semibold"
          >
            {pulling ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Pulling
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Pull thread
              </>
            )}
          </Button>
        </div>

        {categories.map((category, index) => (
          <button
            key={category.name}
            type="button"
            data-testid={`button-map-category-${category.name}`}
            onClick={() => onCategory(category.name)}
            className={`absolute z-10 min-w-[104px] rounded-full border border-border bg-background/75 px-3 py-2 text-left shadow-md backdrop-blur transition-transform hover:scale-105 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${positions[index % positions.length]}`}
          >
            <span className="block text-xs font-semibold text-foreground">
              {category.name}
            </span>
            <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
              {category.count} thread{category.count === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>

      <aside className="space-y-4">
        <Card className="p-5">
          <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold">
            <Compass className="size-4 text-accent" />
            Recent threads
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            A few fresh paths from the shared web.
          </p>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No threads yet.</p>
          ) : (
            <ul className="space-y-3" data-testid="list-map-recent">
              {recent.slice(0, 4).map((site) => (
                <li key={site.id}>
                  <button
                    type="button"
                    onClick={() => onVisit(site)}
                    className="block w-full rounded-lg p-2 text-left hover-elevate"
                    data-testid={`button-map-recent-${site.id}`}
                  >
                    <span className="line-clamp-1 text-sm font-medium text-foreground">
                      {site.title}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground">
                      <span className="truncate">{formatHost(site.url)}</span>
                      <span>{site.category}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-bold">Want the full list?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch to Database for sortable-feeling cards, tags, contributors, and visit counts.
          </p>
          <div className="route-dash my-4" />
          <p className="font-mono text-xs text-muted-foreground">
            Map mode is for choosing a path. Database mode is for inspecting the shelf.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  testid,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  testid: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-display text-2xl font-semibold tabular-nums" data-testid={testid}>
        {value === undefined ? <Skeleton className="h-7 w-12" /> : value.toLocaleString()}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      data-testid={`chip-category-${label}`}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover-elevate ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground"
      }`}
    >
      <span className="font-medium">{label}</span>
      {typeof count === "number" && (
        <span
          className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
            active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SiteCard({
  site,
  onVisit,
}: {
  site: SiteWithTags;
  onVisit: () => void;
}) {
  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-card-border bg-card p-5 transition-shadow hover:shadow-md"
      data-testid={`card-site-${site.id}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge variant="outline" className="font-mono text-[10px]" data-testid={`badge-category-${site.id}`}>
          {site.category}
        </Badge>
        <span className="font-mono text-[10px] text-muted-foreground">
          {relTime(site.createdAt)}
        </span>
      </div>

      <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onVisit}
          className="hover:text-accent focus-visible:text-accent focus:outline-none"
          data-testid={`link-site-title-${site.id}`}
        >
          {site.title}
        </a>
      </h3>

      <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
        {site.description || "No description provided."}
      </p>

      {site.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {site.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar name={site.submittedBy} small />
          <span data-testid={`text-submitter-${site.id}`}>{site.submittedBy}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums" data-testid={`text-visits-${site.id}`}>
            {site.visits.toLocaleString()} visits
          </span>
        </div>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onVisit}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-foreground hover-elevate"
          data-testid={`link-site-visit-${site.id}`}
        >
          <span className="hidden sm:inline">{formatHost(site.url)}</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  );
}

function SiteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-2/3" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

function EmptyState({ category }: { category: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center"
      data-testid="state-empty"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-background">
        <Compass className="size-6 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold">
        {category === "All"
          ? "The shelf is empty"
          : `No sites in ${category} yet`}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Be the first to drop a pin. Share a strange, useful, or beautiful corner
        of the internet.
      </p>
      <Link
        href="/submit"
        data-testid="button-empty-submit"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover-elevate"
      >
        <Sparkles className="size-4" />
        Submit a site
      </Link>
    </div>
  );
}

function Avatar({ name, small }: { name: string; small?: boolean }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  // simple hash for hue
  let hue = 0;
  for (let i = 0; i < name.length; i++) hue = (hue + name.charCodeAt(i) * 7) % 360;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold text-background ${
        small ? "size-5 text-[9px]" : "size-6 text-[10px]"
      }`}
      style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
    >
      {initial}
    </span>
  );
}
