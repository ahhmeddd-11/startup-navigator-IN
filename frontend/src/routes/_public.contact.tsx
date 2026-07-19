import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_public/contact")({
  head: () => ({
    meta: [{ title: "Contact — Startup Navigator" }, { name: "description", content: "Reach the Startup Navigator team." }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/api/contact/", {
        name,
        email,
        subject,
        message,
      });
      if (response.data?.success) {
        toast.success("Message sent successfully", { description: "We'll reply within 24 hours." });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(response.data?.message || "Failed to send message");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-20">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Get in touch</h1>
          <p className="mt-3 text-muted-foreground">
            Product feedback, press, partnerships, or a scheme we missed — we read everything.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</div>
              <div className="mt-1">hello@startupnavigator.in</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Support hours</div>
              <div className="mt-1">Mon–Fri, 10:00–19:00 IST</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Offices</div>
              <div className="mt-1">Bengaluru · Remote</div>
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs"
        >
          <div>
            <Label htmlFor="nm">Name</Label>
            <Input
              id="nm"
              required
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="em">Email</Label>
            <Input
              id="em"
              type="email"
              required
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sb">Subject</Label>
            <Input
              id="sb"
              required
              className="mt-1.5"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              required
              rows={4}
              className="mt-1.5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}

