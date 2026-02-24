"use client";

export function SocialLoginButtons() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.161.140:5000";

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${backendUrl}/auth/microsoft`;
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleGoogleLogin}
        className="border px-4 py-2 rounded hover:bg-gray-100"
      >
        Continue with Google
      </button>
      <button
        onClick={handleMicrosoftLogin}
        className="border px-4 py-2 rounded hover:bg-gray-100"
      >
        Continue with Microsoft
      </button>
    </div>
  );
}
