"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestSheet, submitRegistration, completeRegistration } from "@/services/register";
import { sha256Hex, setToken } from "@/services/api";
import type { API } from "@/types";

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — 个人信息
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [classtype, setClasstype] = useState("high-school");
  const [className, setClassName] = useState("");

  // Step 1 — 问卷数据
  const [sheetId, setSheetId] = useState("");
  const [questions, setQuestions] = useState<API.SheetQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  // Step 3 — 登录信息
  const [tempToken, setTempToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // 获取问卷
  async function handleRequestSheet() {
    if (!nickname.trim() || !realName.trim() || !className.trim()) {
      setError("请填写完整的个人信息");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await requestSheet();
      setSheetId(data.sheet_id);
      setQuestions(data.questions);
      setAnswers(data.questions.map(() => ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取问卷失败");
    } finally {
      setLoading(false);
    }
  }

  // 提交注册
  async function handleSubmitRegister(e: FormEvent) {
    e.preventDefault();
    if (answers.some((a) => !a.trim())) {
      setError("请回答所有题目");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await submitRegistration({
        nickname: nickname.trim(),
        real_name: realName.trim(),
        classtype,
        class: className.trim(),
        sheet_id: sheetId,
        answers: questions.map((q, i) => ({
          question_uuid: q.uuid,
          answer: answers[i].trim(),
        })),
      });
      setTempToken(data.temp_token);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册申请失败");
    } finally {
      setLoading(false);
    }
  }

  // 完成注册
  async function handleComplete(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("请填写用户名和密码");
      return;
    }
    if (username.trim().length < 3) {
      setError("用户名至少 3 个字符");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const hashed = await sha256Hex(await sha256Hex(password));
      const data = await completeRegistration(
        {
          username: username.trim(),
          password: hashed,
          email: email.trim() || null,
        },
        tempToken,
      );
      setToken(data.access_token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "完成注册失败");
    } finally {
      setLoading(false);
    }
  }

  // ——— Styles ———
  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-[#1d1d1f] outline-none transition-colors placeholder:text-gray-400 focus:border-[#007AFF]";
  const btnClass =
    "w-full rounded-xl bg-[#007AFF] py-3 text-center font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";
  const stepDot = (s: Step) =>
    `inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
      step >= s ? "bg-[#007AFF] text-white" : "bg-gray-200 text-gray-500"
    }`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          <span className={stepDot(1)}>1</span>
          <span className="h-px w-8 bg-gray-200" />
          <span className={stepDot(2)}>2</span>
          <span className="h-px w-8 bg-gray-200" />
          <span className={stepDot(3)}>3</span>
        </div>

        <h1 className="text-center text-2xl font-semibold text-[#1d1d1f]">
          注册
        </h1>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Step 1: 个人信息 + 获取问卷 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="真实姓名"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              className={inputClass}
            />
            <select
              value={classtype}
              onChange={(e) => setClasstype(e.target.value)}
              className={inputClass}
            >
              <option value="high-school">高中</option>
              <option value="university">大学</option>
            </select>
            <input
              type="text"
              placeholder="班级"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className={inputClass}
            />

            {questions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-500">问卷题目</p>
                {questions.map((q, i) => (
                  <div key={q.uuid}>
                    <label className="mb-1 block text-sm text-[#1d1d1f]">
                      {i + 1}. {q.question}
                    </label>
                    <input
                      type="text"
                      placeholder="你的答案"
                      value={answers[i]}
                      onChange={(e) => {
                        const next = [...answers];
                        next[i] = e.target.value;
                        setAnswers(next);
                      }}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            )}

            {questions.length === 0 ? (
              <button
                type="button"
                onClick={handleRequestSheet}
                disabled={loading}
                className={btnClass}
              >
                {loading ? "获取中..." : "获取注册问卷"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitRegister}
                disabled={loading}
                className={btnClass}
              >
                {loading ? "提交中..." : "提交注册"}
              </button>
            )}
          </div>
        )}

        {/* Step 3: 设置登录信息 */}
        {step === 3 && (
          <form onSubmit={handleComplete} className="space-y-4">
            <input
              type="text"
              placeholder="用户名（3-20 位字母数字下划线）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
            <input
              type="text"
              placeholder="邮箱（选填）"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={loading}
              className={btnClass}
            >
              {loading ? "完成中..." : "完成注册"}
            </button>
          </form>
        )}

        {/* 回登录 */}
        {step === 1 && (
          <p className="text-center text-sm text-gray-500">
            已有账号？
            <Link href="/login" className="ml-1 text-[#007AFF] hover:underline">
              去登录
            </Link>
          </p>
        )}
        {step === 3 && (
          <p className="text-center text-sm text-gray-500">
            <button
              type="button"
              onClick={() => { setError(""); setStep(1); }}
              className="text-[#007AFF] hover:underline"
            >
              重新填写
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
