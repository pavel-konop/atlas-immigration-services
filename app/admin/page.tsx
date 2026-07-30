import { ArrowRight, BookOpen, FileText, MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { Badge } from "@/components/admin/Badge";
import { AdminButtonLink } from "@/components/admin/Button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Manage Atlas website content and, soon, the AI assistant's chats and knowledge base."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          title={
            <span className="flex items-center gap-2">
              <FileText aria-hidden="true" className="h-5 w-5 text-atlas-gold" /> Content
            </span>
          }
          description="Edit the homepage showcase, photos, feedback, articles, and FAQs shown across the public site."
        >
          <AdminButtonLink href="/admin/content" variant="secondary" size="sm">
            Open content editor <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </AdminButtonLink>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <MessagesSquare aria-hidden="true" className="h-5 w-5 text-atlas-gold" /> Chats
            </span>
          }
          description="Review assistant conversations, low-confidence answers, and content gaps."
        >
          <Badge tone="neutral">Coming next</Badge>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <BookOpen aria-hidden="true" className="h-5 w-5 text-atlas-gold" /> Knowledge
            </span>
          }
          description="Review content intake and drafts, and trigger reindexing of the assistant's knowledge base."
        >
          <Badge tone="neutral">Coming next</Badge>
        </Card>
      </div>
    </div>
  );
}
