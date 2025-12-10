// src/app/login/page.jsx
import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 flex flex-col to-white items-center justify-center">
      {/* <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2">Agri-Smart</h1>
        <p className="text-gray-600"></p>
      </div> */}
      <AuthForm type="login" className="mt-5 text-center mx-auto"/>
      <div className="mt-7 text-center text-gray-600">
      Forgot Password?
        <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
        </Link>
      </div>
    </div>
  );
}