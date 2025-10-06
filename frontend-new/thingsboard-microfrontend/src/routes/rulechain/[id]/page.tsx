'use client';

import { useParams } from '@modern-js/runtime/router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '../../../components/ui/card';
import { useRulechainDetails } from '../hooks/useRuleChainDetails';
import { useRulechainMetadata } from '../hooks/useRuleChainMetadata';
export default function RuleChainDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: ruleChain,
    isLoading: loadingDetails,
    error: errorDetails,
    update: updateDetails,
    refresh: reloadDetails,
  } = useRulechainDetails(id ?? '');

  const {
    metadata,
    isLoading: loadingMeta,
    error: errorMeta,
    update: updateMetadata,
    refresh: reloadMetadata,
  } = useRulechainMetadata(id ?? '');

  if (!id) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Missing RuleChain id
        </h2>
      </div>
    );
  }

  if (loadingDetails || loadingMeta) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Loading RuleChain Details...
        </h2>
      </div>
    );
  }

  if (!ruleChain) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <h2 className="text-xl font-semibold text-red-600">
          RuleChain not found
        </h2>
        {/* <Button onClick={() => router.push('/rulechain')} className="mt-4">
          Back to RuleChains
        </Button> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {ruleChain.name}
      </h1>

      {(errorDetails || errorMeta) && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{errorDetails || errorMeta}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* <TabsContent value="basic" className="mt-6">
          <RuleChainBasicView
            ruleChain={ruleChain}
            metadata={metadata}
            basicName={basicName}
            basicDebugMode={basicDebugMode}
            editing={editing}
            onNameChange={setBasicName}
            onDebugModeChange={setBasicDebugMode}
            onEdit={handleBasicEdit}
            onUpdateMetadata={handleUpdateMetadata}
          />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <RuleChainAdvancedView
            metadataJson={metadataJson}
            editing={editing}
            onMetadataChange={setMetadataJson}
            onEdit={handleAdvancedEdit}
          />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
