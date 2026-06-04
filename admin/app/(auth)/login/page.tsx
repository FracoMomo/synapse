import LoginForm from '@/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-black">S</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Synapse Admin</h1>
          <p className="text-sm text-gray-500 mt-1">University dashboard</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sign in to your account</h2>
          {error === 'unauthorized' && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              You don't have admin access to this dashboard.
            </div>
          )}
          <LoginForm />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Synapse · Campus network platform</p>
      </div>
    </div>
  )
}
