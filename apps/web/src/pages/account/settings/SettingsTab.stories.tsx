import type { Meta, StoryObj } from "@storybook/react-vite";
import { stubFetch } from "#shared/testing/stories.tsx";
import { testUser } from "#shared/testing/fixtures/users.ts";
import en from "#pages/account/locales/en.json" with { type: "json" };
import { SettingsTab } from "./SettingsTab.tsx";

const meta = {
  component: SettingsTab,
  parameters: { route: "/account/settings" },
  beforeEach: () => stubFetch({ "/api/me": { body: { user: testUser } } }),
  play: async ({ canvas }) => {
    await canvas.findByRole("button", { name: en.settings.logOut });
  },
} satisfies Meta<typeof SettingsTab>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LogOutFailed: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: en.settings.logOut }),
    );
    await canvas.findByRole("alert");
  },
};
