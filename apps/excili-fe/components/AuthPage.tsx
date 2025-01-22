export function AuthPage({ isSignin }: { isSignin: boolean }) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            {isSignin ? "Welcome Back!" : "Create Your Account"}
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            {isSignin
              ? "Please sign in to continue"
              : "Sign up to get started with us"}
          </p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {
                !isSignin && <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            }
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isSignin ? "Sign In" : "Sign Up"}
            </button>
          </form>
          <div className="text-sm text-center text-gray-600 mt-4">
            {isSignin ? (
              <p>
                Don't have an account?{" "}
                <a href="http://localhost:3000/signup" className="text-indigo-600 hover:underline">
                  Sign up
                </a>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <a href="http://localhost:3000/signin" className="text-indigo-600 hover:underline">
                  Sign in
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
