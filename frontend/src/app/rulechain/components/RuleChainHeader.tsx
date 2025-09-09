import { Button } from "../../../components/ui/button";

interface RuleChainHeaderProps {
  name: string;
  onBack: () => void;
}

export const RuleChainHeader = ({ name, onBack }: RuleChainHeaderProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
        <p className="text-gray-600">RuleChain Details</p>
      </div>
      <Button variant="outline" onClick={onBack}>
        ← Back to RuleChains
      </Button>
    </div>
  );
};
