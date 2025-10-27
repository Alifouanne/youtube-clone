"use client";

// Import required modules for data fetching, navigation, error boundary, etc.
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../fallbacks/ErrorFallback";
import FilterCarousel from "@/components/FilterCarousel";
import { useRouter } from "next/navigation";

// Props interface for category selection, with an optional selected categoryId
interface CategoriesSectionProps {
  categoryId?: string;
}

/**
 * CategoriesSection: Top-level component that wraps the categories filter carousel
 * Handles loading and error UI states using Suspense and ErrorBoundary
 */
export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    // Suspense is used for showing a skeleton carousel while categories load
    <Suspense
      fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}} />}
    >
      {/* ErrorBoundary will catch any errors and display a fallback message */}
      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Error Loading Categories.."
            description="Please try to refresh the page because there is error happened while loading the categories"
          />
        }
      >
        {/* This is the main categories filter carousel, with loaded data */}
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * CategoriesSectionSuspense: Actual categories carousel logic.
 * Fetches categories using tRPC, builds filter options, and handles filter selection.
 */
const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  // Next.js navigation hook for client-side navigation
  const router = useRouter();

  // Fetch categories using the tRPC suspense query (array with data at [0])
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  // Map the categories to the format expected by FilterCarousel
  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  /**
   * onSelect: Handles when a category is selected in the filter carousel.
   * If a value is chosen, updates the url's categoryId query param and navigates client-side.
   * If 'All' is chosen (value is null), removes the query param.
   */
  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }
    router.push(url.toString());
  };

  // Render the carousel with the categories data and selection handler
  return <FilterCarousel value={categoryId} data={data} onSelect={onSelect} />;
};
