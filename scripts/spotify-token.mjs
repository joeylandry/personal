/**
 * One-time setup for the live player: mints the Spotify refresh token that
 * `lib/spotify.ts` runs on.
 *
 *   1. Create an app at https://developer.spotify.com/dashboard and add the
 *      redirect URI http://127.0.0.1:8888/callback
 *   2. SPOTIFY_CLIENT_ID=… SPOTIFY_CLIENT_SECRET=… npm run spotify:token
 *   3. Open the printed link, approve, and copy SPOTIFY_REFRESH_TOKEN into
 *      .env.local and the Vercel project's environment variables.
 */
import { createServer } from 'node:http';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const PORT = 8888;
const redirectUri = `http://127.0.0.1:${PORT}/callback`;
const scopes = 'user-read-currently-playing user-read-recently-played';

const authorize = new URL('https://accounts.spotify.com/authorize');
authorize.search = new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: redirectUri,
  scope: scopes,
}).toString();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', redirectUri);
  if (url.pathname !== '/callback') {
    response.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    response.writeHead(400).end(`Spotify said: ${url.searchParams.get('error') ?? 'no code'}`);
    server.close();
    return;
  }

  const token = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  }).then((res) => res.json());

  if (!token.refresh_token) {
    response.writeHead(500).end('Token exchange failed — see the terminal.');
    console.error(token);
  } else {
    response.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. Back to the terminal.');
    console.log(`\nSPOTIFY_REFRESH_TOKEN=${token.refresh_token}\n`);
  }
  server.close();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Open this link and approve:\n\n${authorize}\n`);
});
