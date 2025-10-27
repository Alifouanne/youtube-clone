import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TriangleAlert } from "lucide-react";
interface ErrorFallbackProps {
  title: string;
  description: string;
}
const ErrorFallback = ({ description, title }: ErrorFallbackProps) => {
  return (
    <Empty className="w-full  flex items-center justify-center">
      <EmptyHeader>
        <EmptyMedia>
          <TriangleAlert className="text-red-500" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default ErrorFallback;
