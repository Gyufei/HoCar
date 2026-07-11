import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const apiKey = process.env.S_EE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: "S_EE_API_KEY 未配置" },
      { status: 500 }
    );
  }

  const { hash } = await params;

  try {
    const res = await fetch(
      `https://s.ee/api/v1/file/delete/${hash}`,
      {
        headers: { Authorization: apiKey },
      }
    );

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "删除失败" },
      { status: 500 }
    );
  }
}
