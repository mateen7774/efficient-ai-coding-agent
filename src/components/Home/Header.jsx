function Header() {
  return (
    <header className="mb-10 text-center">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-lg shadow-blue-600/30">
        🤖
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        AI Coding Agent
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
        Upload a software repository to detect programming bugs and generate
        intelligent code repair suggestions.
      </p>
    </header>
  );
}

export default Header;