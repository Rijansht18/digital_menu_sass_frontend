import { openDB, DBSchema, IDBPDatabase } from "idb";

const DB_NAME = "menuverse-db";
const DB_VERSION = 1;

interface MenuVerseDB extends DBSchema {
  menus: {
    key: string;
    value: {
      slug: string;
      version: number;
      data: any;
      cachedAt: number;
    };
  };
}

let db: IDBPDatabase<MenuVerseDB> | null = null;

export const getDB = async () => {
  if (db) return db;
  db = await openDB<MenuVerseDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      database.createObjectStore("menus", { keyPath: "slug" });
    },
  });
  return db;
};

export const getCachedMenu = async (slug: string) => {
  const database = await getDB();
  return database.get("menus", slug);
};

export const cacheMenu = async (slug: string, version: number, data: any) => {
  const database = await getDB();
  await database.put("menus", { slug, version, data, cachedAt: Date.now() });
};

export const checkMenuVersion = async (
  slug: string,
  apiUrl: string
): Promise<{ needsRefresh: boolean; version: number }> => {
  try {
    const res = await fetch(`${apiUrl}/public/version/${slug}`);
    const json = await res.json();
    const serverVersion = json.data?.version ?? 0;

    const cached = await getCachedMenu(slug);
    const needsRefresh = !cached || cached.version !== serverVersion;

    return { needsRefresh, version: serverVersion };
  } catch {
    return { needsRefresh: true, version: 0 };
  }
};
