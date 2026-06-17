import { GalleryHorizontalEnd } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DemosPage() {
  return (
    <>
      <PageHeader
        title="个人 Demo"
        description="集中放置你的实验项目、小工具和作品入口。"
      />

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GalleryHorizontalEnd className="size-5" />
          </div>
          <CardTitle>Demo 模块已预留</CardTitle>
          <CardDescription>
            后续可以在这里管理 demo 列表、访问地址、说明和状态。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            这个模块已预留，后续可以在这里接入具体功能。
          </div>
        </CardContent>
      </Card>
    </>
  );
}
