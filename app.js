(() => {
  const jwtInput = document.getElementById("jwtInput");
  const headerJson = document.getElementById("headerJson");
  const payloadJson = document.getElementById("payloadJson");
  const status = document.getElementById("status");
  const toastBox = document.getElementById("toast");
  const jwtOverlay = document.getElementById("jwtOverlay");

  const openSecret = document.getElementById("openSecret");
  const secretModal = document.getElementById("secretModal");
  const closeSecret = document.getElementById("closeSecret");
  const closeSecretBtn = document.getElementById("closeSecretBtn");
  const secretInput = document.getElementById("secretInput");
  const toggleSecret = document.getElementById("toggleSecret");
  const eyeIcon = document.getElementById("eyeIcon");

  const copyJwt = document.getElementById("copyJwt");

  const state = {
    secret: "",
    isProgrammatic: false,
  };

  function setStatus(text) {
    status.textContent = text;
  }

  let toastTimer = null;
  function toast(message) {
    clearTimeout(toastTimer);
    toastBox.textContent = message;
    toastBox.classList.add("show");
    toastTimer = setTimeout(() => toastBox.classList.remove("show"), 1400);
  }

  function openModal() {
    secretModal.classList.add("show");
    secretModal.setAttribute("aria-hidden", "false");
    secretInput.focus();
  }

  function closeModal() {
    secretModal.classList.remove("show");
    secretModal.setAttribute("aria-hidden", "true");
  }

  function toggleSecretView() {
    const isPassword = secretInput.type === "password";
    secretInput.type = isPassword ? "text" : "password";
    eyeIcon.classList.toggle("eye-open", isPassword);
    eyeIcon.classList.toggle("eye-closed", !isPassword);
  }

  function safeParseJson(text) {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (err) {
      return { ok: false, error: err };
    }
  }

  function renderTokenOverlay(token) {
    const safe = token || "";
    const parts = safe.split(".");
    if (parts.length === 1) {
      jwtOverlay.textContent = safe;
      return;
    }
    const header = parts[0] || "";
    const payload = parts[1] || "";
    const signature = parts.slice(2).join(".") || "";
    jwtOverlay.innerHTML = `${wrapSpan(header, "seg-header")}.${wrapSpan(payload, "seg-payload")}.${wrapSpan(signature, "seg-signature")}`;
  }

  function wrapSpan(text, cls) {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<span class="${cls}">${escaped}</span>`;
  }

  function updateEditorsFromToken(token) {
    const parts = token.split(".");
    if (parts.length < 2) {
      setStatus(JwtStrings.statusInvalidToken);
      return;
    }
    try {
      const header = JwtCrypto.base64UrlDecodeJson(parts[0]);
      const payload = JwtCrypto.base64UrlDecodeJson(parts[1]);
      state.isProgrammatic = true;
      headerJson.value = JwtCrypto.prettify(header);
      payloadJson.value = JwtCrypto.prettify(payload);
      state.isProgrammatic = false;
      setStatus(JwtStrings.statusDecoded);
    } catch (err) {
      setStatus(JwtStrings.statusParseFailed);
    }
  }

  async function regenerateToken() {
    if (state.isProgrammatic) return;

    const headerResult = safeParseJson(headerJson.value);
    const payloadResult = safeParseJson(payloadJson.value);

    if (!headerResult.ok || !payloadResult.ok) {
      setStatus(JwtStrings.statusJsonInvalid);
      return;
    }

    const header = headerResult.value;
    const payload = payloadResult.value;
    const alg = header.alg;

    if (!alg || typeof alg !== "string") {
      setStatus(JwtStrings.statusAlgMissing);
      return;
    }

    if (!state.secret) {
      setStatus(JwtStrings.statusSecretMissing);
      return;
    }

    if (!["HS256", "HS384", "HS512"].includes(alg)) {
      setStatus(JwtStrings.statusAlgNotSupported);
      return;
    }

    const headerB64 = JwtCrypto.base64UrlEncodeJson(header);
    const payloadB64 = JwtCrypto.base64UrlEncodeJson(payload);
    const signingInput = `${headerB64}.${payloadB64}`;
    const signature = await JwtCrypto.hmacSign(alg, state.secret, signingInput);

    state.isProgrammatic = true;
    jwtInput.value = `${signingInput}.${signature}`;
    renderTokenOverlay(jwtInput.value);
    state.isProgrammatic = false;
    setStatus(JwtStrings.statusResigned);
  }

  jwtInput.addEventListener("input", () => {
    if (state.isProgrammatic) return;
    renderTokenOverlay(jwtInput.value);
    updateEditorsFromToken(jwtInput.value.trim());
  });

  headerJson.addEventListener("input", regenerateToken);
  payloadJson.addEventListener("input", regenerateToken);

  openSecret.addEventListener("click", openModal);
  closeSecret.addEventListener("click", closeModal);
  closeSecretBtn.addEventListener("click", closeModal);
  toggleSecret.addEventListener("click", toggleSecretView);

  secretInput.addEventListener("input", () => {
    state.secret = secretInput.value;
    regenerateToken();
  });

  copyJwt.addEventListener("click", async () => {
    if (!jwtInput.value.trim()) {
      toast(JwtStrings.toastCopyEmpty);
      return;
    }
    await navigator.clipboard.writeText(jwtInput.value.trim());
    toast(JwtStrings.toastCopyOk);
  });

  secretModal.addEventListener("click", (event) => {
    if (event.target === closeSecret) {
      closeModal();
    }
  });

  headerJson.value = "{\n  \"typ\": \"JWT\",\n  \"alg\": \"HS256\"\n}";
  payloadJson.value = "{\n  \"sub\": \"user-1\"\n}";
  renderTokenOverlay(jwtInput.value);
  setStatus(JwtStrings.statusIdle);
})();
