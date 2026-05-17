import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";

import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { CATEGORIES } from "@shared/schema";
import type { SiteWithTags } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "Give it a title.").max(120),
  url: z
    .string()
    .min(1, "URL is required.")
    .url("Include the protocol — https:// helps.")
    .refine(
      (v) => /^https?:\/\//i.test(v),
      "URL must start with http:// or https://"
    ),
  description: z.string().max(400).optional(),
  category: z.enum(CATEGORIES),
  tagsText: z.string().max(120).optional(),
  submittedBy: z.string().max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Submit() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      category: "Curiosities",
      tagsText: "",
      submittedBy: "",
    },
  });

  const submit = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/sites", {
        title: values.title.trim(),
        url: values.url.trim(),
        description: (values.description ?? "").trim(),
        category: values.category,
        tags: values.tagsText ?? "",
        submittedBy: (values.submittedBy ?? "").trim() || "anonymous",
      });
      return (await res.json()) as SiteWithTags;
    },
    onSuccess: (site) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Pinned to the map",
        description: `${site.title} is now live in the pool.`,
      });
      form.reset();
      setLocation("/");
    },
    onError: (err: any) => {
      toast({
        title: "Couldn't save that one",
        description: err?.message ?? "Check the fields and try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-6 -ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover-elevate"
        data-testid="link-back"
      >
        <ArrowLeft className="size-3.5" />
        Back to discovery
      </Link>

      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3 text-accent" />
          New submission
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Add a thread to the open web.
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Share a site that branches somewhere interesting — generative art,
          weird tools, calm rooms, internet history, or anything worth exploring.
        </p>
      </header>

      <Card className="p-6 sm:p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => submit.mutate(v))}
            className="space-y-6"
            noValidate
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://yourfavoritething.lol"
                      autoComplete="off"
                      data-testid="input-url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What should we call it?"
                      data-testid="input-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why is this worth a visit? A sentence is plenty."
                      rows={3}
                      data-testid="input-description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional. Max 400 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Pick one" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} data-testid={`option-category-${c}`}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="generative, calm, weird"
                        data-testid="input-tags"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Comma-separated. Up to 8.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="submittedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your handle</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="topaz (or leave blank for anonymous)"
                      data-testid="input-submitted-by"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown next to your submission. We never collect more than this.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                data-testid="button-reset"
              >
                Clear
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={submit.isPending}
                data-testid="button-submit"
                className="gap-2"
              >
                {submit.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Pinning...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Add to Webloom
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
        Prototype mode: submissions auto-approve so every thread can be explored immediately.
      </p>
    </div>
  );
}
