import { Database } from "bun:sqlite";

const db = new Database("cache/cache.db", { create: true });
db.exec("PRAGMA journal_mode = WAL;");
db.exec(`
  CREATE TABLE IF NOT EXISTS file (
    path TEXT PRIMARY KEY,
    mime TEXT,
    ext TEXT
  );
`);

export const database = {
  file: db.query<FileRecord, string>("SELECT * FROM file WHERE path = ?"),
  insertFile: db.query("INSERT INTO file (path, mime, ext) VALUES (?, ?, ?)"),
  insertFiles: db.transaction(files => {
    for (const file of files) {
      database.insertFile.run(file.path, file.mime, file.ext);
    }
  })
};

export interface FileRecord {
  path: string;
  mime?: string;
  ext?: string;
}
