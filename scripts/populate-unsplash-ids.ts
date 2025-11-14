import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { createApi } from "unsplash-js";
import dotenv from "dotenv";
import nodeFetch from "node-fetch";
import express from "express";
import open from "open";

dotenv.config();

// Usage: tsx script.ts <folderPath>

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const TOKEN_FILE = ".unsplash_token.json";

async function getOAuthToken(): Promise<string> {
  try {
    const data = await fs.readFile(TOKEN_FILE, "utf8");
    const json = JSON.parse(data);
    if (json.access_token) return json.access_token;
  } catch {
    // proceed to OAuth flow
  }

  const appId = process.env.UNSPLASH_APP_ID;
  const appSecret = process.env.UNSPLASH_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("Missing UNSPLASH_APP_ID or UNSPLASH_APP_SECRET in .env");
  }

  const redirectUri = "http://localhost:3000/callback";
  const authorizeUrl = `https://unsplash.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public+read_user+write_collections`;

  const app = express();

  const tokenPromise = new Promise<string>((resolve, reject) => {
    const server = app.listen(3000, () => {
      console.log("Opening browser for Unsplash OAuth login...");
      console.log(`Authorize URL: ${authorizeUrl}`);
      open(authorizeUrl);
    });

    app.get('/callback', async (req, res) => {
      const code = req.query.code as string;
      if (!code) {
        res.send("No code received");
        reject(new Error("No code received"));
        return;
      }
      res.send("Authorization successful! You can close this window.");
      server.close();

      console.log(`Received code: ${code}`);
      console.log(`Exchanging code for token with client_id=${appId} and redirect_uri=${redirectUri}`);

      try {
        const tokenRes = await nodeFetch('https://unsplash.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            code,
            grant_type: 'authorization_code'
          })
        });

        const text = await tokenRes.text();
        console.log(`Token exchange response status: ${tokenRes.status}`);
        console.log(`Token exchange response body: ${text}`);

        const tokenJson = JSON.parse(text);
        await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenJson, null, 2), 'utf8');
        resolve(tokenJson.access_token);
      } catch (err) {
        console.error("Error during token exchange:", err);
        reject(err);
      }
    });
  });

  return tokenPromise;
}

async function main() {
  const [folderPath] = process.argv.slice(2);
  if (!folderPath) {
    console.error("Usage: tsx script.ts <folderPath>");
    process.exit(1);
  }

  const collectionId = process.env.UNSPLASH_COLLECTION_ID;
  const usedCollectionId = process.env.UNSPLASH_USED_COLLECTION_ID;
  if (!collectionId || !usedCollectionId) {
    console.error("Missing UNSPLASH_COLLECTION_ID or UNSPLASH_USED_COLLECTION_ID in .env");
    process.exit(1);
  }

  const accessToken = await getOAuthToken();

  const unsplash = createApi({
    accessKey: "",
    fetch: nodeFetch as any,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const files = await fs.readdir(folderPath);
  const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".markdown"));

  const missingFiles: string[] = [];

  for (const file of mdFiles) {
    const fullPath = path.join(folderPath, file);
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = matter(raw);

    if (!parsed.data.unsplashId || parsed.data.unsplashId.trim() === "") {
      missingFiles.push(fullPath);
    }
  }

  if (missingFiles.length === 0) {
    console.log("No files missing unsplashId.");
    return;
  }

  console.log(`Found ${missingFiles.length} files missing unsplashId.`);

  let photos: any[] = [];
  let page = 1;
  const perPage = 30;

  while (photos.length < missingFiles.length) {
    const response = await unsplash.collections.getPhotos({ collectionId, perPage, page });
    if (response.type !== "success") throw new Error(`Unsplash API error: ${response.errors?.join(", ")}`);
    const results = response.response?.results || [];
    if (results.length === 0) break;
    photos = photos.concat(results);
    page++;
  }

  if (photos.length < missingFiles.length) console.warn(`Requested ${missingFiles.length} images but only got ${photos.length}`);

  photos = shuffle(photos);

  for (let i = 0; i < missingFiles.length && i < photos.length; i++) {
    const filePath = missingFiles[i];
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);

    parsed.data.unsplashId = photos[i].links.html;
    const updated = matter.stringify(parsed.content, parsed.data);
    await fs.writeFile(filePath, updated, "utf8");
    console.log(`Updated ${path.basename(filePath)} with ${photos[i].links.html}`);

    try {
      const addRes = await unsplash.collections.addPhoto({ collectionId: usedCollectionId, photoId: photos[i].id });
      if (addRes.type === "success") console.log(`Added photo ${photos[i].id} to used collection ${usedCollectionId}`);
      const removeRes = await unsplash.collections.removePhoto({ collectionId, photoId: photos[i].id });
      if (removeRes.type === "success") console.log(`Removed photo ${photos[i].id} from source collection ${collectionId}`);
    } catch (err) {
      console.warn(`Error moving photo ${photos[i].id}:`, err);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
