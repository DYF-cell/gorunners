const tokenKey = "gorunners_token";
const defaultPlannerCenter = [31.3, 120.62];
const plannerTypeIcons = {
  start: "S",
  checkpoint: "C",
  water: "W",
  photo: "P",
  finish: "F",
};
const plannerTypeHints = {
  start: "用于活动集合与热身起点。",
  checkpoint: "适合设置集合点，帮助队伍保持节奏。",
  water: "建议设置在中段，方便补水和短暂恢复。",
  photo: "标记风景位，便于合影和活动分享。",
  finish: "用于终点冲线与放松区域。",
};

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
  usersPagination: document.getElementById("admin-users-pagination"),
  events: document.getElementById("admin-events"),
  eventsPagination: document.getElementById("admin-events-pagination"),
  posts: document.getElementById("admin-posts"),
  postsPagination: document.getElementById("admin-posts-pagination"),
  eventForm: document.getElementById("admin-event-form"),
  eventId: document.getElementById("admin-event-id"),
  eventModeLabel: document.getElementById("admin-event-mode-label"),
  eventSubmit: document.getElementById("admin-event-submit"),
  eventCancel: document.getElementById("admin-event-cancel"),
  eventLevel: document.querySelector('#admin-event-form select[name="level"]'),
  eventPlanner: document.getElementById("admin-route-map"),
  eventPlannerHint: document.getElementById("admin-map-type-hint"),
  eventPlannerSummary: document.getElementById("admin-route-summary"),
  plannerTypes: document.getElementById("admin-map-types"),
  plannerExpand: document.getElementById("admin-map-expand"),
  plannerEdit: document.getElementById("admin-route-edit"),
  plannerDone: document.getElementById("admin-route-done"),
  plannerUndo: document.getElementById("admin-route-undo"),
  plannerClear: document.getElementById("admin-route-clear"),
  plannerModal: document.getElementById("admin-map-picker-modal"),
  plannerModalClose: document.getElementById("admin-map-picker-close"),
  plannerModalCancel: document.getElementById("admin-map-picker-cancel"),
  plannerModalEdit: document.getElementById("admin-map-picker-edit"),
  plannerModalDone: document.getElementById("admin-map-picker-done"),
  plannerModalUndo: document.getElementById("admin-map-picker-undo"),
  plannerModalClear: document.getElementById("admin-map-picker-clear"),
  plannerPickerTypes: document.getElementById("admin-map-picker-types"),
  plannerPickerHint: document.getElementById("admin-map-picker-hint"),
  plannerPickerCoords: document.getElementById("admin-map-picker-coords"),
  plannerPickerPanel: document.getElementById("admin-map-picker-panel"),
  plannerPickerResizeHandle: document.getElementById("admin-map-picker-resize-handle"),
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
const paginationPageSizes = {
  users: 6,
  events: 5,
  posts: 4,
};
const paginationState = {
  users: 1,
  events: 1,
  posts: 1,
};

let plannerMap = null;
let plannerLayer = null;
let plannerPoints = [];
let plannerEditMode = true;
let plannerSelectedIndex = null;
let plannerSelectedType = "checkpoint";
let plannerPickerMap = null;
let plannerPickerRouteLayer = null;
let plannerPickerSelectionLayer = null;
let plannerPickerSelectionMarker = null;
let plannerPickerSelectedLatLng = null;
let plannerPickerResizeState = null;

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
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
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

function getPaginatedItems(sectionKey, items) {
  const pageSize = paginationPageSizes[sectionKey] || 1;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(paginationState[sectionKey] || 1, 1), totalPages);
  const startIndex = totalItems ? (currentPage - 1) * pageSize : 0;
  const pageItems = items.slice(startIndex, startIndex + pageSize);
  paginationState[sectionKey] = currentPage;
  return {
    items: pageItems,
    totalItems,
    totalPages,
    currentPage,
    startItem: totalItems ? startIndex + 1 : 0,
    endItem: totalItems ? Math.min(startIndex + pageSize, totalItems) : 0,
  };
}

function renderSectionByKey(sectionKey) {
  if (sectionKey === "users") {
    renderUsers();
    return;
  }
  if (sectionKey === "events") {
    renderEvents();
    return;
  }
  if (sectionKey === "posts") {
    renderPosts();
  }
}

function renderPagination(sectionKey, paginationMeta) {
  const container = dom[`${sectionKey}Pagination`];
  if (!container) return;
  if (!paginationMeta.totalItems || paginationMeta.totalPages <= 1) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = `
    <div class="admin-pagination-summary">
      显示 ${paginationMeta.startItem}-${paginationMeta.endItem} / ${paginationMeta.totalItems}
    </div>
    <div class="admin-pagination-controls">
      <button
        class="outline-button"
        type="button"
        data-page-section="${sectionKey}"
        data-page="${paginationMeta.currentPage - 1}"
        ${paginationMeta.currentPage <= 1 ? "disabled" : ""}
      >
        上一页
      </button>
      <span class="status-pill">第 ${paginationMeta.currentPage} / ${paginationMeta.totalPages} 页</span>
      <button
        class="outline-button"
        type="button"
        data-page-section="${sectionKey}"
        data-page="${paginationMeta.currentPage + 1}"
        ${paginationMeta.currentPage >= paginationMeta.totalPages ? "disabled" : ""}
      >
        下一页
      </button>
    </div>
  `;

  container.querySelectorAll("[data-page-section]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextPage = Number(button.dataset.page || "1");
      paginationState[sectionKey] = nextPage;
      renderSectionByKey(sectionKey);
    });
  });
}

function updateModalLock() {
  const modalOpen = document.querySelector(".modal.show");
  document.body.classList.toggle("modal-open", Boolean(modalOpen));
}

function sanitizeRouteType(type) {
  const normalized = String(type || "").toLowerCase();
  if (["start", "checkpoint", "water", "photo", "finish"].includes(normalized)) {
    return normalized;
  }
  return "checkpoint";
}

function getDefaultRouteType(index, total) {
  if (index === 0) return "start";
  if (index === total - 1) return "finish";
  return "checkpoint";
}

function getPlannerHint(type) {
  return plannerTypeHints[sanitizeRouteType(type)] || plannerTypeHints.checkpoint;
}

function normalizeRoutePoints(points) {
  if (!Array.isArray(points)) return [];
  const total = points.length;
  return points
    .map((point, index) => {
      if (Array.isArray(point)) {
        return {
          lat: Number(point[0]),
          lng: Number(point[1]),
          type: sanitizeRouteType(point[2] || getDefaultRouteType(index, total)),
        };
      }
      if (point && typeof point === "object") {
        return {
          lat: Number(point.lat ?? point[0]),
          lng: Number(point.lng ?? point[1]),
          type: sanitizeRouteType(point.type || getDefaultRouteType(index, total)),
        };
      }
      return null;
    })
    .filter((point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lng));
}

function routePointToLatLng(point) {
  return [Number(point.lat), Number(point.lng)];
}

function createPlannerPointIcon(point, index, total, selected = false) {
  const type = sanitizeRouteType(point?.type || getDefaultRouteType(index, total));
  return L.divIcon({
    className: `route-point-marker${selected ? " selected" : ""}`,
    html: `<span>${plannerTypeIcons[type] || "C"}</span>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

function updatePlannerTypeButtons() {
  [dom.plannerTypes, dom.plannerPickerTypes].filter(Boolean).forEach((group) => {
    group.querySelectorAll("[data-plan-type]").forEach((button) => {
      const type = sanitizeRouteType(button.dataset.planType || "checkpoint");
      button.classList.toggle("active", type === plannerSelectedType);
    });
  });
  if (dom.eventPlannerHint) {
    dom.eventPlannerHint.textContent = getPlannerHint(plannerSelectedType);
  }
  if (dom.plannerPickerHint) {
    dom.plannerPickerHint.textContent = getPlannerHint(plannerSelectedType);
  }
}

function updatePlannerSummary() {
  if (!dom.eventPlannerSummary) return;
  if (!plannerPoints.length) {
    dom.eventPlannerSummary.textContent = "当前还没有路线点位。点击“编辑当前路线”后可在地图上添加。";
    return;
  }
  const startPoint = plannerPoints[0];
  dom.eventPlannerSummary.textContent = `已设置 ${plannerPoints.length} 个路线点位，起点 ${startPoint.lat.toFixed(
    4
  )}, ${startPoint.lng.toFixed(4)}。需要更大工作区时点击“放大规划”。`;
}

function renderPlannerControls() {
  if (dom.plannerEdit) dom.plannerEdit.classList.toggle("active", plannerEditMode);
  if (dom.plannerModalEdit) dom.plannerModalEdit.classList.toggle("active", plannerEditMode);
  if (dom.plannerUndo) dom.plannerUndo.disabled = !plannerPoints.length;
  if (dom.plannerClear) dom.plannerClear.disabled = !plannerPoints.length;
  if (dom.plannerModalUndo) dom.plannerModalUndo.disabled = !plannerPoints.length;
  if (dom.plannerModalClear) dom.plannerModalClear.disabled = !plannerPoints.length;
  updatePlannerTypeButtons();
  updatePlannerSummary();
}

function setPlannerPickerSelectedLatLng(latlng) {
  plannerPickerSelectedLatLng = {
    lat: Number(latlng.lat.toFixed(6)),
    lng: Number(latlng.lng.toFixed(6)),
  };
  if (dom.plannerPickerCoords) {
    dom.plannerPickerCoords.textContent = `已选坐标：${plannerPickerSelectedLatLng.lat.toFixed(5)}, ${plannerPickerSelectedLatLng.lng.toFixed(5)}`;
  }
  if (!plannerPickerSelectionLayer) return;
  const iconText = plannerTypeIcons[plannerSelectedType] || "C";
  const iconHtml =
    `<div style="background:#ff6a3d;color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;` +
    `border:2px solid #111827">${iconText}</div>`;
  if (!plannerPickerSelectionMarker) {
    plannerPickerSelectionMarker = L.marker([plannerPickerSelectedLatLng.lat, plannerPickerSelectedLatLng.lng], {
      icon: L.divIcon({
        className: "plan-marker",
        html: iconHtml,
        iconSize: [34, 28],
      }),
    }).addTo(plannerPickerSelectionLayer);
  } else {
    plannerPickerSelectionMarker.setLatLng([plannerPickerSelectedLatLng.lat, plannerPickerSelectedLatLng.lng]);
    plannerPickerSelectionMarker.setIcon(
      L.divIcon({
        className: "plan-marker",
        html: iconHtml,
        iconSize: [34, 28],
      })
    );
  }
  plannerPickerSelectionMarker.bindPopup(getPlannerHint(plannerSelectedType)).openPopup();
}

function refreshPlannerViews(resetPickerSelection = false) {
  renderPlannerMap();
  if (dom.plannerModal?.classList.contains("show")) {
    renderPlannerPickerMap(resetPickerSelection);
  }
}

function drawPlannerRoutePoints(layer, mapInstance, context = "main") {
  plannerPoints.forEach((point, index) => {
    const marker = L.marker(routePointToLatLng(point), {
      draggable: plannerEditMode,
      icon: createPlannerPointIcon(point, index, plannerPoints.length, plannerSelectedIndex === index),
    }).addTo(layer);
    marker.bindPopup(`${escapeHtml(sanitizeRouteType(point.type))} ${index + 1}`);
    marker.on("click", (event) => {
      L.DomEvent.stopPropagation(event);
      plannerSelectedIndex = index;
      if (context === "picker") {
        setPlannerPickerSelectedLatLng({ lat: point.lat, lng: point.lng });
      }
      if (plannerEditMode && plannerPoints[index]) {
        plannerPoints[index].type = sanitizeRouteType(plannerSelectedType);
      }
      refreshPlannerViews(false);
    });
    if (plannerEditMode) {
      marker.on("dragend", (dragEvent) => {
        const latlng = dragEvent.target.getLatLng();
        plannerPoints[index].lat = Number(latlng.lat.toFixed(6));
        plannerPoints[index].lng = Number(latlng.lng.toFixed(6));
        plannerSelectedIndex = index;
        if (context === "picker") {
          setPlannerPickerSelectedLatLng(latlng);
        }
        refreshPlannerViews(false);
      });
    }
  });

  if (!plannerPoints.length) {
    L.marker(defaultPlannerCenter).addTo(layer).bindPopup("管理员路线规划");
    mapInstance.setView(defaultPlannerCenter, 12);
  }
}

function renderPlannerMap() {
  if (!plannerMap || !plannerLayer) return;
  plannerLayer.clearLayers();

  if (plannerPoints.length > 1) {
    const routeLine = L.polyline(
      plannerPoints.map((point) => routePointToLatLng(point)),
      { color: "#ff6a3d", weight: 5, opacity: 0.95 }
    ).addTo(plannerLayer);
    plannerMap.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
  } else if (plannerPoints.length === 1) {
    plannerMap.setView(routePointToLatLng(plannerPoints[0]), 14);
  }

  drawPlannerRoutePoints(plannerLayer, plannerMap, "main");
  renderPlannerControls();
}

function renderPlannerPickerMap(resetSelection = false) {
  ensurePlannerPickerMap();
  if (!plannerPickerMap || !plannerPickerRouteLayer) return;
  plannerPickerRouteLayer.clearLayers();
  plannerPickerSelectionLayer?.clearLayers();
  if (resetSelection) {
    plannerPickerSelectionMarker = null;
    plannerPickerSelectedLatLng = null;
    if (dom.plannerPickerCoords) {
      dom.plannerPickerCoords.textContent = "尚未选择点位。";
    }
  } else if (plannerPickerSelectedLatLng) {
    plannerPickerSelectionMarker = null;
    setPlannerPickerSelectedLatLng(plannerPickerSelectedLatLng);
  }

  if (plannerPoints.length > 1) {
    const routeLine = L.polyline(
      plannerPoints.map((point) => routePointToLatLng(point)),
      { color: "#ff6a3d", weight: 5, opacity: 0.95 }
    ).addTo(plannerPickerRouteLayer);
    plannerPickerMap.fitBounds(routeLine.getBounds(), { padding: [28, 28] });
  } else if (plannerPoints.length === 1) {
    plannerPickerMap.setView(routePointToLatLng(plannerPoints[0]), 14);
  } else {
    plannerPickerMap.setView(defaultPlannerCenter, 12);
  }

  drawPlannerRoutePoints(plannerPickerRouteLayer, plannerPickerMap, "picker");
  renderPlannerControls();
  setTimeout(() => plannerPickerMap.invalidateSize(), 40);
}

function ensurePlannerPickerMap() {
  if (!window.L || plannerPickerMap) return;
  plannerPickerMap = L.map("admin-map-picker", { zoomControl: true, attributionControl: true }).setView(
    defaultPlannerCenter,
    12
  );
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(plannerPickerMap);
  plannerPickerRouteLayer = L.layerGroup().addTo(plannerPickerMap);
  plannerPickerSelectionLayer = L.layerGroup().addTo(plannerPickerMap);
  plannerPickerMap.on("click", (event) => {
    setPlannerPickerSelectedLatLng(event.latlng);
    addPlannerPoint(event.latlng, false);
  });
}

function initPlannerMap() {
  if (!window.L || plannerMap || !dom.eventPlanner) return;
  plannerMap = L.map("admin-route-map", { zoomControl: true, attributionControl: true }).setView(
    defaultPlannerCenter,
    12
  );
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(plannerMap);
  plannerLayer = L.layerGroup().addTo(plannerMap);
  plannerMap.on("click", (event) => {
    addPlannerPoint(event.latlng, false);
  });
  renderPlannerMap();
}

function initPlannerPickerResize() {
  const panel = dom.plannerPickerPanel;
  const handle = dom.plannerPickerResizeHandle;
  if (!panel || !handle) return;

  const endResize = () => {
    if (!plannerPickerResizeState) return;
    plannerPickerResizeState = null;
    document.body.classList.remove("resizing-map-picker-panel");
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", endResize);
  };

  const onMouseMove = (event) => {
    if (!plannerPickerResizeState) return;
    const deltaY = event.clientY - plannerPickerResizeState.startY;
    const nextHeight = Math.min(
      plannerPickerResizeState.maxHeight,
      Math.max(plannerPickerResizeState.minHeight, plannerPickerResizeState.startHeight + deltaY)
    );
    panel.style.height = `${Math.round(nextHeight)}px`;
    panel.style.maxHeight = "none";
    plannerPickerMap?.invalidateSize();
  };

  handle.addEventListener("mousedown", (event) => {
    event.preventDefault();
    const rect = panel.getBoundingClientRect();
    plannerPickerResizeState = {
      startY: event.clientY,
      startHeight: rect.height,
      minHeight: 118,
      maxHeight: Math.max(220, Math.round(window.innerHeight * 0.72)),
    };
    document.body.classList.add("resizing-map-picker-panel");
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endResize);
  });
}

function openPlannerModal() {
  if (!dom.plannerModal) return;
  dom.plannerModal.classList.add("show");
  dom.plannerModal.setAttribute("aria-hidden", "false");
  renderPlannerPickerMap(true);
  updateModalLock();
}

function closePlannerModal() {
  if (!dom.plannerModal) return;
  dom.plannerModal.classList.remove("show");
  dom.plannerModal.setAttribute("aria-hidden", "true");
  updateModalLock();
}

function addPlannerPoint(latlng, notify = true) {
  if (!plannerEditMode) {
    showToast("请先点击“编辑当前路线”，再在地图上添加点位。");
    return false;
  }
  plannerPoints.push({
    lat: Number(latlng.lat.toFixed(6)),
    lng: Number(latlng.lng.toFixed(6)),
    type: sanitizeRouteType(plannerSelectedType),
  });
  plannerSelectedIndex = plannerPoints.length - 1;
  if (dom.plannerModal?.classList.contains("show")) {
    setPlannerPickerSelectedLatLng(latlng);
  }
  refreshPlannerViews(false);
  if (notify) {
    showToast("路线点位已添加。");
  }
  return true;
}

function setPlannerEditMode(enabled) {
  plannerEditMode = Boolean(enabled);
  if (!plannerEditMode) plannerSelectedIndex = null;
  refreshPlannerViews(false);
  showToast(plannerEditMode ? "管理员路线编辑已开启。" : "管理员路线编辑已完成。");
}

function undoPlannerPoint() {
  if (!plannerPoints.length) {
    showToast("当前没有可撤销的路线点位。");
    return;
  }
  plannerPoints.pop();
  plannerSelectedIndex = plannerPoints.length ? plannerPoints.length - 1 : null;
  refreshPlannerViews(false);
  showToast("已撤销最后一个路线点位。");
}

function clearPlannerRoute() {
  plannerPoints = [];
  plannerSelectedIndex = null;
  plannerPickerSelectedLatLng = null;
  plannerPickerSelectionMarker = null;
  refreshPlannerViews(true);
  showToast("路线规划已清空。");
}

function setEventFormMode(mode, eventName = "") {
  const isEdit = mode === "edit";
  if (dom.eventModeLabel) {
    dom.eventModeLabel.textContent = isEdit
      ? `当前正在编辑活动：${eventName || "未命名活动"}。保存后会以管理员版本覆盖现有内容。`
      : "管理员可新建活动，也可点下方“编辑活动”覆盖任意活动路线与基础信息。";
  }
  if (dom.eventSubmit) {
    dom.eventSubmit.textContent = isEdit ? "保存活动改动" : "发布新活动";
  }
  if (dom.eventCancel) {
    dom.eventCancel.hidden = !isEdit;
  }
}

function resetEventForm() {
  dom.eventForm.reset();
  if (dom.eventId) dom.eventId.value = "";
  if (dom.eventLevel) dom.eventLevel.value = "Beginner";
  plannerPoints = [];
  plannerSelectedIndex = null;
  plannerSelectedType = "checkpoint";
  plannerPickerSelectedLatLng = null;
  plannerPickerSelectionMarker = null;
  plannerEditMode = true;
  closePlannerModal();
  setEventFormMode("create");
  refreshPlannerViews(true);
}

function populateEventForm(eventItem) {
  if (!eventItem) return;
  if (dom.eventId) dom.eventId.value = String(eventItem.id || "");
  dom.eventForm.elements["name"].value = eventItem.name_zh || eventItem.name || "";
  dom.eventForm.elements["location"].value = eventItem.location_zh || eventItem.location || "";
  dom.eventForm.elements["time"].value = eventItem.time_label_zh || eventItem.time_label || "";
  dom.eventForm.elements["distance"].value = eventItem.distance || "";
  dom.eventForm.elements["level"].value = eventItem.level || "Beginner";
  dom.eventForm.elements["capacity"].value = eventItem.capacity || "";
  plannerPoints = normalizeRoutePoints(
    Array.isArray(eventItem.route) && eventItem.route.length
      ? eventItem.route.map((item, index) => {
          const coords = eventItem.route_coords?.[index] || [];
          return { lat: coords[0], lng: coords[1], type: item.type };
        })
      : eventItem.route_coords || []
  );
  plannerSelectedIndex = null;
  plannerSelectedType = plannerPoints[0]?.type || "checkpoint";
  plannerPickerSelectedLatLng = null;
  plannerPickerSelectionMarker = null;
  plannerEditMode = true;
  setEventFormMode("edit", eventItem.name_zh || eventItem.name || "");
  refreshPlannerViews(true);
  dom.eventForm.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    plannerMap?.invalidateSize();
    plannerPickerMap?.invalidateSize();
  }, 60);
}

function buildEventPayload(formData) {
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const timeLabel = String(formData.get("time") || "").trim();
  const distance = Number(formData.get("distance") || 5);
  const level = String(formData.get("level") || "Beginner");
  const capacity = Number(formData.get("capacity") || 20);
  const routeCoords = plannerPoints.map((point) => [point.lat, point.lng]);

  const pace =
    level === "Beginner"
      ? "6'30\"-8'00\" / km"
      : level === "Intermediate"
      ? "5'30\"-6'30\" / km"
      : "4'30\"-5'30\" / km";

  return {
    name,
    name_zh: name,
    description: "Admin-managed run with route planning and moderation support.",
    description_zh: "管理员后台创建或覆盖的活动，可统一管理路线、审核与活动信息。",
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
    lat: routeCoords[0]?.[0] ?? defaultPlannerCenter[0],
    lng: routeCoords[0]?.[1] ?? defaultPlannerCenter[1],
    route_coords: routeCoords,
    route: plannerPoints.map((point, index) => ({
      name: `Point ${index + 1}`,
      type: sanitizeRouteType(point.type || getDefaultRouteType(index, plannerPoints.length)),
    })),
  };
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
}

function renderUsers() {
  const keyword = dom.userSearch.value.trim().toLowerCase();
  const filtered = users.filter((user) => {
    const haystack = `${user.name} ${user.email}`.toLowerCase();
    return !keyword || haystack.includes(keyword);
  });
  const paginationMeta = getPaginatedItems("users", filtered);
  const visibleUsers = paginationMeta.items;

  dom.users.innerHTML = visibleUsers.length
    ? visibleUsers
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
  renderPagination("users", paginationMeta);

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
  const paginationMeta = getPaginatedItems("events", events);
  const visibleEvents = paginationMeta.items;

  dom.events.innerHTML = visibleEvents.length
    ? visibleEvents
        .map(
          (eventItem) => `
            <article class="admin-row">
              <div class="admin-row-head">
                <div>
                  <strong>${escapeHtml(eventItem.name_zh || eventItem.name)}</strong>
                  <div class="card-subtitle">${escapeHtml(eventItem.time_label)} · ${escapeHtml(eventItem.location)}</div>
                </div>
                <span class="status-pill">${escapeHtml(`${eventItem.distance} km`)}</span>
              </div>
              <div class="admin-row-meta">
                <span>难度：${escapeHtml(eventItem.level)}</span>
                <span>报名 ${eventItem.registration_count || 0}/${eventItem.capacity || 0}</span>
                <span>路线点位 ${(eventItem.route_coords || []).length}</span>
                <span>打卡点 ${eventItem.checkpoint_count || 0}</span>
                <span>创建人：${escapeHtml(eventItem.created_by_name || "系统")}</span>
              </div>
              <div class="admin-row-actions">
                <button class="outline-button" type="button" data-edit-event="${eventItem.id}">编辑活动</button>
                <button class="primary-button danger-button" type="button" data-delete-event="${eventItem.id}">删除活动</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="admin-empty">当前没有活动。</div>`;
  renderPagination("events", paginationMeta);

  dom.events.querySelectorAll("[data-edit-event]").forEach((button) => {
    button.addEventListener("click", () => {
      const eventItem = events.find((item) => String(item.id) === String(button.dataset.editEvent));
      populateEventForm(eventItem);
    });
  });

  dom.events.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.addEventListener("click", async () => {
      const eventId = button.dataset.deleteEvent;
      if (!window.confirm("确认删除这个活动吗？相关报名和打卡记录会一并清除。")) return;
      button.disabled = true;
      try {
        await apiRequest(`/events/${eventId}`, { method: "DELETE" });
        showToast("活动已删除。");
        if (String(dom.eventId.value) === String(eventId)) resetEventForm();
        await loadConsoleData();
      } catch (error) {
        showToast(error.message || "删除活动失败。");
      } finally {
        button.disabled = false;
      }
    });
  });
}

function postHiddenLabel(post) {
  if (!post.is_hidden) return "展示中";
  return `已隐藏${post.hidden_by_name ? ` · ${escapeHtml(post.hidden_by_name)}` : ""}`;
}

function commentHiddenLabel(comment) {
  if (!comment.is_hidden) return "展示中";
  return `已隐藏${comment.hidden_by_name ? ` · ${escapeHtml(comment.hidden_by_name)}` : ""}`;
}

function renderPosts() {
  const paginationMeta = getPaginatedItems("posts", posts);
  const visiblePosts = paginationMeta.items;

  dom.posts.innerHTML = visiblePosts.length
    ? visiblePosts
        .map((post) => {
          const commentRows = Array.isArray(post.comments) ? post.comments : [];
          return `
            <article class="admin-row ${post.is_hidden ? "is-hidden" : ""}">
              <div class="admin-row-head">
                <div>
                  <strong>${escapeHtml(post.user_name || "匿名用户")}</strong>
                  <div class="card-subtitle">${escapeHtml(post.user_email || "未记录邮箱")} · ${escapeHtml(
                    post.spot_name || "未知地点"
                  )}</div>
                </div>
                <span class="status-pill ${post.is_hidden ? "inactive" : "active"}">${postHiddenLabel(post)}</span>
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
                <span>隐藏评论 ${post.hidden_comment_count || 0}</span>
                <span>帖子 ID #${post.id}</span>
                <span>${escapeHtml(formatTime(post.created_at))}</span>
              </div>
              <div class="admin-row-actions">
                <button
                  class="outline-button warning-button"
                  type="button"
                  data-toggle-post="${post.id}"
                  data-hidden="${post.is_hidden ? "true" : "false"}"
                >
                  ${post.is_hidden ? "取消隐藏帖子" : "隐藏帖子"}
                </button>
                <button class="primary-button danger-button" type="button" data-delete-post="${post.id}">删除帖子</button>
              </div>
              <div class="admin-comment-list">
                ${
                  commentRows.length
                    ? commentRows
                        .map(
                          (comment) => `
                            <div class="admin-comment-row ${comment.is_hidden ? "is-hidden" : ""}">
                              <div class="admin-comment-head">
                                <strong>${escapeHtml(comment.user_name || "Runner")}</strong>
                                <span class="status-pill ${comment.is_hidden ? "inactive" : "active"}">${commentHiddenLabel(
                                  comment
                                )}</span>
                              </div>
                              <div class="card-subtitle">${escapeHtml(comment.user_email || "未记录邮箱")} · ${escapeHtml(
                                formatTime(comment.created_at)
                              )}</div>
                              <div class="body">${escapeHtml(comment.text)}</div>
                              <div class="admin-row-actions admin-comment-actions">
                                <button
                                  class="outline-button warning-button"
                                  type="button"
                                  data-toggle-comment="${comment.id}"
                                  data-hidden="${comment.is_hidden ? "true" : "false"}"
                                >
                                  ${comment.is_hidden ? "取消隐藏评论" : "隐藏评论"}
                                </button>
                                <button
                                  class="primary-button danger-button"
                                  type="button"
                                  data-delete-comment="${comment.id}"
                                >
                                  删除评论
                                </button>
                              </div>
                            </div>
                          `
                        )
                        .join("")
                    : `<div class="admin-empty">这条帖子当前没有评论。</div>`
                }
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="admin-empty">当前没有需要审核的帖子。</div>`;
  renderPagination("posts", paginationMeta);

  dom.posts.querySelectorAll("[data-delete-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.dataset.deletePost;
      if (!window.confirm("确认删除这条帖子吗？相关评论也会同时删除。")) return;
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

  dom.posts.querySelectorAll("[data-toggle-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      const postId = button.dataset.togglePost;
      const nextHidden = button.dataset.hidden !== "true";
      button.disabled = true;
      try {
        await apiRequest(`/admin/posts/${postId}`, {
          method: "PATCH",
          body: JSON.stringify({ is_hidden: nextHidden }),
        });
        showToast(nextHidden ? "帖子已隐藏。" : "帖子已恢复展示。");
        await loadConsoleData();
      } catch (error) {
        showToast(error.message || "帖子状态更新失败。");
      } finally {
        button.disabled = false;
      }
    });
  });

  dom.posts.querySelectorAll("[data-toggle-comment]").forEach((button) => {
    button.addEventListener("click", async () => {
      const commentId = button.dataset.toggleComment;
      const nextHidden = button.dataset.hidden !== "true";
      button.disabled = true;
      try {
        await apiRequest(`/admin/comments/${commentId}`, {
          method: "PATCH",
          body: JSON.stringify({ is_hidden: nextHidden }),
        });
        showToast(nextHidden ? "评论已隐藏。" : "评论已恢复展示。");
        await loadConsoleData();
      } catch (error) {
        showToast(error.message || "评论状态更新失败。");
      } finally {
        button.disabled = false;
      }
    });
  });

  dom.posts.querySelectorAll("[data-delete-comment]").forEach((button) => {
    button.addEventListener("click", async () => {
      const commentId = button.dataset.deleteComment;
      if (!window.confirm("确认删除这条评论吗？")) return;
      button.disabled = true;
      try {
        await apiRequest(`/admin/comments/${commentId}`, { method: "DELETE" });
        showToast("评论已删除。");
        await loadConsoleData();
      } catch (error) {
        showToast(error.message || "删除评论失败。");
      } finally {
        button.disabled = false;
      }
    });
  });
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
  const username = String(formData.get("username") || "").trim();
  const code = String(formData.get("code") || "");

  try {
    const token = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, code }),
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
    setView("console");
    initPlannerMap();
    initPlannerPickerResize();
    resetEventForm();
    await loadConsoleData();
    setTimeout(() => {
      plannerMap?.invalidateSize();
      plannerPickerMap?.invalidateSize();
    }, 60);
    showToast("管理员后台已就绪。");
  } catch (error) {
    setLoginMessage(error.message || "登录失败。", true);
  }
}

async function handleEventSubmit(event) {
  event.preventDefault();
  const formData = new FormData(dom.eventForm);
  const payload = buildEventPayload(formData);
  const eventId = String(formData.get("event_id") || "").trim();
  const isEdit = Boolean(eventId);

  dom.eventSubmit.disabled = true;
  try {
    if (isEdit) {
      await apiRequest(`/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("活动已按管理员版本更新。");
    } else {
      await apiRequest("/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("活动已发布。");
    }
    resetEventForm();
    await loadConsoleData();
  } catch (error) {
    showToast(error.message || (isEdit ? "活动更新失败。" : "活动创建失败。"));
  } finally {
    dom.eventSubmit.disabled = false;
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
      setView("console");
      initPlannerMap();
      initPlannerPickerResize();
      resetEventForm();
      await loadConsoleData();
      setTimeout(() => {
        plannerMap?.invalidateSize();
        plannerPickerMap?.invalidateSize();
      }, 60);
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
dom.eventForm.addEventListener("submit", handleEventSubmit);
dom.eventCancel?.addEventListener("click", resetEventForm);
dom.refreshButton.addEventListener("click", async () => {
  try {
    await loadConsoleData();
    setTimeout(() => {
      plannerMap?.invalidateSize();
      plannerPickerMap?.invalidateSize();
    }, 20);
    showToast("后台数据已刷新。");
  } catch (error) {
    showToast(error.message || "刷新失败。");
  }
});
dom.logoutButton.addEventListener("click", handleLogout);
dom.userSearch.addEventListener("input", () => {
  paginationState.users = 1;
  renderUsers();
});
[dom.plannerTypes, dom.plannerPickerTypes].filter(Boolean).forEach((group) => {
  group.querySelectorAll("[data-plan-type]").forEach((button) => {
    button.addEventListener("click", () => {
      plannerSelectedType = sanitizeRouteType(button.dataset.planType || "checkpoint");
      updatePlannerTypeButtons();
      if (plannerPickerSelectedLatLng && dom.plannerModal?.classList.contains("show")) {
        setPlannerPickerSelectedLatLng(plannerPickerSelectedLatLng);
      }
    });
  });
});
dom.plannerExpand?.addEventListener("click", openPlannerModal);
dom.plannerEdit?.addEventListener("click", () => setPlannerEditMode(true));
dom.plannerDone?.addEventListener("click", () => setPlannerEditMode(false));
dom.plannerUndo?.addEventListener("click", undoPlannerPoint);
dom.plannerClear?.addEventListener("click", clearPlannerRoute);
dom.plannerModalClose?.addEventListener("click", closePlannerModal);
dom.plannerModalCancel?.addEventListener("click", closePlannerModal);
dom.plannerModalEdit?.addEventListener("click", () => setPlannerEditMode(true));
dom.plannerModalDone?.addEventListener("click", () => setPlannerEditMode(false));
dom.plannerModalUndo?.addEventListener("click", undoPlannerPoint);
dom.plannerModalClear?.addEventListener("click", clearPlannerRoute);
dom.plannerModal?.addEventListener("click", (event) => {
  if (event.target === dom.plannerModal) {
    closePlannerModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dom.plannerModal?.classList.contains("show")) {
    closePlannerModal();
  }
});

init();
