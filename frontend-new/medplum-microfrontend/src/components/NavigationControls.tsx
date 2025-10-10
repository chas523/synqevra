import { useNavigate } from "@modern-js/runtime/router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NavigationControls = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <div className="relative top-4 left-4 z-10 bg-white rounded-full shadow-lg px-3 py-2 border w-20 ml-20 md:ml-0">
      <div className="flex items-center gap-2">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="Go Back"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Forward Button */}
        <button
          onClick={handleForward}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="Go Forward"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};
export default NavigationControls;