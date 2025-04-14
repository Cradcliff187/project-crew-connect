import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Document } from './schemas/documentSchema';
import RelationshipsTab from './RelationshipsTab';
import { Loader2 } from 'lucide-react';

interface DocumentTabsProps {
  document: Document;
  onViewDocument: (document: Document) => void;
}

const DocumentTabs: React.FC<DocumentTabsProps> = ({ document, onViewDocument }) => {
  const [activeTab, setActiveTab] = useState('relationships');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLoading(true);

    // Simulate loading state for smoother UX
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <Tabs defaultValue="relationships" onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-1 w-full">
        <TabsTrigger value="relationships">Related Documents</TabsTrigger>
      </TabsList>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
        </div>
      ) : (
        <TabsContent value="relationships" className="pt-4">
          <RelationshipsTab document={document} onViewDocument={onViewDocument} />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DocumentTabs;
