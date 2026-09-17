'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchProfile(user.id);
    };
    checkUser();
  }, []);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  const handleAuth = async (isSignUp) => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Đăng ký thành công! Vui lòng kiểm tra email kích hoạt.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else {
        setUser(data.user);
        fetchProfile(data.user.id);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const handleConvert = async () => {
    if (!inputUrl) return alert('Vui lòng dán link sản phẩm!');
    setLoading(true);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: inputUrl,
          userId: user ? user.id : 'guest'
        })
      });
      const data = await res.json();
      setAffiliateLink(data.affiliateUrl);
    } catch (e) {
      alert('Có lỗi xảy ra khi tạo link!');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h1 className="text-xl font-bold text-red-600">Săn Sale Hoàn Tiền</h1>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Ví: <b className="text-green-600">{Number(profile?.balance || 0).toLocaleString()}đ</b></span>
            <button onClick={handleLogout} className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-lg">Đăng xuất</button>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Chưa đăng nhập</span>
        )}
      </div>

      {!user && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <h2 className="font-semibold mb-3">Đăng nhập để nhận hoàn tiền vào tài khoản</h2>
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Email của bạn" 
              className="border p-2 rounded-lg text-sm outline-none focus:border-red-500"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              className="border p-2 rounded-lg text-sm outline-none focus:border-red-500"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => handleAuth(false)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">Đăng nhập</button>
              <button onClick={() => handleAuth(true)} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-medium">Đăng ký</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-2">Tạo Link Mua Hàng Hoàn Tiền</h2>
        <p className="text-sm text-slate-500 mb-4">Dán link sản phẩm Shopee/Lazada vào đây trước khi mua để được tích lũy tiền hoàn.</p>
        
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="Dán link sản phẩm (vd: https://shopee.vn/product/...)" 
            className="w-full border p-3 rounded-lg text-sm outline-none focus:border-red-500"
            value={inputUrl} onChange={(e) => setInputUrl(e.target.value)}
          />
          <button 
            onClick={handleConvert}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg text-sm transition"
          >
            {loading ? 'Đang xử lý...' : 'Lấy Link Mua Có Hoàn Tiền'}
          </button>
        </div>

        {affiliateLink && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-sm text-slate-700 mb-2 font-medium">Link hoàn tiền của bạn đã sẵn sàng:</p>
            <a 
              href={affiliateLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow hover:bg-red-700"
            >
              Bấm Vào Đây Để Mua Hàng Ngay
            </a>
          </div>
        )}
      </div>
    </main>
  );
}