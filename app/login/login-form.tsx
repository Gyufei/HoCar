"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("登录失败，请检查用户名和密码。");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f7f7f8_100%)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LockKeyhole className="size-4" />
          </span>
          Personal Hub
        </div>

        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">登录你的个人管理台</CardTitle>
            <CardDescription>
              继续管理水电账单、个人服务和后续模块。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="请输入用户名"
                  inputMode="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="请输入密码"
                />
              </div>

              {error ? (
                <div
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "正在登录..." : "登录"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
