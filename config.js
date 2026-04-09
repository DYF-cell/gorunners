window.GORUNNERS_API = "http://127.0.0.1:8000";

window.GORUNNERS_AI_TRAINERS = [
  {
    id: "default",
    label: { en: "GoRunner AI Trainer", zh: "GoRunner AI训练师" },
    mode: "api",
    useDifyParameters: true,
    iframeSrc: "  ",
    inputForm: [
      {
        key: "running_level",
        required: true,
        type: "select",
        label: { en: "Running Level", zh: "跑步水平" },
        options: [
          { value: "beginner", label: { en: "Beginner", zh: "新手" } },
          { value: "intermediate", label: { en: "Intermediate", zh: "进阶" } },
          { value: "advanced", label: { en: "Advanced", zh: "高级" } },
        ],
      },
      {
        key: "goal_type",
        required: true,
        type: "text",
        label: { en: "Goal_type", zh: "目标类型" },
        placeholder: { en: "e.g. 5K training / Fat loss / Marathon prep", zh: "例如：5K训练 / 减脂 / 马拉松备赛" },
      },
      {
        key: "current_weekly_distance",
        required: false,
        type: "number",
        label: { en: "Current weekly distance (optional)", zh: "当前每周里程（选填）" },
        placeholder: { en: "e.g. 15 (km)", zh: "例如：15（公里）" },
      },
      {
        key: "preferred_intensity",
        required: true,
        type: "text",
        label: { en: "Preferred intensity", zh: "偏好强度" },
        placeholder: { en: "e.g. Easy / Moderate / Hard", zh: "例如：轻松 / 中等 / 高强度" },
      },
      {
        key: "injury_concern",
        required: true,
        type: "text",
        label: { en: "Injury concern", zh: "伤病情况" },
        placeholder: { en: "e.g. Knee / None / Achilles", zh: "例如：膝盖 / 无 / 跟腱" },
      },
      {
        key: "user_feedback",
        required: false,
        type: "textarea",
        label: { en: "User feedback (optional)", zh: "补充说明（选填）" },
        placeholder: { en: "Anything else the trainer should know?", zh: "还有什么想让训练师知道的？" },
      },
    ],
  },
];
