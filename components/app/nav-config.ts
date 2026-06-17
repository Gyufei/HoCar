import {
  Droplets,
  GalleryHorizontalEnd,
  Home,
  Image,
  ReceiptText,
  Settings,
  Zap,
} from "lucide-react";

export const navGroups = [
  {
    label: "工作台",
    items: [{ title: "概览", href: "/", icon: Home }],
  },
  {
    label: "生活账单",
    items: [
      { title: "电费", href: "/bills/electricity", icon: Zap },
      { title: "水费", href: "/bills/water", icon: Droplets },
    ],
  },
  {
    label: "个人服务",
    items: [
      { title: "图床服务", href: "/images", icon: Image },
      { title: "个人 Demo", href: "/demos", icon: GalleryHorizontalEnd },
    ],
  },
  {
    label: "系统",
    items: [{ title: "系统设置", href: "/settings", icon: Settings }],
  },
] as const;

export const moduleCards = [
  {
    title: "生活账单",
    description: "管理水费、电费计算和历史记录。",
    href: "/bills/electricity",
    icon: ReceiptText,
  },
  {
    title: "图床服务",
    description: "预留你的个人图片托管入口。",
    href: "/images",
    icon: Image,
  },
  {
    title: "个人 Demo",
    description: "集中展示实验项目和小工具。",
    href: "/demos",
    icon: GalleryHorizontalEnd,
  },
  {
    title: "系统设置",
    description: "管理偏好、账号和平台配置。",
    href: "/settings",
    icon: Settings,
  },
] as const;
