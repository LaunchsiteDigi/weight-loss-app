import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const suggestions = [
  // Cycle 1
  "Log my weight",
  "What should I eat?",
  "Track my water",
  "Log a workout",
  // Cycle 2
  "Show my progress",
  "Set a goal",
  "Calculate my BMI",
  "Daily check-in",
  // Cycle 3
  "Log my calories",
  "Meal ideas for lunch",
  "How did I sleep?",
  "Body measurements",
];
