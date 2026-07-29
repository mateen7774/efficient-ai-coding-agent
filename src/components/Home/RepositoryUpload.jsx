import ProcessingProgress from "./ProcessingProgress";
import AnalysisResultTable from "./AnalysisResultTable";

function RepositoryUpload({
  repository,
  loading,
  progress,
  progressMessage,
  processResult,
  processError,
  onFileChange,
  onRemove,
  onAnalyse,
}) {
  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-5 sm:px-8">
          <h2 className="text-xl font-semibold text-white">
            Repository Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Upload your repository as a ZIP file.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <label
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
              loading
                ? "cursor-not-allowed border-slate-700 opacity-50"
                : "cursor-pointer border-slate-600 bg-slate-900/40 hover:border-blue-500"
            }`}
          >
            <div className="mb-4 text-4xl">
              📁
            </div>

            <p className="text-lg font-semibold text-white">
              Select repository
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Only ZIP repositories are supported
            </p>

            <input
              type="file"
              accept=".zip,application/zip"
              onChange={onFileChange}
              disabled={loading}
              className="hidden"
            />
          </label>

          {repository && (
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div>
                <p className="font-medium text-white">
                  {repository.name}
                </p>

                <p className="mt-1 text-sm text-emerald-300">
                  Ready for analysis
                </p>
              </div>

              <button
                type="button"
                onClick={onRemove}
                disabled={loading}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onAnalyse}
            disabled={!repository || loading}
            className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading
              ? `Processing ${Math.round(progress)}%`
              : "Analyse Repository"}
          </button>

          {loading && (
            <ProcessingProgress
              percentage={progress}
              message={progressMessage}
            />
          )}

          {processError && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="font-semibold text-red-300">
                Processing failed
              </p>

              <p className="mt-2 text-sm text-red-200">
                {processError}
              </p>
            </div>
          )}
        </div>
      </section>

      {processResult && (
        <AnalysisResultTable
          result={processResult}
        />
      )}
    </>
  );
}

export default RepositoryUpload;