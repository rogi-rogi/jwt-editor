const JwtCrypto = (() => {
  const encoder = new TextEncoder();

  function base64UrlEncodeBytes(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }

  function base64UrlEncodeJson(obj) {
    return base64UrlEncodeBytes(encoder.encode(JSON.stringify(obj)));
  }

  function base64UrlDecodeToString(input) {
    const pad = 4 - (input.length % 4 || 4);
    const padded = input + "=".repeat(pad === 4 ? 0 : pad);
    const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
    return atob(normalized);
  }

  function base64UrlDecodeJson(input) {
    const decoded = base64UrlDecodeToString(input);
    return JSON.parse(decoded);
  }

  async function hmacSign(alg, secret, data) {
    const hash = alg === "HS256" ? "SHA-256" : alg === "HS384" ? "SHA-384" : "SHA-512";
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: { name: hash } },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return base64UrlEncodeBytes(new Uint8Array(sigBuf));
  }

  function prettify(obj) {
    return JSON.stringify(obj, null, 2);
  }

  return {
    base64UrlEncodeJson,
    base64UrlDecodeJson,
    hmacSign,
    prettify,
  };
})();
