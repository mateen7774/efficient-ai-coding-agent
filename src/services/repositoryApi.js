const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function parseResponse(response) {
  const responseText = await response.text();

  let responseData = {};

  try {
    responseData = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseData = {
      message: responseText || "Invalid response received from server.",
    };
  }

  if (!response.ok) {
    throw new Error(
      responseData.message ||
        responseData.error ||
        `Request failed with status ${response.status}`
    );
  }

  return responseData;
}

export async function processRepository(
  repositoryFile,
  autoApplyRepair = true
) {
  const formData = new FormData();

  formData.append("repository", repositoryFile);
  formData.append("autoApplyRepair", String(autoApplyRepair));

  const response = await fetch(
    `${API_BASE_URL}/api/repositories/process`,
    {
      method: "POST",
      body: formData,
    }
  );

  return parseResponse(response);
}

export async function getProcessStatus({ jobId, statusUrl }) {
  let requestUrl;

  if (statusUrl) {
    requestUrl = statusUrl.startsWith("http")
      ? statusUrl
      : `${API_BASE_URL}${statusUrl.startsWith("/") ? "" : "/"}${statusUrl}`;
  } else {
    requestUrl = `${API_BASE_URL}/api/repositories/process-status/${jobId}`;
  }

  const response = await fetch(requestUrl);

  return parseResponse(response);
}