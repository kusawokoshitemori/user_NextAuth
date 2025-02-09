"use client"; // クライアントコンポーネントとしてマーク

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { supabase } from "../../services/supabaseClient";
import useAuth from "../../hooks/useAuth";
import MainHeader from "@/components/MainHeader";
import MainFooter from "@/components/MainFooter";
import useRedirectOnAuth from "@/hooks/useRedirectOnAuth";

//formの型定義
interface ProverbFormData {
  proverb: string;
  explanation: string;
}

const ProverbForm = () => {
  useRedirectOnAuth();
  const [textMessage, setTextMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProverbFormData>({
    defaultValues: {
      proverb: "",
      explanation: "",
    },
  });

  const { user } = useAuth();

  const onSubmit: SubmitHandler<ProverbFormData> = async (data) => {
    if (!user) {
      return;
    }
    const { error } = await supabase.from("posts").insert([
      {
        proverb: data.proverb,
        explanation: data.explanation,
        userid: user.id,
        good: 0,
        comment: 0,
      },
    ]);

    if (error) {
    } else {
      // 送信後の処理をここに追加
      await reset({ proverb: "", explanation: "" });
      setTextMessage("データが正常に送信されました！"); // メッセージの表示

      // メッセージを数秒後に消す（例: 3秒後）
      setTimeout(() => {
        setTextMessage("");
      }, 5000);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-400">
      <header className="fixed top-0 left-0 right-0 z-10">
        <MainHeader />
      </header>

      {/* ここから投稿画面 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-6 bg-gray-100 rounded-xl shadow-lg w-full max-w-sm mb-8 md:max-w-lg lg:max-w-2xl"
      >
        <div className="flex items-center justify-center flex-col">
          <div className="text-4xl pb-4">投稿画面</div>
          <textarea
            {...register("proverb", { required: true, maxLength: 30 })}
            placeholder="ことわざ (最大30文字)"
            className="w-4/5 p-2 border rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
          />
          {errors.proverb && <span>ことわざは必須です（最大30文字）</span>}
        </div>
        <div className="flex items-center justify-center flex-col">
          <textarea
            {...register("explanation", { required: true, maxLength: 50 })}
            placeholder="説明 (最大50文字)"
            className="w-4/5 p-2 border rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
          />
          {errors.explanation && <span>説明は必須です（最大50文字）</span>}
          <span>{textMessage}</span>
        </div>
        <div className="flex justify-end w-full">
          <button
            type="submit"
            className="px-8 py-4 bg-blue-500 text-white rounded-xl translate-x-[-64px]"
          >
            投稿
          </button>
        </div>
      </form>

      <footer className="fixed bottom-0 left-0 right-0">
        <MainFooter />
      </footer>
    </div>
  );
};

export default ProverbForm;
