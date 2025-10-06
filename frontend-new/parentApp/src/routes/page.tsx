import './index.css';
import { Navigate } from '@modern-js/runtime/router';

const Index = () => {
  // React Router redirect - najczystszy sposób
  return <Navigate to="/thingsboard" replace />;
};

export default Index;
