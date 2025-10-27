import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

interface LoadingFallbackProps {
  title: string;
  description: string;
}
const LoadingFallback = ({ description, title }: LoadingFallbackProps) => {
  return (
    <Empty className="w-full  flex items-center justify-center">
      <EmptyHeader>
        <EmptyMedia>
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default LoadingFallback;
