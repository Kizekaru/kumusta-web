import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const clientId = process.env.GOOGLE_CLASSROOM_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLASSROOM_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CLASSROOM_REDIRECT_URI;

  if (error) {
    return new NextResponse(`
      <html>
        <body style="font-family:'Inter',sans-serif;padding:40px;text-align:center;">
          <h2>Google Authentication Error</h2>
          <p style="color:red;">${error}</p>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Google Classroom OAuth is not configured." },
      { status: 500 }
    );
  }

  let userProfile = null;
  let accessToken = null;

  if (code) {
    try {
      // Exchange authorization code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        // Fetch User Info
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userRes.ok) {
          userProfile = await userRes.json();
        }
      }
    } catch (err: any) {
      console.error("Token exchange failed:", err);
    }
  }

  const state = searchParams.get("state");
  let webReturnUrl: string | null = null;
  if (state) {
    try {
      const decoded = decodeURIComponent(state);
      if (decoded.startsWith("{")) {
        const parsed = JSON.parse(decoded);
        if (parsed.returnUrl && (parsed.returnUrl.startsWith("http://") || parsed.returnUrl.startsWith("https://"))) {
          webReturnUrl = parsed.returnUrl;
        }
      } else if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
        webReturnUrl = decoded;
      }
    } catch (e) {
      if (state.startsWith("http://") || state.startsWith("https://")) {
        webReturnUrl = state;
      }
    }
  }

  const email = userProfile?.email || "";
  const name = userProfile?.name || "";
  const picture = userProfile?.picture || "";
  const givenName = userProfile?.given_name || name.split(" ")[0] || "";
  const familyName = userProfile?.family_name || "";
  const token = accessToken || "";

  // If request originated from Web, redirect directly to mobile web dashboard URL
  if (webReturnUrl) {
    try {
      const target = new URL(webReturnUrl);
      target.searchParams.set("auth", "success");
      target.searchParams.set("email", email);
      target.searchParams.set("name", name);
      target.searchParams.set("firstName", givenName);
      target.searchParams.set("lastName", familyName);
      target.searchParams.set("picture", picture);
      target.searchParams.set("token", token);
      return NextResponse.redirect(target.toString());
    } catch (err) {
      console.warn("Failed to construct web redirect URL:", err);
    }
  }

  const deepLinkUrl = `agapai://auth?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&firstName=${encodeURIComponent(givenName)}&lastName=${encodeURIComponent(familyName)}&picture=${encodeURIComponent(picture)}&token=${encodeURIComponent(token)}`;

  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Google Sign-In Success - KUMUSTA</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #F8FAFC;
            color: #0F172A;
          }
          .card {
            background: white;
            padding: 32px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            text-align: center;
            max-width: 400px;
            width: 90%;
          }
          .avatar {
            width: 64px;
            height: 64px;
            border-radius: 32px;
            margin-bottom: 16px;
            border: 3px solid #7C3AED;
          }
          .title { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #7C3AED; }
          .email { font-size: 14px; color: #64748B; margin-bottom: 20px; word-break: break-all; }
          .btn {
            display: inline-block;
            background: #7C3AED;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          ${picture ? `<img src="${picture}" class="avatar" alt="Avatar" />` : ''}
          <div class="title">Welcome, ${name || "Student"}!</div>
          <div class="email">${email}</div>
          <p style="font-size: 13px; color: #64748B; margin-bottom: 24px;">
            Successfully authenticated with Google. Returning to KUMUSTA...
          </p>
          <a href="${deepLinkUrl}" class="btn" id="openAppBtn">Open KUMUSTA App</a>
        </div>
        <script>
          // Automatically try to open mobile app or close popup
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                email: ${JSON.stringify(email)},
                name: ${JSON.stringify(name)},
                firstName: ${JSON.stringify(givenName)},
                lastName: ${JSON.stringify(familyName)},
                picture: ${JSON.stringify(picture)},
                token: ${JSON.stringify(token)}
              }, '*');
              setTimeout(() => window.close(), 1000);
            }
          } catch (e) {}

          // Deep link redirect for mobile
          setTimeout(() => {
            window.location.href = "${deepLinkUrl}";
          }, 300);
        </script>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}
