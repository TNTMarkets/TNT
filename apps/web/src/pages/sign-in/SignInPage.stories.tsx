import type { Meta, StoryObj } from "@storybook/react-vite";
import en from "./locales/en.json" with { type: "json" };
import { SignInPage } from "./SignInPage.tsx";

const meta = {
  component: SignInPage,
  parameters: { route: "/sign-in" },
  play: async ({ canvas }) => {
    await canvas.findByRole("button", { name: en.with42 });
  },
} satisfies Meta<typeof SignInPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Failed: Story = {
  parameters: { route: "/sign-in?error=sign_in_failed" },
  play: async ({ canvas }) => {
    await canvas.findByRole("alert");
  },
};
