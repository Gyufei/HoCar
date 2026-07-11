import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.S_EE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: "S_EE_API_KEY 未配置" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "请选择一个文件" },
        { status: 400 }
      );
    }

    const body = new FormData();
    body.append("smfile", file);

    const res = await fetch("https://s.ee/api/v1/file/upload", {
      method: "POST",
      headers: { Authorization: apiKey },
      body,
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "上传请求失败，请检查网络" },
      { status: 500 }
    );
  }
}
