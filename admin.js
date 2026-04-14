const tokenKey = "gorunners_token";

const dom = {
  loginPanel: document.getElementById("admin-login-panel"),
  consolePanel: document.getElementById("admin-console"),
  loginForm: document.getElementById("admin-login-form"),
  loginMessage: document.getElementById("admin-login-message"),
  refreshButton: document.getElementById("admin-refresh"),
  logoutButton: document.getElementById("admin-logout"),
  viewerMeta: document.getElementById("admin-viewer-meta"),
  dbBadge: document.getElementById("db-badge"),
  toast: document.getElementById("admin-toast"),
  userSearch: document.getElementById("user-search"),
  users: document.getElementById("admin-users"),
  events: document.getElementById("admin-events"),
  posts: document.getElementById("admin-posts"),
  actions: document.getElementById("admin-actions"),
  eventForm: document.getElementById("admin-event-form"),
  statUsers: document.getElementById("stat-users"),
  statEvents: document.getElementById("stat-events"),
  statPosts: document.getElementById("stat-posts"),
  statRegistrations: document.getElementById("stat-registrations"),
};

let API_BASE =
  localStorage.getItem("gorunners_api") ||
  window.GORUNNERS_API ||
  "http://127.0.0.1:8000";
let authToken = localStorage.getItem(tokenKey) || "";
let currentAdmin = null;
let dashboard = null;
let users = [];
let events = [];
let posts = [];

function showToast(message) {
  if (!message) return;
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  setTimeout(() => dom.toast.classList.remove("show"), 2400);
}

function setLoginMessage(message, isError = false) {
  dom.loginMessage.textContent = message;
  dom.loginMessage.classList.toggle("notice-error", isError);
}

function setView(mode) {
  dom.loginPanel.hidden = mode !== "login";
  dom.consolePanel.hidden = mode !== "console";
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  if (!response.ok) {
    throw new Error(payload?.detail || "Request failed");
  }
  return payload;
}

async function ensureApiBase() {
  const candidates = [API_BASE, "http://127.0.0.1:8000", "http://localhost:8000"];
  for (const candidate of candidates) {
    try {
      const response = await fetch(`${candidate}/health`);
      if (response.ok) {
        API_BASE = candidate;
        localStorage.setItem("gorunners_api", candidate);
        return;
      }
    } catch (error) {
      // try next candidate
    }
  }
}

function formatTime(value) {
  if (!value) return "暂无记录";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function roleLabel(role) {
  return role === "admin" ? "管理员" : "普通用户";
}

function statusLabel(isActive) {
  return isActive ? "正常" : "已禁用";
}

function renderDashboard() {
  const stats = dashboard?.stats || {};
  dom.statUsers.textContent = stats.user_total || 0;
  dom.statEvents.textContent = stats.event_total || 0;
  dom.statPosts.textContent = stats.post_total || 0;
  dom.statRegistrations.textContent = stats.registration_total || 0;
  dom.dbBadge.textContent = (dashboard?.database_backend || "db").toUpperCase();
  dom.viewerMeta.textContent = currentAdmin
    ? `当前管理员：${currentAdmin.name}（${currentAdmin.email}）`
    : "管理员后台已连接数据接口，可统一处理用户、活动和社区帖子。";

  const recentActions = dashboard?.recent_actions || [];
  dom.actions.innerHTML = recentActions.length
    ? recentActions
        .map(
          (item) => `
            <article class="admin-row">
              <div class="admin-row-head">
                <strong>${escapeHtml(item.admin_name || "Admin")}</strong>
                <span class="status-pill">${escapeHtml(formatTime(item.created_at))}</span>
              </div>
              <div class="admin-row-meta">
                <span>${escapeHtml(item.action_type || "update")}</span>
                <span>${escapeHtml(item.target_type || "system")} #${escapeHtml(item.target_id || "-")}</span>
              </div>
              <div class="body">${escapeHtml(item.note || "无备注")}</div>
            </article>
          `
        )
        .join("")
    : `<div class="admin-empty">暂无管理操作记录。</div>`;
}

function renderUsers() {
  const keyword = dom.userSearch.value.trim().toLowerCase();
  const filtered = users.filter((user) => {
    const haystack = `${user.name} ${user.email}`.toLowerCase();
    return !keyword || haystack.includes(keyword);
  });

  dom.users.innerHTML = filtered.length
    ? filtered
        .map(
          (user) => `
            <article class="admin-row">
              <div class="admin-row-head">
                <div>
                  <strong>${escapeHtml(user.name)}</strong>
                  <div class="card-subtitle">${escapeHtml(user.email)}</div>
                </div>
                <span class="status-pill ${user.is_active ? "active" : "inactive"}">${statusLabel(user.is_active)}</span>
              </div>
              <div class="admin-row-meta">
                <span>角色：${roleLabel(user.role)}</span>
                <span>报名 ${user.registration_count || 0}</span>
                <span>发帖 ${user.post_count || 0}</span>
                <span>创建活动 ${user.event_count || 0}</span>
                <span>最近登录：${escapeHtml(formatTime(user.last_login_at))}</span>
              </div>
              <div class="admin-row-actions">
                <select data-user-role="${user.id}">
                  <option value="user" ${user.role === "user" ? "selected" : ""}>普通用户</option>
                  <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理员</option>
                </select>
                <select data-user-active="${user.id}">
                  <option value="true" ${user.is_active ? "selected" : ""}>启用</option>
                  <option value="false" ${!user.is_active ? "selected" : ""}>禁用</option>
                </select>
                <button class="primary-button" type="button" data-save-user="${user.id}">保存</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="admin-empty">没有匹配到用户。</div>`;

  dom.users.querySelectorAll("[data-save-user]").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.saveUser;
      const role = dom.users.querySelector(`[data-user-role="${userId}"]`)?.value || "user";
      const isActive = dom.users.querySelector(`[data-user-active="${userId}"]`)?.value === "true";
      button.disabled = true;
      try {
        await apiRequest(`/admin/users/${userId}`, {
          method: "PATCH",
          body: JSON.stringify({ role, is_active: isActive }),
        });
        showToast("用户信息已更新。");
        await loadConsoleData();
      } catch (error) {
        showToast(error.message || "更新用户失败。");
      } finally {
        button.disabled = false;
      }
    });
  });
}

function renderEvents() {
  dom.events.innerHTML = events.length
    ? events
        .map(
          (event) => `
            <article class="admin-row">
              <div class="admin-row-head">
                <div>
                  <strong>${escapeHtml(event.name_zh || event.name)}</strong>
                  <div class="card-subtitle">${escapeHtml(event.time_label)} · ${escapeHtml(event.location)}</div>
                </div>
                <span class="status-pill">${escapeHtml(`${event.distance} km`)}</span>
              </div>
              <div class="admin-row-meta">
                <span>难度：${escapeHtml(event.level)}</span>
                <span>报名 ${event.registration_count || 0}/${event.capacity || 0}</span>
                <span>打卡点 ${event.checkpoint_count || 0}</span>
                <span>创建人：${escapeHtml(event.created_by_name || "系统")}</span>
              </div>
              <div class="admin-row-actions">
                <button class="outline-button" type="button" data-open-event="${event.id}">查看主站详情</button>
                <button class="primary-button danger-button" type="button" data-delete-event="${event.id}">删除活动</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="admin-empty">当前没有活动。</div>`;

  dom.events.querySelectorAll("[data-open-event]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = `index.html#event`;
    });
  });

  dom.events.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.addEventListener("click", async () => {
      const eventId = button.dataset.deleteEvent;
      if (!window.confirm("确认删除这个活动吗？相关报名和打卡记录会一并清除。")) {
        return;
      }
      button.disabled = true;
      try {
        await apiRequest(`/events/${eventId}`, { method: "DELETE" });
        showToast("活动已删除。");
        await loadConsoleData();
      } catch (error) {
        showToast(error.message || "删除活动失败。");
      } finally {
        button.disabled = false;
      }
    });
  });
}

function renderPosts() {
  dom.posts.innerHTML = posts.length
    ? posts
        .map(
          (post) => `
            <article class="admin-row">
              <div class="admin-row-head">
                <div>
                  <strong>${escapeHtml(post.user_name || "匿名用户")}</strong>
                  <div class="card-subtitle">${escapeHtml(post.user_email || "未记录邮箱")} · ${escapeHtml(post.spot_name || "未知地点")}</div>
                </div>
                <span class="status-pill">${escapeHtml(formatTime(post.created_at))}</span>
              </div>
              <div class="body">${escapeHtml(post.text)}</div>
              ${
                post.image_url
                  ? `<img class="admin-post-image" src="${escapeHtml(post.image_url)}" alt="post image" />`
                  : ""
              }
              <div class="admin-row-meta">
                <span>点赞 ${post.likes || 0}</span>
                <span>评论 ${post.comment_count || 0}</span>
                <span>帖子 ID #${post.id}</span>
              </div>
              <div class="admin-row-actions">
                <button class="primary-button danger-button" type="button" data-delete-post="${post.id}">删除帖子</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="admin-empty">当前没有需要审核的帖子。</div>`;

  dom.posts.querySelectorAll("[data-delete-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.dataset.deletePost;
      if (!window.confirm("确认删除这条帖子吗？相关评论也会同时删除。")) {
        return;
      }
      button.disabled = true;
      try {
        await apiRequest(`/admin/posts/${postId}`, { method: "DELETE" });
        showToast("帖子已删除。");
        await loadConsoleData();
      } catch (error) {
        showToast(error.message || "删除帖子失败。");
      } finally {
        button.disabled = false;
      }
    });
  });
}

function buildEventPayload(formData) {
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const timeLabel = String(formData.get("time") || "").trim();
  const distance = Number(formData.get("distance") || 5);
  const level = String(formData.get("level") || "Beginner");
  const capacity = Number(formData.get("capacity") || 20);

  const pace =
    level === "Beginner"
      ? "6'30\"-8'00\" / km"
      : level === "Intermediate"
      ? "5'30\"-6'30\" / km"
      : "4'30\"-5'30\" / km";

  return {
    name,
    name_zh: name,
    description: "Admin-created run with moderation-ready management tools.",
    description_zh: "管理员发布的跑步活动，可在后台统一管理。",
    time_label: timeLabel,
    time_label_zh: timeLabel,
    location,
    location_zh: location,
    distance,
    level,
    pace,
    capacity,
    tags: ["Admin", "Managed"],
    tags_zh: ["后台", "管理"],
    lat: 31.3,
    lng: 120.62,
    route_coords: [
      [31.3, 120.62],
      [31.302, 120.624],
      [31.304, 120.62],
      [31.302, 120.616],
      [31.3, 120.62],
    ],
  };
}

async function fetchCurrentUser() {
  if (!authToken) return null;
  try {
    const me = await apiRequest("/auth/me");
    currentAdmin = me;
    return me;
  } catch (error) {
    authToken = "";
    currentAdmin = null;
    localStorage.removeItem(tokenKey);
    return null;
  }
}

async function loadConsoleData() {
  const [dashboardData, userData, eventData, postData] = await Promise.all([
    apiRequest("/admin/dashboard"),
    apiRequest("/admin/users"),
    apiRequest("/admin/events"),
    apiRequest("/admin/posts"),
  ]);
  dashboard = dashboardData;
  users = Array.isArray(userData) ? userData : [];
  events = Array.isArray(eventData) ? eventData : [];
  posts = Array.isArray(postData) ? postData : [];
  renderDashboard();
  renderUsers();
  renderEvents();
  renderPosts();
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const formData = new FormData(dom.loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  try {
    const token = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    authToken = token.access_token;
    localStorage.setItem(tokenKey, authToken);
    const me = await fetchCurrentUser();
    if (!me || me.role !== "admin") {
      authToken = "";
      currentAdmin = null;
      localStorage.removeItem(tokenKey);
      setLoginMessage("该账号不是管理员，不能进入后台。", true);
      return;
    }
    setLoginMessage("登录成功，正在载入后台数据。");
    await loadConsoleData();
    setView("console");
    showToast("管理员后台已就绪。");
  } catch (error) {
    setLoginMessage(error.message || "登录失败。", true);
  }
}

async function handleCreateEvent(event) {
  event.preventDefault();
  const payload = buildEventPayload(new FormData(dom.eventForm));
  try {
    await apiRequest("/events", { method: "POST", body: JSON.stringify(payload) });
    dom.eventForm.reset();
    showToast("活动已发布。");
    await loadConsoleData();
  } catch (error) {
    showToast(error.message || "活动创建失败。");
  }
}

function handleLogout() {
  authToken = "";
  currentAdmin = null;
  localStorage.removeItem(tokenKey);
  setLoginMessage("你已退出管理员后台。");
  setView("login");
  showToast("已退出登录。");
}

async function init() {
  await ensureApiBase();
  const me = await fetchCurrentUser();
  if (me?.role === "admin") {
    try {
      await loadConsoleData();
      setView("console");
      return;
    } catch (error) {
      setLoginMessage(error.message || "后台数据加载失败。", true);
    }
  } else if (authToken && me && me.role !== "admin") {
    authToken = "";
    currentAdmin = null;
    localStorage.removeItem(tokenKey);
    setLoginMessage("当前登录账号不是管理员，请重新登录。", true);
  }
  setView("login");
}

dom.loginForm.addEventListener("submit", handleLoginSubmit);
dom.eventForm.addEventListener("submit", handleCreateEvent);
dom.refreshButton.addEventListener("click", async () => {
  try {
    await loadConsoleData();
    showToast("后台数据已刷新。");
  } catch (error) {
    showToast(error.message || "刷新失败。");
  }
});
dom.logoutButton.addEventListener("click", handleLogout);
dom.userSearch.addEventListener("input", renderUsers);

init();
