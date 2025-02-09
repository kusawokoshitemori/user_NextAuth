"use client";

import { useState } from "react";
import { supabase } from "@/services/supabaseClient";
import useAuth from "@/hooks/useAuth";
import { handleComment } from "@/lib/handleComment";

interface CommentPostProps {
  postId: number; // 投稿IDを受け取る
  setCommentNumber: React.Dispatch<React.SetStateAction<number>>;
  setComments: React.Dispatch<React.SetStateAction<{ content: string }[]>>;
}

const CommentPost = ({
  postId,
  setCommentNumber,
  setComments,
}: CommentPostProps) => {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const handleClick = async () => {
    if (!user) {
      alert("ユーザーがログインしていません");
      return;
    }
    const userId = user.id; // 仮のユーザーID

    if (content.trim() === "") {
      alert("内容を入力してください");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert([{ content, user_id: userId, post_id: postId }]);

      if (error) {
        alert("コメントの保存に失敗しました");
        return;
      }

      // postテーブルのcommentを1増やす & UIも1増やす
      handleComment(postId);
      setCommentNumber((prev) => prev + 1);
      alert("コメントが保存されました");

      // 仮のUI
      setComments((prevComments) => [...prevComments, { content: content }]);

      setContent(""); // フォームをリセット
    } catch {}
  };

  return (
    <div className="flex items-center justify-center">
      <input
        type="text"
        placeholder="入力してください"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-72 md:w-96 lg:w-128 py-4"
      />
      <button
        onClick={handleClick}
        className="text-white bg-blue-500 rounded-lg hover:bg-blue-700 whitespace-nowrap px-4 py-4 text-lg"
      >
        送信
      </button>
    </div>
  );
};

export default CommentPost;
