import { supabase } from "@/services/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { PlayerUser, OtherUserId } = await req.json();

    // データベースに挿入
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: PlayerUser, followee_id: OtherUserId });

    // エラーがあればレスポンスを返す
    if (error) {
      console.error("フォロー中にエラーが発生しました", error.message);
      return NextResponse.json(
        { error: "フォローに失敗しました" },
        { status: 500 }
      );
    }

    console.log("フォローができました");

    // 正常なレスポンスを返す
    return NextResponse.json(
      { success: true, message: "フォローが完了しました" },
      { status: 200 }
    );
  } catch (error) {
    console.error("予期しないエラーが発生しました", error);

    // エラーのレスポンスを返す
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
