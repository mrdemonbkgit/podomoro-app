/**
 * BUILD INFORMATION
 * 
 * This file contains build-specific information.
 * 
 * DEV MODE: This default version is used during development (npm run dev)
 * PRODUCTION: Automatically regenerated during build (npm run build)
 * 
 * The values below represent a development build and will be overwritten
 * during production builds by scripts/generate-build-info.js
 */

export interface BuildInfo {
  buildNumber: string;
  buildDate: string;
  gitCommit: string;
  gitBranch: string;
  timestamp: number;
}

export const buildInfo: BuildInfo = {
  "buildNumber": "dev",
  "buildDate": new Date().toISOString(),
  "gitCommit": "dev",
  "gitBranch": "dev",
  "timestamp": Date.now()
};

// Human-readable formats
export const getBuildNumberShort = (): string => {
  // In dev mode, return "dev"
  if (buildInfo.buildNumber === "dev") {
    return "dev";
  }
  
  // Format: YYMMDD-HHmm
  const bn = buildInfo.buildNumber;
  return `${bn.slice(2, 8)}-${bn.slice(8, 12)}`;
};

export const getBuildDateFormatted = (): string => {
  return new Date(buildInfo.buildDate).toLocaleString();
};

export const getGitInfo = (): string => {
  return `${buildInfo.gitBranch}@${buildInfo.gitCommit}`;
};
