import { Settings } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="系统设置"
        description="预留平台偏好、账号信息和模块配置入口。"
      />

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="size-5" />
          </div>
          <CardTitle>设置模块已预留</CardTitle>
          <CardDescription>
            后续可以在这里管理主题、账号、安全设置和模块开关。
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
