import React from "react";

type Environment = "DEV" | "PROD";

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

export const backendUrl = (): string =>
  `${origin()}${env() === "DEV" ? ":5001" : ""}`;

interface FetchOptions {
  method?: string;
  headers: Record<string, string>;
  body?: string;
}

export const fetchWithAuth = async <T>(
  route: string,
  method: string = "GET",
  body?: unknown,
): Promise<T> => {
  const jwt = localStorage.getItem("jwt") || "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };

  const options: FetchOptions = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${backendUrl()}${route}`, options);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json() as Promise<T>;
};

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timerId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

import { GB, ES, FR, DE, IT } from "country-flag-icons/react/3x2";

export interface Language {
  code: string;
  name: string;
  color: string;
  Flag: React.ComponentType<{ title: string; style?: React.CSSProperties }>;
}

export const Languages: Language[] = [
  {
    code: "en",
    name: "english",
    color: "#4A90E2",
    Flag: GB,
  },
  {
    code: "es",
    name: "spanish",
    color: "#FF6B6B",
    Flag: ES,
  },
  {
    code: "fr",
    name: "french",
    color: "#6BFF8D",
    Flag: FR,
  },
  {
    code: "de",
    name: "german",
    color: "#9B6BFF",
    Flag: DE,
  },
  {
    code: "it",
    name: "italian",
    color: "#FF9B6B", // Orange to differentiate from other colors
    Flag: IT,
  },
];
