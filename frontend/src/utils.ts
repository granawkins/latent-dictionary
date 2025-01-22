type Environment = 'DEV' | 'PROD';

const origin = (): string => {
  return window.location.origin.split(":").slice(0, 2).join(":");
};

const env = (): Environment => {
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

export const backendUrl = (): string => `${origin()}${env() === "DEV" ? ":5001" : ""}`;

interface FetchOptions {
  method: string;
  headers: {
    'Content-Type': string;
    Authorization: string;
  };
  body?: string;
}

export const fetchWithAuth = async <T>(
  route: string,
  method: string = "GET",
  body?: unknown
): Promise<T> => {
  const jwt = localStorage.getItem("jwt") || "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };
  const options: FetchOptions = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };
  console.log(`${backendUrl()}${route}`, options);
  const res = await fetch(`${backendUrl()}${route}`, options);
  return res.json() as Promise<T>;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timerId: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
