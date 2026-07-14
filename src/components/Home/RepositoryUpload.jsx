function RepositoryUpload({ repository, onFileChange, onRemove }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-5 sm:px-8">
        <h2 className="text-xl font-semibold text-white">
          Repository Analysis
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Upload your software project as a ZIP file.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-600 bg-slate-900/40 px-6 py-12 text-center transition hover:border-blue-500 hover:bg-blue-500/5">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-2xl transition group-hover:scale-110">
            📁
          </div>

          <span className="text-lg font-semibold text-white">
            Select your repository
          </span>

          <span className="mt-2 text-sm text-slate-400">
            Click here to upload a ZIP file
          </span>

          <input
            type="file"
            accept=".zip"
            onChange={onFileChange}
            className="hidden"
          />
        </label>

        {repository && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-300">
                ✓
              </div>

              <div>
                <p className="font-medium text-white">{repository.name}</p>

                <p className="text-sm text-green-300">
                  Repository selected successfully
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Remove
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={!repository}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Analyse Repository
        </button>
      </div>
    </section>
  );
}

export default RepositoryUpload;