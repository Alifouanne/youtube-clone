import { SignIn } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

export default function Page() {
  return <SignIn appearance={{ baseTheme: [shadcn] }} />;
}
