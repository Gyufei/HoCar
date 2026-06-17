import { Image as ImageIcon } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ImagesPage() {
  return (
    <>
      <PageHeader
        title="图床服务"
        description="预留你的个人图片托管、上传和外链管理入口。"
      />

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ImageIcon className="size-5" />
          </div>
          <CardTitle>图床模块已预留</CardTitle>
          <CardDescription>
            后续可以在这里接入上传、图片列表、外链复制和存储配置。
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
