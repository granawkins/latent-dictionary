const origin = () => {
  return window.location.origin.split(":").slice(0, 2).join(":");
};

const env = () => {
  const _origin = origin();
  if (
    _origin.includes("localhost") ||
    _origin.includes("12") ||
    _origin.includes("192")
  ) {
    return "DEV";
  }
  return "PROD";
};

export const backendUrl = () => `${origin()}${env() === "DEV" ? ":5001" : ""}`;

export const fetchWithAuth = async (route, method = "GET", body) => {
  const jwt = localStorage.getItem("jwt") || "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };
  const options = {
    method,
    headers,
    body: JSON.stringify(body),
  };
  const res = await fetch(`${backendUrl()}${route}`, options);
  return await res.json();
};

export const debounce = (func, delay) => {
  let timerId;
  return (...args) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
