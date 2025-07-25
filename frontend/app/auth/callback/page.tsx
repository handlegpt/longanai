"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("access_token");
    const email = params.get("email");
    if (token && email) {
      // 设置 localStorage
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_email", email);
      
      // 立即触发自定义事件通知导航栏更新
      window.dispatchEvent(new CustomEvent('userLogin', { 
        detail: { token, email } 
      }));
      
      // 延迟跳转，确保状态更新完成
      setTimeout(() => {
        router.replace("/");
      }, 100);
    } else {
      // 如果没有 token，直接跳转到主页
      router.replace("/");
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">登录中，请稍候...</p>
      </div>
    </div>
  );
} 