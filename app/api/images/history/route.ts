import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.S_EE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: "S_EE_API_KEY 未配置" },
      { status: 500 }
    );
  }

  const page = request.nextUrl.searchParams.get("page") || "1";

  try {
    const res = await fetch(
      `https://s.ee/api/v1/files?page=${page}`,
      {
        headers: { Authorization: apiKey },
      }
    );

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "获取历史记录失败" },
      { status: 500 }
    );
  }
}
