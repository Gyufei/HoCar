import Link from "next/link";
import { ArrowUpRight, Clock, FolderKanban } from "lucide-react";

import { ModuleCard } from "@/components/app/module-card";
import { moduleCards } from "@/components/app/nav-config";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="概览"
        description="把水电账单、图床服务、个人 Demo 和后续小工具放进同一个轻量入口。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card hover>
          <CardHeader>
            <CardDescription>当前平台</CardDescription>
            <CardTitle className="text-xl">Personal Hub</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            先从生活账单开始，后续逐步接入你的个人服务。
          </CardContent>
        </Card>
        <Card hover>
          <CardHeader>
            <CardDescription>已接入模块</CardDescription>
            <CardTitle className="text-xl">生活账单</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            电费和水费计算、保存、历史记录仍然可用。
          </CardContent>
        </Card>
        <Card hover>
          <CardHeader>
            <CardDescription>预留模块</CardDescription>
            <CardTitle className="text-xl">图床 / Demo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            导航和页面已预留，后续可以直接填业务功能。
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-4 text-primary" />
          <h2 className="text-base font-semibold">常用模块</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((item) => (
            <ModuleCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <CardTitle>最近记录</CardTitle>
            </div>
            <CardDescription>
              第一阶段先保留入口，后续可以接入跨模块时间线。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              还没有统一的最近记录。你可以先从生活账单模块查看历史。
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>预留服务</CardTitle>
            <CardDescription>
              图床和个人 Demo 页面已经接入导航，等待具体功能。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-between"
              render={
                <Link href="/images">
                  查看图床入口
                  <ArrowUpRight className="size-4" />
                </Link>
              }
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
