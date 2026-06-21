"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/services/auth";
import { getToken } from "@/services/api";
import type { API } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<API.CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    setError("");
    try {
      await logout("");
    } catch {
      // logout 内部已 clearToken
    }
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col p-6">
      {/* Header */}
      <div className="pt-8">
        <h1 className="text-3xl font-semibold text-[#1d1d1f]">Hello World</h1>
        <p className="mt-1 text-sm text-gray-400">欢迎回来</p>
      </div>

      {/* User info card */}
      <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#007AFF] text-lg font-semibold text-white">
            {user.nickname.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-medium text-[#1d1d1f]">{user.nickname}</p>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="space-y-3 text-sm">
          <InfoRow label="真实姓名" value={user.real_name} />
          <InfoRow label="班级" value={`${user.class}（${classTypeLabel(user.class_type)}）`} />
          <InfoRow label="角色" value={roleLabel(user.user_role)} />
          <InfoRow label="积分" value={`${user.score}`} />
          <InfoRow label="注册时间" value={new Date(user.joined_at).toLocaleDateString("zh-CN")} />
          <InfoRow label="状态" value={statusLabel(user.current_status)} />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</div>
      )}

      {/* Logout button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-200 bg-white py-3 text-center font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-[#1d1d1f]">{value}</span>
    </div>
  );
}

function classTypeLabel(t: string): string {
  return t === "university" ? "大学" : "高中";
}

function roleLabel(r: string): string {
  const map: Record<string, string> = {
    superadmin: "超级管理员",
    songlist_editor: "歌单编辑者",
    "normal-user": "普通用户",
  };
  return map[r] || r;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    normal: "正常",
    disabled: "已禁用",
    banned: "已封禁",
    pending_deletion: "注销冷却中",
  };
  return map[s] || s;
}
