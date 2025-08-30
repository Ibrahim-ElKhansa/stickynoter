import { login, signup } from './actions'
import { Button } from '@/components/atoms/Button'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-2 pt-4">
            <Button formAction={login} className="flex-1">
              Log in
            </Button>
            <Button formAction={signup} variant="outline" className="flex-1">
              Sign up
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm">
              Or continue with
            </p>
            <div className="mt-2">
              <Button variant="outline" className="w-full">
                Google
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
