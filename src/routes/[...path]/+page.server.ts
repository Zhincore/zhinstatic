import type { PageServerLoad } from "./$types";
import { getNode } from "./_node.server";

export const load: PageServerLoad = async ({ params }) => getNode(params.path);
