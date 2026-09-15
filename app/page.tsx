import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-8 text-center">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
          J
        </span>
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Jobrig
        </span>
      </div>
      <p className="max-w-md text-muted-foreground">
        Instant on-site quoting, job dispatch, and automated review requests for
        field service businesses.
      </p>
      <div className="flex gap-3">
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="outline"
          className="h-11 px-6 text-base"
        >
          Log in
        </Button>
        <Button
          render={<Link href="/signup" />}
          nativeButton={false}
          className="h-11 px-6 text-base"
        >
          Get started
        </Button>
      </div>
    </div>
  );
}
