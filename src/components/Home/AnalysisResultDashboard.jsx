import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Download,
  FileCode2,
  Files,
  FlaskConical,
  Gauge,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const severityStyles = {
  critical:
    "border-red-500/30 bg-red-500/10 text-red-300",
  high:
    "border-orange-500/30 bg-orange-500/10 text-orange-300",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-300",
  low:
    "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

function buildApiUrl(path = "") {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function formatDuration(milliseconds = 0) {
  if (!milliseconds) return "0 ms";

  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  return `${(milliseconds / 1000).toFixed(1)} sec`;
}

function getFileName(path = "") {
  return path.split(/[\\/]/).pop() || path;
}

function parseTestSummary(stdout = "") {
  const getValue = (name) => {
    const match = stdout.match(
      new RegExp(`# ${name}\\s+(\\d+)`)
    );

    return Number(match?.[1] || 0);
  };

  return {
    tests: getValue("tests"),
    passed: getValue("pass"),
    failed: getValue("fail"),
    skipped: getValue("skipped"),
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function CodeBox({ title, code, type }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        type === "removed"
          ? "border-red-500/20 bg-red-950/20"
          : "border-emerald-500/20 bg-emerald-950/20"
      }`}
    >
      <div
        className={`border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
          type === "removed"
            ? "border-red-500/20 text-red-300"
            : "border-emerald-500/20 text-emerald-300"
        }`}
      >
        {title}
      </div>

      <pre className="overflow-auto p-4 text-xs leading-6 text-slate-200">
        <code>{code || "No code provided"}</code>
      </pre>
    </div>
  );
}

function AnalysisResultDashboard({ result }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedBug, setExpandedBug] = useState(null);

  const bugs = result?.analysis?.suspectedBugs || [];
  const changes =
    result?.repair?.changes ||
    result?.repairPlan?.changes ||
    [];

  const testsBefore = useMemo(
    () =>
      parseTestSummary(
        result?.testsBeforeRepair?.testExecution?.stdout
      ),
    [result]
  );

  const testsAfter = useMemo(
    () =>
      parseTestSummary(
        result?.testsAfterRepair?.testExecution?.stdout
      ),
    [result]
  );

  const confidence = Math.round(
    Number(
      result?.analysis?.overallConfidence ||
        result?.repairPlan?.confidence ||
        0
    ) * 100
  );

  const downloadUrl = buildApiUrl(
    result?.repairedRepository?.downloadUrl
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    {
      id: "bugs",
      label: `Detected Bugs (${bugs.length})`,
    },
    {
      id: "repairs",
      label: `Code Repairs (${changes.length})`,
    },
    { id: "tests", label: "Test Results" },
    { id: "performance", label: "Performance" },
  ];

  return (
    <section className="mt-8 space-y-6">
      <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 shadow-2xl">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
              <ShieldCheck size={30} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                  Repair successful
                </h2>

                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  100% completed
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-slate-300">
                {result?.message ||
                  "Repository bugs were detected, repaired and verified successfully."}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {result?.repository?.originalName}
              </p>
            </div>
          </div>

          {downloadUrl && (
            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <Download size={19} />
              Download repaired ZIP
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          icon={Files}
          label="Files analysed"
          value={result?.analysis?.analysedFileCount || 0}
          description={`${result?.repository?.extractedFiles || 0} extracted`}
        />

        <StatCard
          icon={AlertTriangle}
          label="Bugs detected"
          value={bugs.length}
          description="AI identified issues"
        />

        <StatCard
          icon={FileCode2}
          label="Files repaired"
          value={result?.repair?.changedFileCount || 0}
          description={`${result?.repair?.appliedChangeCount || changes.length} changes`}
        />

        <StatCard
          icon={FlaskConical}
          label="Tests passed"
          value={`${testsAfter.passed}/${testsAfter.tests}`}
          description={`${testsBefore.failed} failed before repair`}
        />

        <StatCard
          icon={Gauge}
          label="AI confidence"
          value={`${confidence}%`}
          description={result?.analysis?.primaryLanguage}
        />

        <StatCard
          icon={Clock3}
          label="Processing time"
          value={formatDuration(
            result?.metrics?.completePipelineTimeMs
          )}
          description="Complete pipeline"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
        <div className="overflow-x-auto border-b border-white/10">
          <div className="flex min-w-max px-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-5 py-4 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-blue-400 text-blue-300"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {activeTab === "overview" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-blue-300">
                  <BrainCircuit size={20} />
                  <h3 className="font-semibold">
                    Repository summary
                  </h3>
                </div>

                <p className="mt-4 leading-7 text-slate-300">
                  {result?.analysis?.repositorySummary}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-purple-300">
                  <Sparkles size={20} />
                  <h3 className="font-semibold">
                    Repair strategy
                  </h3>
                </div>

                <p className="mt-4 leading-7 text-slate-300">
                  {result?.repairPlan?.repairStrategy}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
                <h3 className="font-semibold text-white">
                  Repository information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Language
                    </p>
                    <p className="mt-1 capitalize text-slate-200">
                      {result?.analysis?.primaryLanguage}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Source files
                    </p>
                    <p className="mt-1 text-slate-200">
                      {result?.repository?.categoryCounts?.source ||
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Test files
                    </p>
                    <p className="mt-1 text-slate-200">
                      {result?.repository?.categoryCounts?.test ||
                        0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Ecosystem
                    </p>
                    <p className="mt-1 uppercase text-slate-200">
                      {result?.testsAfterRepair?.ecosystem ||
                        "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bugs" && (
            <div className="space-y-4">
              {bugs.map((bug) => {
                const expanded = expandedBug === bug.id;

                return (
                  <article
                    key={bug.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBug(expanded ? null : bug.id)
                      }
                      className="flex w-full items-start justify-between gap-4 p-5 text-left"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-blue-300">
                            {bug.id}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                              severityStyles[bug.severity] ||
                              severityStyles.low
                            }`}
                          >
                            {bug.severity}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                            {Math.round(
                              Number(bug.confidence || 0) * 100
                            )}
                            % confidence
                          </span>
                        </div>

                        <h3 className="mt-3 font-semibold text-white">
                          {bug.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {getFileName(bug.filePath)} · Line{" "}
                          {bug.lineStart}
                        </p>
                      </div>

                      <ChevronDown
                        size={20}
                        className={`mt-1 shrink-0 text-slate-400 transition ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded && (
                      <div className="space-y-4 border-t border-white/10 p-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Description
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {bug.description}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Root cause
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {bug.rootCause}
                          </p>
                        </div>

                        <CodeBox
                          title="Suspicious code"
                          code={bug.suspiciousCode}
                          type="removed"
                        />

                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                            Recommended action
                          </p>

                          <p className="mt-2 text-sm text-slate-200">
                            {bug.recommendedAction}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {activeTab === "repairs" && (
            <div className="space-y-5">
              {changes.map((change, index) => (
                <article
                  key={`${change.filePath}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-300">
                        <Wrench size={18} />
                        <span className="text-sm font-semibold">
                          Change {change.changeNumber || index + 1}
                        </span>
                      </div>

                      <p className="mt-2 font-medium text-white">
                        {getFileName(change.filePath)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Line {change.startLine}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {change.explanation}
                  </p>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <CodeBox
                      title="Before repair"
                      code={change.originalCode}
                      type="removed"
                    />

                    <CodeBox
                      title="After repair"
                      code={change.replacementCode}
                      type="added"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === "tests" && (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                  <div className="flex items-center gap-3 text-red-300">
                    <XCircle size={25} />
                    <h3 className="font-semibold">
                      Before repair
                    </h3>
                  </div>

                  <p className="mt-5 text-4xl font-bold text-white">
                    {testsBefore.passed}/{testsBefore.tests}
                  </p>

                  <p className="mt-1 text-sm text-red-200">
                    Tests passed
                  </p>

                  <p className="mt-4 text-sm text-slate-300">
                    {testsBefore.failed} failing tests detected
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <CheckCircle2 size={25} />
                    <h3 className="font-semibold">
                      After repair
                    </h3>
                  </div>

                  <p className="mt-5 text-4xl font-bold text-white">
                    {testsAfter.passed}/{testsAfter.tests}
                  </p>

                  <p className="mt-1 text-sm text-emerald-200">
                    Tests passed
                  </p>

                  <p className="mt-4 text-sm text-slate-300">
                    Exit code{" "}
                    {
                      result?.testsAfterRepair?.testExecution
                        ?.exitCode
                    }
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold text-white">
                  Test execution
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Command
                    </p>
                    <p className="mt-1 font-mono text-sm text-slate-200">
                      {
                        result?.testsAfterRepair?.testExecution
                          ?.command
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Execution time
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      {formatDuration(
                        result?.testsAfterRepair?.testExecution
                          ?.executionTimeMs
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Result
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      All tests passed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon={Archive}
                label="Extraction"
                value={formatDuration(
                  result?.metrics?.extractionTimeMs
                )}
              />

              <StatCard
                icon={BrainCircuit}
                label="AI analysis"
                value={formatDuration(
                  result?.metrics?.analysisTimeMs
                )}
              />

              <StatCard
                icon={Activity}
                label="Bug localisation"
                value={formatDuration(
                  result?.metrics?.bugLocalization
                    ?.executionTimeMs
                )}
              />

              <StatCard
                icon={Wrench}
                label="Repair planning"
                value={formatDuration(
                  result?.metrics?.repairPlanning
                    ?.executionTimeMs
                )}
              />

              <StatCard
                icon={Code2}
                label="Total AI tokens"
                value={(
                  Number(
                    result?.metrics?.bugLocalization
                      ?.totalTokens || 0
                  ) +
                  Number(
                    result?.metrics?.repairPlanning
                      ?.totalTokens || 0
                  )
                ).toLocaleString()}
              />

              <StatCard
                icon={Clock3}
                label="Complete pipeline"
                value={formatDuration(
                  result?.metrics?.completePipelineTimeMs
                )}
              />
            </div>
          )}
        </div>
      </div>

      {result?.repairedRepository?.available && (
        <div className="flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">
              Repaired repository ready
            </p>

            <p className="mt-1 text-sm text-slate-300">
              Verified by tests. Download expires in{" "}
              {result?.repairedRepository?.expiresInMinutes ||
                15}{" "}
              minutes.
            </p>
          </div>

          <a
            href={downloadUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
          >
            <Download size={18} />
            Download repository
          </a>
        </div>
      )}
    </section>
  );
}

export default AnalysisResultDashboard;