const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

function createApiUrl(path = "") {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function formatMilliseconds(milliseconds = 0) {
  const value = Number(milliseconds || 0);

  if (value < 1000) {
    return `${value} ms`;
  }

  return `${(value / 1000).toFixed(2)} seconds`;
}

function formatFileSize(bytes = 0) {
  const value = Number(bytes || 0);

  if (value < 1024) {
    return `${value} bytes`;
  }

  return `${(value / 1024).toFixed(2)} KB`;
}

function getFileName(path = "") {
  return path.split(/[\\/]/).pop() || path;
}

function parseTestOutput(stdout = "") {
  function findValue(label) {
    const expression = new RegExp(
      `# ${label}\\s+(\\d+)`
    );

    const match = stdout.match(expression);

    return Number(match?.[1] || 0);
  }

  return {
    total: findValue("tests"),
    passed: findValue("pass"),
    failed: findValue("fail"),
    skipped: findValue("skipped"),
  };
}

function StatusBadge({ success }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        success
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-red-500/15 text-red-300"
      }`}
    >
      {success ? "Passed" : "Failed"}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    critical:
      "bg-red-500/15 text-red-300",
    high:
      "bg-orange-500/15 text-orange-300",
    medium:
      "bg-amber-500/15 text-amber-300",
    low:
      "bg-blue-500/15 text-blue-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[severity] ||
        styles.low
      }`}
    >
      {severity || "unknown"}
    </span>
  );
}

function TableContainer({
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        {children}
      </div>
    </section>
  );
}

function AnalysisResultTable({ result }) {
  const data =
    result?.result ||
    result?.data ||
    result;

  const bugs =
    data?.analysis?.suspectedBugs || [];

  const changes =
    data?.repair?.changes ||
    data?.repairPlan?.changes ||
    [];

  const testsBefore = parseTestOutput(
    data?.testsBeforeRepair?.testExecution
      ?.stdout || ""
  );

  const testsAfter = parseTestOutput(
    data?.testsAfterRepair?.testExecution
      ?.stdout || ""
  );

  const confidence = Math.round(
    Number(
      data?.analysis?.overallConfidence ||
        data?.repairPlan?.confidence ||
        0
    ) * 100
  );

  const downloadUrl = createApiUrl(
    data?.repairedRepository?.downloadUrl
  );

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                Repair completed successfully
              </h2>

              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950">
                100%
              </span>
            </div>

            <p className="mt-2 text-emerald-200">
              {data?.message ||
                "Repository was repaired and verified by tests."}
            </p>
          </div>

          {downloadUrl && (
            <a
              href={downloadUrl}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Download repaired ZIP
            </a>
          )}
        </div>
      </div>

      <TableContainer
        title="Repository Overview"
        description="General repository and analysis information"
      >
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-4">
                Repository
              </th>
              <th className="px-5 py-4">
                Language
              </th>
              <th className="px-5 py-4">
                Files analysed
              </th>
              <th className="px-5 py-4">
                Bugs found
              </th>
              <th className="px-5 py-4">
                Files repaired
              </th>
              <th className="px-5 py-4">
                Confidence
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t border-white/10 text-sm text-slate-200">
              <td className="px-5 py-4 font-medium text-white">
                {data?.repository?.originalName ||
                  "Repository"}
              </td>

              <td className="px-5 py-4 capitalize">
                {data?.analysis?.primaryLanguage ||
                  "Unknown"}
              </td>

              <td className="px-5 py-4">
                {data?.analysis?.analysedFileCount ||
                  data?.repository?.scannedFiles ||
                  0}
              </td>

              <td className="px-5 py-4">
                {bugs.length}
              </td>

              <td className="px-5 py-4">
                {data?.repair?.changedFileCount ||
                  0}
              </td>

              <td className="px-5 py-4 text-emerald-300">
                {confidence}%
              </td>
            </tr>
          </tbody>
        </table>
      </TableContainer>

      <TableContainer
        title="Repository Details"
        description="Uploaded repository file information"
      >
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-4">
                Extracted files
              </th>
              <th className="px-5 py-4">
                Source files
              </th>
              <th className="px-5 py-4">
                Test files
              </th>
              <th className="px-5 py-4">
                Configuration
              </th>
              <th className="px-5 py-4">
                Documentation
              </th>
              <th className="px-5 py-4">
                ZIP size
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t border-white/10 text-sm text-slate-200">
              <td className="px-5 py-4">
                {data?.repository?.extractedFiles ||
                  0}
              </td>

              <td className="px-5 py-4">
                {data?.repository?.categoryCounts
                  ?.source || 0}
              </td>

              <td className="px-5 py-4">
                {data?.repository?.categoryCounts
                  ?.test || 0}
              </td>

              <td className="px-5 py-4">
                {data?.repository?.categoryCounts
                  ?.configuration || 0}
              </td>

              <td className="px-5 py-4">
                {data?.repository?.categoryCounts
                  ?.documentation || 0}
              </td>

              <td className="px-5 py-4">
                {formatFileSize(
                  data?.repository?.size
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </TableContainer>

      <TableContainer
        title={`Detected Bugs (${bugs.length})`}
        description="Issues detected by the AI bug localisation agent"
      >
        <table className="w-full min-w-[1200px] text-left">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-4">
                ID
              </th>
              <th className="px-5 py-4">
                Bug
              </th>
              <th className="px-5 py-4">
                Severity
              </th>
              <th className="px-5 py-4">
                File
              </th>
              <th className="px-5 py-4">
                Line
              </th>
              <th className="px-5 py-4">
                Root cause
              </th>
              <th className="px-5 py-4">
                Recommended action
              </th>
              <th className="px-5 py-4">
                Confidence
              </th>
            </tr>
          </thead>

          <tbody>
            {bugs.map((bug) => (
              <tr
                key={bug.id}
                className="border-t border-white/10 align-top text-sm text-slate-300"
              >
                <td className="px-5 py-4 font-semibold text-blue-300">
                  {bug.id}
                </td>

                <td className="max-w-xs px-5 py-4">
                  <p className="font-medium text-white">
                    {bug.title}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {bug.description}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <SeverityBadge
                    severity={bug.severity}
                  />
                </td>

                <td className="px-5 py-4 font-mono text-xs">
                  {getFileName(bug.filePath)}
                </td>

                <td className="px-5 py-4">
                  {bug.lineStart}
                </td>

                <td className="max-w-xs px-5 py-4">
                  {bug.rootCause}
                </td>

                <td className="max-w-xs px-5 py-4">
                  {bug.recommendedAction}
                </td>

                <td className="px-5 py-4">
                  {Math.round(
                    Number(bug.confidence || 0) *
                      100
                  )}
                  %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>

      <TableContainer
        title={`Applied Repairs (${changes.length})`}
        description="Code changes applied to the repository"
      >
        <table className="w-full min-w-[1300px] text-left">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-4">
                Change
              </th>
              <th className="px-5 py-4">
                File
              </th>
              <th className="px-5 py-4">
                Line
              </th>
              <th className="px-5 py-4">
                Original code
              </th>
              <th className="px-5 py-4">
                Replacement code
              </th>
              <th className="px-5 py-4">
                Explanation
              </th>
            </tr>
          </thead>

          <tbody>
            {changes.map((change, index) => (
              <tr
                key={`${change.filePath}-${index}`}
                className="border-t border-white/10 align-top text-sm text-slate-300"
              >
                <td className="px-5 py-4 font-semibold text-blue-300">
                  {change.changeNumber ||
                    index + 1}
                </td>

                <td className="px-5 py-4 font-mono text-xs">
                  {getFileName(change.filePath)}
                </td>

                <td className="px-5 py-4">
                  {change.startLine}
                </td>

                <td className="max-w-sm px-5 py-4">
                  <pre className="overflow-auto rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                    <code>
                      {change.originalCode}
                    </code>
                  </pre>
                </td>

                <td className="max-w-sm px-5 py-4">
                  <pre className="overflow-auto rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                    <code>
                      {change.replacementCode}
                    </code>
                  </pre>
                </td>

                <td className="max-w-xs px-5 py-4 leading-6">
                  {change.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>

      <TableContainer
        title="Test Results"
        description="Comparison before and after the automated repair"
      >
        <table className="w-full min-w-[800px] text-left">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-4">
                Stage
              </th>
              <th className="px-5 py-4">
                Status
              </th>
              <th className="px-5 py-4">
                Total tests
              </th>
              <th className="px-5 py-4">
                Passed
              </th>
              <th className="px-5 py-4">
                Failed
              </th>
              <th className="px-5 py-4">
                Command
              </th>
              <th className="px-5 py-4">
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t border-white/10 text-sm text-slate-300">
              <td className="px-5 py-4 font-medium text-white">
                Before repair
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  success={
                    data?.testsBeforeRepair
                      ?.testExecution?.success
                  }
                />
              </td>

              <td className="px-5 py-4">
                {testsBefore.total}
              </td>

              <td className="px-5 py-4 text-emerald-300">
                {testsBefore.passed}
              </td>

              <td className="px-5 py-4 text-red-300">
                {testsBefore.failed}
              </td>

              <td className="px-5 py-4 font-mono text-xs">
                {data?.testsBeforeRepair
                  ?.testExecution?.command || "-"}
              </td>

              <td className="px-5 py-4">
                {formatMilliseconds(
                  data?.testsBeforeRepair
                    ?.testExecution
                    ?.executionTimeMs
                )}
              </td>
            </tr>

            <tr className="border-t border-white/10 text-sm text-slate-300">
              <td className="px-5 py-4 font-medium text-white">
                After repair
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  success={
                    data?.testsAfterRepair
                      ?.testExecution?.success
                  }
                />
              </td>

              <td className="px-5 py-4">
                {testsAfter.total}
              </td>

              <td className="px-5 py-4 text-emerald-300">
                {testsAfter.passed}
              </td>

              <td className="px-5 py-4 text-red-300">
                {testsAfter.failed}
              </td>

              <td className="px-5 py-4 font-mono text-xs">
                {data?.testsAfterRepair
                  ?.testExecution?.command || "-"}
              </td>

              <td className="px-5 py-4">
                {formatMilliseconds(
                  data?.testsAfterRepair
                    ?.testExecution
                    ?.executionTimeMs
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </TableContainer>

      <TableContainer
        title="Performance Metrics"
        description="Pipeline execution time and AI token usage"
      >
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-4">
                Extraction
              </th>
              <th className="px-5 py-4">
                AI analysis
              </th>
              <th className="px-5 py-4">
                Bug localisation
              </th>
              <th className="px-5 py-4">
                Repair planning
              </th>
              <th className="px-5 py-4">
                Total tokens
              </th>
              <th className="px-5 py-4">
                Complete pipeline
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t border-white/10 text-sm text-slate-300">
              <td className="px-5 py-4">
                {formatMilliseconds(
                  data?.metrics?.extractionTimeMs
                )}
              </td>

              <td className="px-5 py-4">
                {formatMilliseconds(
                  data?.metrics?.analysisTimeMs
                )}
              </td>

              <td className="px-5 py-4">
                {formatMilliseconds(
                  data?.metrics?.bugLocalization
                    ?.executionTimeMs
                )}
              </td>

              <td className="px-5 py-4">
                {formatMilliseconds(
                  data?.metrics?.repairPlanning
                    ?.executionTimeMs
                )}
              </td>

              <td className="px-5 py-4">
                {(
                  Number(
                    data?.metrics?.bugLocalization
                      ?.totalTokens || 0
                  ) +
                  Number(
                    data?.metrics?.repairPlanning
                      ?.totalTokens || 0
                  )
                ).toLocaleString()}
              </td>

              <td className="px-5 py-4 font-semibold text-emerald-300">
                {formatMilliseconds(
                  data?.metrics
                    ?.completePipelineTimeMs
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </TableContainer>
    </section>
  );
}

export default AnalysisResultTable;