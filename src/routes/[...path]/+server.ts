import { json } from "@sveltejs/kit";
import { getNode } from "./_node.server";
import type { Action } from "./$types";

export const GET: Action = async ({ params }) => getNode(params.path).then(json);
