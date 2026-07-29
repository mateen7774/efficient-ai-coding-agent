import { useState } from "react";

import Header from "./Header";
import RepositoryUpload from "./RepositoryUpload";
import FeatureCard from "./FeatureCard";

import {
  getProcessStatus,
  processRepository,
} from "../../services/repositoryApi";

import {
  getPipelineProgress,
} from "../../utils/pipelineProgress";

const POLLING_INTERVAL_MS = 2000;
const MAXIMUM_POLLING_ATTEMPTS = 120;

const sleep = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

function getJobStatus(response = {}) {
  return String(
    response.status ||
      response.jobStatus ||
      response.job?.status ||
      ""
  ).toLowerCase();
}

function getJobStage(response = {}) {
  return String(
    response.stage ||
      response.currentStage ||
      response.job?.stage ||
      ""
  ).toLowerCase();
}

function getJobId(response = {}) {
  return (
    response.jobId ||
    response.id ||
    response.job?.id ||
    response.data?.jobId ||
    null
  );
}

function getStatusUrl(response = {}) {
  return (
    response.statusUrl ||
    response.job?.statusUrl ||
    response.data?.statusUrl ||
    null
  );
}

function getResultData(response = {}) {
  if (response.result) {
    return response.result;
  }

  if (response.data?.result) {
    return response.data.result;
  }

  if (response.job?.result) {
    return response.job.result;
  }

  if (
    response.data?.analysis ||
    response.data?.repair ||
    response.data?.testsAfterRepair
  ) {
    return response.data;
  }

  return response;
}

function isCompletedResponse(response = {}) {
  const status = getJobStatus(response);
  const stage = getJobStage(response);

  const message = String(
    response.message || ""
  ).toLowerCase();

  const completedStatuses = [
    "completed",
    "complete",
    "success",
    "succeeded",
  ];

  if (completedStatuses.includes(status)) {
    return true;
  }

  if (
    response.success === true &&
    message.includes("completed")
  ) {
    return true;
  }

  if (
    response.success === true &&
    stage === "tests-after-repair"
  ) {
    return true;
  }

  if (
    response.repairedRepository?.available === true ||
    response.result?.repairedRepository?.available === true ||
    response.data?.repairedRepository?.available === true ||
    response.job?.result?.repairedRepository?.available === true
  ) {
    return true;
  }

  return false;
}

function isFailedResponse(response = {}) {
  const status = getJobStatus(response);

  return [
    "failed",
    "failure",
    "error",
    "cancelled",
    "canceled",
  ].includes(status);
}

function getErrorMessage(response = {}) {
  return (
    response.error?.message ||
    response.error ||
    response.job?.error?.message ||
    response.job?.error ||
    response.data?.error?.message ||
    response.data?.error ||
    response.message ||
    "Repository processing failed."
  );
}

function Home() {
  const [repository, setRepository] =
    useState(null);

  const [fileInputKey, setFileInputKey] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [progressMessage, setProgressMessage] =
    useState("");

  const [processStatus, setProcessStatus] =
    useState("");

  const [processResult, setProcessResult] =
    useState(null);

  const [processError, setProcessError] =
    useState("");

  function resetProcessingState({
    clearResult = true,
  } = {}) {
    setLoading(false);
    setProgress(0);
    setProgressMessage("");
    setProcessStatus("");
    setProcessError("");

    if (clearResult) {
      setProcessResult(null);
    }
  }

  function clearRepositorySelection() {
    setRepository(null);

    /*
     * Input ko remount karta hai, jis se
     * browser ke andar selected ZIP bhi clear hoti hai.
     */
    setFileInputKey(
      (currentKey) => currentKey + 1
    );
  }

  function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    setProcessError("");
    setProcessResult(null);
    setProcessStatus("");
    setProgress(0);
    setProgressMessage("");

    if (!selectedFile) {
      setRepository(null);
      return;
    }

    const isZipFile = selectedFile.name
      .toLowerCase()
      .endsWith(".zip");

    if (!isZipFile) {
      clearRepositorySelection();

      setProcessError(
        "Please select a valid ZIP repository file."
      );

      return;
    }

    setRepository(selectedFile);
  }

  function handleRemove() {
    clearRepositorySelection();
    resetProcessingState();
  }

  function updateProgress(statusResponse) {
    const progressInformation =
      getPipelineProgress(statusResponse);

    const nextPercentage = Number(
      progressInformation?.percentage
    );

    if (Number.isFinite(nextPercentage)) {
      setProgress((currentProgress) =>
        Math.max(
          currentProgress,
          Math.min(99, nextPercentage)
        )
      );
    }

    const nextMessage =
      progressInformation?.label ||
      statusResponse.message ||
      statusResponse.stage ||
      "Processing repository...";

    setProgressMessage(nextMessage);

    setProcessStatus(
      statusResponse.message ||
        nextMessage
    );
  }

  async function pollRepositoryStatus({
    jobId,
    statusUrl,
  }) {
    for (
      let attempt = 1;
      attempt <= MAXIMUM_POLLING_ATTEMPTS;
      attempt += 1
    ) {
      const statusResponse =
        await getProcessStatus({
          jobId,
          statusUrl,
        });

      console.log(
        `Repository status attempt ${attempt}:`,
        statusResponse
      );

      if (isFailedResponse(statusResponse)) {
        throw new Error(
          getErrorMessage(statusResponse)
        );
      }

      updateProgress(statusResponse);

      if (isCompletedResponse(statusResponse)) {
        return getResultData(statusResponse);
      }

      await sleep(POLLING_INTERVAL_MS);
    }

    throw new Error(
      "Repository processing timed out. Please check the backend logs and try again."
    );
  }

  function handleSuccessfulResult(result) {
    setProgress(100);

    setProgressMessage(
      result.message ||
        "Repository repaired and verified successfully."
    );

    setProcessStatus(
      result.message ||
        "Repository processing completed."
    );

    setProcessResult(result);

    /*
     * Result table screen par rahegi,
     * lekin selected repository clear ho jayegi.
     */
    clearRepositorySelection();
  }

  async function handleAnalyseRepository() {
    if (!repository || loading) {
      if (!repository) {
        setProcessError(
          "Please select a repository ZIP file first."
        );
      }

      return;
    }

    try {
      setLoading(true);
      setProcessError("");
      setProcessResult(null);

      setProgress(5);

      setProgressMessage(
        "Preparing repository upload..."
      );

      setProcessStatus(
        "Preparing repository upload..."
      );

      const processResponse =
        await processRepository(
          repository,
          true
        );

      console.log(
        "Repository process started:",
        processResponse
      );

      if (processResponse.success === false) {
        throw new Error(
          getErrorMessage(processResponse)
        );
      }

      setProgress(10);

      setProgressMessage(
        "Repository uploaded successfully."
      );

      setProcessStatus(
        "Repository uploaded successfully."
      );

      const jobId =
        getJobId(processResponse);

      const statusUrl =
        getStatusUrl(processResponse);

      /*
       * Backend agar final result directly
       * return kar de to polling nahi hogi.
       */
      if (isCompletedResponse(processResponse)) {
        const directResult =
          getResultData(processResponse);

        handleSuccessfulResult(directResult);
        return;
      }

      /*
       * Job ID aur status URL dono missing hon,
       * lekin API ne data directly return kiya ho.
       */
      if (!jobId && !statusUrl) {
        const directResult =
          getResultData(processResponse);

        handleSuccessfulResult(directResult);
        return;
      }

      setProgress(15);

      setProgressMessage(
        "AI processing pipeline started..."
      );

      setProcessStatus(
        "AI processing pipeline started..."
      );

      const completedResult =
        await pollRepositoryStatus({
          jobId,
          statusUrl,
        });

      handleSuccessfulResult(
        completedResult
      );
    } catch (error) {
      console.error(
        "Repository processing error:",
        error
      );

      setProcessError(
        error instanceof Error
          ? error.message
          : "Unable to process the repository."
      );

      setProcessStatus("");
      setProgressMessage("");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Header />

        <RepositoryUpload
          repository={repository}
          fileInputKey={fileInputKey}
          loading={loading}
          progress={progress}
          progressMessage={progressMessage}
          processStatus={processStatus}
          processResult={processResult}
          processError={processError}
          onFileChange={handleFileChange}
          onRemove={handleRemove}
          onAnalyse={handleAnalyseRepository}
        />

        {!processResult && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🔍"
              title="Bug Detection"
              description="AI scans source code, tests, configuration files and runtime logs to identify software bugs."
            />

            <FeatureCard
              icon="🛠️"
              title="Automated Repair"
              description="Targeted code fixes are generated and safely applied to the uploaded repository."
            />

            <FeatureCard
              icon="✅"
              title="Test Verification"
              description="Tests run before and after repair to verify that the generated changes work correctly."
            />
          </section>
        )}
      </div>
    </main>
  );
}

export default Home;