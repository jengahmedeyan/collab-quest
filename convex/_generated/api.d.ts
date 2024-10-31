/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_codes from "../functions/codes.js";
import type * as functions_cursor from "../functions/cursor.js";
import type * as functions_file from "../functions/file.js";
import type * as functions_presence from "../functions/presence.js";
import type * as functions_projects from "../functions/projects.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/codes": typeof functions_codes;
  "functions/cursor": typeof functions_cursor;
  "functions/file": typeof functions_file;
  "functions/presence": typeof functions_presence;
  "functions/projects": typeof functions_projects;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
