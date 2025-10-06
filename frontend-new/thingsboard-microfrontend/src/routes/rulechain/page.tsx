import { useNavigate } from '@modern-js/runtime/router';
import { CreateRuleChainSection } from './components/CreateRuleChainSection';
import { ErrorMessage } from './components/ErrorMessage';
import { RuleChainList } from './components/RuleChainList';
import { useRulechains } from './hooks/useRuleChains';

export default function RuleChainPage() {
  // const { isAuthenticated, accessToken } = useAuth();
  const { ruleChains, error, isLoading } = useRulechains();
  type RuleChain = { id?: { id?: string } | string };
  const navigate = useNavigate();

  const handleRuleChainClick = (ruleChain: RuleChain) => {
    const id =
      typeof ruleChain.id === 'string' ? ruleChain.id : ruleChain.id?.id;
    if (id) {
      navigate(`/rulechain/${id}`);
    }
  };

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
  //       <LoginButton />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex flex-col gap-2">
      {/* <AuthenticationSection
        isAuthenticated={isAuthenticated}
        accessToken={accessToken}
        onLogin={() => {}}
        onLogout={() => localStorage.removeItem("accessToken")}
      /> */}

      <h1 className="flex gap-3 items-center text-3xl font-bold text-gray-900 ">
        RuleChains{' '}
        <span className="text-sm text-gray-400">
          Manage Thingsboard rule chains
        </span>
      </h1>

      {error && <ErrorMessage message="Failed to load rule chains" />}

      <RuleChainList
        ruleChains={ruleChains}
        loading={isLoading}
        onRuleChainClick={handleRuleChainClick}
      />

      <CreateRuleChainSection />
    </div>
  );
}
