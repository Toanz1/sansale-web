import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { originalUrl, userId } = await req.json();

    if (!originalUrl) {
      return NextResponse.json({ error: "Thiếu link sản phẩm" }, { status: 400 });
    }

    const AFF_ID = process.env.NEXT_PUBLIC_ACCESSTRADE_AFF_ID;
    
    // Tách bỏ tham số rác đằng sau link sản phẩm
    const cleanUrl = originalUrl.split('?')[0];
    const encodedUrl = encodeURIComponent(cleanUrl);

    // Gắn mã affiliate của bạn + sub1 chứa ID của người dùng
    const affiliateUrl = `https://go.isclix.com/deep_link/${AFF_ID}/?url=${encodedUrl}&sub1=${userId || 'guest'}`;

    return NextResponse.json({ affiliateUrl });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi chuyển đổi link" }, { status: 500 });
  }
}