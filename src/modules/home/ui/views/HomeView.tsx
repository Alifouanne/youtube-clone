// Import the CategoriesSection component which displays the categories filter UI
import { CategoriesSection } from "../sections/CategoriesSection";

// Define props for HomeView, allowing an optional categoryId (used for filtering)
interface HomeViewProps {
  categoryId?: string;
}

// HomeView component: main wrapper for the home page UI
// Receives (optional) categoryId prop, which will be passed to CategoriesSection
const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    // Main layout wrapper with max-width, horizontal/vertical padding, and vertical gap
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Render the categories section with the selected categoryId */}
      <CategoriesSection categoryId={categoryId} />
    </div>
  );
};

// Export HomeView as the default export
export default HomeView;
