const stateKey = "gorunners_state_v2";
const eventsKey = "gorunners_events_v2";

const defaultState = {
  registrations: [],
  checkins: {},
  points: 0,
  badges: [],
  streak: 0,
  checkpointProgress: {},
  locationEnabled: false,
  updates: [],
  language: "en",
  posts: {},
  selectedSpotId: CITY_SPOTS[0]?.id || "",
  selectedTrainerId: "",
  aiChats: {},
  currentLocation: null,
  routePlans: {},
  draftRoutes: {},
  savedRoutes: {},
  selectedRoutes: {},
  routeMode: "idle",
};

const i18n = {
  en: {
    nav_home: "Home",
    nav_explore: "Explore",
    nav_event: "Event",
    nav_match: "Match Me",
    nav_community: "Community",
    nav_myrun: "My Run",
    nav_organizer: "Organizer",
    nav_ai_trainer: "AI Trainer",
    header_location: "Enable Location",
    header_join: "Join Next Run",
    header_login: "Login",
    header_logout: "Logout",
    ai_eyebrow: "AI",
    ai_title: "AI Trainer",
    ai_subtitle: "Choose a trainer and chat inside the page.",
    ai_open: "Open",
    ai_setup: "Setup",
    ai_default_name: "AI Trainer",
    ai_select_placeholder: "Select a trainer",
    ai_empty: "Configure trainer embed URLs in config.js to enable this panel.",
    ai_input_label: "Message",
    ai_input_placeholder: "Ask the trainer…",
    ai_send: "Send",
    ai_clear: "Clear",
    ai_chat_unavailable: "AI chat is not configured on the server.",
    ai_chat_error: "AI request failed. Please try again.",
    ai_profile_title: "Trainer Setup",
    ai_profile_subtitle: "Fill the required info once, then start chatting.",
    ai_profile_save: "Save",
    ai_profile_missing: "Please complete the required fields first.",
    ai_profile_loading: "Loading trainer setup…",
    hero_eyebrow: "C1 Go Runners - Wuming Run Crew Edition",
    hero_title: "Run together, feel connected, play the route.",
    hero_lead:
      "GoRunners is a playful web platform that helps runners discover onsite events, match with pace-friendly groups, and unlock rewards along interactive routes.",
    hero_cta_explore: "Explore Runs",
    hero_cta_match: "Find My Pace",
    hero_stat_members: "Active Members",
    hero_stat_runs: "Runs This Week",
    hero_stat_badges: "Badges Earned",
    spotlight_title: "Tonight's Spotlight",
    label_time: "Time",
    label_meetup: "Meet-up",
    label_pace: "Pace",
    label_perks: "Playful Perks",
    spotlight_cta: "Reserve a Spot",
    explore_eyebrow: "Discover",
    explore_title: "Explore Onsite Runs",
    search_placeholder: "Search by name or tag",
    filter_distance: "Distance",
    filter_short: "0-4 km",
    filter_medium: "5-8 km",
    filter_long: "9+ km",
    filter_level: "Difficulty",
    level_beginner: "Beginner",
    level_intermediate: "Intermediate",
    level_advanced: "Advanced",
    filter_time: "Time",
    time_morning: "Morning",
    time_afternoon: "Afternoon",
    time_evening: "Evening",
    detail_eyebrow: "Detail",
    detail_title: "Run Event Detail",
    label_distance: "Distance",
    label_pace_range: "Pace Range",
    button_register: "Register Now",
    button_preview: "Preview Route",
    map_title: "Interactive Route Map",
    button_reset: "Reset Checkpoints",
    button_recommend: "Recommend Points",
    button_plan_clear: "Clear Plan",
    button_map_expand: "Expand Planner",
    button_route_edit: "Edit Current Route",
    button_route_done: "Finish Editing",
    button_route_undo: "Undo Point",
    button_route_save: "Save Route",
    button_route_update: "Update Route",
    button_route_add: "Add Point",
    button_route_delete_point: "Delete Point",
    map_footnote: "Complete all checkpoints to unlock the Route Explorer badge.",
    map_plan_note: "Tap map to open fullscreen planner and add running points with guided tips.",
    map_edit_hint: "Press Edit Current Route, then tap the map to add route points.",
    route_select_placeholder: "Saved routes",
    route_name_placeholder: "Route name",
    route_saved_empty: "No saved routes yet.",
    map_picker_title: "Route Planner",
    map_picker_subtitle: "Select a point for hydration, checkpoints, and route strategy.",
    map_picker_close: "Close",
    map_picker_steps_title: "How to choose a location",
    map_picker_step_1: "Choose marker type",
    map_picker_step_2: "Tap map or a suggested point",
    map_picker_step_3: "Confirm and save",
    map_picker_hint_checkpoint: "Good for pace reminders and team regroup points.",
    map_picker_hint_water: "Place this where runners can refill and recover quickly.",
    map_picker_hint_photo: "Mark scenic spots for photos and social sharing.",
    map_picker_hint_start: "Use this for the gather point before warm-up.",
    map_picker_hint_finish: "Set this at your finish funnel and cooldown zone.",
    map_picker_suggestions: "Suggested route points",
    map_picker_note_label: "Marker note",
    map_picker_note_placeholder: "e.g. Easy pace regroup",
    map_picker_coords_empty: "No point selected yet.",
    map_picker_coords_value: "Selected: {lat}, {lng}",
    map_picker_cancel: "Cancel",
    map_picker_save: "Save Marker",
    match_eyebrow: "Match",
    match_title: "Pace-Based Group Matching",
    match_subtitle:
      "Tell us your pace, goals, and vibe. We'll recommend a group and a run that keeps it supportive and fun.",
    match_experience_label: "Experience Level",
    match_goal_label: "Goal for Today",
    match_pace_label: "Preferred Pace (min/km)",
    match_style_label: "Run Style",
    goal_social: "Social",
    goal_stress: "Stress Relief",
    goal_training: "Training",
    goal_pb: "Challenge PB",
    style_buddy: "Buddy",
    style_group: "Group",
    style_solo: "Solo + check-ins",
    match_wearable: "Sync from wearable for real-time pace",
    match_submit: "Get My Match",
    match_result_title: "Your Match",
    match_result_default: "Complete the form to see recommendations.",
    match_result_body:
      "We will suggest a pace-friendly group, a nearby run, and the playful rewards you can unlock.",
    community_eyebrow: "Community",
    community_title: "Suzhou Runner Map & Threads",
    community_subtitle:
      "Explore real spots across Suzhou, check in onsite, and share runner-to-runner tips.",
    community_map_title: "Suzhou Live Map",
    community_locate: "Locate Me",
    community_checkin: "Check In",
    community_note: "Location is used only to show nearby spots and check-ins.",
    community_feed_title: "Spot Threads",
    post_placeholder: "Share a tip or moment",
    post_camera: "Open Camera",
    post_submit: "Post",
    auth_signin: "Sign In",
    auth_register: "Register",
    auth_toggle_register: "Need an account? Register",
    auth_toggle_login: "Have an account? Login",
    auth_email_label: "Email",
    auth_name_label: "Name",
    auth_password_label: "Password",
    auth_login_button: "Login",
    auth_register_button: "Create Account",
    myrun_eyebrow: "My Run",
    myrun_title: "Participation Rewards & Progress",
    myrun_subtitle: "Celebrate consistency, not competition. Track your streaks, badges, and upcoming runs.",
    myrun_streak: "Weekly Streak",
    myrun_streak_hint: "Join 3 runs in a row to unlock the Momentum badge.",
    myrun_points: "Total Points",
    myrun_points_hint: "Earn points for each registration, checkpoint, and team run.",
    myrun_badges: "Badges Unlocked",
    myrun_upcoming: "Upcoming Runs",
    myrun_clear: "Clear All",
    org_eyebrow: "Organizer",
    org_title: "Lightweight Activity Management",
    org_subtitle:
      "Create events, track attendance, and broadcast onsite updates to keep everyone informed.",
    org_create_title: "Create a New Run",
    org_name_label: "Run Name",
    org_location_label: "Meet-up Location",
    org_time_label: "Time & Day",
    org_distance_label: "Distance (km)",
    org_level_label: "Difficulty",
    org_capacity_label: "Capacity",
    org_publish: "Publish Run",
    org_attendance: "Live Attendance",
    org_users: "User Management",
    org_users_load: "Refresh",
    org_update: "Send Update",
    org_notice: "No update sent yet. Tap \"Send Update\" to broadcast a warm-up reminder.",
    footer_title: "GoRunners - Wuming Run Crew",
    footer_subtitle: "Built for CPT208 Human-Centric Computing - Active Lifestyles Track",
    footer_explore: "See All Runs",
    footer_match: "Match Again",
    spots_left: "{count} spots left",
    seats_left: "{count} seats left",
    button_details: "View details",
    button_register_short: "Register",
    badge_unlocked: "Unlocked",
    no_registrations: "No registrations yet. Pick a run to get started.",
    no_attendance: "No attendees yet. Publish a run to start.",
    no_posts: "No posts yet. Be the first to share a tip.",
    post_like: "Like",
    post_reply: "Reply",
    post_floor: "{count}F",
    spot_vibe: "Vibe",
    spot_distance: "Distance",
    match_result_prefix: "We recommend",
    type_start: "start",
    type_water: "water",
    type_photo: "photo",
    type_checkpoint: "checkpoint",
    type_finish: "finish",
    toast_already_registered: "You are already registered.",
    toast_no_spots: "No spots left. Try another run.",
    toast_registered: "Registration confirmed! See you onsite.",
    toast_route_badge: "Route Explorer badge unlocked!",
    toast_checkpoints_reset: "Checkpoints reset.",
    toast_location_enabled: "Location enabled for onsite routing.",
    toast_location_disabled: "Location disabled.",
    toast_geo_unsupported: "Geolocation is not supported on this device.",
    toast_geo_denied: "Location access denied.",
    toast_geo_success: "Location updated.",
    toast_checkin_ok: "Checked in at {spot}.",
    toast_checkin_far: "You are about {distance} km away. Move closer to check in.",
    toast_posted: "Post published.",
    toast_like: "Thanks for the encouragement!",
    toast_reply: "Reply added.",
    toast_update_sent: "Update broadcasted to runners.",
    toast_event_created: "New run published.",
    toast_cleared: "All registrations cleared.",
    toast_route_preview: "Route preview focused.",
    toast_login_required: "Please login to continue.",
    toast_login_success: "Logged in.",
    toast_logout: "Logged out.",
    toast_register_success: "Account created.",
    toast_admin_required: "Admin access required.",
    toast_recommend_done: "Recommended checkpoints added.",
    toast_plan_added: "Planning marker saved.",
    toast_route_editing: "Route editing enabled. Tap the map to add points.",
    toast_route_done: "Route editing finished.",
    toast_route_saved: "Route saved.",
    toast_route_updated: "Route updated.",
    toast_route_selected: "Saved route loaded.",
    toast_route_empty: "Add at least two points before saving.",
    toast_route_undo: "Last route point removed.",
    toast_route_deleted: "Route deleted.",
    toast_route_renamed: "Route renamed.",
    toast_route_point_deleted: "Route point deleted.",
    toast_picker_need_point: "Select a point on the map first.",
    toast_checkin_confirm: "Check-in confirmed.",
    toast_checkin_removed: "Check-in removed.",
    toast_geo_needed: "Enable location to check in.",
    header_location_on: "Location Enabled",
  },
  zh: {
    nav_home: "首页",
    nav_explore: "活动",
    nav_event: "详情",
    nav_match: "匹配",
    nav_community: "社区",
    nav_myrun: "我的跑步",
    nav_organizer: "组织者",
    nav_ai_trainer: "AI训练师选择",
    header_location: "开启定位",
    header_join: "加入下一场",
    header_login: "登录",
    header_logout: "退出",
    ai_eyebrow: "AI",
    ai_title: "AI训练师",
    ai_subtitle: "选择一个训练师，在页面内直接对话。",
    ai_open: "新窗口打开",
    ai_setup: "设置",
    ai_default_name: "AI训练师",
    ai_select_placeholder: "请选择AI训练师",
    ai_empty: "请在 config.js 配置 AI 训练师 embed URL，才能显示对话面板。",
    ai_input_label: "消息",
    ai_input_placeholder: "问训练师一个问题…",
    ai_send: "发送",
    ai_clear: "清空",
    ai_chat_unavailable: "服务器尚未配置 AI 对话能力。",
    ai_chat_error: "AI 请求失败，请稍后重试。",
    ai_profile_title: "训练师信息",
    ai_profile_subtitle: "先填写必填信息，再开始对话。",
    ai_profile_save: "保存",
    ai_profile_missing: "请先补全必填信息。",
    ai_profile_loading: "正在加载训练师表单…",
    hero_eyebrow: "C1 Go Runners - 无名跑团",
    hero_title: "一起奔跑，连接彼此，玩转路线。",
    hero_lead: "GoRunners 帮助跑者发现线下活动、匹配合适配速小组，并在互动路线中解锁奖励。",
    hero_cta_explore: "发现活动",
    hero_cta_match: "匹配配速",
    hero_stat_members: "活跃成员",
    hero_stat_runs: "本周活动",
    hero_stat_badges: "徽章已解锁",
    spotlight_title: "今晚推荐",
    label_time: "时间",
    label_meetup: "集合点",
    label_pace: "配速",
    label_perks: "互动奖励",
    spotlight_cta: "立即报名",
    explore_eyebrow: "发现",
    explore_title: "探索线下跑步活动",
    search_placeholder: "搜索活动名称或标签",
    filter_distance: "距离",
    filter_short: "0-4 公里",
    filter_medium: "5-8 公里",
    filter_long: "9+ 公里",
    filter_level: "难度",
    level_beginner: "新手",
    level_intermediate: "进阶",
    level_advanced: "高级",
    filter_time: "时间",
    time_morning: "早上",
    time_afternoon: "下午",
    time_evening: "晚上",
    detail_eyebrow: "详情",
    detail_title: "活动详情",
    label_distance: "距离",
    label_pace_range: "配速范围",
    button_register: "立即报名",
    button_preview: "预览路线",
    map_title: "互动路线地图",
    button_reset: "重置打卡",
    button_recommend: "推荐打卡点",
    button_plan_clear: "清空规划",
    button_map_expand: "放大规划",
    button_route_edit: "编辑当前路线",
    button_route_done: "完成编辑",
    button_route_undo: "撤销点位",
    button_route_save: "保存路线",
    button_route_update: "更新路线",
    button_route_add: "添加点位",
    button_route_delete_point: "删除点位",
    map_footnote: "完成所有打卡点可解锁路线探索徽章。",
    map_plan_note: "点击地图可进入全屏规划，按提示添加补水和路线标注。",
    map_edit_hint: "先点击编辑当前路线，再点击地图添加路线点位。",
    route_select_placeholder: "已保存路线",
    route_name_placeholder: "路线名称",
    route_saved_empty: "暂无保存路线。",
    map_picker_title: "路线规划面板",
    map_picker_subtitle: "选择补水点、打卡点与配速策略位置。",
    map_picker_close: "关闭",
    map_picker_steps_title: "地点选择步骤",
    map_picker_step_1: "先选择标注类型",
    map_picker_step_2: "点击地图或推荐点位",
    map_picker_step_3: "确认后保存",
    map_picker_hint_checkpoint: "适合设置集合点，帮助队伍保持节奏。",
    map_picker_hint_water: "建议设置在中段，方便补水和短暂恢复。",
    map_picker_hint_photo: "标记风景位，便于合影和活动分享。",
    map_picker_hint_start: "用于活动集合与热身起点。",
    map_picker_hint_finish: "用于终点冲线与放松区域。",
    map_picker_suggestions: "推荐路线点位",
    map_picker_note_label: "标注备注",
    map_picker_note_placeholder: "例如：慢配速集合点",
    map_picker_coords_empty: "尚未选择点位。",
    map_picker_coords_value: "已选坐标：{lat}, {lng}",
    map_picker_cancel: "取消",
    map_picker_save: "保存标注",
    match_eyebrow: "匹配",
    match_title: "配速分组匹配",
    match_subtitle: "告诉我们你的配速与目标，我们会推荐适合的小组和活动。",
    match_experience_label: "跑步经验",
    match_goal_label: "今日目标",
    match_pace_label: "偏好配速 (分钟/公里)",
    match_style_label: "跑步风格",
    goal_social: "社交",
    goal_stress: "减压",
    goal_training: "训练",
    goal_pb: "挑战PB",
    style_buddy: "搭子",
    style_group: "小组",
    style_solo: "独跑+签到",
    match_wearable: "同步穿戴设备配速",
    match_submit: "获取匹配",
    match_result_title: "你的匹配",
    match_result_default: "完成表单后查看推荐结果。",
    match_result_body: "我们将推荐合适的小组、附近活动以及可解锁奖励。",
    community_eyebrow: "社区",
    community_title: "苏州跑步地图与互动贴",
    community_subtitle: "探索苏州真实地点，现场签到并分享跑者心得。",
    community_map_title: "苏州实时地图",
    community_locate: "定位我",
    community_checkin: "现场签到",
    community_note: "定位仅用于展示附近点位与签到。",
    community_feed_title: "地点帖子",
    post_placeholder: "分享路线建议或跑步瞬间",
    post_camera: "打开相机",
    post_submit: "发布",
    auth_signin: "登录",
    auth_register: "注册",
    auth_toggle_register: "没有账号？注册",
    auth_toggle_login: "已有账号？登录",
    auth_email_label: "邮箱",
    auth_name_label: "姓名",
    auth_password_label: "密码",
    auth_login_button: "登录",
    auth_register_button: "创建账号",
    myrun_eyebrow: "我的跑步",
    myrun_title: "参与奖励与进度",
    myrun_subtitle: "鼓励坚持而非竞争，记录你的连续参与与徽章。",
    myrun_streak: "本周连续",
    myrun_streak_hint: "连续参加3次可解锁连续打卡徽章。",
    myrun_points: "累计积分",
    myrun_points_hint: "报名、打卡、组队均可获得积分。",
    myrun_badges: "徽章解锁",
    myrun_upcoming: "已报名活动",
    myrun_clear: "清空",
    org_eyebrow: "组织者",
    org_title: "轻量活动管理",
    org_subtitle: "创建活动、签到管理、现场通知，一站式管理。",
    org_create_title: "创建新活动",
    org_name_label: "活动名称",
    org_location_label: "集合地点",
    org_time_label: "时间与日期",
    org_distance_label: "距离 (公里)",
    org_level_label: "难度",
    org_capacity_label: "人数上限",
    org_publish: "发布活动",
    org_attendance: "签到情况",
    org_users: "用户管理",
    org_users_load: "刷新",
    org_update: "发送通知",
    org_notice: "暂无通知，点击发送提醒热身。",
    footer_title: "GoRunners - 无名跑团",
    footer_subtitle: "CPT208 Human-Centric Computing - Active Lifestyles",
    footer_explore: "查看活动",
    footer_match: "再次匹配",
    spots_left: "剩余{count}位",
    seats_left: "剩余{count}位",
    button_details: "查看详情",
    button_register_short: "报名",
    badge_unlocked: "已解锁",
    no_registrations: "暂无报名活动，先选择一场吧。",
    no_attendance: "暂无签到，先发布活动。",
    no_posts: "还没有帖子，快来第一个分享吧。",
    post_like: "鼓励",
    post_reply: "回复",
    post_floor: "{count}楼",
    spot_vibe: "氛围",
    spot_distance: "距离",
    match_result_prefix: "推荐",
    type_start: "起点",
    type_water: "补水",
    type_photo: "拍照",
    type_checkpoint: "打卡",
    type_finish: "终点",
    toast_already_registered: "你已经报名了。",
    toast_no_spots: "名额已满，试试其他活动。",
    toast_registered: "报名成功，现场见。",
    toast_route_badge: "已解锁路线探索徽章。",
    toast_checkpoints_reset: "已重置打卡点。",
    toast_location_enabled: "定位已开启。",
    toast_location_disabled: "定位已关闭。",
    toast_geo_unsupported: "当前设备不支持定位。",
    toast_geo_denied: "定位权限被拒绝。",
    toast_geo_success: "定位已更新。",
    toast_checkin_ok: "已在{spot}签到。",
    toast_checkin_far: "距离约{distance}公里，靠近后可签到。",
    toast_posted: "已发布帖子。",
    toast_like: "感谢你的鼓励。",
    toast_reply: "回复已添加。",
    toast_update_sent: "通知已发送。",
    toast_event_created: "新活动已发布。",
    toast_cleared: "已清空报名记录。",
    toast_route_preview: "已定位路线预览。",
    toast_login_required: "请先登录。",
    toast_login_success: "已登录。",
    toast_logout: "已退出。",
    toast_register_success: "账号已创建。",
    toast_admin_required: "需要管理员权限。",
    toast_recommend_done: "已生成推荐打卡点。",
    toast_plan_added: "规划标注已保存。",
    toast_route_editing: "已进入路线编辑，点击地图添加点位。",
    toast_route_done: "路线编辑已完成。",
    toast_route_saved: "路线已保存。",
    toast_route_updated: "路线已更新。",
    toast_route_selected: "已载入保存的路线。",
    toast_route_empty: "至少添加两个点位后再保存。",
    toast_route_undo: "已撤销最后一个点位。",
    toast_route_deleted: "路线已删除。",
    toast_route_renamed: "路线已重命名。",
    toast_route_point_deleted: "点位已删除。",
    toast_picker_need_point: "请先在地图上选择一个点位。",
    toast_checkin_confirm: "签到已确认。",
    toast_checkin_removed: "已取消签到。",
    toast_geo_needed: "请先开启定位再签到。",
    header_location_on: "定位已开启",
  },
};

const sampleUpdates = {
  en: [
    "Warm-up starts in 10 minutes at the plaza.",
    "Buddy check: grab a partner before the first checkpoint.",
    "Hydration reminder: water station open at 2.5 km.",
  ],
  zh: ["10分钟后开始热身", "请先找到搭子", "补水点已开放"],
};

const defaultAiTrainer = {
  id: "default",
  label: { en: "GoRunner AI Trainer", zh: "GoRunner AI训练师" },
  iframeSrc: "http://127.0.0.1/chatbot/YcT9FHuccNmapXDu",
};

const dom = {
  navLinks: document.querySelectorAll(".nav-link"),
  sections: document.querySelectorAll("main section"),
  langButtons: document.querySelectorAll(".lang-button"),
  aiTrainerIframe: document.getElementById("ai-trainer-iframe"),
  aiTrainerEmpty: document.getElementById("ai-trainer-empty"),
  aiTrainerName: document.getElementById("ai-trainer-name"),
  aiEmbed: document.getElementById("ai-embed"),
  eventsGrid: document.getElementById("events-grid"),
  eventTags: document.getElementById("event-tags"),
  eventName: document.getElementById("event-name"),
  eventSubtitle: document.getElementById("event-subtitle"),
  eventStatus: document.getElementById("event-status"),
  eventLocation: document.getElementById("event-location"),
  eventTime: document.getElementById("event-time"),
  eventDistance: document.getElementById("event-distance"),
  eventPace: document.getElementById("event-pace"),
  eventDescription: document.getElementById("event-description"),
  eventGear: document.getElementById("event-gear"),
  eventRewards: document.getElementById("event-rewards"),
  registerButton: document.getElementById("register-button"),
  routeMap: document.getElementById("route-map"),
  checkpointList: document.getElementById("checkpoint-list"),
  routeReset: document.getElementById("route-reset"),
  checkpointRecommend: document.getElementById("checkpoint-recommend"),
  planClear: document.getElementById("plan-clear"),
  mapExpand: document.getElementById("map-expand"),
  routeEdit: document.getElementById("route-edit"),
  routeDone: document.getElementById("route-done"),
  routeUndo: document.getElementById("route-undo"),
  routeSave: document.getElementById("route-save"),
  routeUpdate: document.getElementById("route-update"),
  routeSelect: document.getElementById("route-select"),
  routeSavedList: document.getElementById("route-saved-list"),
  routeEditHint: document.getElementById("route-edit-hint"),
  routePreview: document.getElementById("route-preview"),
  matchForm: document.getElementById("match-form"),
  matchTitle: document.getElementById("match-title"),
  matchBody: document.getElementById("match-body"),
  matchBadges: document.getElementById("match-badges"),
  streakCount: document.getElementById("streak-count"),
  pointsCount: document.getElementById("points-count"),
  badgeGrid: document.getElementById("badge-grid"),
  registrationsList: document.getElementById("registrations-list"),
  clearRegistrations: document.getElementById("clear-registrations"),
  attendanceList: document.getElementById("attendance-list"),
  sendUpdate: document.getElementById("send-update"),
  organizerNotice: document.getElementById("organizer-notice"),
  usersList: document.getElementById("users-list"),
  loadUsers: document.getElementById("load-users"),
  createEventForm: document.getElementById("create-event-form"),
  searchInput: document.getElementById("search-input"),
  filterDistance: document.getElementById("filter-distance"),
  filterLevel: document.getElementById("filter-level"),
  filterTime: document.getElementById("filter-time"),
  locationToggle: document.getElementById("location-toggle"),
  quickRegister: document.getElementById("quick-register"),
  spotlightTitle: document.getElementById("spotlight-title"),
  spotlightTime: document.getElementById("spotlight-time"),
  spotlightLocation: document.getElementById("spotlight-location"),
  spotlightPace: document.getElementById("spotlight-pace"),
  spotlightPerks: document.getElementById("spotlight-perks"),
  spotlightCta: document.getElementById("spotlight-cta"),
  toast: document.getElementById("toast"),
  locateButton: document.getElementById("locate-button"),
  checkinButton: document.getElementById("checkin-button"),
  spotSelect: document.getElementById("spot-select"),
  spotDetails: document.getElementById("spot-details"),
  postForm: document.getElementById("post-form"),
  postText: document.getElementById("post-text"),
  postImage: document.getElementById("post-image"),
  postPreview: document.getElementById("post-preview"),
  postList: document.getElementById("post-list"),
  cameraButton: document.getElementById("camera-button"),
  loginButton: document.getElementById("login-button"),
  logoutButton: document.getElementById("logout-button"),
  userChip: document.getElementById("user-chip"),
  userName: document.getElementById("user-name"),
  authModal: document.getElementById("auth-modal"),
  authForm: document.getElementById("auth-form"),
  authToggle: document.getElementById("auth-toggle"),
  authClose: document.getElementById("auth-close"),
  authTitle: document.getElementById("auth-title"),
  authSubmit: document.getElementById("auth-submit"),
  authNameField: document.getElementById("auth-name-field"),
  mapPickerModal: document.getElementById("map-picker-modal"),
  mapPickerClose: document.getElementById("map-picker-close"),
  mapPickerCancel: document.getElementById("map-picker-cancel"),
  mapPickerSave: document.getElementById("map-picker-save"),
  mapPickerAdd: document.getElementById("map-picker-add"),
  mapPickerUndo: document.getElementById("map-picker-undo"),
  mapPickerDeletePoint: document.getElementById("map-picker-delete-point"),
  mapPickerUpdate: document.getElementById("map-picker-update"),
  mapPickerRouteSelect: document.getElementById("map-picker-route-select"),
  mapPickerRouteList: document.getElementById("map-picker-route-list"),
  mapPickerTypes: document.getElementById("map-picker-types"),
  mapPickerHint: document.getElementById("map-picker-hint"),
  mapPickerSuggestions: document.getElementById("map-picker-suggestions"),
  mapPickerLabel: document.getElementById("map-picker-label"),
  mapPickerCoords: document.getElementById("map-picker-coords"),
};

let API_BASE =
  localStorage.getItem("gorunners_api") ||
  window.GORUNNERS_API ||
  "http://127.0.0.1:8000";
const tokenKey = "gorunners_token";

let state = loadState();
let events = [...DEFAULT_EVENTS];
let spots = [...CITY_SPOTS];
let activeEvent = events[0];
let currentLang = state.language || "en";
let authToken = localStorage.getItem(tokenKey) || "";
let currentUser = null;
let authMode = "login";
let eventMap;
let cityMap;
let pickerMap;
let eventLayerGroup;
let planLayerGroup;
let cityLayerGroup;
let pickerRouteLayer;
let pickerPlanLayer;
let pickerSelectionLayer;
let pickerSelectionMarker;
let userMarker;
let pickerSelectedType = "checkpoint";
let pickerSelectedLatLng = null;
let selectedRoutePointIndex = null;
const planTypeIcons = {
  start: "S",
  checkpoint: "C",
  water: "W",
  photo: "P",
  finish: "F",
};
const suzhouBounds = window.L
  ? L.latLngBounds([
      [30.9, 120.2],
      [31.7, 121.1],
    ])
  : null;

function t(key, vars = {}) {
  const dict = i18n[currentLang] || i18n.en;
  let text = dict[key] || i18n.en[key] || key;
  Object.entries(vars).forEach(([token, value]) => {
    text = text.replace(new RegExp(`{${token}}`, "g"), value);
  });
  return text;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    element.placeholder = t(key);
  });
  dom.matchTitle.textContent = t("match_result_default");
  dom.matchBody.textContent = t("match_result_body");
  updatePickerTypeButtons();
  if (!pickerSelectedLatLng) {
    dom.mapPickerCoords.textContent = t("map_picker_coords_empty");
  } else {
    dom.mapPickerCoords.textContent = t("map_picker_coords_value", {
      lat: pickerSelectedLatLng.lat.toFixed(5),
      lng: pickerSelectedLatLng.lng.toFixed(5),
    });
  }
}

function setLanguage(lang) {
  currentLang = lang;
  state.language = lang;
  saveState();
  document.documentElement.lang = lang === "zh" ? "zh" : "en";
  dom.langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
  applyTranslations();
  updateLocationButton();
  updateAuthModal();
  setUserUI();
  renderEvents();
  renderEventDetail();
  renderMyRun();
  renderSpotList();
  renderSpotDetails();
  renderPosts();
  updateSpotlight(activeEvent);
  renderCityMarkers();
  renderAiTrainer();
  if (dom.mapPickerModal.classList.contains("show")) {
    renderPickerMap();
  }
}

function getAiTrainers() {
  const trainers = window.GORUNNERS_AI_TRAINERS;
  if (!Array.isArray(trainers)) return [];
  return trainers
    .filter((trainer) => trainer && trainer.id)
    .map((trainer) => ({
      id: String(trainer.id),
      label: trainer.label,
      mode: trainer.mode === "api" ? "api" : "embed",
      useDifyParameters: trainer.useDifyParameters === true,
      iframeSrc: typeof trainer.iframeSrc === "string" ? trainer.iframeSrc : "",
      inputForm: Array.isArray(trainer.inputForm) ? trainer.inputForm : [],
    }));
}

function getAiTrainerLabel(trainer) {
  if (!trainer) return "";
  if (typeof trainer.label === "string") return trainer.label;
  if (trainer.label && typeof trainer.label === "object") {
    return currentLang === "zh"
      ? trainer.label.zh || trainer.label.en || trainer.id
      : trainer.label.en || trainer.label.zh || trainer.id;
  }
  return trainer.id;
}

function getAnonAiUserId() {
  const key = "gorunners_ai_user";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const generated =
    (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
    `anon_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  localStorage.setItem(key, generated);
  return generated;
}

function getChatState(trainerId) {
  if (!state.aiChats || typeof state.aiChats !== "object") {
    state.aiChats = {};
  }
  if (!state.aiChats[trainerId]) {
    state.aiChats[trainerId] = { conversationId: "", messages: [], inputs: {} };
  }
  const chat = state.aiChats[trainerId];
  if (!Array.isArray(chat.messages)) chat.messages = [];
  if (typeof chat.conversationId !== "string") chat.conversationId = "";
  if (!chat.inputs || typeof chat.inputs !== "object") chat.inputs = {};
  return chat;
}

function pushChatMessage(trainerId, role, text) {
  const chat = getChatState(trainerId);
  chat.messages.push({ role, text: String(text || "") });
  if (chat.messages.length > 60) {
    chat.messages = chat.messages.slice(-60);
  }
  saveState();
}

function renderAiChat(trainerId) {
  if (!dom.aiChatMessages) return;
  const chat = getChatState(trainerId);
  dom.aiChatMessages.innerHTML = "";

  if (!chat.messages.length) {
    const bubble = document.createElement("div");
    bubble.className = "ai-chat-bubble meta";
    bubble.textContent = currentLang === "zh" ? "从一个问题开始吧。" : "Start with a question.";
    dom.aiChatMessages.appendChild(bubble);
    return;
  }

  chat.messages.forEach((message) => {
    const bubble = document.createElement("div");
    const role = message.role === "user" ? "user" : message.role === "assistant" ? "assistant" : "meta";
    bubble.className = `ai-chat-bubble ${role}`;
    bubble.textContent = message.text || "";
    dom.aiChatMessages.appendChild(bubble);
  });

  dom.aiChatMessages.scrollTop = dom.aiChatMessages.scrollHeight;
}

async function sendAiChatMessage(trainerId, text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;

  const chat = getChatState(trainerId);
  const activeTrainer = getAiTrainers().find((trainer) => trainer.id === trainerId);
  const requiredFields = (activeTrainer?.inputForm || []).filter((field) => field?.required);
  const missingRequired = requiredFields.some((field) => !String(chat.inputs?.[field.key] || "").trim());
  if (missingRequired) {
    pushChatMessage(trainerId, "meta", t("ai_profile_missing"));
    renderAiChat(trainerId);
    if (dom.aiChatProfile) dom.aiChatProfile.hidden = false;
    return;
  }

  pushChatMessage(trainerId, "user", trimmed);
  renderAiChat(trainerId);

  try {
    const response = await apiRequest("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message: trimmed,
        conversation_id: chat.conversationId,
        user: currentUser?.email || currentUser?.id?.toString() || getAnonAiUserId(),
        inputs: chat.inputs || {},
      }),
    });
    if (response?.conversation_id) {
      chat.conversationId = String(response.conversation_id);
    }
    pushChatMessage(trainerId, "assistant", response?.answer || "");
  } catch (error) {
    const message = error?.message || t("ai_chat_error");
    pushChatMessage(trainerId, "meta", message === "Request failed" ? t("ai_chat_unavailable") : message);
  }
  renderAiChat(trainerId);
}

function getFieldLabel(field) {
  if (!field) return "";
  const label = field.label;
  if (typeof label === "string") return label;
  if (label && typeof label === "object") {
    return currentLang === "zh" ? label.zh || label.en || field.key : label.en || label.zh || field.key;
  }
  return field.key;
}

function getFieldPlaceholder(field) {
  if (!field) return "";
  const placeholder = field.placeholder;
  if (typeof placeholder === "string") return placeholder;
  if (placeholder && typeof placeholder === "object") {
    return currentLang === "zh"
      ? placeholder.zh || placeholder.en || ""
      : placeholder.en || placeholder.zh || "";
  }
  return "";
}

function getOptionLabel(option) {
  if (!option) return "";
  const label = option.label;
  if (typeof label === "string") return label;
  if (label && typeof label === "object") {
    return currentLang === "zh" ? label.zh || label.en || option.value : label.en || label.zh || option.value;
  }
  return option.value;
}

let difyParametersCache = null;
let difyParametersPromise = null;

async function ensureDifyParameters() {
  if (difyParametersCache) return difyParametersCache;
  if (!difyParametersPromise) {
    difyParametersPromise = apiRequest("/ai/parameters")
      .then((payload) => {
        difyParametersCache = payload || {};
        return difyParametersCache;
      })
      .catch(() => {
        difyParametersCache = {};
        return difyParametersCache;
      })
      .finally(() => {
        difyParametersPromise = null;
      });
  }
  return difyParametersPromise;
}

function mapDifyInputFormField(field) {
  if (!field || typeof field !== "object") return null;
  const key = field.variable || field.name || field.key;
  if (!key) return null;

  const rawType = String(field.type || "text").toLowerCase();
  const type =
    rawType.includes("select") || rawType.includes("dropdown")
      ? "select"
      : rawType.includes("number")
        ? "number"
        : rawType.includes("paragraph") || rawType.includes("textarea")
          ? "textarea"
          : "text";

  const optionsRaw = Array.isArray(field.options) ? field.options : [];
  const options = optionsRaw
    .map((option) => {
      if (typeof option === "string" || typeof option === "number") {
        return { value: String(option), label: String(option) };
      }
      if (option && typeof option === "object") {
        const value = option.value ?? option.key ?? option.id;
        const label = option.label ?? option.name ?? value;
        if (!value) return null;
        return { value: String(value), label: String(label) };
      }
      return null;
    })
    .filter(Boolean);

  return {
    key: String(key),
    required: Boolean(field.required),
    type,
    label: typeof field.label === "string" ? field.label : field.label?.en || field.label?.zh || String(key),
    placeholder: typeof field.placeholder === "string" ? field.placeholder : "",
    options,
  };
}

function getTrainerFields(trainer) {
  if (!trainer) return [];
  if (trainer.useDifyParameters !== true) {
    return Array.isArray(trainer.inputForm) ? trainer.inputForm : [];
  }
  const fields = difyParametersCache?.user_input_form;
  if (!Array.isArray(fields)) return [];
  return fields.map(mapDifyInputFormField).filter(Boolean);
}

function renderAiTrainerProfileForm(trainer) {
  if (!dom.aiChatProfile || !dom.aiChatProfileForm || !dom.aiChatProfileSave) return;
  if (!trainer || trainer.mode !== "api") {
    dom.aiChatProfile.hidden = true;
    dom.aiChatProfileForm.innerHTML = "";
    return;
  }

  const fields = getTrainerFields(trainer);
  const shouldShowProfile = fields.length > 0;
  dom.aiChatProfileForm.innerHTML = "";
  if (!shouldShowProfile) {
    if (trainer.useDifyParameters === true) {
      dom.aiChatProfile.hidden = false;
      const hint = document.createElement("div");
      hint.className = "ai-chat-bubble meta";
      hint.textContent = t("ai_profile_loading");
      dom.aiChatProfileForm.appendChild(hint);
      ensureDifyParameters().then(() => renderAiTrainer());
    } else {
      dom.aiChatProfile.hidden = true;
    }
    return;
  }

  const chat = getChatState(trainer.id);
  const requiredFields = fields.filter((field) => field?.required);
  const missingRequired = requiredFields.some((field) => !String(chat.inputs?.[field.key] || "").trim());
  dom.aiChatProfile.hidden = !missingRequired;

  fields.forEach((field) => {
    if (!field?.key) return;
    const wrapper = document.createElement("label");
    const label = document.createElement("span");
    label.textContent = `${getFieldLabel(field)}${field.required ? " *" : ""}`;
    wrapper.appendChild(label);

    const fieldType = field.type === "select" ? "select" : field.type === "textarea" ? "textarea" : "text";
    if (fieldType === "select") {
      const select = document.createElement("select");
      select.name = field.key;
      const options = Array.isArray(field.options) ? field.options : [];
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = currentLang === "zh" ? "请选择" : "Select";
      placeholder.disabled = field.required === true;
      placeholder.hidden = true;
      placeholder.selected = !chat.inputs?.[field.key];
      select.appendChild(placeholder);
      options.forEach((option) => {
        if (!option?.value) return;
        const opt = document.createElement("option");
        opt.value = String(option.value);
        opt.textContent = typeof option.label === "string" ? option.label : getOptionLabel(option);
        select.appendChild(opt);
      });
      select.value = chat.inputs?.[field.key] || "";
      wrapper.appendChild(select);
    } else if (fieldType === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.name = field.key;
      textarea.rows = 4;
      textarea.value = chat.inputs?.[field.key] || "";
      const placeholderText = typeof field.placeholder === "string" ? field.placeholder : getFieldPlaceholder(field);
      if (placeholderText) textarea.placeholder = placeholderText;
      wrapper.appendChild(textarea);
    } else {
      const input = document.createElement("input");
      input.type = field.type === "number" ? "number" : "text";
      input.name = field.key;
      input.value = chat.inputs?.[field.key] || "";
      const placeholderText = typeof field.placeholder === "string" ? field.placeholder : getFieldPlaceholder(field);
      if (placeholderText) input.placeholder = placeholderText;
      wrapper.appendChild(input);
    }

    dom.aiChatProfileForm.appendChild(wrapper);
  });

  dom.aiChatProfileSave.onclick = () => {
    const formData = new FormData(dom.aiChatProfileForm);
    fields.forEach((field) => {
      if (!field?.key) return;
      const raw = String(formData.get(field.key) || "").trim();
      if (!raw) {
        delete chat.inputs[field.key];
        return;
      }
      const normalized =
        field.type === "number"
          ? Number.isFinite(Number(raw))
            ? Number(raw)
            : raw
          : raw;
      chat.inputs[field.key] = normalized;
    });
    chat.conversationId = "";
    chat.messages = [];
    saveState();
    renderAiTrainer();
  };
}

function renderAiTrainer() {
  if (
    !dom.aiTrainerIframe ||
    !dom.aiTrainerEmpty ||
    !dom.aiTrainerName ||
    !dom.aiEmbed
  ) {
    return;
  }

  const trainers = getAiTrainers();
  const hasSelectedTrainer = trainers.some((trainer) => trainer.id === state.selectedTrainerId);
  if (!hasSelectedTrainer) {
    state.selectedTrainerId = trainers[0]?.id || defaultAiTrainer.id;
    saveState();
  }

  const activeTrainer = trainers.find((trainer) => trainer.id === state.selectedTrainerId) || trainers[0] || defaultAiTrainer;
  const embedUrl = activeTrainer?.iframeSrc || "";

  dom.aiTrainerName.textContent = activeTrainer ? getAiTrainerLabel(activeTrainer) : t("ai_default_name");

  dom.aiEmbed.hidden = false;
  if (dom.aiTrainerIframe.getAttribute("src") !== embedUrl) {
    dom.aiTrainerIframe.setAttribute("src", embedUrl);
  }
  dom.aiTrainerEmpty.hidden = Boolean(embedUrl);
  dom.aiEmbed.hidden = !embedUrl;
}

function initAiTrainer() {
  renderAiTrainer();
}

function loadState() {
  const saved = localStorage.getItem(stateKey);
  if (!saved) return { ...defaultState };
  try {
    const parsed = { ...defaultState, ...JSON.parse(saved) };
    parsed.registrations = Array.isArray(parsed.registrations)
      ? parsed.registrations.map((id) => String(id))
      : [];
    parsed.routePlans = parsed.routePlans && typeof parsed.routePlans === "object" ? parsed.routePlans : {};
    parsed.draftRoutes = parsed.draftRoutes && typeof parsed.draftRoutes === "object" ? parsed.draftRoutes : {};
    parsed.savedRoutes = parsed.savedRoutes && typeof parsed.savedRoutes === "object" ? parsed.savedRoutes : {};
    parsed.selectedRoutes = parsed.selectedRoutes && typeof parsed.selectedRoutes === "object" ? parsed.selectedRoutes : {};
    parsed.routeMode = "idle";
    return parsed;
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function loadEvents() {
  const saved = localStorage.getItem(eventsKey);
  if (!saved) return [...DEFAULT_EVENTS];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_EVENTS];
  } catch (error) {
    return [...DEFAULT_EVENTS];
  }
}

function saveEvents() {
  localStorage.setItem(eventsKey, JSON.stringify(events));
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const hasBody = options.body && !(options.body instanceof FormData);
  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  if (!response.ok) {
    const message = payload?.detail || "Request failed";
    throw new Error(message);
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
      // try next
    }
  }
}

function normalizeEvent(event) {
  return {
    ...event,
    id: String(event.id),
    spotsLeft: event.spots_left ?? event.spotsLeft ?? event.capacity ?? 0,
    timeOfDay: event.timeOfDay || inferTimeOfDay(event.time_label || event.timeLabel),
    tags: event.tags || [],
    tags_zh: event.tags_zh || [],
    route_coords: event.route_coords || event.routeCoords || [],
  };
}

async function fetchCurrentUser() {
  if (!authToken) return null;
  try {
    const me = await apiRequest("/auth/me");
    currentUser = me;
    return me;
  } catch (error) {
    currentUser = null;
    authToken = "";
    localStorage.removeItem(tokenKey);
    return null;
  }
}

async function fetchEventsFromServer() {
  try {
    const data = await apiRequest("/events");
    if (Array.isArray(data) && data.length) {
      const previousActiveId = activeEvent ? String(activeEvent.id) : null;
      events = data.map((event) => normalizeEvent(event));
      activeEvent = events.find((event) => String(event.id) === previousActiveId) || events[0] || activeEvent;
      renderEvents();
      renderEventDetail();
      updateSpotlight(activeEvent);
    }
  } catch (error) {
    // fallback to local data
  }
}

async function fetchSpotsFromServer() {
  try {
    const data = await apiRequest("/spots");
    if (Array.isArray(data) && data.length) {
      spots = data;
      if (!spots.some((spot) => spot.id === state.selectedSpotId)) {
        state.selectedSpotId = spots[0]?.id || "";
        saveState();
      }
      renderSpotList();
      renderSpotDetails();
      fetchPostsFromServer(state.selectedSpotId).then(renderPosts);
      renderCityMarkers();
    }
  } catch (error) {
    // fallback to local data
  }
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  setTimeout(() => dom.toast.classList.remove("show"), 2400);
}

function updateLocationButton() {
  dom.locationToggle.textContent = state.locationEnabled ? t("header_location_on") : t("header_location");
}

function inferTimeOfDay(timeLabel) {
  const match = String(timeLabel || "").match(/(\\d{1,2})/);
  if (!match) return "evening";
  const hour = parseInt(match[1], 10);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function setUserUI() {
  if (currentUser) {
    dom.userChip.hidden = false;
    dom.loginButton.hidden = true;
    dom.userName.textContent = `${currentUser.name} (${currentUser.role})`;
  } else {
    dom.userChip.hidden = true;
    dom.loginButton.hidden = false;
    dom.userName.textContent = "Guest";
  }
}

function updateAuthModal() {
  if (authMode === "register") {
    dom.authTitle.textContent = t("auth_register");
    dom.authSubmit.textContent = t("auth_register_button");
    dom.authToggle.textContent = t("auth_toggle_login");
    dom.authNameField.style.display = "grid";
  } else {
    dom.authTitle.textContent = t("auth_signin");
    dom.authSubmit.textContent = t("auth_login_button");
    dom.authToggle.textContent = t("auth_toggle_register");
    dom.authNameField.style.display = "none";
  }
}

function openAuthModal(mode = "login") {
  authMode = mode;
  updateAuthModal();
  dom.authModal.classList.add("show");
  dom.authModal.setAttribute("aria-hidden", "false");
  updateModalLock();
}

function closeAuthModal() {
  dom.authModal.classList.remove("show");
  dom.authModal.setAttribute("aria-hidden", "true");
  updateModalLock();
}

function updateModalLock() {
  const modalOpen = document.querySelector(".modal.show");
  document.body.classList.toggle("modal-open", Boolean(modalOpen));
}

function getEventText(event, key) {
  const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  if (currentLang === "zh") {
    const zhKey = `${key}_zh`;
    const camelKey = `${key}Zh`;
    const snakeZh = `${snakeKey}_zh`;
    if (event[snakeZh]) return event[snakeZh];
    if (event[zhKey]) return event[zhKey];
    if (event[camelKey]) return event[camelKey];
  }
  if (event[key] !== undefined) return event[key];
  if (event[snakeKey] !== undefined) return event[snakeKey];
  return "";
}

function getEventArray(event, key) {
  const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  if (currentLang === "zh") {
    const zhKey = `${key}_zh`;
    const camelKey = `${key}Zh`;
    const snakeZh = `${snakeKey}_zh`;
    if (Array.isArray(event[snakeZh])) return event[snakeZh];
    if (Array.isArray(event[zhKey])) return event[zhKey];
    if (Array.isArray(event[camelKey])) return event[camelKey];
  }
  if (Array.isArray(event[key])) return event[key];
  if (Array.isArray(event[snakeKey])) return event[snakeKey];
  return [];
}

function getSpotText(spot, key) {
  const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  if (currentLang === "zh") {
    const zhKey = `${key}_zh`;
    const camelKey = `${key}Zh`;
    const snakeZh = `${snakeKey}_zh`;
    if (spot[snakeZh]) return spot[snakeZh];
    if (spot[zhKey]) return spot[zhKey];
    if (spot[camelKey]) return spot[camelKey];
  }
  if (spot[key] !== undefined) return spot[key];
  if (spot[snakeKey] !== undefined) return spot[snakeKey];
  return "";
}

function setActiveEvent(eventId) {
  const selected = events.find((item) => String(item.id) === String(eventId));
  if (!selected) return;
  activeEvent = selected;
  renderEventDetail();
  updateSpotlight(activeEvent);
}

function renderEvents() {
  const filtered = applyFilters(events);
  dom.eventsGrid.innerHTML = filtered
    .map((event) => {
      const tags = getEventArray(event, "tags");
      const spotsLeft = event.spotsLeft ?? event.spots_left ?? 0;
      return `
        <article class="card event-card">
          <span class="badge">${t("spots_left", { count: spotsLeft })}</span>
          <p class="card-title">${getEventText(event, "name")}</p>
          <p class="card-subtitle">${getEventText(event, "timeLabel")} - ${getEventText(
        event,
        "location"
      )}</p>
          <div class="pill-group">
            <span class="pill">${t(`level_${event.level.toLowerCase()}`)}</span>
            <span class="pill">${event.distance} km</span>
            ${tags
              .slice(0, 2)
              .map((tag) => `<span class="pill">${tag}</span>`)
              .join("")}
          </div>
          <p class="body">${getEventText(event, "description")}</p>
          <div class="button-row">
            <button class="outline-button" data-event="${event.id}">${t("button_details")}</button>
            <button class="primary-button" data-register="${event.id}">${t("button_register_short")}</button>
          </div>
        </article>
      `;
    })
    .join("");

  dom.eventsGrid.querySelectorAll("[data-event]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveEvent(button.dataset.event);
      scrollToSection("event");
    });
  });

  dom.eventsGrid.querySelectorAll("[data-register]").forEach((button) => {
    button.addEventListener("click", () => registerEvent(button.dataset.register));
  });
}

function renderEventDetail() {
  if (!activeEvent) return;
  const tags = getEventArray(activeEvent, "tags");
  dom.eventName.textContent = getEventText(activeEvent, "name");
  dom.eventSubtitle.textContent = tags.join(" - ");
  const spotsLeft = activeEvent.spotsLeft ?? activeEvent.spots_left ?? 0;
  dom.eventStatus.textContent = t("seats_left", { count: spotsLeft });
  dom.eventLocation.textContent = getEventText(activeEvent, "location");
  dom.eventTime.textContent = getEventText(activeEvent, "timeLabel");
  dom.eventDistance.textContent = `${activeEvent.distance} km`;
  dom.eventPace.textContent = activeEvent.pace;
  dom.eventDescription.textContent = getEventText(activeEvent, "description");
  const gear = getEventArray(activeEvent, "gear");
  const fallbackGear = currentLang === "zh" ? ["饮水", "舒适跑鞋"] : ["Water", "Comfort shoes"];
  const gearList = gear.length ? gear : fallbackGear;
  dom.eventGear.innerHTML = gearList.map((item) => `<span class="pill">${item}</span>`).join("");
  dom.eventRewards.textContent = getEventText(activeEvent, "rewards") || (currentLang === "zh" ? "完成可获得积分与徽章" : "Complete to earn points and badges");
  dom.eventTags.innerHTML = tags.map((tag) => `<span class="pill">${tag}</span>`).join("");
  renderEventMap(activeEvent);
  loadCheckpointsForEvent(activeEvent);
}

function renderEventMap(event) {
  if (!eventMap) return;
  eventLayerGroup.clearLayers();
  const route = getEditableRoute(event);
  const center = event.lat && event.lng ? [event.lat, event.lng] : [31.3, 120.62];
  if (route.length > 1) {
    const routeLine = L.polyline(route, { color: "#ff6a3d", weight: 5, opacity: 0.95 }).addTo(eventLayerGroup);
    eventMap.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
  } else {
    eventMap.setView(center, 14);
  }
  route.forEach((point, index) => {
    const marker = L.marker(point, {
      draggable: state.routeEditMode,
      icon: createRoutePointIcon(index),
    }).addTo(eventLayerGroup);
    marker.bindPopup(`${currentLang === "zh" ? "路线点" : "Route Point"} ${index + 1}`);
    if (state.routeEditMode) {
      marker.on("dragend", (dragEvent) => {
        updateRoutePoint(index, dragEvent.target.getLatLng());
      });
    }
  });
  if (!route.length) {
    L.marker(center).addTo(eventLayerGroup).bindPopup(getEventText(event, "name"));
  }
  renderRoutePlanMarkers(event.id);
  renderRouteControls();
}

function renderRoutePlanMarkers(eventId) {
  if (!planLayerGroup) return;
  planLayerGroup.clearLayers();
}

function createRoutePointIcon(index) {
  return L.divIcon({
    className: "route-point-marker",
    html: `<span>${index === 0 ? "S" : index + 1}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function getEventRouteCoords(event) {
  return (event?.route_coords || event?.routeCoords || []).map((point) => [Number(point[0]), Number(point[1])]);
}

function getCurrentRouteKey() {
  return activeEvent?.id ? String(activeEvent.id) : "";
}

function getEditableRoute(event = activeEvent) {
  const key = event?.id ? String(event.id) : "";
  const customRoute = key ? state.routePlans?.[key] : null;
  return Array.isArray(customRoute) && customRoute.length ? customRoute : getEventRouteCoords(event);
}

function ensureEditableRoute() {
  const key = getCurrentRouteKey();
  if (!key) return [];
  if (!Array.isArray(state.routePlans[key]) || !state.routePlans[key].length) {
    state.routePlans[key] = getEventRouteCoords(activeEvent);
  }
  return state.routePlans[key];
}

function addRoutePoint(latlng) {
  if (!state.routeEditMode) {
    state.routeEditMode = true;
  }
  const route = ensureEditableRoute();
  route.push([Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))]);
  saveState();
  renderEventMap(activeEvent);
  renderCheckpointList(activeEvent, null);
  if (dom.mapPickerModal?.classList.contains("show")) {
    renderPickerMap(false);
  }
}

function updateRoutePoint(index, latlng) {
  const route = ensureEditableRoute();
  if (!route[index]) return;
  route[index] = [Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))];
  saveState();
  renderEventMap(activeEvent);
  renderCheckpointList(activeEvent, null);
  if (dom.mapPickerModal?.classList.contains("show")) {
    renderPickerMap(false);
  }
}

function undoRoutePoint() {
  const route = ensureEditableRoute();
  if (!route.length) return;
  route.pop();
  saveState();
  renderEventMap(activeEvent);
  renderCheckpointList(activeEvent, null);
  if (dom.mapPickerModal?.classList.contains("show")) {
    renderPickerMap(false);
  }
  showToast(t("toast_route_undo"));
}

function setRouteEditing(enabled) {
  state.routeEditMode = enabled;
  if (enabled) {
    ensureEditableRoute();
  }
  saveState();
  renderEventMap(activeEvent);
  renderCheckpointList(activeEvent, null);
  if (dom.mapPickerModal?.classList.contains("show")) {
    renderPickerMap(false);
  }
  showToast(t(enabled ? "toast_route_editing" : "toast_route_done"));
}

function getSavedRoutes() {
  const key = getCurrentRouteKey();
  if (!key) return [];
  if (!Array.isArray(state.savedRoutes?.[key])) {
    state.savedRoutes[key] = [];
  }
  return state.savedRoutes[key];
}

function saveCurrentRoute() {
  const key = getCurrentRouteKey();
  const route = ensureEditableRoute();
  if (!key || route.length < 2) {
    showToast(t("toast_route_empty"));
    return;
  }
  const saved = getSavedRoutes();
  const label = currentLang === "zh" ? `路线 ${saved.length + 1}` : `Route ${saved.length + 1}`;
  const id = `route_${Date.now()}`;
  saved.push({
    id,
    label,
    points: route.map((point) => [...point]),
    updatedAt: new Date().toLocaleString(),
  });
  state.selectedRoutes[key] = id;
  saveState();
  renderRouteControls();
  showToast(t("toast_route_saved"));
}

function updateCurrentSavedRoute() {
  const key = getCurrentRouteKey();
  const route = ensureEditableRoute();
  if (!key || route.length < 2) {
    showToast(t("toast_route_empty"));
    return;
  }
  const saved = getSavedRoutes();
  const selectedId = state.selectedRoutes?.[key];
  let selectedRoute = saved.find((item) => item.id === selectedId);
  if (!selectedRoute) {
    saveCurrentRoute();
    return;
  }
  selectedRoute.points = route.map((point) => [...point]);
  selectedRoute.updatedAt = new Date().toLocaleString();
  saveState();
  renderRouteControls();
  showToast(t("toast_route_updated"));
}

function loadSavedRoute(routeId) {
  const key = getCurrentRouteKey();
  const savedRoute = getSavedRoutes().find((item) => item.id === routeId);
  if (!key || !savedRoute) return;
  state.routePlans[key] = savedRoute.points.map((point) => [Number(point[0]), Number(point[1])]);
  state.selectedRoutes[key] = routeId;
  state.routeEditMode = true;
  saveState();
  renderEventMap(activeEvent);
  renderCheckpointList(activeEvent, null);
  if (dom.mapPickerModal?.classList.contains("show")) {
    renderPickerMap(false);
  }
  showToast(t("toast_route_selected"));
}

function clearRoutePlan() {
  if (!activeEvent?.id) return;
  state.routePlans[String(activeEvent.id)] = [];
  saveState();
  renderEventMap(activeEvent);
  renderCheckpointList(activeEvent, null);
  if (dom.mapPickerModal?.classList.contains("show")) {
    renderPickerMap(false);
  }
}

function renderRouteControls() {
  const key = getCurrentRouteKey();
  const saved = getSavedRoutes();
  [dom.routeSelect, dom.mapPickerRouteSelect].filter(Boolean).forEach((select) => {
    const selected = state.selectedRoutes?.[key] || "";
    select.innerHTML = [
      `<option value="">${t("route_select_placeholder")}</option>`,
      ...saved.map((route) => `<option value="${route.id}">${route.label}</option>`),
    ].join("");
    select.value = selected;
  });
  [dom.routeUndo, dom.routeUpdate, dom.mapPickerUndo, dom.mapPickerUpdate].forEach((button) => {
    if (button) button.disabled = !state.routeEditMode;
  });
  if (dom.mapPickerAdd) {
    dom.mapPickerAdd.disabled = !pickerSelectedLatLng;
  }
  if (dom.routeEdit) {
    dom.routeEdit.classList.toggle("active", state.routeEditMode);
  }
  if (dom.routeEditHint) {
    dom.routeEditHint.textContent = state.routeEditMode
      ? currentLang === "zh"
        ? "正在编辑：点击地图添加点位，拖动点位调整路线。"
        : "Editing: tap the map to add points, then drag points to adjust the route."
      : t("map_edit_hint");
  }
}

function getPickerHint(type) {
  const hintKey = `map_picker_hint_${type}`;
  return t(hintKey);
}

function updatePickerTypeButtons() {
  if (!dom.mapPickerTypes) return;
  dom.mapPickerTypes.querySelectorAll("[data-plan-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.planType === pickerSelectedType);
  });
  dom.mapPickerHint.textContent = getPickerHint(pickerSelectedType);
}

function setPickerSelectedLatLng(latlng) {
  pickerSelectedLatLng = {
    lat: Number(latlng.lat.toFixed(6)),
    lng: Number(latlng.lng.toFixed(6)),
  };
  const typeLabel = t(`type_${pickerSelectedType}`);
  const iconText = planTypeIcons[pickerSelectedType] || "C";
  const iconHtml = `<div style="background:#ff6a3d;color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;border:2px solid #111827">${iconText}</div>`;
  if (!pickerSelectionMarker) {
    pickerSelectionMarker = L.marker([pickerSelectedLatLng.lat, pickerSelectedLatLng.lng], {
      icon: L.divIcon({
        className: "plan-marker",
        html: iconHtml,
        iconSize: [34, 28],
      }),
    }).addTo(pickerSelectionLayer);
  } else {
    pickerSelectionMarker.setLatLng([pickerSelectedLatLng.lat, pickerSelectedLatLng.lng]);
    pickerSelectionMarker.setIcon(
      L.divIcon({
        className: "plan-marker",
        html: iconHtml,
        iconSize: [34, 28],
      })
    );
  }
  pickerSelectionMarker.bindPopup(typeLabel).openPopup();
  dom.mapPickerCoords.textContent = t("map_picker_coords_value", {
    lat: pickerSelectedLatLng.lat.toFixed(5),
    lng: pickerSelectedLatLng.lng.toFixed(5),
  });
  renderRouteControls();
}

function renderPickerSuggestions() {
  if (!dom.mapPickerSuggestions || !activeEvent) return;
  const routeCoords = activeEvent.route_coords || activeEvent.routeCoords || [];
  const routeText = getEventArray(activeEvent, "route");
  const suggestions = routeCoords.slice(0, 8).map((coords, index) => {
    const routeItem = routeText[index] || {};
    return {
      lat: coords[0],
      lng: coords[1],
      type: routeItem.type || "checkpoint",
      label:
        routeItem.name ||
        (currentLang === "zh" ? `推荐点 ${index + 1}` : `Suggested Point ${index + 1}`),
    };
  });
  dom.mapPickerSuggestions.innerHTML = suggestions.length
    ? suggestions
        .map(
          (item, index) => `
            <button class="ghost-button" type="button" data-suggest-index="${index}">
              <span>${item.label}</span>
              <span>${item.lat.toFixed(3)}, ${item.lng.toFixed(3)}</span>
            </button>
          `
        )
        .join("")
    : `<p class="body">${currentLang === "zh" ? "暂无推荐点位" : "No suggested points yet."}</p>`;

  dom.mapPickerSuggestions.querySelectorAll("[data-suggest-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const suggestion = suggestions[Number(button.dataset.suggestIndex)];
      if (!suggestion) return;
      pickerSelectedType = suggestion.type;
      updatePickerTypeButtons();
      setPickerSelectedLatLng({ lat: suggestion.lat, lng: suggestion.lng });
      dom.mapPickerLabel.value = suggestion.label;
      pickerMap?.flyTo([suggestion.lat, suggestion.lng], Math.max(pickerMap.getZoom(), 14));
    });
  });
}

function ensurePickerMap() {
  if (!window.L || pickerMap) return;
  pickerMap = L.map("map-picker", { zoomControl: true, attributionControl: true }).setView(
    [31.3, 120.62],
    12
  );
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(pickerMap);
  if (suzhouBounds) {
    pickerMap.setMaxBounds(suzhouBounds);
  }
  pickerRouteLayer = L.layerGroup().addTo(pickerMap);
  pickerPlanLayer = L.layerGroup().addTo(pickerMap);
  pickerSelectionLayer = L.layerGroup().addTo(pickerMap);
  pickerMap.on("click", (event) => {
    setPickerSelectedLatLng(event.latlng);
    addRoutePoint(event.latlng);
  });
}

function renderPickerMap(resetSelection = true) {
  ensurePickerMap();
  if (!pickerMap || !activeEvent) return;
  pickerRouteLayer.clearLayers();
  pickerPlanLayer.clearLayers();
  if (resetSelection) {
    pickerSelectionLayer.clearLayers();
    pickerSelectionMarker = null;
    pickerSelectedLatLng = null;
    dom.mapPickerCoords.textContent = t("map_picker_coords_empty");
    dom.mapPickerLabel.value = "";
  }

  const route = getEditableRoute(activeEvent);
  const center = activeEvent.lat && activeEvent.lng ? [activeEvent.lat, activeEvent.lng] : [31.3, 120.62];
  if (route.length > 1) {
    const routeLine = L.polyline(route, { color: "#ff6a3d", weight: 5, opacity: 0.95 }).addTo(pickerRouteLayer);
    pickerMap.fitBounds(routeLine.getBounds(), { padding: [28, 28] });
  } else {
    pickerMap.setView(center, 14);
  }

  route.forEach((point, index) => {
    const marker = L.marker(point, {
      draggable: state.routeEditMode,
      icon: createRoutePointIcon(index),
    }).addTo(pickerRouteLayer);
    marker.bindPopup(`${currentLang === "zh" ? "路线点" : "Route Point"} ${index + 1}`);
    if (state.routeEditMode) {
      marker.on("dragend", (dragEvent) => {
        updateRoutePoint(index, dragEvent.target.getLatLng());
      });
    }
  });
  if (!route.length) {
    L.marker(center).addTo(pickerRouteLayer).bindPopup(getEventText(activeEvent, "name"));
  }
  renderPickerSuggestions();
  updatePickerTypeButtons();
  renderRouteControls();
  setTimeout(() => {
    pickerMap.invalidateSize();
  }, 40);
}

function openMapPicker(initialLatLng = null) {
  if (!activeEvent?.id) return;
  dom.mapPickerModal.classList.add("show");
  dom.mapPickerModal.setAttribute("aria-hidden", "false");
  renderPickerMap();
  if (initialLatLng) {
    setPickerSelectedLatLng(initialLatLng);
    pickerMap?.setView([initialLatLng.lat, initialLatLng.lng], Math.max(pickerMap.getZoom(), 14));
  }
  updateModalLock();
}

function closeMapPicker() {
  dom.mapPickerModal.classList.remove("show");
  dom.mapPickerModal.setAttribute("aria-hidden", "true");
  updateModalLock();
}

function saveMapPickerMarker() {
  saveCurrentRoute();
}

function addMapPickerPoint() {
  if (!activeEvent?.id || !pickerSelectedLatLng) {
    showToast(t("toast_picker_need_point"));
    return;
  }
  if (!state.routeEditMode) {
    setRouteEditing(true);
  }
  addRoutePoint(pickerSelectedLatLng);
}

async function loadCheckpointsForEvent(event) {
  if (!event?.id) {
    renderCheckpointList(event, null);
    return;
  }
  try {
    const data = await apiRequest(`/events/${event.id}/checkpoints`);
    if (Array.isArray(data) && data.length) {
      renderCheckpointList(event, data);
      return;
    }
  } catch (error) {
    // fallback
  }
  renderCheckpointList(event, null);
}

function renderCheckpointList(event, serverCheckpoints) {
  const progress = state.checkpointProgress[event.id] || {};
  const customRoute = state.routePlans?.[String(event.id)] || [];
  const route = Array.isArray(customRoute) && customRoute.length
    ? customRoute.map((_, index) => ({
        name: currentLang === "zh" ? `路线点 ${index + 1}` : `Route Point ${index + 1}`,
        type: index === 0 ? "start" : index === customRoute.length - 1 ? "finish" : "checkpoint",
      }))
    : Array.isArray(serverCheckpoints) && serverCheckpoints.length
    ? serverCheckpoints.map((item) => ({
        name: currentLang === "zh" ? item.name_zh || item.name : item.name,
        type: item.type,
      }))
    : getEventArray(event, "route") || [];
  const fallbackRoute =
    route.length || !event.route_coords
      ? route
      : event.route_coords.map((_, index) => ({
          name: currentLang === "zh" ? `打卡点 ${index + 1}` : `Checkpoint ${index + 1}`,
          type: "checkpoint",
        }));
  dom.checkpointList.innerHTML = fallbackRoute
    .map((point, index) => {
      const checked = progress[index] ? "checked" : "";
      return `
        <label class="checkpoint">
          <span>${point.name} <em>(${t(`type_${point.type}`)})</em></span>
          <input type="checkbox" data-checkpoint="${index}" ${checked} />
        </label>
      `;
    })
    .join("");

  dom.checkpointList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (eventInput) => {
      const index = eventInput.target.dataset.checkpoint;
      if (!state.checkpointProgress[event.id]) {
        state.checkpointProgress[event.id] = {};
      }
      state.checkpointProgress[event.id][index] = eventInput.target.checked;
      saveState();
      if (eventInput.target.checked) {
        addPoints(10);
      }
      checkRouteCompletion(event.id, fallbackRoute.length);
    });
  });
}

function checkRouteCompletion(eventId, total) {
  const progress = state.checkpointProgress[eventId] || {};
  const completed = Object.values(progress).filter(Boolean).length === total;
  if (completed && !state.badges.includes("route-explorer")) {
    unlockBadge("route-explorer");
    showToast(t("toast_route_badge"));
  }
}

async function registerEvent(eventId) {
  const normalizedEventId = String(eventId);
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  if (state.registrations.includes(normalizedEventId)) {
    showToast(t("toast_already_registered"));
    return;
  }
  const event = events.find((item) => String(item.id) === normalizedEventId);
  if (!event) return;
  if ((event.spotsLeft ?? event.spots_left ?? 0) <= 0) {
    showToast(t("toast_no_spots"));
    return;
  }
  try {
    const result = await apiRequest(`/events/${normalizedEventId}/register`, { method: "POST" });
    if (result?.spots_left !== undefined) {
      event.spotsLeft = result.spots_left;
    } else {
      event.spotsLeft = (event.spotsLeft ?? event.spots_left) - 1;
    }
  } catch (error) {
    showToast(error.message || t("toast_no_spots"));
    return;
  }
  state.registrations.push(normalizedEventId);
  state.streak += 1;
  addPoints(50);
  unlockBadge("first-finish");
  const tagList = event.tags || [];
  if (tagList.includes("Team") || tagList.includes("Challenge")) {
    unlockBadge("team-spirit");
  }
  if (tagList.includes("Night Run")) {
    unlockBadge("night-owl");
  }
  if (state.streak >= 3) {
    unlockBadge("momentum");
  }
  saveState();
  saveEvents();
  renderMyRun();
  renderEvents();
  renderEventDetail();
  showToast(t("toast_registered"));
}

function addPoints(amount) {
  state.points += amount;
  saveState();
  renderMyRun();
}

function unlockBadge(badgeId) {
  if (!state.badges.includes(badgeId)) {
    state.badges.push(badgeId);
    saveState();
    renderMyRun();
  }
}

function renderMyRun() {
  dom.streakCount.textContent = `${state.streak} ${currentLang === "zh" ? "次" : "runs"}`;
  dom.pointsCount.textContent = `${state.points} ${currentLang === "zh" ? "分" : "pts"}`;

  dom.badgeGrid.innerHTML = DEFAULT_BADGES.map((badge) => {
    const unlocked = state.badges.includes(badge.id);
    const name = currentLang === "zh" ? badge.nameZh : badge.name;
    const hint = currentLang === "zh" ? badge.hintZh : badge.hint;
    return `
      <div class="badge-item">
        <span>${name}</span>
        <strong>${unlocked ? t("badge_unlocked") : hint}</strong>
      </div>
    `;
  }).join("");

  dom.registrationsList.innerHTML = state.registrations
    .map((eventId) => events.find((event) => event.id === eventId))
    .filter(Boolean)
    .map((event) => {
      return `
        <div class="list-item">
          <strong>${getEventText(event, "name")}</strong>
          <span>${getEventText(event, "timeLabel")} - ${getEventText(event, "location")}</span>
          <span>${event.distance} km - ${event.pace}</span>
        </div>
      `;
    })
    .join("");

  if (state.registrations.length === 0) {
    dom.registrationsList.innerHTML = `<p class="body">${t("no_registrations")}</p>`;
  }

  renderAttendance();
}

function renderAttendance() {
  dom.attendanceList.innerHTML = state.registrations
    .map((eventId) => events.find((event) => event.id === eventId))
    .filter(Boolean)
    .map((event) => {
      const checked = state.checkins[event.id] ? "checked" : "";
      return `
        <label class="attendance-row">
          <span>${getEventText(event, "name")}</span>
          <input type="checkbox" data-checkin="${event.id}" ${checked} />
        </label>
      `;
    })
    .join("");

  if (state.registrations.length === 0) {
    dom.attendanceList.innerHTML = `<p class="body">${t("no_attendance")}</p>`;
  }

  dom.attendanceList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (eventInput) => {
      const eventId = eventInput.target.dataset.checkin;
      state.checkins[eventId] = eventInput.target.checked;
      saveState();
      showToast(eventInput.target.checked ? t("toast_checkin_confirm") : t("toast_checkin_removed"));
    });
  });
}

function applyFilters(list) {
  const search = dom.searchInput.value.toLowerCase();
  const distance = dom.filterDistance.value;
  const level = dom.filterLevel.value;
  const time = dom.filterTime.value;

  return list.filter((event) => {
    const tags = getEventArray(event, "tags");
    const matchesSearch =
      getEventText(event, "name").toLowerCase().includes(search) ||
      tags.some((tag) => tag.toLowerCase().includes(search));
    const matchesLevel = level === "all" || event.level === level;
    const eventTimeOfDay = event.timeOfDay || inferTimeOfDay(getEventText(event, "timeLabel"));
    const matchesTime = time === "all" || eventTimeOfDay === time;
    const matchesDistance =
      distance === "all" ||
      (distance === "short" && event.distance <= 4) ||
      (distance === "medium" && event.distance > 4 && event.distance <= 8) ||
      (distance === "long" && event.distance > 8);
    return matchesSearch && matchesLevel && matchesTime && matchesDistance;
  });
}

function handleMatch(event) {
  event.preventDefault();
  const formData = new FormData(dom.matchForm);
  const experience = formData.get("experience");
  const goal = formData.get("goal");
  const pace = parseFloat(formData.get("pace"));
  const style = formData.get("style");

  const bestEvent = events
    .map((eventItem) => {
      let score = 0;
      if (eventItem.level === experience) score += 3;
      if (eventItem.tags.some((tag) => tag.toLowerCase().includes(goal.toLowerCase()))) score += 2;
      const paceTarget = pace;
      if (eventItem.pace.includes("6'30") && paceTarget >= 6.5) score += 2;
      if (eventItem.pace.includes("5'30") && paceTarget <= 5.5) score += 2;
      if (eventItem.distance <= 5 && experience === "Beginner") score += 2;
      return { eventItem, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.eventItem;

  const goalKeyMap = {
    Social: "goal_social",
    "Stress Relief": "goal_stress",
    Training: "goal_training",
    PB: "goal_pb",
  };
  const goalKey = goalKeyMap[goal] || "goal_social";
  const groupName = `${t(`level_${experience.toLowerCase()}`)} ${t(`style_${style.toLowerCase()}`)}`;
  const rewardText = bestEvent ? getEventText(bestEvent, "rewards") : "";
  const eventName = bestEvent ? getEventText(bestEvent, "name") : "";
  const eventTime = bestEvent ? getEventText(bestEvent, "timeLabel") : "";
  const eventPace = bestEvent ? bestEvent.pace : "";

  dom.matchTitle.textContent = `${groupName} - ${t(goalKey)}`;
  dom.matchBody.textContent = bestEvent
    ? `${t("match_result_prefix")} "${eventName}" (${eventTime}), ${eventPace}. ${rewardText}.`
    : t("match_result_body");

  dom.matchBadges.innerHTML = ["Warm-up Buddy", "Pace Shield", "Welcome Gift"]
    .map((item) => `<span class="pill">${currentLang === "zh" ? translateBadge(item) : item}</span>`)
    .join("");
}

function translateBadge(label) {
  const map = {
    "Warm-up Buddy": "热身搭子",
    "Pace Shield": "配速守护",
    "Welcome Gift": "欢迎礼",
  };
  return map[label] || label;
}

async function handleCreateEvent(event) {
  event.preventDefault();
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  if (!currentUser || currentUser.role !== "admin") {
    showToast(t("toast_admin_required"));
    return;
  }
  const formData = new FormData(dom.createEventForm);
  const name = formData.get("name");
  const location = formData.get("location");
  const timeLabel = formData.get("time");
  const distance = parseFloat(formData.get("distance"));
  const level = formData.get("level");
  const capacity = parseInt(formData.get("capacity"), 10);

  const hourMatch = timeLabel.match(/\b(\d{1,2})\b/);
  const hour = hourMatch ? parseInt(hourMatch[1], 10) : 18;
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const pace =
    level === "Beginner"
      ? "6'30\"-8'00\" / km"
      : level === "Intermediate"
      ? "5'30\"-6'30\" / km"
      : "4'30\"-5'30\" / km";

  const payload = {
    name,
    name_zh: name,
    description: "Organizer-created run with supportive pacing and onsite check-ins.",
    description_zh: "",
    time_label: timeLabel,
    time_label_zh: "",
    location,
    location_zh: "",
    distance,
    level,
    pace,
    capacity,
    tags: ["Organizer", "Onsite"],
    tags_zh: [],
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

  try {
    const created = await apiRequest("/events", { method: "POST", body: JSON.stringify(payload) });
    const normalized = normalizeEvent(created);
    events.unshift(normalized);
  } catch (error) {
    const fallback = {
      id: `custom-${Date.now()}`,
      name,
      nameZh: name,
      timeLabel,
      timeLabelZh: timeLabel,
      timeOfDay,
      location,
      locationZh: location,
      distance,
      level,
      pace,
      capacity,
      spotsLeft: capacity,
      tags: ["Organizer", "Onsite"],
      tagsZh: [],
      gear: ["Water", "Comfort shoes"],
      description: "Organizer-created run with supportive pacing and onsite check-ins.",
      rewards: "Earn 55 pts + 'Organizer Pick' badge",
      lat: 31.3,
      lng: 120.62,
      routeCoords: [
        [31.3, 120.62],
        [31.302, 120.624],
        [31.304, 120.62],
        [31.302, 120.616],
        [31.3, 120.62],
      ],
      route: [
        { name: "Meet-up Start", type: "start" },
        { name: "Checkpoint One", type: "checkpoint" },
        { name: "Hydration", type: "water" },
        { name: "Finish", type: "finish" },
      ],
    };
    events.unshift(fallback);
  }

  saveEvents();
  renderEvents();
  dom.createEventForm.reset();
  showToast(t("toast_event_created"));
}

function sendOrganizerUpdate() {
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  if (!currentUser || currentUser.role !== "admin") {
    showToast(t("toast_admin_required"));
    return;
  }
  const messages = sampleUpdates[currentLang] || sampleUpdates.en;
  const message = messages[Math.floor(Math.random() * messages.length)];
  state.updates.push({ message, time: new Date().toLocaleTimeString() });
  saveState();
  dom.organizerNotice.textContent = `${message}`;
  showToast(t("toast_update_sent"));
}

async function fetchUsers() {
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  if (!currentUser || currentUser.role !== "admin") {
    showToast(t("toast_admin_required"));
    return;
  }
  try {
    const users = await apiRequest("/admin/users");
    dom.usersList.innerHTML = users
      .map(
        (user) => `
        <div class="list-item">
          <strong>${user.name}</strong>
          <span>${user.email} - ${user.role}</span>
        </div>
      `
      )
      .join("");
  } catch (error) {
    dom.usersList.innerHTML = `<p class="body">${error.message}</p>`;
  }
}

async function handleRecommendCheckpoints() {
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  if (!currentUser || currentUser.role !== "admin") {
    showToast(t("toast_admin_required"));
    return;
  }
  try {
    await apiRequest(`/events/${activeEvent.id}/recommend-checkpoints`, { method: "POST" });
    await loadCheckpointsForEvent(activeEvent);
    showToast(t("toast_recommend_done"));
  } catch (error) {
    showToast(error.message || t("toast_admin_required"));
  }
}

function updateSpotlight(event) {
  if (!event) return;
  const checkpointCount = event.route?.length || event.route_coords?.length || 0;
  dom.spotlightTitle.textContent = getEventText(event, "name");
  dom.spotlightTime.textContent = getEventText(event, "timeLabel");
  dom.spotlightLocation.textContent = getEventText(event, "location");
  dom.spotlightPace.textContent = event.pace;
  dom.spotlightPerks.textContent = `${checkpointCount} ${currentLang === "zh" ? "打卡点" : "checkpoints"} - ${getEventText(
    event,
    "rewards"
  )}`;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const formData = new FormData(dom.authForm);
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name") || "";
  try {
    if (authMode === "register") {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name: name || "Runner" }),
      });
      authToken = result.access_token;
      localStorage.setItem(tokenKey, authToken);
      await fetchCurrentUser();
      showToast(t("toast_register_success"));
    } else {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      authToken = result.access_token;
      localStorage.setItem(tokenKey, authToken);
      await fetchCurrentUser();
      showToast(t("toast_login_success"));
    }
    closeAuthModal();
    setUserUI();
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  } catch (error) {
    showToast(error.message || t("toast_login_required"));
  }
}

function handleLogout() {
  authToken = "";
  currentUser = null;
  localStorage.removeItem(tokenKey);
  setUserUI();
  showToast(t("toast_logout"));
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
}

function initNav() {
  dom.navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      dom.navLinks.forEach((nav) => nav.classList.remove("active"));
      button.classList.add("active");
      scrollToSection(target);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          dom.navLinks.forEach((link) => {
            if (link.dataset.target === entry.target.id) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  dom.sections.forEach((section) => observer.observe(section));
}

function initFilters() {
  [dom.searchInput, dom.filterDistance, dom.filterLevel, dom.filterTime].forEach((input) => {
    input.addEventListener("input", renderEvents);
  });
}

function initLanguageToggle() {
  dom.langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
}

function initActions() {
  dom.registerButton.addEventListener("click", () => registerEvent(activeEvent.id));
  dom.routeReset.addEventListener("click", () => {
    state.checkpointProgress[activeEvent.id] = {};
    saveState();
    loadCheckpointsForEvent(activeEvent);
    showToast(t("toast_checkpoints_reset"));
  });
  dom.planClear.addEventListener("click", clearRoutePlan);
  dom.mapExpand.addEventListener("click", () => openMapPicker());
  dom.routeEdit.addEventListener("click", () => setRouteEditing(true));
  dom.routeDone.addEventListener("click", () => setRouteEditing(false));
  dom.routeUndo.addEventListener("click", undoRoutePoint);
  dom.routeSave.addEventListener("click", saveCurrentRoute);
  dom.routeUpdate.addEventListener("click", updateCurrentSavedRoute);
  dom.routeSelect.addEventListener("change", (event) => loadSavedRoute(event.target.value));
  dom.checkpointRecommend.addEventListener("click", handleRecommendCheckpoints);
  dom.routePreview.addEventListener("click", () => {
    if (eventMap) {
      eventMap.invalidateSize();
      eventMap.scrollWheelZoom.enable();
      eventMap.flyTo([activeEvent.lat, activeEvent.lng], 14);
    }
    showToast(t("toast_route_preview"));
  });
  dom.matchForm.addEventListener("submit", handleMatch);
  dom.clearRegistrations.addEventListener("click", () => {
    state.registrations = [];
    state.streak = 0;
    state.points = 0;
    state.badges = [];
    state.checkins = {};
    saveState();
    renderMyRun();
    showToast(t("toast_cleared"));
  });
  dom.sendUpdate.addEventListener("click", sendOrganizerUpdate);
  dom.loadUsers.addEventListener("click", fetchUsers);
  dom.createEventForm.addEventListener("submit", handleCreateEvent);
  dom.locationToggle.addEventListener("click", toggleLocation);
  dom.quickRegister.addEventListener("click", () => registerEvent(activeEvent.id));
  dom.spotlightCta.addEventListener("click", () => registerEvent(activeEvent.id));
  dom.locateButton.addEventListener("click", locateUser);
  dom.checkinButton.addEventListener("click", handleCheckin);
  dom.spotSelect.addEventListener("change", (event) => selectSpot(event.target.value));
  dom.postForm.addEventListener("submit", handlePostSubmit);
  dom.postImage.addEventListener("change", handleImagePreview);
  dom.cameraButton.addEventListener("click", () => dom.postImage.click());
  dom.loginButton.addEventListener("click", () => openAuthModal("login"));
  dom.logoutButton.addEventListener("click", handleLogout);
  dom.authClose.addEventListener("click", closeAuthModal);
  dom.authToggle.addEventListener("click", () => {
    authMode = authMode === "login" ? "register" : "login";
    updateAuthModal();
  });
  dom.authForm.addEventListener("submit", handleAuthSubmit);
  dom.mapPickerClose.addEventListener("click", closeMapPicker);
  dom.mapPickerCancel.addEventListener("click", closeMapPicker);
  dom.mapPickerSave.addEventListener("click", saveMapPickerMarker);
  dom.mapPickerAdd.addEventListener("click", addMapPickerPoint);
  dom.mapPickerUndo.addEventListener("click", undoRoutePoint);
  dom.mapPickerDeletePoint.addEventListener("click", deleteSelectedRoutePoint);
  dom.mapPickerUpdate.addEventListener("click", updateCurrentSavedRoute);
  dom.mapPickerRouteSelect.addEventListener("change", (event) => loadSavedRoute(event.target.value));
  dom.mapPickerTypes.querySelectorAll("[data-plan-type]").forEach((button) => {
    button.addEventListener("click", () => {
      pickerSelectedType = button.dataset.planType || "checkpoint";
      updatePickerTypeButtons();
      if (pickerSelectedLatLng && pickerSelectionMarker) {
        setPickerSelectedLatLng(pickerSelectedLatLng);
      }
    });
  });
  dom.mapPickerModal.addEventListener("click", (event) => {
    if (event.target === dom.mapPickerModal) {
      closeMapPicker();
    }
  });

  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", () => scrollToSection(button.dataset.target));
  });
}

function initMaps() {
  if (!window.L) return;
  eventMap = L.map("route-map", { zoomControl: false, attributionControl: true }).setView(
    [31.3, 120.62],
    12
  );
  cityMap = L.map("city-map", { zoomControl: true, attributionControl: true }).setView(
    [31.3, 120.62],
    11
  );

  [eventMap, cityMap].forEach((mapInstance) => {
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance);
    if (suzhouBounds) {
      mapInstance.setMaxBounds(suzhouBounds);
    }
  });

  eventLayerGroup = L.layerGroup().addTo(eventMap);
  planLayerGroup = L.layerGroup().addTo(eventMap);
  cityLayerGroup = L.layerGroup().addTo(cityMap);
  eventMap.on("click", (event) => {
    addRoutePoint(event.latlng);
  });
  renderEventMap(activeEvent);
  renderCityMarkers();
  if (state.currentLocation) {
    userMarker = L.circleMarker([state.currentLocation.lat, state.currentLocation.lng], {
      radius: 8,
      color: "#111827",
      fillColor: "#ff6a3d",
      fillOpacity: 0.9,
    }).addTo(cityMap);
  }
}

function renderCityMarkers() {
  if (!cityMap) return;
  cityLayerGroup.clearLayers();
  const selectedId = String(state.selectedSpotId);
  spots.forEach((spot) => {
    const marker = L.marker([spot.lat, spot.lng]).addTo(cityLayerGroup);
    marker.bindPopup(getSpotText(spot, "name"));
    marker.on("click", () => selectSpot(spot.id));
    if (String(spot.id) === selectedId) {
      marker.openPopup();
    }
  });
}

function locateUser() {
  if (!navigator.geolocation) {
    showToast(t("toast_geo_unsupported"));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      state.currentLocation = coords;
      state.locationEnabled = true;
      saveState();
      if (cityMap) {
        if (!userMarker) {
          userMarker = L.circleMarker([coords.lat, coords.lng], {
            radius: 8,
            color: "#111827",
            fillColor: "#ff6a3d",
            fillOpacity: 0.9,
          }).addTo(cityMap);
        } else {
          userMarker.setLatLng([coords.lat, coords.lng]);
        }
        cityMap.setView([coords.lat, coords.lng], 13);
      }
      updateLocationButton();
      showToast(t("toast_geo_success"));
    },
    () => {
      showToast(t("toast_geo_denied"));
    }
  );
}

function toggleLocation() {
  if (!state.locationEnabled) {
    locateUser();
  } else {
    state.locationEnabled = false;
    saveState();
    updateLocationButton();
    showToast(t("toast_location_disabled"));
  }
}

async function handleCheckin() {
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  if (!state.currentLocation) {
    showToast(t("toast_geo_needed"));
    return;
  }
  const spot = spots.find((item) => String(item.id) === String(state.selectedSpotId));
  if (!spot) return;
  const distance = getDistanceKm(state.currentLocation, { lat: spot.lat, lng: spot.lng });
  if (distance <= 0.6) {
    try {
      await apiRequest(`/spots/${spot.id}/checkin`, { method: "POST" });
    } catch (error) {
      // allow local badge even if server fails
    }
    addPoints(30);
    unlockBadge("city-explorer");
    showToast(t("toast_checkin_ok", { spot: getSpotText(spot, "name") }));
  } else {
    showToast(t("toast_checkin_far", { distance: distance.toFixed(2) }));
  }
}

function getDistanceKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function renderSpotList() {
  if (!dom.spotSelect) return;
  const selectedId = String(state.selectedSpotId);
  if (!spots.some((spot) => String(spot.id) === selectedId)) {
    state.selectedSpotId = spots[0]?.id || "";
  }
  dom.spotSelect.innerHTML = spots.map((spot) => {
    return `<option value="${spot.id}">${getSpotText(spot, "name")}</option>`;
  }).join("");
  dom.spotSelect.value = String(state.selectedSpotId || spots[0]?.id || "");
}

function selectSpot(spotId) {
  state.selectedSpotId = spotId;
  saveState();
  renderSpotDetails();
  fetchPostsFromServer(spotId).then(renderPosts);
  if (cityMap) {
    const spot = spots.find((item) => String(item.id) === String(spotId));
    if (spot) {
      cityMap.flyTo([spot.lat, spot.lng], 13);
    }
  }
}

function renderSpotDetails() {
  const spot = spots.find((item) => String(item.id) === String(state.selectedSpotId));
  if (!spot) return;
  const distanceText = state.currentLocation
    ? `${t("spot_distance")}: ${getDistanceKm(state.currentLocation, { lat: spot.lat, lng: spot.lng }).toFixed(2)} km`
    : "";
  dom.spotDetails.innerHTML = `
    <strong>${getSpotText(spot, "name")}</strong>
    <div>${getSpotText(spot, "description")}</div>
    <div>${t("spot_vibe")}: ${getSpotText(spot, "vibe")}</div>
    ${distanceText ? `<div>${distanceText}</div>` : ""}
  `;
}

function handleImagePreview(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    dom.postPreview.src = reader.result;
    dom.postPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

async function handlePostSubmit(event) {
  event.preventDefault();
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  const text = dom.postText.value.trim();
  if (!text) return;
  const spotId = state.selectedSpotId;
  let imageUrl = "";
  const file = dom.postImage.files?.[0];
  if (file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiRequest("/uploads", { method: "POST", body: formData });
      if (result?.url) {
        imageUrl = `${API_BASE}${result.url}`;
      }
    } catch (error) {
      // ignore upload errors, allow text post
    }
  }
  try {
    await apiRequest(`/spots/${spotId}/posts`, {
      method: "POST",
      body: JSON.stringify({ text, image_url: imageUrl }),
    });
  } catch (error) {
    showToast(error.message || t("toast_posted"));
    return;
  }
  dom.postText.value = "";
  dom.postImage.value = "";
  dom.postPreview.src = "";
  dom.postPreview.style.display = "none";
  await fetchPostsFromServer(spotId);
  renderPosts();
  showToast(t("toast_posted"));
}

async function fetchPostsFromServer(spotId) {
  if (!spotId) return;
  try {
    const data = await apiRequest(`/spots/${spotId}/posts`);
    if (Array.isArray(data)) {
      state.posts[spotId] = data.map((post) => ({
        id: post.id,
        text: post.text,
        image: post.image_url || "",
        likes: post.likes || 0,
        comments: post.comments || [],
        time: post.created_at ? new Date(post.created_at).toLocaleString() : new Date().toLocaleString(),
      }));
      saveState();
    }
  } catch (error) {
    // keep local cache
  }
}

function renderPosts() {
  const spotId = state.selectedSpotId;
  const posts = state.posts[spotId] || [];
  dom.postList.innerHTML = posts
    .map((post, index) => {
      const commentList = post.comments || [];
      const comments = commentList
        .slice(0, 2)
        .map((comment) => `<div class="post-comment">${comment.text || comment}</div>`)
        .join("");
      return `
        <div class="post-item">
          <div class="post-meta">
            <span>${t("post_floor", { count: posts.length - index })}</span>
            <span>${post.time}</span>
          </div>
          <div>${post.text}</div>
          ${post.image ? `<img src="${post.image}" alt="post image" />` : ""}
          <div class="post-buttons">
            <button class="ghost-button" data-like="${post.id}">${t("post_like")} (${post.likes})</button>
            <button class="ghost-button" data-reply="${post.id}">${t("post_reply")} (${commentList.length})</button>
          </div>
          ${comments}
        </div>
      `;
    })
    .join("");

  if (posts.length === 0) {
    dom.postList.innerHTML = `<p class="body">${t("no_posts")}</p>`;
  }

  dom.postList.querySelectorAll("[data-like]").forEach((button) => {
    button.addEventListener("click", () => handleLike(button.dataset.like));
  });
  dom.postList.querySelectorAll("[data-reply]").forEach((button) => {
    button.addEventListener("click", () => handleReply(button.dataset.reply));
  });
}

async function handleLike(postId) {
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  const spotId = state.selectedSpotId;
  const posts = state.posts[spotId] || [];
  const post = posts.find((item) => item.id === postId);
  if (!post) return;
  try {
    const result = await apiRequest(`/posts/${postId}/like`, { method: "POST" });
    post.likes = result?.likes ?? post.likes + 1;
  } catch (error) {
    post.likes += 1;
  }
  saveState();
  renderPosts();
  showToast(t("toast_like"));
}

async function handleReply(postId) {
  if (!authToken) {
    showToast(t("toast_login_required"));
    openAuthModal("login");
    return;
  }
  const replyText = prompt(currentLang === "zh" ? "输入回复" : "Type a reply");
  if (!replyText) return;
  const spotId = state.selectedSpotId;
  const posts = state.posts[spotId] || [];
  const post = posts.find((item) => item.id === postId);
  if (!post) return;
  try {
    await apiRequest(`/posts/${postId}/comment`, { method: "POST", body: JSON.stringify({ text: replyText }) });
    post.comments.push({ text: replyText });
  } catch (error) {
    post.comments.push({ text: replyText });
  }
  saveState();
  renderPosts();
  showToast(t("toast_reply"));
}

function getRouteMode() {
  return state.routeMode || "idle";
}

function setRouteMode(mode) {
  state.routeMode = mode;
  state.routeEditMode = mode === "edit";
}

function getDraftRoute(event = activeEvent) {
  const key = event?.id ? String(event.id) : "";
  const draftRoute = key ? state.draftRoutes?.[key] : null;
  return normalizeRoutePoints(draftRoute);
}

function normalizeRoutePoints(points) {
  if (!Array.isArray(points)) return [];
  return points
    .map((point) => {
      if (Array.isArray(point)) return [Number(point[0]), Number(point[1])];
      if (point && typeof point === "object") return [Number(point.lat), Number(point.lng)];
      return null;
    })
    .filter((point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1]));
}

function getEditableRoute(event = activeEvent) {
  const key = event?.id ? String(event.id) : "";
  const customRoute = key ? normalizeRoutePoints(state.routePlans?.[key]) : [];
  return customRoute.length ? customRoute : getEventRouteCoords(event);
}

function ensureEditableRoute() {
  const key = getCurrentRouteKey();
  if (!key) return [];
  const normalized = normalizeRoutePoints(state.routePlans[key]);
  state.routePlans[key] = normalized.length ? normalized : getEventRouteCoords(activeEvent);
  return state.routePlans[key];
}

function getVisibleRoute(event = activeEvent) {
  const draftRoute = getDraftRoute(event);
  if (getRouteMode() === "draft" && draftRoute.length) {
    return draftRoute.length >= 2 ? draftRoute : getEventRouteCoords(event);
  }
  return getEditableRoute(event);
}

function getSingleDraftPoint(event = activeEvent) {
  const draftRoute = getDraftRoute(event);
  return getRouteMode() === "draft" && draftRoute.length === 1 ? draftRoute[0] : null;
}

function canEditVisibleRoute() {
  return getRouteMode() === "edit" || (getRouteMode() === "draft" && getDraftRoute().length >= 2);
}

function getRoutePointShortLabel(index, total) {
  if (index === 0) return "S";
  if (index === total - 1) return "F";
  return "C";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getRoutePointText(index, total) {
  const shortLabel = getRoutePointShortLabel(index, total);
  if (shortLabel === "S") return currentLang === "zh" ? "起点" : "Start";
  if (shortLabel === "F") return currentLang === "zh" ? "终点" : "Finish";
  return currentLang === "zh" ? "打卡点" : "Checkpoint";
}

function createRoutePointIcon(index, total = 1) {
  return L.divIcon({
    className: `route-point-marker${selectedRoutePointIndex === index ? " selected" : ""}`,
    html: `<span>${getRoutePointShortLabel(index, total)}</span>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

function drawRoutePoint(layer, point, index, total) {
  const marker = L.marker(point, {
    draggable: canEditVisibleRoute(),
    icon: createRoutePointIcon(index, total),
  }).addTo(layer);
  marker.bindPopup(`${getRoutePointText(index, total)} ${index + 1}`);
  marker.on("click", () => selectRoutePoint(index));
  if (canEditVisibleRoute()) {
    marker.on("dragend", (dragEvent) => updateRoutePoint(index, dragEvent.target.getLatLng()));
  }
}

function renderEventMap(event) {
  if (!eventMap) return;
  eventLayerGroup.clearLayers();
  const route = getVisibleRoute(event);
  const draftPoint = getSingleDraftPoint(event);
  const center = event.lat && event.lng ? [event.lat, event.lng] : [31.3, 120.62];

  if (route.length > 1) {
    const routeLine = L.polyline(route, { color: "#ff6a3d", weight: 5, opacity: 0.95 }).addTo(eventLayerGroup);
    eventMap.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
  } else {
    eventMap.setView(center, 14);
  }

  route.forEach((point, index) => drawRoutePoint(eventLayerGroup, point, index, route.length));

  if (draftPoint) {
    L.marker(draftPoint, {
      draggable: true,
      icon: createRoutePointIcon(0, 1),
    })
      .addTo(eventLayerGroup)
      .bindPopup(currentLang === "zh" ? "新路线起点" : "New route start")
      .on("click", () => selectRoutePoint(0))
      .on("dragend", (dragEvent) => updateRoutePoint(0, dragEvent.target.getLatLng()));
  }

  if (!route.length && !draftPoint) {
    L.marker(center).addTo(eventLayerGroup).bindPopup(getEventText(event, "name"));
  }

  renderRouteControls();
}

function refreshRouteViews(updateCheckpoints = true) {
  renderEventMap(activeEvent);
  if (updateCheckpoints) renderCheckpointList(activeEvent, null);
  if (dom.mapPickerModal?.classList.contains("show")) {
    renderPickerMap(false);
  }
}

function addRoutePoint(latlng) {
  const key = getCurrentRouteKey();
  if (!key) return;

  if (getRouteMode() === "edit") {
    const route = ensureEditableRoute();
    route.push([Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))]);
    selectedRoutePointIndex = route.length - 1;
  } else {
    setRouteMode("draft");
    state.routePlans[key] = [];
    if (!Array.isArray(state.draftRoutes[key])) state.draftRoutes[key] = [];
    state.draftRoutes[key].push([Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))]);
    selectedRoutePointIndex = state.draftRoutes[key].length - 1;
    if (state.draftRoutes[key].length >= 2) {
      state.routePlans[key] = state.draftRoutes[key].map((point) => [...point]);
    }
  }

  saveState();
  refreshRouteViews();
}

function updateRoutePoint(index, latlng) {
  const key = getCurrentRouteKey();
  const route = getRouteMode() === "draft" ? getDraftRoute() : ensureEditableRoute();
  if (!route[index]) return;
  route[index] = [Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))];
  selectedRoutePointIndex = index;
  if (getRouteMode() === "draft") {
    state.routePlans[key] = route.length >= 2 ? route.map((point) => [...point]) : [];
  }
  saveState();
  refreshRouteViews();
}

function undoRoutePoint() {
  const key = getCurrentRouteKey();
  const route = getRouteMode() === "draft" ? getDraftRoute() : ensureEditableRoute();
  if (!route.length) return;
  route.pop();
  selectedRoutePointIndex = null;
  if (getRouteMode() === "draft") {
    state.routePlans[key] = route.length >= 2 ? route.map((point) => [...point]) : [];
  }
  saveState();
  refreshRouteViews();
  showToast(t("toast_route_undo"));
}

function deleteSelectedRoutePoint() {
  const key = getCurrentRouteKey();
  const route = getRouteMode() === "draft" ? getDraftRoute() : ensureEditableRoute();
  if (!route.length) return;
  const index = selectedRoutePointIndex === null ? route.length - 1 : selectedRoutePointIndex;
  route.splice(index, 1);
  selectedRoutePointIndex = null;
  if (getRouteMode() === "draft") {
    state.routePlans[key] = route.length >= 2 ? route.map((point) => [...point]) : [];
  }
  saveState();
  refreshRouteViews();
  showToast(t("toast_route_point_deleted"));
}

function selectRoutePoint(index) {
  selectedRoutePointIndex = index;
  refreshRouteViews(false);
}

function setRouteEditing(enabled) {
  const key = getCurrentRouteKey();
  selectedRoutePointIndex = null;
  if (enabled) {
    setRouteMode("edit");
    state.draftRoutes[key] = [];
    state.routePlans[key] = getEditableRoute(activeEvent).map((point) => [...point]);
  } else {
    setRouteMode("idle");
  }
  saveState();
  refreshRouteViews();
  showToast(t(enabled ? "toast_route_editing" : "toast_route_done"));
}

function saveCurrentRoute() {
  const key = getCurrentRouteKey();
  const route = getRouteMode() === "draft" ? getDraftRoute() : ensureEditableRoute();
  if (!key || route.length < 2) {
    showToast(t("toast_route_empty"));
    return;
  }
  const saved = getSavedRoutes();
  const label = currentLang === "zh" ? `路线 ${saved.length + 1}` : `Route ${saved.length + 1}`;
  const id = `route_${Date.now()}`;
  saved.push({
    id,
    label,
    points: route.map((point) => [...point]),
    updatedAt: new Date().toLocaleString(),
  });
  state.routePlans[key] = route.map((point) => [...point]);
  state.draftRoutes[key] = [];
  state.selectedRoutes[key] = id;
  setRouteMode("edit");
  saveState();
  refreshRouteViews();
  showToast(t("toast_route_saved"));
}

function updateCurrentSavedRoute() {
  const key = getCurrentRouteKey();
  const route = getVisibleRoute(activeEvent);
  if (!key || route.length < 2) {
    showToast(t("toast_route_empty"));
    return;
  }
  const selectedRoute = getSavedRoutes().find((item) => item.id === state.selectedRoutes?.[key]);
  if (!selectedRoute) {
    saveCurrentRoute();
    return;
  }
  selectedRoute.points = route.map((point) => [...point]);
  selectedRoute.updatedAt = new Date().toLocaleString();
  saveState();
  renderRouteControls();
  showToast(t("toast_route_updated"));
}

function loadSavedRoute(routeId) {
  const key = getCurrentRouteKey();
  const savedRoute = getSavedRoutes().find((item) => item.id === routeId);
  if (!key || !savedRoute) return;
  state.routePlans[key] = savedRoute.points.map((point) => [Number(point[0]), Number(point[1])]);
  state.draftRoutes[key] = [];
  state.selectedRoutes[key] = routeId;
  setRouteMode("edit");
  selectedRoutePointIndex = null;
  saveState();
  refreshRouteViews();
  showToast(t("toast_route_selected"));
}

function clearRoutePlan() {
  if (!activeEvent?.id) return;
  const key = String(activeEvent.id);
  state.routePlans[key] = [];
  state.draftRoutes[key] = [];
  setRouteMode("idle");
  selectedRoutePointIndex = null;
  saveState();
  refreshRouteViews();
}

function renameSavedRoute(routeId, label) {
  const route = getSavedRoutes().find((item) => item.id === routeId);
  if (!route) return;
  route.label = label.trim() || route.label;
  route.updatedAt = new Date().toLocaleString();
  saveState();
  renderRouteControls();
  showToast(t("toast_route_renamed"));
}

function deleteSavedRoute(routeId) {
  const key = getCurrentRouteKey();
  const saved = getSavedRoutes();
  const index = saved.findIndex((item) => item.id === routeId);
  if (index === -1) return;
  saved.splice(index, 1);
  if (state.selectedRoutes[key] === routeId) state.selectedRoutes[key] = "";
  saveState();
  renderRouteControls();
  showToast(t("toast_route_deleted"));
}

function renderRouteControls() {
  const key = getCurrentRouteKey();
  const saved = getSavedRoutes();
  const selected = state.selectedRoutes?.[key] || "";

  [dom.routeSelect, dom.mapPickerRouteSelect].filter(Boolean).forEach((select) => {
    select.innerHTML = [
      `<option value="">${t("route_select_placeholder")}</option>`,
      ...saved.map((route) => `<option value="${route.id}">${escapeHtml(route.label)}</option>`),
    ].join("");
    select.value = selected;
  });

  [dom.routeSavedList, dom.mapPickerRouteList].filter(Boolean).forEach((list) => {
    list.innerHTML = saved.length
      ? saved
          .map(
            (route) => `
              <div class="saved-route-row" data-route-id="${route.id}">
                <input value="${escapeHtml(route.label)}" aria-label="${t("route_name_placeholder")}" />
                <button class="ghost-button saved-route-load" type="button">${currentLang === "zh" ? "选择" : "Load"}</button>
                <button class="ghost-button saved-route-delete" type="button" aria-label="${currentLang === "zh" ? "删除路线" : "Delete route"}">🗑</button>
              </div>
            `
          )
          .join("")
      : `<p class="body">${t("route_saved_empty")}</p>`;

    list.querySelectorAll(".saved-route-row").forEach((row) => {
      const routeId = row.dataset.routeId;
      row.querySelector("input")?.addEventListener("change", (event) => renameSavedRoute(routeId, event.target.value));
      row.querySelector(".saved-route-load")?.addEventListener("click", () => loadSavedRoute(routeId));
      row.querySelector(".saved-route-delete")?.addEventListener("click", () => deleteSavedRoute(routeId));
    });
  });

  [dom.routeUpdate, dom.mapPickerUpdate].forEach((button) => {
    if (button) button.disabled = getRouteMode() === "idle";
  });
  if (dom.mapPickerAdd) dom.mapPickerAdd.disabled = !pickerSelectedLatLng;
  if (dom.mapPickerDeletePoint) dom.mapPickerDeletePoint.disabled = !canEditVisibleRoute() && !getSingleDraftPoint();
  if (dom.routeEdit) dom.routeEdit.classList.toggle("active", getRouteMode() === "edit");
  if (dom.routeEditHint) {
    dom.routeEditHint.textContent =
      getRouteMode() === "edit"
        ? currentLang === "zh"
          ? "正在编辑当前路线：拖动 S/C/F 圆点调整路线，或点击地图添加点位。"
          : "Editing current route: drag S/C/F points or tap the map to add points."
        : getRouteMode() === "draft"
        ? currentLang === "zh"
          ? "正在新建路线：第一个点不会连接默认路线，第二个点开始自动连线。"
          : "Creating a route: the first point stays separate; two or more points connect as a new route."
        : t("map_edit_hint");
  }
}

function renderPickerMap(resetSelection = true) {
  ensurePickerMap();
  if (!pickerMap || !activeEvent) return;
  pickerRouteLayer.clearLayers();
  pickerPlanLayer.clearLayers();
  if (resetSelection) {
    pickerSelectionLayer.clearLayers();
    pickerSelectionMarker = null;
    pickerSelectedLatLng = null;
    dom.mapPickerCoords.textContent = t("map_picker_coords_empty");
    dom.mapPickerLabel.value = "";
  }

  const route = getVisibleRoute(activeEvent);
  const draftPoint = getSingleDraftPoint(activeEvent);
  const center = activeEvent.lat && activeEvent.lng ? [activeEvent.lat, activeEvent.lng] : [31.3, 120.62];
  if (route.length > 1) {
    const routeLine = L.polyline(route, { color: "#ff6a3d", weight: 5, opacity: 0.95 }).addTo(pickerRouteLayer);
    pickerMap.fitBounds(routeLine.getBounds(), { padding: [28, 28] });
  } else {
    pickerMap.setView(center, 14);
  }

  route.forEach((point, index) => drawRoutePoint(pickerRouteLayer, point, index, route.length));
  if (draftPoint) {
    L.marker(draftPoint, { draggable: true, icon: createRoutePointIcon(0, 1) })
      .addTo(pickerRouteLayer)
      .bindPopup(currentLang === "zh" ? "新路线起点" : "New route start")
      .on("click", () => selectRoutePoint(0))
      .on("dragend", (dragEvent) => updateRoutePoint(0, dragEvent.target.getLatLng()));
  }
  if (!route.length && !draftPoint) {
    L.marker(center).addTo(pickerRouteLayer).bindPopup(getEventText(activeEvent, "name"));
  }

  renderPickerSuggestions();
  updatePickerTypeButtons();
  renderRouteControls();
  setTimeout(() => pickerMap.invalidateSize(), 40);
}

function addMapPickerPoint() {
  if (!activeEvent?.id || !pickerSelectedLatLng) {
    showToast(t("toast_picker_need_point"));
    return;
  }
  addRoutePoint(pickerSelectedLatLng);
}

async function init() {
  initNav();
  initFilters();
  initActions();
  initLanguageToggle();
  initAiTrainer();
  initMaps();
  setLanguage(currentLang);
  await ensureApiBase();
  await fetchCurrentUser();
  setUserUI();
  if (currentUser?.role === "admin") {
    fetchUsers();
  }
  fetchEventsFromServer();
  fetchSpotsFromServer();
}

init();
