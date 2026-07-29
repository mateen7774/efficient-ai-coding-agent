const stageDefinitions = [
  {
    names: ["queued", "pending"],
    percentage: 5,
    label: "Preparing analysis",
  },
  {
    names: ["upload", "uploaded", "repository-upload"],
    percentage: 10,
    label: "Repository uploaded",
  },
  {
    names: ["extract", "extraction", "repository-extraction"],
    percentage: 20,
    label: "Extracting repository",
  },
  {
    names: ["scan", "scanning", "repository-scan"],
    percentage: 30,
    label: "Scanning project files",
  },
  {
    names: ["context", "context-building"],
    percentage: 40,
    label: "Building AI context",
  },
  {
    names: ["analysis", "bug-localization", "bug-detection"],
    percentage: 55,
    label: "Detecting software bugs",
  },
  {
    names: ["repair-plan", "repair-planning"],
    percentage: 68,
    label: "Creating repair plan",
  },
  {
    names: ["tests-before-repair", "test-before-repair"],
    percentage: 75,
    label: "Running initial tests",
  },
  {
    names: ["repair", "applying-repair", "repair-application"],
    percentage: 85,
    label: "Applying code repairs",
  },
  {
    names: ["tests-after-repair", "test-after-repair"],
    percentage: 95,
    label: "Verifying repaired code",
  },
  {
    names: ["packaging", "repository-packaging"],
    percentage: 98,
    label: "Preparing download",
  },
  {
    names: ["completed", "complete", "success", "succeeded"],
    percentage: 100,
    label: "Processing completed",
  },
];

export function getPipelineProgress(response = {}) {
  const explicitProgress = Number(
    response.progress ??
      response.percentage ??
      response.job?.progress
  );

  if (
    Number.isFinite(explicitProgress) &&
    explicitProgress >= 0 &&
    explicitProgress <= 100
  ) {
    return {
      percentage: explicitProgress,
      label:
        response.message ||
        response.stage ||
        "Processing repository",
    };
  }

  const status = String(
    response.status ||
      response.jobStatus ||
      response.job?.status ||
      ""
  ).toLowerCase();

  const stage = String(
    response.stage ||
      response.currentStage ||
      response.job?.stage ||
      status
  ).toLowerCase();

  if (
    response.success === true &&
    response.message?.toLowerCase().includes("completed")
  ) {
    return {
      percentage: 100,
      label: response.message,
    };
  }

  const matchedStage = stageDefinitions.find(({ names }) =>
    names.some(
      (name) =>
        stage === name ||
        stage.includes(name) ||
        status === name
    )
  );

  return (
    matchedStage || {
      percentage: 8,
      label:
        response.message ||
        response.stage ||
        "Processing repository",
    }
  );
}