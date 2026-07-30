import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function AdminChatsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Chats" description="Assistant conversations, answer status, and content gaps." />
      <EmptyState
        icon={MessagesSquare}
        title="Chat review is coming next"
        description="This section will list assistant conversations, low-confidence and escalated answers, and questions with no good match — turning logged chats into content improvements."
      />
    </div>
  );
}
