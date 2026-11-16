// Mirror screen logic: clock, weather, buttons, and the physical-button poll.
const $ = (id) => document.getElementById(id);
const result = $("result");
let lastPresses = null;
let hideTimer = null;

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function tickClock() {
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const d = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  $("date").textContent = d.charAt(0).toUpperCase() + d.slice(1);
}

function showWeather(w) {
  if (!w) { $("weather").textContent = ""; return; }
  $("weather").innerHTML =
    `<div class="temp">${w.now}°</div>` +
    `<div>${esc(w.summary)}</div>` +
    `<div>${w.min}° / ${w.max}° · chuva ${w.rain_chance}%</div>`;
}

function thumbs(items) {
  if (!items || !items.length) return "";
  return '<div class="thumbs">' + items.map((i) =>
    `<figure><img src="/wardrobe-images/${esc(i.id)}.jpg" alt=""><figcaption>${esc(i.name)}</figcaption></figure>`
  ).join("") + "</div>";
}

function show(html, autoHideSeconds = 60) {
  result.innerHTML = html;
  result.classList.remove("hidden");
  clearTimeout(hideTimer);
  if (autoHideSeconds) hideTimer = setTimeout(() => result.classList.add("hidden"), autoHideSeconds * 1000);
}

async function callApi(path) {
  show('<div class="spinner"></div><p>Analisando...</p>', 0);
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occasion: $("occasion").value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  } catch (err) {
    show(`<p class="error">${esc(err.message)}</p>`, 15);
    return null;
  }
}

async function checkOutfit() {
  show('<p>Fique parado(a)... 📸</p>', 0);
  await new Promise((r) => setTimeout(r, 1200)); // give the person a moment to pose
  const d = await callApi("/api/check");
  if (!d) return;
  show(
    `<div class="score">${d.score}/10</div><h2>${esc(d.headline)}</h2>` +
    (d.good.length ? `<div class="label">Pontos fortes</div><ul class="good">${d.good.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : "") +
    (d.tips.length ? `<div class="label">Dicas</div><ul>${d.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "") +
    (d.swap_items.length ? `<div class="label">Do seu armário</div>${thumbs(d.swap_items)}` : "")
  );
}

async function suggestOutfit() {
  const d = await callApi("/api/suggest");
  if (!d) return;
  show(
    `<h2>${esc(d.headline)}</h2>${thumbs(d.items)}<p>${esc(d.why)}</p>` +
    (d.alternative_items.length ? `<div class="label">Alternativa</div>${thumbs(d.alternative_items)}` : "")
  );
}

async function poll() {
  try {
    const res = await fetch("/api/status");
    const s = await res.json();
    showWeather(s.weather);
    if (lastPresses !== null && s.button_presses > lastPresses) checkOutfit();
    lastPresses = s.button_presses;
  } catch (_) { /* server restarting; try again next tick */ }
}

$("btn-check").addEventListener("click", checkOutfit);
$("btn-suggest").addEventListener("click", suggestOutfit);
tickClock();
setInterval(tickClock, 10_000);
poll();
setInterval(poll, 1500);
