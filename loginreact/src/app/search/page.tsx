"use client";

import React, {
  useState,
  useRef,
  RefObject,
  useEffect,
  useCallback,
} from "react";
import Contents from "@/components/contents";
import MainHeader from "@/components/MainHeader";
import MainFooter from "@/components/MainFooter";
import useIntersectionObserver from "../utils/IntersectionObserver";
import useAuth from "@/hooks/useAuth";
import useRedirectOnAuth from "@/hooks/useRedirectOnAuth";

const SearchScreen = () => {
  useRedirectOnAuth();
  const { user: PlayerUser } = useAuth();
  const loaderRef = useRef<HTMLDivElement | null>(null); // Intersection Observer用
  const [newArrayLoading, setNewArrayLoading] = useState(true);

  // 最新のIdから配列を作る
  const [LastPost, setLastPost] = useState(3);
  useEffect(() => {
    const fetchPostId = async () => {
      try {
        // APIエンドポイントを呼び出して最新の投稿IDを取得
        const response = await fetch("/api/fetchLastpostId");

        if (response.ok) {
          const data = await response.json();
          setLastPost(data.lastPostId); // APIから取得したIDをsetLastPostにセット
        } else {
          setLastPost(0);
        }
      } catch {
        setLastPost(0);
      }
    };

    fetchPostId();
  }, []);

  const generatePostIds = (startId: number, count: number) => {
    return Array.from({ length: count }, (_, i) => startId - i);
  };

  const [searchedPosts, setSearchedPosts] = useState<number[]>([]);
  useEffect(() => {
    const newSearchArray = generatePostIds(LastPost, 5);
    setSearchedPosts(newSearchArray);
  }, [LastPost]);

  const fetchMorePosts = useCallback(() => {
    if (!searchedPosts || searchedPosts.length === 0) {
      return;
    }

    const lastId = searchedPosts[searchedPosts.length - 1];

    // lastIdが3より小さい場合は投稿を取得しない else文でこれ以上の投稿は見つかりませんとかやってもいいかも
    if (lastId >= 3) {
      const newPosts = generatePostIds(lastId - 1, 5); // さらに5件追加
      setSearchedPosts((prevPosts) => [...prevPosts, ...newPosts]);
    }
  }, [searchedPosts]);

  useEffect(() => {
    if (searchedPosts.length == 0) {
      fetchMorePosts();
    }
  }, [searchedPosts, fetchMorePosts]);

  // Intersection Observerを使ってスクロールを検知
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePosts();
        }
      },
      {
        threshold: 0.5, // 要素が50%見えるまで待つ
      }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) observer.observe(currentLoaderRef);

    return () => {
      if (currentLoaderRef) observer.unobserve(currentLoaderRef);
      observer.disconnect();
    };
  }, [fetchMorePosts]);

  // seemsのAPIを呼び出す関数
  const fetchIntersectionData = async (user_id: string, post_id: number) => {
    try {
      const response = await fetch("/api/seems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, post_id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
    } catch {}
  };
  const elementRefs = useRef<RefObject<HTMLDivElement>[]>(
    searchedPosts.map(() => React.createRef<HTMLDivElement>())
  );

  // IntersectionObserverフックを使用
  useIntersectionObserver(elementRefs.current, (postId) => {
    if (!PlayerUser || !PlayerUser.id) {
      return; // PlayerUserがnullまたはIDがない場合は何もしない
    }
    const userId = PlayerUser.id;

    // ここで直接APIを呼び出す
    fetchIntersectionData(userId, postId);
  });

  setTimeout(() => {
    setNewArrayLoading(false);
  }, 1200);

  return (
    <div className="w-full h-screen">
      <header className="fixed top-0 left-0 right-0 z-10">
        <MainHeader />
      </header>

      {/* ロード画面 */}
      {newArrayLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-24 h-24 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="pt-24 bg-yellow-50">
        {/* searchedPosts配列の各postIdに対してContentsコンポーネントを表示 */}
        {searchedPosts.map((postId, index) => (
          <Contents
            key={postId}
            postId={postId}
            ref={elementRefs.current[index]}
          />
        ))}
      </div>

      {/* スクロール検知用のローダー要素 */}

      <div ref={loaderRef} className="pb-32">
        Loading...
      </div>

      <footer className="fixed bottom-0 left-0 right-0">
        <MainFooter />
      </footer>
    </div>
  );
};

export default SearchScreen;
