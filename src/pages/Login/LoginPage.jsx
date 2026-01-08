import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError('Please enter both identifier and password.');
      return;
    }

    const fakeUser = {
      id: identifier,
      name: identifier,
    };
    localStorage.setItem('annotatorUser', JSON.stringify(fakeUser));

    navigate('/annotate');
  };

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-10">
        {/* Left side: branding / description */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30">
            Coral Bleaching Detection Phase 1
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
            Log in to the coral
            <span className="block text-emerald-400">bleaching annotation tool</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl">
            Each expert is assigned a unique set of coral patches to annotate
            across four classes: Living Coral (LC), Partially Bleached (PB),
            Dead Coral (DC), and Dead Coral with Algae (DCA).
          </p>
        </div>

        {/* Right side: login card */}
        <div className="flex-1 w-full max-w-md">
          <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-center">
              Expert login
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 text-center">
              Use your assigned identifier to continue annotating your patch set.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  className="block text-xs sm:text-sm font-medium text-left"
                  htmlFor="identifier"
                >
                  Username
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g. valles, diola, expert1"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="block text-xs sm:text-sm font-medium text-left"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-xs sm:text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-sm font-medium text-white transition-colors"
              >
                Log in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
