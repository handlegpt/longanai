"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("access_token");
    const email = params.get("email");
    if (token) {
      localStorage.setItem("auth_token", token);
      if (email) localStorage.setItem("user_email", email);
      router.replace("/"); // 自动跳转主页
    }
  }, [params, router]);

  return <div>登录中，请稍候...</div>;
} 