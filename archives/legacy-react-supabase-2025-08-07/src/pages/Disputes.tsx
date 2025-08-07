import { useState } from 'react';
import { DisputesList } from '@/components/DisputesList';
import { DisputeDetails } from '@/components/DisputeDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Disputes() {
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const handleDisputeSelect = (disputeId: string) => {
    setSelectedDisputeId(disputeId);
  };

  const handleBack = () => {
    setSelectedDisputeId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {selectedDisputeId ? (
          <DisputeDetails disputeId={selectedDisputeId} onBack={handleBack} />
        ) : (
          <DisputesList onDisputeSelect={handleDisputeSelect} />
        )}
      </div>
    </div>
  );
}