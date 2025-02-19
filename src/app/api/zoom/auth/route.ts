import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const redirectUri = process.env.BASE_URL + "/api/zoom/callback";

  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  return NextResponse.redirect(zoomAuthUrl);
}
