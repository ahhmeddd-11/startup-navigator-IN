import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, Edit2, Trash2, FileText, Landmark, Users, 
  Sparkles, Bookmark, LogOut, LayoutDashboard, Mail, Eye, 
  CheckCircle, XCircle, ArrowLeft, ArrowRight 
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Startup Navigator" }] }),
  component: AdminPanel,
});

type AdminStats = {
  resources_count: number;
  articles_count: number;
  users_count: number;
  conversations_count: number;
  bookmarks_count: number;
  contact_messages_count: number;
  recent_users: UserRow[];
  recent_contact_messages: ContactMessage[];
};

type UserRow = {
  id: number;
  email: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
};

type Resource = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  full_description?: string;
  external_link?: string;
  category: { id: number; name: string; slug: string };
  tags: { id: number; name: string; slug: string }[];
  resource_type: string;
  duration: string;
  featured: boolean;
  is_published: boolean;
  created_at: string;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  reading_time: number;
  category: { id: number; name: string; slug: string };
  tags: { id: number; name: string; slug: string }[];
  featured: boolean;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
};

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type AIConversation = {
  id: number;
  user_email: string;
  title: string;
  created_at: string;
  messages_count: number;
  interactions?: { id: number; prompt_type: string; user_query: string; ai_response: string }[];
};

type Category = { id: number; name: string; slug: string };
type Tag = { id: number; name: string; slug: string };

function AdminPanel() {
  const { user: currentUser, isCheckingAuth, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("dashboard");

  // Pagination & Search States
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  const [resourcePage, setResourcePage] = useState(1);
  const [resourceSearch, setResourceSearch] = useState("");

  const [articlePage, setArticlePage] = useState(1);
  const [articleSearch, setArticleSearch] = useState("");

  const [contactPage, setContactPage] = useState(1);
  const [contactSearch, setContactSearch] = useState("");

  const [aiPage, setAiPage] = useState(1);
  const [aiSearch, setAiSearch] = useState("");

  // Dialog States
  const [isResourceOpen, setIsResourceOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resTitle, setResTitle] = useState("");
  const [resShortDesc, setResShortDesc] = useState("");
  const [resFullDesc, setResFullDesc] = useState("");
  const [resExtLink, setResExtLink] = useState("");
  const [resCategory, setResCategory] = useState("");
  const [resTags, setResTags] = useState<string[]>([]);
  const [resType, setResType] = useState("Guide");
  const [resDuration, setResDuration] = useState("");
  const [resFeatured, setResFeatured] = useState(false);
  const [resPublished, setResPublished] = useState(false);

  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [artTitle, setArtTitle] = useState("");
  const [artSummary, setArtSummary] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artReadingTime, setArtReadingTime] = useState(5);
  const [artCategory, setArtCategory] = useState("");
  const [artTags, setArtTags] = useState<string[]>([]);
  const [artFeatured, setArtFeatured] = useState(false);
  const [artPublished, setArtPublished] = useState(false);
  const [artMetaTitle, setArtMetaTitle] = useState("");
  const [artMetaDesc, setArtMetaDesc] = useState("");

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [uName, setUName] = useState("");
  const [uStaff, setUStaff] = useState(false);
  const [uActive, setUActive] = useState(true);

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState<ContactMessage | null>(null);

  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [viewingConversation, setViewingConversation] = useState<AIConversation | null>(null);

  // Route protection
  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        void navigate({ to: "/login" });
      } else if (!currentUser?.is_staff) {
        void navigate({ to: "/" });
      }
    }
  }, [isAuthenticated, isCheckingAuth, currentUser, navigate]);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/api/admin/dashboard/");
      return res.data?.data as AdminStats;
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery<{ results: UserRow[]; count: number }>({
    queryKey: ["admin-users", userPage, userSearch, userRoleFilter, userStatusFilter],
    queryFn: async () => {
      const res = await api.get("/api/admin/users/", {
        params: {
          page: userPage,
          search: userSearch,
          role: userRoleFilter !== "all" ? userRoleFilter : undefined,
          status: userStatusFilter !== "all" ? userStatusFilter : undefined,
        },
      });
      return {
        results: res.data?.data?.results || [],
        count: res.data?.data?.count || 0,
      };
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: resourcesData, isLoading: resourcesLoading, refetch: refetchResources } = useQuery<{ results: Resource[]; count: number }>({
    queryKey: ["admin-resources", resourcePage, resourceSearch],
    queryFn: async () => {
      const res = await api.get("/api/resources/", {
        params: { page: resourcePage, search: resourceSearch },
      });
      return {
        results: res.data?.data?.results || [],
        count: res.data?.data?.count || 0,
      };
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: articlesData, isLoading: articlesLoading, refetch: refetchArticles } = useQuery<{ results: Article[]; count: number }>({
    queryKey: ["admin-articles", articlePage, articleSearch],
    queryFn: async () => {
      const res = await api.get("/api/knowledge/", {
        params: { page: articlePage, search: articleSearch },
      });
      return {
        results: res.data?.data?.results || [],
        count: res.data?.data?.count || 0,
      };
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: contactsData, isLoading: contactsLoading, refetch: refetchContacts } = useQuery<{ results: ContactMessage[]; count: number }>({
    queryKey: ["admin-contacts", contactPage, contactSearch],
    queryFn: async () => {
      const res = await api.get("/api/admin/contacts/", {
        params: { page: contactPage, search: contactSearch },
      });
      return {
        results: res.data?.data?.results || [],
        count: res.data?.data?.count || 0,
      };
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: aiConversationsData, isLoading: aiLoading, refetch: refetchAI } = useQuery<{ results: AIConversation[]; count: number }>({
    queryKey: ["admin-conversations", aiPage, aiSearch],
    queryFn: async () => {
      const res = await api.get("/api/ai/admin/conversations/", {
        params: { page: aiPage, search: aiSearch },
      });
      return {
        results: res.data?.data?.results || [],
        count: res.data?.data?.count || 0,
      };
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: resCategories } = useQuery<Category[]>({
    queryKey: ["res-categories"],
    queryFn: async () => {
      const res = await api.get("/api/resources/categories/");
      const payload = res.data?.data;
      return (payload?.results || payload || []) as Category[];
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: resTagsData } = useQuery<Tag[]>({
    queryKey: ["res-tags"],
    queryFn: async () => {
      const res = await api.get("/api/resources/tags/");
      const payload = res.data?.data;
      return (payload?.results || payload || []) as Tag[];
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: artCategories } = useQuery<Category[]>({
    queryKey: ["art-categories"],
    queryFn: async () => {
      const res = await api.get("/api/knowledge/categories/");
      const payload = res.data?.data;
      return (payload?.results || payload || []) as Category[];
    },
    enabled: !!currentUser?.is_staff,
  });

  const { data: artTagsData } = useQuery<Tag[]>({
    queryKey: ["art-tags"],
    queryFn: async () => {
      const res = await api.get("/api/knowledge/tags/");
      const payload = res.data?.data;
      return (payload?.results || payload || []) as Tag[];
    },
    enabled: !!currentUser?.is_staff,
  });

  // User Handlers
  const openUserEdit = (userRow: UserRow) => {
    setEditingUser(userRow);
    setUName(userRow.full_name);
    setUStaff(userRow.is_staff);
    setUActive(userRow.is_active);
    setIsUserOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await api.patch(`/api/admin/users/${editingUser.id}/`, {
        full_name: uName,
        is_staff: uStaff,
        is_active: uActive,
      });
      toast.success("User updated successfully");
      setIsUserOpen(false);
      void refetchUsers();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error(err.response?.data?.[0] || err.response?.data?.message || "Failed to update user");
    }
  };

  const toggleUserActivation = async (userRow: UserRow) => {
    try {
      await api.patch(`/api/admin/users/${userRow.id}/`, {
        is_active: !userRow.is_active,
      });
      toast.success(userRow.is_active ? "User deactivated" : "User activated");
      void refetchUsers();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error(err.response?.data?.[0] || err.response?.data?.message || "Action failed");
    }
  };

  const handleUserDelete = async (userRow: UserRow) => {
    if (!confirm(`Are you sure you want to permanently delete user ${userRow.email}?`)) return;

    try {
      await api.delete(`/api/admin/users/${userRow.id}/`);
      toast.success("User deleted successfully");
      void refetchUsers();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error(err.response?.data?.[0] || err.response?.data?.message || "Delete failed");
    }
  };

  // Resource CRUD
  const openResourceAdd = () => {
    setEditingResource(null);
    setResTitle("");
    setResShortDesc("");
    setResFullDesc("");
    setResExtLink("");
    setResCategory(resCategories?.[0]?.id?.toString() || "");
    setResTags([]);
    setResType("Guide");
    setResDuration("");
    setResFeatured(false);
    setResPublished(false);
    setIsResourceOpen(true);
  };

  const openResourceEdit = (resource: Resource) => {
    setEditingResource(resource);
    setResTitle(resource.title);
    setResShortDesc(resource.short_description);
    setResFullDesc(resource.full_description || "");
    setResExtLink(resource.external_link || "");
    setResCategory(resource.category?.id?.toString() || "");
    setResTags(resource.tags?.map(t => t.id.toString()) || []);
    setResType(resource.resource_type);
    setResDuration(resource.duration || "");
    setResFeatured(resource.featured);
    setResPublished(resource.is_published);
    setIsResourceOpen(true);
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resShortDesc.trim() || !resCategory) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      title: resTitle,
      short_description: resShortDesc,
      full_description: resFullDesc,
      external_link: resExtLink,
      category: parseInt(resCategory),
      tags: resTags.map(id => parseInt(id)),
      resource_type: resType,
      duration: resDuration,
      featured: resFeatured,
      is_published: resPublished,
    };

    try {
      if (editingResource) {
        await api.patch(`/api/resources/${editingResource.slug}/`, payload);
        toast.success("Resource updated successfully");
      } else {
        await api.post("/api/resources/", payload);
        toast.success("Resource created successfully");
      }
      setIsResourceOpen(false);
      void refetchResources();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error("Failed to save resource");
    }
  };

  const handleResourceDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/api/resources/${slug}/`);
      toast.success("Resource deleted successfully");
      void refetchResources();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error("Failed to delete resource");
    }
  };

  // Article CRUD
  const openArticleAdd = () => {
    setEditingArticle(null);
    setArtTitle("");
    setArtSummary("");
    setArtContent("");
    setArtReadingTime(5);
    setArtCategory(artCategories?.[0]?.id?.toString() || "");
    setArtTags([]);
    setArtFeatured(false);
    setArtPublished(false);
    setArtMetaTitle("");
    setArtMetaDesc("");
    setIsArticleOpen(true);
  };

  const openArticleEdit = (article: Article) => {
    setEditingArticle(article);
    setArtTitle(article.title);
    setArtSummary(article.summary);
    setArtContent(article.content);
    setArtReadingTime(article.reading_time);
    setArtCategory(article.category?.id?.toString() || "");
    setArtTags(article.tags?.map(t => t.id.toString()) || []);
    setArtFeatured(article.featured);
    setArtPublished(article.is_published);
    setArtMetaTitle(article.meta_title || "");
    setArtMetaDesc(article.meta_description || "");
    setIsArticleOpen(true);
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artSummary.trim() || !artContent.trim() || !artCategory) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      title: artTitle,
      summary: artSummary,
      content: artContent,
      reading_time: artReadingTime,
      category: parseInt(artCategory),
      tags: artTags.map(id => parseInt(id)),
      featured: artFeatured,
      is_published: artPublished,
      meta_title: artMetaTitle,
      meta_description: artMetaDesc,
    };

    try {
      if (editingArticle) {
        await api.patch(`/api/knowledge/${editingArticle.slug}/`, payload);
        toast.success("Article updated successfully");
      } else {
        await api.post("/api/knowledge/", payload);
        toast.success("Article created successfully");
      }
      setIsArticleOpen(false);
      void refetchArticles();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error("Failed to save article");
    }
  };

  const handleArticleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await api.delete(`/api/knowledge/${slug}/`);
      toast.success("Article deleted successfully");
      void refetchArticles();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error("Failed to delete article");
    }
  };

  // Contact Messages Actions
  const toggleContactReadStatus = async (contact: ContactMessage) => {
    try {
      await api.patch(`/api/admin/contacts/${contact.id}/`, {
        is_read: !contact.is_read,
      });
      toast.success(contact.is_read ? "Marked as unread" : "Marked as read");
      void refetchContacts();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handleContactDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/api/admin/contacts/${id}/`);
      toast.success("Message deleted successfully");
      void refetchContacts();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error("Failed to delete message");
    }
  };

  const openContactView = async (contact: ContactMessage) => {
    setViewingContact(contact);
    setIsContactOpen(true);
    if (!contact.is_read) {
      try {
        await api.patch(`/api/admin/contacts/${contact.id}/`, { is_read: true });
        void refetchContacts();
        void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      } catch (err) {}
    }
  };

  // AI Conversations Actions
  const handleAIConversationDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this AI conversation?")) return;
    try {
      await api.delete(`/api/ai/admin/conversations/${id}/`);
      toast.success("Conversation deleted successfully");
      void refetchAI();
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error("Failed to delete conversation");
    }
  };

  const openAIConversationView = async (conv: AIConversation) => {
    try {
      const res = await api.get(`/api/ai/admin/conversations/${conv.id}/`);
      setViewingConversation(res.data?.data);
      setIsConversationOpen(true);
    } catch (err) {
      toast.error("Failed to load conversation details");
    }
  };

  // Tag togglers
  const handleTagToggle = (tagId: string, type: "res" | "art") => {
    if (type === "res") {
      setResTags(prev =>
        prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
      );
    } else {
      setArtTags(prev =>
        prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
      );
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Checking authorization…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser?.is_staff) {
    return null;
  }

  // Pagination bounds checking helpers
  const userTotalPages = Math.ceil((usersData?.count || 0) / 10);
  const resourceTotalPages = Math.ceil((resourcesData?.count || 0) / 10);
  const articleTotalPages = Math.ceil((articlesData?.count || 0) / 10);
  const contactTotalPages = Math.ceil((contactsData?.count || 0) / 10);
  const aiTotalPages = Math.ceil((aiConversationsData?.count || 0) / 10);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-page flex h-14 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Logo />
            <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary text-xs rounded-full">
              Staff Console
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Exit Admin</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-page py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Internal Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage platform assets, user roles, read contact inquiries, and review conversation logs.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/60 p-1 rounded-xl flex flex-wrap max-w-max">
              <TabsTrigger value="dashboard" className="rounded-lg flex gap-1.5 items-center">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg flex gap-1.5 items-center">
                <Users className="h-4 w-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="resources" className="rounded-lg flex gap-1.5 items-center">
                <Landmark className="h-4 w-4" /> Resources
              </TabsTrigger>
              <TabsTrigger value="articles" className="rounded-lg flex gap-1.5 items-center">
                <FileText className="h-4 w-4" /> Articles
              </TabsTrigger>
              <TabsTrigger value="contacts" className="rounded-lg flex gap-1.5 items-center">
                <Mail className="h-4 w-4" /> Inquiries
              </TabsTrigger>
              <TabsTrigger value="ai" className="rounded-lg flex gap-1.5 items-center">
                <Sparkles className="h-4 w-4" /> AI Threads
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-8 outline-none">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <Card className="bg-accent/10 border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {statsLoading ? "—" : stats?.users_count}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/10 border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Resources</CardTitle>
                    <Landmark className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {statsLoading ? "—" : stats?.resources_count}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/10 border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Articles</CardTitle>
                    <FileText className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {statsLoading ? "—" : stats?.articles_count}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/10 border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">AI Chats</CardTitle>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {statsLoading ? "—" : stats?.conversations_count}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/10 border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Bookmarks</CardTitle>
                    <Bookmark className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {statsLoading ? "—" : stats?.bookmarks_count}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/10 border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Inquiries</CardTitle>
                    <Mail className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      {statsLoading ? "—" : stats?.contact_messages_count}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Users List */}
                <Card className="border-border/80 bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent User Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-border">
                      {stats?.recent_users?.map((u) => (
                        <div key={u.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{u.full_name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                          <Badge variant={u.is_staff ? "default" : "outline"}>
                            {u.is_staff ? "Admin" : "User"}
                          </Badge>
                        </div>
                      ))}
                      {stats?.recent_users?.length === 0 && (
                        <div className="py-4 text-center text-xs text-muted-foreground">No recent registrations.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Inquiries List */}
                <Card className="border-border/80 bg-card">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent Contact Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-border">
                      {stats?.recent_contact_messages?.map((c) => (
                        <div key={c.id} className="py-3 flex items-center justify-between">
                          <div className="truncate max-w-[70%]">
                            <div className="font-medium text-sm truncate">{c.subject}</div>
                            <div className="text-xs text-muted-foreground">{c.name} ({c.email})</div>
                          </div>
                          <Badge variant={c.is_read ? "secondary" : "destructive"} className="text-[10px]">
                            {c.is_read ? "Read" : "New"}
                          </Badge>
                        </div>
                      ))}
                      {stats?.recent_contact_messages?.length === 0 && (
                        <div className="py-4 text-center text-xs text-muted-foreground">No recent messages.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Management Tab */}
            <TabsContent value="users" className="space-y-4 outline-none">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex flex-wrap items-center gap-3 w-full sm:max-w-xl">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                      className="pl-9 bg-card"
                    />
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                    className="flex h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs focus:outline-hidden"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrators</option>
                    <option value="user">Normal Users</option>
                  </select>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => { setUserStatusFilter(e.target.value); setUserPage(1); }}
                    className="flex h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs focus:outline-hidden"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Date Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersData?.results?.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.full_name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.is_staff ? "default" : "outline"}>
                                {u.is_staff ? "Admin" : "User"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(u.date_joined).toLocaleDateString("en-IN")}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                u.is_active ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                              }`}>
                                {u.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openUserEdit(u)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-8" 
                                  onClick={() => toggleUserActivation(u)}
                                  disabled={u.id === currentUser?.id}
                                >
                                  {u.is_active ? "Deactivate" : "Activate"}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                                  onClick={() => handleUserDelete(u)}
                                  disabled={u.id === currentUser?.id}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {userTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => setUserPage(p => Math.max(p - 1, 1))} disabled={userPage === 1}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Prev
                      </Button>
                      <span className="text-xs text-muted-foreground">Page {userPage} of {userTotalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setUserPage(p => Math.min(p + 1, userTotalPages))} disabled={userPage === userTotalPages}>
                        Next <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4 outline-none">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={resourceSearch}
                    onChange={(e) => { setResourceSearch(e.target.value); setResourcePage(1); }}
                    className="pl-9 bg-card"
                  />
                </div>
                <Button onClick={openResourceAdd}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Resource
                </Button>
              </div>

              {resourcesLoading ? (
                <div className="flex justify-center py-12">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resourcesData?.results?.map((res) => (
                          <TableRow key={res.id}>
                            <TableCell className="font-medium">{res.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="rounded-full text-xs font-normal">
                                {res.resource_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{res.category?.name || "—"}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                res.is_published ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                              }`}>
                                {res.is_published ? "Published" : "Draft"}
                              </span>
                            </TableCell>
                            <TableCell>{res.featured ? "Yes" : "No"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openResourceEdit(res)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleResourceDelete(res.slug)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {resourceTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => setResourcePage(p => Math.max(p - 1, 1))} disabled={resourcePage === 1}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Prev
                      </Button>
                      <span className="text-xs text-muted-foreground">Page {resourcePage} of {resourceTotalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setResourcePage(p => Math.min(p + 1, resourceTotalPages))} disabled={resourcePage === resourceTotalPages}>
                        Next <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles" className="space-y-4 outline-none">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={articleSearch}
                    onChange={(e) => { setArticleSearch(e.target.value); setArticlePage(1); }}
                    className="pl-9 bg-card"
                  />
                </div>
                <Button onClick={openArticleAdd}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Article
                </Button>
              </div>

              {articlesLoading ? (
                <div className="flex justify-center py-12">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Reading Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articlesData?.results?.map((art) => (
                          <TableRow key={art.id}>
                            <TableCell className="font-medium">{art.title}</TableCell>
                            <TableCell>{art.category?.name || "—"}</TableCell>
                            <TableCell>{art.reading_time} min</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                art.is_published ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                              }`}>
                                {art.is_published ? "Published" : "Draft"}
                              </span>
                            </TableCell>
                            <TableCell>{art.featured ? "Yes" : "No"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openArticleEdit(art)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleArticleDelete(art.slug)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {articleTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => setArticlePage(p => Math.max(p - 1, 1))} disabled={articlePage === 1}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Prev
                      </Button>
                      <span className="text-xs text-muted-foreground">Page {articlePage} of {articleTotalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setArticlePage(p => Math.min(p + 1, articleTotalPages))} disabled={articlePage === articleTotalPages}>
                        Next <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Inquiries Tab */}
            <TabsContent value="contacts" className="space-y-4 outline-none">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={contactSearch}
                    onChange={(e) => { setContactSearch(e.target.value); setContactPage(1); }}
                    className="pl-9 bg-card"
                  />
                </div>
              </div>

              {contactsLoading ? (
                <div className="flex justify-center py-12">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Sender</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactsData?.results?.map((c) => (
                          <TableRow key={c.id} className={!c.is_read ? "bg-accent/10" : ""}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell className="max-w-xs truncate">{c.subject}</TableCell>
                            <TableCell>{new Date(c.created_at).toLocaleDateString("en-IN")}</TableCell>
                            <TableCell>
                              <Badge variant={c.is_read ? "secondary" : "destructive"}>
                                {c.is_read ? "Read" : "Unread"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openContactView(c)}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-8" 
                                  onClick={() => toggleContactReadStatus(c)}
                                >
                                  {c.is_read ? "Mark Unread" : "Mark Read"}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                                  onClick={() => handleContactDelete(c.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {contactsData?.results?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                              No inquiries found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {contactTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => setContactPage(p => Math.max(p - 1, 1))} disabled={contactPage === 1}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Prev
                      </Button>
                      <span className="text-xs text-muted-foreground">Page {contactPage} of {contactTotalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setContactPage(p => Math.min(p + 1, contactTotalPages))} disabled={contactPage === contactTotalPages}>
                        Next <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* AI Conversations Tab */}
            <TabsContent value="ai" className="space-y-4 outline-none">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search threads..."
                    value={aiSearch}
                    onChange={(e) => { setAiSearch(e.target.value); setAiPage(1); }}
                    className="pl-9 bg-card"
                  />
                </div>
              </div>

              {aiLoading ? (
                <div className="flex justify-center py-12">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>User Email</TableHead>
                          <TableHead>Conversation Title</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Messages</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aiConversationsData?.results?.map((conv) => (
                          <TableRow key={conv.id}>
                            <TableCell className="font-medium">{conv.user_email}</TableCell>
                            <TableCell className="max-w-xs truncate">{conv.title}</TableCell>
                            <TableCell>{new Date(conv.created_at).toLocaleDateString("en-IN")}</TableCell>
                            <TableCell>{conv.messages_count} messages</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAIConversationView(conv)}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                                  onClick={() => handleAIConversationDelete(conv.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {aiConversationsData?.results?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                              No threads found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {aiTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => setAiPage(p => Math.max(p - 1, 1))} disabled={aiPage === 1}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Prev
                      </Button>
                      <span className="text-xs text-muted-foreground">Page {aiPage} of {aiTotalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setAiPage(p => Math.min(p + 1, aiTotalPages))} disabled={aiPage === aiTotalPages}>
                        Next <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* User Update Dialog */}
      <Dialog open={isUserOpen} onOpenChange={setIsUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Change roles and system account privileges.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="usr-email">Email</Label>
              <Input id="usr-email" value={editingUser?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="usr-name">Full Name</Label>
              <Input id="usr-name" value={uName} onChange={(e) => setUName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={uStaff} 
                  onChange={(e) => setUStaff(e.target.checked)} 
                  className="rounded border-input text-primary focus:ring-primary"
                  disabled={editingUser?.id === currentUser?.id}
                />
                <span className="text-sm font-medium">Administrator Privileges</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={uActive} 
                  onChange={(e) => setUActive(e.target.checked)} 
                  className="rounded border-input text-primary focus:ring-primary"
                  disabled={editingUser?.id === currentUser?.id}
                />
                <span className="text-sm font-medium">Active Account</span>
              </label>
            </div>
            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setIsUserOpen(false)}>Cancel</Button>
              <Button type="submit">Save User Settings</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inquiry Detail Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Inquired Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">From</span>
                <span className="font-medium text-foreground">{viewingContact?.name}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email</span>
                <span className="font-medium text-foreground">{viewingContact?.email}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Date Received</span>
                <span className="font-medium text-foreground">
                  {viewingContact?.created_at ? new Date(viewingContact.created_at).toLocaleString("en-IN") : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Subject</span>
                <span className="font-medium text-foreground">{viewingContact?.subject}</span>
              </div>
            </div>
            <div className="border border-border p-4 bg-muted/20 rounded-xl">
              <span className="text-xs text-muted-foreground block mb-1">Message Content</span>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{viewingContact?.message}</p>
            </div>
            <DialogFooter className="pt-2">
              <Button onClick={() => setIsContactOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Conversation Detail Dialog */}
      <Dialog open={isConversationOpen} onOpenChange={setIsConversationOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Thread: {viewingConversation?.title}</DialogTitle>
            <DialogDescription>Email: {viewingConversation?.user_email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="divide-y divide-border">
              {viewingConversation?.interactions?.map((m) => (
                <div key={m.id} className="py-4 space-y-3">
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <span className="text-[10px] uppercase font-semibold text-primary block mb-1">Founder Prompt ({m.prompt_type})</span>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{m.user_query}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                    <span className="text-[10px] uppercase font-semibold text-accent block mb-1">AI Advisor Output</span>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{m.ai_response}</p>
                  </div>
                </div>
              ))}
              {viewingConversation?.interactions?.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No message exchanges found in this thread.</div>
              )}
            </div>
            <DialogFooter className="pt-4 border-t border-border">
              <Button onClick={() => setIsConversationOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Create/Edit Dialog */}
      <Dialog open={isResourceOpen} onOpenChange={setIsResourceOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingResource ? "Edit Resource" : "Create Resource"}</DialogTitle>
            <DialogDescription>
              {editingResource ? "Modify the properties of this resource." : "Add a new asset resource."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResourceSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="res-title">Title *</Label>
              <Input id="res-title" value={resTitle} onChange={(e) => setResTitle(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="res-short">Short Description *</Label>
              <Textarea id="res-short" value={resShortDesc} onChange={(e) => setResShortDesc(e.target.value)} required rows={2} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="res-full">Full Description</Label>
              <Textarea id="res-full" value={resFullDesc} onChange={(e) => setResFullDesc(e.target.value)} rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="res-type">Resource Type</Label>
                <select
                  id="res-type"
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden"
                >
                  <option value="Template">Template</option>
                  <option value="Guide">Guide</option>
                  <option value="Checklist">Checklist</option>
                  <option value="Toolkit">Toolkit</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-cat">Category *</Label>
                <select
                  id="res-cat"
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden"
                  required
                >
                  <option value="">Select Category</option>
                  {resCategories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="res-link">External URL</Label>
                <Input id="res-link" value={resExtLink} onChange={(e) => setResExtLink(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="res-duration">Duration / Size</Label>
                <Input id="res-duration" value={resDuration} onChange={(e) => setResDuration(e.target.value)} placeholder="e.g. 15 min, 3 pages" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-lg max-h-24 overflow-y-auto bg-card">
                {resTagsData?.map(t => (
                  <Badge
                    key={t.id}
                    variant={resTags.includes(t.id.toString()) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => handleTagToggle(t.id.toString(), "res")}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={resFeatured} onChange={(e) => setResFeatured(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Featured Resource</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={resPublished} onChange={(e) => setResPublished(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Publish Immediately</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setIsResourceOpen(false)}>Cancel</Button>
              <Button type="submit">Save Resource</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Article Create/Edit Dialog */}
      <Dialog open={isArticleOpen} onOpenChange={setIsArticleOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Article" : "Publish Article"}</DialogTitle>
            <DialogDescription>
              {editingArticle ? "Modify properties and SEO details of this article." : "Publish a new playbook."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleArticleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="art-title">Title *</Label>
              <Input id="art-title" value={artTitle} onChange={(e) => setArtTitle(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="art-sum">Summary *</Label>
              <Textarea id="art-sum" value={artSummary} onChange={(e) => setArtSummary(e.target.value)} required rows={2} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="art-content">Content (Markdown supported) *</Label>
              <Textarea id="art-content" value={artContent} onChange={(e) => setArtContent(e.target.value)} required rows={6} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="art-cat">Category *</Label>
                <select
                  id="art-cat"
                  value={artCategory}
                  onChange={(e) => setArtCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden"
                  required
                >
                  <option value="">Select Category</option>
                  {artCategories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="art-reading">Reading Time (minutes) *</Label>
                <Input
                  id="art-reading"
                  type="number"
                  min={1}
                  value={artReadingTime}
                  onChange={(e) => setArtReadingTime(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-lg max-h-24 overflow-y-auto bg-card">
                {artTagsData?.map(t => (
                  <Badge
                    key={t.id}
                    variant={artTags.includes(t.id.toString()) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => handleTagToggle(t.id.toString(), "art")}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label htmlFor="art-seo-title">SEO Title</Label>
                <Input id="art-seo-title" value={artMetaTitle} onChange={(e) => setArtMetaTitle(e.target.value)} placeholder="Max 70 chars" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="art-seo-desc">SEO Description</Label>
                <Input id="art-seo-desc" value={artMetaDesc} onChange={(e) => setArtMetaDesc(e.target.value)} placeholder="Max 160 chars" />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={artFeatured} onChange={(e) => setArtFeatured(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Featured Article</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={artPublished} onChange={(e) => setArtPublished(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Publish Immediately</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setIsArticleOpen(false)}>Cancel</Button>
              <Button type="submit">Publish Article</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
