"use client";

import Image from "next/image";
import { useEffect, useState, forwardRef } from "react";
import { supabase } from "@/services/supabaseClient";
import CommentSection from "./comment/CommentSection";
import useAuth from "@/hooks/useAuth";
import { handleLike } from "@/lib/handleLike";
import { useRouter } from "next/navigation";
import Avatar from "./Avataer";

interface Post {
  id: number;
  proverb: string;
  explanation: string | null;
  created_at: string;
  userid: string;
  good: number;
  comment: number;
}
interface User {
  id: string; // ユーザーのID
  name: string; // 名前
}

const Contents = forwardRef<HTMLDivElement, { postId: number }>(
  ({ postId }, ref) => {
    const { user: PlayerUser } = useAuth();
    const [isOpenDetail, setIsOpenDetail] = useState(false);
    const [isOpenComment, setIsOpenComment] = useState(false);
    const [post, setPost] = useState<Post | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [comments, setComments] = useState<{ content: string }[]>([]);
    const [isLiked, setIsLiked] = useState<boolean | null>(null);
    const [likeNumber, setLikeNumber] = useState(0);
    const [commentNumber, setCommentNumber] = useState(0);

    const ClickArrow = () => {
      setIsOpenDetail(!isOpenDetail);
    };
    const ClickComment = () => {
      setIsOpenComment(!isOpenComment);
    };

    // クリックしたら/profile/${user.id}に移動する
    const router = useRouter();
    const handleClick = () => {
      if (!post) return;
      if (!PlayerUser) return;
      if (!post.userid) return;
      if (PlayerUser.id && post.userid == PlayerUser.id) {
        router.push("/profile");
        return;
      }
      router.push(`/profile/${post.userid}`);
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          // 特定の投稿を取得
          const { data: postData, error: postError } = await supabase
            .from("posts")
            .select("*")
            .eq("id", postId)
            .maybeSingle();

          if (postError) {
            return;
          }

          setPost(postData as Post);

          if (!postData) {
            return; // useridが無効な場合は処理を終了
          }

          // ユーザー名を取得
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name")
            .eq("id", postData.userid)
            .maybeSingle();

          if (userError) {
          } else {
            setUser(userData as User);
          }

          // コメントを取得
          const { data: commentsData, error: commentsError } = await supabase
            .from("comments")
            .select("content")
            .eq("post_id", postId);

          if (commentsError) {
            return;
          }

          setComments(commentsData);
        } catch {}
      };

      fetchData();
    }, [postId]);

    // ここにAPI送るやつ(isLikedState)
    useEffect(() => {
      if (!postId || !PlayerUser) return;
      const getIslikedState = async () => {
        try {
          const response = await fetch(
            `/api/getLikeState/${PlayerUser.id}/${postId}`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setIsLiked(data.isLiked);
        } catch {}
      };

      getIslikedState();
    }, [postId, PlayerUser]);

    useEffect(() => {
      if (!post) return;
      setLikeNumber(post.good);
      setCommentNumber(post.comment);
    }, [post]);

    if (!post) {
      return <p>Loading...</p>;
    }

    // イイねボタンを押したときの処理
    const handleLikeClick = () => {
      if (PlayerUser?.id) {
        if (isLiked) return;
        // API呼び出し
        handleLike(PlayerUser.id, post.id);

        setIsLiked(true);
        // いいねを1増やしたように見せる
        setLikeNumber((prev) => prev + 1);
      }
    };
    if (!user) return;

    return (
      <div
        ref={ref}
        id={`post-${postId}`}
        className="w-5/6 mx-auto my-2 border-4 rounded-lg border-blue-300"
      >
        <div
          className="w-full flex items-center border-b-4 border-green-500 cursor-pointer"
          onClick={handleClick}
        >
          <Avatar userId={post.userid} />
          <p className="whitespace-nowrap text-lg">
            {user ? user.name : "名前を取得中..."}
          </p>
        </div>
        <p className="text-2xl sm:text-4xl flex items-center justify-center mt-2">
          {post.proverb}
        </p>
        <div
          className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
            isOpenDetail ? "max-h-96" : "max-h-0"
          } ml-4 sm:ml-8 md:ml-12 lg:ml-16 xl:ml-20`}
        >
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl">
            {post.explanation || "詳細はありません。"}
          </p>
        </div>
        <div className="w-5/6 flex justify-between items-center mx-auto">
          <div className="flex items-center">
            <Image
              src={isLiked ? "/heart_red.png" : "/heart_white.png"}
              alt="ハートの画像"
              width={40}
              height={40}
              className={`rounded-full mr-4 ml-1 m-1 w-auto h-auto`}
              onClick={handleLikeClick}
            />
            <p className="text-lg">{likeNumber}</p>
          </div>
          <div className="flex items-center">
            <Image
              src="/comment_white.png"
              alt="コメントの画像"
              width={50}
              height={50}
              className="rounded-full mr-4 ml-1 m-1  w-auto h-auto"
              onClick={ClickComment}
            />
            <p className="text-lg">{commentNumber}</p>
          </div>
          <div>
            <Image
              src="/right_arrow.png"
              alt="▷の画像"
              width={30}
              height={30}
              className={`rounded-full mr-4 ml-1 m-1 cursor-pointer transition-transform duration-500 ease-in-out ${
                isOpenDetail ? "rotate-90" : "rotate-0"
              }`}
              onClick={ClickArrow}
            />
          </div>
        </div>
        {/* コメントを出す */}
        {isOpenComment && (
          <CommentSection
            comments={comments}
            setComments={setComments}
            postId={postId}
            setCommentNumber={setCommentNumber}
          />
        )}
      </div>
    );
  }
);

Contents.displayName = "Contents";

export default Contents;
