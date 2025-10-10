import MedplumConnection from './components/MedplumConnection';
import ThingsboardConnection from './components/ThingsboardConnection';

//import { Label } from "@/components/ui/label"

const Connections = () => {
  return (
    <div className="flex flex-row gap-2 h-full justify-center items-center">
      <ThingsboardConnection />
      <MedplumConnection />
    </div>
  );
};
export default Connections;
