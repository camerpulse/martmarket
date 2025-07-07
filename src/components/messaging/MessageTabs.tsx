import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, Send, FileText } from 'lucide-react';

interface MessageTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  inboxCount?: number;
  sentCount?: number;
  draftsCount?: number;
}

export default function MessageTabs({ 
  activeTab, 
  onTabChange, 
  inboxCount = 0, 
  sentCount = 0, 
  draftsCount = 0 
}: MessageTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="inbox" className="flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          Inbox
          {inboxCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {inboxCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Sent
          {sentCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              {sentCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="drafts" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Drafts
          {draftsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              {draftsCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}