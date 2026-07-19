import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { articles } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Clock, Share2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_public/articles/$slug")({
  loader: ({ params }: { params: { slug: string } }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} — Startup Navigator` },
          { name: "description", content: loaderData.article.excerpt },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:description", content: loaderData.article.excerpt },
        ]
      : [{ title: "Article — Startup Navigator" }, { name: "robots", content: "noindex" }],
  }),
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-semibold">Article not found</h1>
      <Link to="/articles" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        Back to articles
      </Link>
    </div>
  ),
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = articles.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 3);
  return (
    <div className="container-page py-12 md:py-16">
      <Link
        to="/articles"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All articles
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_260px]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full">{article.category}</Badge>
            {article.tags.map((t) => (
              <span key={t} className="text-muted-foreground">#{t}</span>
            ))}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-medium">
                {article.author.split(" ").map((s) => s[0]).join("")}
              </div>
              <div>
                <div className="font-medium">{article.author}</div>
                <div className="text-xs text-muted-foreground">{article.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {article.readingTime} min read
              </span>
              <span>Updated {new Date(article.updated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" aria-label="Bookmark"><Bookmark className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" aria-label="Share"><Share2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> AI Summary
            </div>
            <p className="mt-2 text-sm text-foreground/90">
              {article.body[0]}
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-6 text-base leading-relaxed text-foreground/90">
            {article.toc.map((section, i) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{section.label}</h2>
                <p className="mt-3 text-muted-foreground">{article.body[i] ?? article.body[article.body.length - 1]}</p>
              </section>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-16 border-t border-border pt-10">
              <h3 className="text-lg font-semibold">Related reading</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to="/articles/$slug"
                    params={{ slug: r.slug }}
                    className="rounded-lg border border-border p-4 text-sm transition-colors hover:bg-accent/40"
                  >
                    <div className="text-xs text-muted-foreground">{r.category}</div>
                    <div className="mt-1 font-medium">{r.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">On this page</div>
            <ul className="mt-3 space-y-2 text-sm">
              {article.toc.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
