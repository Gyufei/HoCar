import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function ModuleCard({
  title,
  description,
  href,
  icon: Icon,
}: ModuleCardProps) {
  return (
    <Link href={href} className="group block cursor-pointer">
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
        <CardHeader>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="leading-6">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
