import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, CheckCircle2 } from 'lucide-react';
import DocumentMigrationUtility from '@/components/documents/migration/DocumentMigrationUtility';
import DocumentValidationUtility from '@/components/documents/validation/DocumentValidationUtility';

export default function DocumentAdministrationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Administration</h1>
          <p className="text-muted-foreground">
            Manage document migration, validation, and system settings
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="cursor-pointer hover:border-primary/50"
              onClick={() => setActiveTab('migration')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Document Migration</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Migrate Documents</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Update existing documents to use the standardized format with proper URLs and
                  metadata
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary/50"
              onClick={() => setActiveTab('validation')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Document Validation</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Validate Documents</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Validate storage paths, URLs, and metadata for all documents in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Security</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Access Control</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Manage permissions and security settings for document access
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document System Overview</CardTitle>
              <CardDescription>
                The document management system handles file storage, metadata, and relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                The document management system now follows a standardized pattern across all entity
                types, providing a consistent user experience and reliable functionality.
              </p>

              <h3 className="font-medium mt-4">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Standardized document upload interface</li>
                <li>Consistent document grid and table views</li>
                <li>Unified document metadata management</li>
                <li>Document relationship tracking</li>
                <li>Storage path validation and URL management</li>
              </ul>

              <h3 className="font-medium mt-4">Administration Tools</h3>
              <p>Use the Migration and Validation tabs to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Migrate existing documents to the new standardized format</li>
                <li>Validate document metadata and storage links</li>
                <li>Identify and fix issues with document records</li>
                <li>Ensure consistent document representation across the application</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration">
          <DocumentMigrationUtility />
        </TabsContent>

        <TabsContent value="validation">
          <DocumentValidationUtility />
        </TabsContent>
      </Tabs>
    </div>
  );
}
