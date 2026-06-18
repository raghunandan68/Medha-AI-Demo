import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sparkles,
  FileText,
  Brain,
  MessageSquare,
} from "lucide-react";

import supabase from "../utils/supabase";

export default function SignupPage() {

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSignup = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    if (password !== confirmPassword) {

      setError("Passwords do not match");

      setLoading(false);

      return;

    }

    const { error } = await supabase.auth.signUp({

      email,

      password,

      options: {

        data: {

          full_name: fullName,

        },

      },

    });

    if (error) {

      setError(error.message);

      setLoading(false);

      return;

    }

    navigate("/dashboard");

  };

  return (

    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">

      <div className="w-full max-w-6xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-[#111827]">

        {/* LEFT */}

        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-purple-900/40 via-slate-900 to-cyan-900/30">

          <div className="flex justify-center mb-0">

            <img

              src="/logo.png"

              alt="Logo"

              className="w-[600px] max-w-none h-auto"

            />

          </div>

          <h2 className="text-5xl font-bold text-white leading-tight -mt-6 mb-5">

            Learn Smarter,

            <br />

            Not Harder

          </h2>

          <p className="text-gray-400 text-lg mb-10">

            Upload documents and transform them into summaries,

            flashcards, quizzes and interactive AI chats.

          </p>

          <div className="space-y-5">

            <div className="flex items-center gap-4 text-gray-300">

              <Sparkles className="text-purple-400" />

              AI Summaries

            </div>

            <div className="flex items-center gap-4 text-gray-300">

              <FileText className="text-cyan-400" />

              Flashcards

            </div>

            <div className="flex items-center gap-4 text-gray-300">

              <Brain className="text-pink-400" />

              Smart Quizzes

            </div>

            <div className="flex items-center gap-4 text-gray-300">

              <MessageSquare className="text-green-400" />

              Document Chat

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center justify-center bg-[#111827] p-10">

          <form

            onSubmit={handleSignup}

            className="w-full max-w-md"

          >

            <div className="flex justify-center mb-3">

              <img

                src="/brain-book.png"

                alt="AI Learning"

                className="w-[400px] h-auto object-contain"

              />

            </div>

            <h1 className="text-4xl font-bold text-center text-white mb-2">

              Create Account

            </h1>

            <p className="text-center text-gray-400 mb-8">

              Start your AI learning journey

            </p>

            <input

              type="text"

              placeholder="Full Name"

              value={fullName}

              onChange={(e) => setFullName(e.target.value)}

              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white mb-5 outline-none focus:border-cyan-500"

              required

            />

            <input

              type="email"

              placeholder="Email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white mb-5 outline-none focus:border-cyan-500"

              required

            />

            <div className="relative mb-5">

              <input

                type={showPassword ? "text" : "password"}

                placeholder="Password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-500"

                required

              />

              <button

                type="button"

                onClick={() => setShowPassword(!showPassword)}

                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"

              >

                {

                  showPassword

                  ?

                  <EyeOff size={20} />

                  :

                  <Eye size={20} />

                }

              </button>

            </div>

            <div className="relative mb-5">

              <input

                type={showConfirmPassword ? "text" : "password"}

                placeholder="Confirm Password"

                value={confirmPassword}

                onChange={(e) => setConfirmPassword(e.target.value)}

                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-500"

                required

              />

              <button

                type="button"

                onClick={() =>

                  setShowConfirmPassword(!showConfirmPassword)

                }

                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"

              >

                {

                  showConfirmPassword

                  ?

                  <EyeOff size={20} />

                  :

                  <Eye size={20} />

                }

              </button>

            </div>

            {error && (

              <p className="text-red-400 mb-4 text-sm">

                {error}

              </p>

            )}

            <button

              disabled={loading}

              className="w-full p-4 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 transition"

            >

              {

                loading

                ?

                "Creating Account..."

                :

                "Sign Up"

              }

            </button>

            <p className="text-center text-gray-400 mt-8">

              Already have an account?

              {" "}

              <Link

                to="/"

                className="text-cyan-400 hover:underline"

              >

                Login

              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>

  );

}

