"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("请填写用户名和密码");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-sm"
      >
        <h1 className="text-center text-2xl font-semibold text-[#1d1d1f]">
          登录
        </h1>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="用户名或邮箱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#1d1d1f] outline-none transition-colors placeholder:text-gray-400 focus:border-[#007AFF]"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[#1d1d1f] outline-none transition-colors placeholder:text-gray-400 focus:border-[#007AFF]"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#007AFF] py-3 text-center font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>

        <p className="text-center text-sm text-gray-500">
          没有账号？
          <Link href="/register" className="ml-1 text-[#007AFF] hover:underline">
            去注册
          </Link>
        </p>
      </form>
    </div>
  );
}
