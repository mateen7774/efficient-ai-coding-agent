const steps = [
  {
    name: "Upload",
    minimum: 10,
  },
  {
    name: "Scan",
    minimum: 30,
  },
  {
    name: "AI Analysis",
    minimum: 55,
  },
  {
    name: "Repair",
    minimum: 85,
  },
  {
    name: "Tests",
    minimum: 95,
  },
];

function ProcessingProgress({
  percentage = 0,
  message = "Processing repository...",
}) {
  const safePercentage = Math.min(
    100,
    Math.max(0, Math.round(percentage))
  );

  return (
    <section className="mt-6 rounded-2xl border border-blue-500/20 bg-slate-900/80 p-5 shadow-xl">
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="font-semibold text-white">
            Repository processing
          </p>

          <p className="mt-1 text-sm text-blue-300">
            {message}
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-blue-500 bg-blue-500/10">
          <span className="text-lg font-bold text-white">
            {safePercentage}%
          </span>
        </div>
      </div>

      <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{
            width: `${safePercentage}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2">
        {steps.map((step) => {
          const completed =
            safePercentage >= step.minimum;

          return (
            <div
              key={step.name}
              className="text-center"
            >
              <div
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  completed
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {completed ? "✓" : "•"}
              </div>

              <p
                className={`mt-2 text-xs ${
                  completed
                    ? "text-emerald-300"
                    : "text-slate-500"
                }`}
              >
                {step.name}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProcessingProgress;