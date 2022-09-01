import { json } from "@sveltejs/kit";
import { getNode } from "../_node.server";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => getNode(params.path).then(json);
