import type { Meta, StoryObj } from "@storybook/react-vite";
import { stubFetch } from "#shared/testing/stories.tsx";
import { testAvatar, testUser } from "#shared/testing/fixtures/users.ts";
import { AccountPage } from "./AccountPage.tsx";

const meta = {
  component: AccountPage,
  parameters: { route: "/account" },
  beforeEach: () =>
    stubFetch({
      "/api/me": { body: { user: { ...testUser, image: testAvatar } } },
    }),
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { name: testUser.name });
  },
} satisfies Meta<typeof AccountPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile" } },
};
