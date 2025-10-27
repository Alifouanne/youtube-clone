import HomeView from "@/modules/home/ui/views/HomeView";
import { trpc, HydrateClient } from "@/trpc/server";
export const dynamic = "force-dynamic";
interface HomeProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}
export default async function Home({ searchParams }: HomeProps) {
  const { categoryId } = await searchParams;
  void trpc.categories.getMany.prefetch();
  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
}
