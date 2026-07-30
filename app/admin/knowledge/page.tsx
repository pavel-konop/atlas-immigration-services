import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function AdminKnowledgePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge" description="Content intake, drafts, and knowledge-base indexing." />
      <EmptyState
        icon={BookOpen}
        title="Knowledge management is coming next"
        description="This section will cover raw content intake, AI-processed drafts awaiting approval, and reindexing the assistant's approved knowledge base."
      />
    </div>
  );
}
