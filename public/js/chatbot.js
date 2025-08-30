// public/js/chatbot.js

document.addEventListener("DOMContentLoaded", () => {
  const form       = document.getElementById("chatbot-form");
  const input      = document.getElementById("chatbot-input");
  const chatBody   = document.getElementById("chatbot-body");
  const toggleBtn  = document.getElementById("chatbot-toggle");
  const closeBtn   = document.getElementById("chatbot-close");
  const chatWindow = document.getElementById("chatbot-window");

  // Accessibility
  chatBody.setAttribute("aria-live", "polite");
  chatBody.setAttribute("role", "log");
  toggleBtn.setAttribute("aria-expanded", "false");

  // Load persisted chat
  const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
  history.forEach(msg => renderBubble(msg.role, msg.text, msg.time));

  // Toggle
  function openChat() {
    chatWindow.classList.remove("hidden");
    toggleBtn.setAttribute("aria-expanded", "true");
    input.focus();
  }
  function closeChat() {
    chatWindow.classList.add("hidden");
    toggleBtn.setAttribute("aria-expanded", "false");
  }
  toggleBtn.addEventListener("click", () =>
    chatWindow.classList.contains("hidden") ? openChat() : closeChat()
  );
  closeBtn?.addEventListener("click", closeChat);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !chatWindow.classList.contains("hidden")) {
      closeChat();
    }
  });

  // Create a bubble element
  function renderBubble(role, text, time = new Date()) {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble", role);
    // message text
    const p = document.createElement("p");
    p.textContent = text;
    bubble.appendChild(p);
    // timestamp
    const ts = document.createElement("time");
    ts.classList.add("bubble-time");
    ts.dateTime = new Date(time).toISOString();
    ts.textContent = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bubble.appendChild(ts);

    chatBody.appendChild(bubble);
    chatBody.scrollTop = chatBody.scrollHeight;
    return bubble;
  }

  // Persist to sessionStorage
  function pushHistory(role, text) {
    const entry = { role, text, time: Date.now() };
    history.push(entry);
    sessionStorage.setItem("chatHistory", JSON.stringify(history));
  }

  // Typing indicator animation
  let typingInterval;
  function startTypingIndicator() {
    const load = renderBubble("bot", "Typing");
    let dots = 0;
    typingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      load.querySelector("p").textContent = "Typing" + ".".repeat(dots);
    }, 400);
    return load;
  }
  function stopTypingIndicator(loadEl) {
    clearInterval(typingInterval);
    if (loadEl) loadEl.remove();
  }

  // Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    input.disabled = true;

    // User bubble
    renderBubble("user", msg);
    pushHistory("user", msg);

    // Bot typing…
    const loader = startTypingIndicator();

    try {
      const res = await fetch("/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const { response, error } = await res.json();

      stopTypingIndicator(loader);

      if (res.ok && response) {
        renderBubble("bot", response);
        pushHistory("bot", response);
      } else {
        console.error("Chatbot error:", error || res.statusText);
        renderBubble("bot", "⚠️ Sorry, something went wrong.");
        pushHistory("bot", "⚠️ Sorry, something went wrong.");
      }
    } catch (err) {
      console.error("Network error:", err);
      stopTypingIndicator(loader);
      renderBubble("bot", "⚠️ Network error. Please try again.");
      pushHistory("bot", "⚠️ Network error. Please try again.");
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  // Enter key submits, Shift+Enter for newline
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
});
