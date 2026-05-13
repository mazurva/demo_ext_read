const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50
};

function readLogLevel() {
  const params = new URLSearchParams(globalThis.location?.search || "");
  const fromQuery = params.get("log");
  const fromStorage = globalThis.localStorage?.getItem("readingTrainerLogLevel");
  const level = String(fromQuery || fromStorage || "debug").toLowerCase();
  return Object.hasOwn(LEVELS, level) ? level : "debug";
}

let activeLevel = readLogLevel();

function canLog(level) {
  return LEVELS[level] >= LEVELS[activeLevel] && activeLevel !== "silent";
}

export function setLogLevel(level) {
  const normalized = String(level).toLowerCase();
  activeLevel = Object.hasOwn(LEVELS, normalized) ? normalized : "debug";
}

export const logger = {
  debug(message, details) {
    if (canLog("debug")) {
      console.debug(message, details ?? "");
    }
  },
  info(message, details) {
    if (canLog("info")) {
      console.info(message, details ?? "");
    }
  },
  warn(message, details) {
    if (canLog("warn")) {
      console.warn(message, details ?? "");
    }
  },
  error(message, details) {
    if (canLog("error")) {
      console.error(message, details ?? "");
    }
  }
};
