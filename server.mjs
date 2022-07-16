import { config as dotenv } from "dotenv";

dotenv();

import("./build/index.js").catch(console.error);
