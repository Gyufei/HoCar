 import { NextRequest, NextResponse } from "next/server";
 
 import { DEFAULT_CLIPBOARD_KEY } from "@/lib/clipboard/constants";
 import {
   buildClipboardResponse,
   clipboardSaveSchema,
 } from "@/lib/clipboard/payload";
 import { prisma } from "@/lib/prisma";
 
 function getUserIdFromEnv(): string {
   const userId = process.env.SINGLE_USER_ID;
   if (!userId) {
     throw new Error("SINGLE_USER_ID is not set");
   }
   return userId;
 }
 
 export async function GET() {
   try {
     const userId = getUserIdFromEnv();
 
     const entry = await prisma.clipboardEntry.findUnique({
       where: {
         uniq_clipboard_entries_user_key: {
           userId,
           key: DEFAULT_CLIPBOARD_KEY,
         },
       },
     });
 
     return NextResponse.json({
       success: true,
       data: buildClipboardResponse(entry),
     });
   } catch (error) {
     console.error(error);
     return NextResponse.json(
       {
         success: false,
         error: { code: "INTERNAL_ERROR", message: "服务器内部错误" },
       },
       { status: 500 },
     );
   }
 }
 
 export async function POST(req: NextRequest) {
   let json: unknown;
   try {
     json = await req.json();
   } catch {
     return NextResponse.json(
       {
         success: false,
         error: { code: "INVALID_JSON", message: "请求体必须是 JSON" },
       },
       { status: 400 },
     );
   }
 
   const parsed = clipboardSaveSchema.safeParse(json);
   if (!parsed.success) {
     return NextResponse.json(
       {
         success: false,
         error: { code: "INVALID_BODY", message: "内容过长，不能超过 10,000 个字符" },
       },
       { status: 400 },
     );
   }
 
   const { content } = parsed.data;
 
   try {
     const userId = getUserIdFromEnv();
 
     const entry = await prisma.clipboardEntry.upsert({
       where: {
         uniq_clipboard_entries_user_key: {
           userId,
           key: DEFAULT_CLIPBOARD_KEY,
         },
       },
       create: {
         userId,
         key: DEFAULT_CLIPBOARD_KEY,
         content,
       },
       update: { content },
     });
 
     return NextResponse.json({
       success: true,
       data: buildClipboardResponse(entry),
     });
   } catch (error) {
     console.error(error);
     return NextResponse.json(
       {
         success: false,
         error: { code: "INTERNAL_ERROR", message: "服务器内部错误" },
       },
       { status: 500 },
     );
   }
 }
