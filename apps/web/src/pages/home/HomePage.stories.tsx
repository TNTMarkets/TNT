import type { Meta, StoryObj } from "@storybook/react-vite";
import { stubFetch } from "#shared/testing/stories.tsx";
import { testCategories } from "#shared/testing/fixtures/categories.ts";
import { testUser } from "#shared/testing/fixtures/users.ts";
import en from "./locales/en.json" with { type: "json" };
import { HomePage } from "./HomePage.tsx";

const categories = { body: { categories: testCategories } };

const meta = {
  component: HomePage,
  parameters: { route: "/" },
  beforeEach: () =>
    stubFetch({
      "/api/me": { body: { user: null } },
      "/api/categories": categories,
    }),
  play: async ({ canvas }) => {
    await canvas.findByTestId("popular-categories");
    await canvas.findByRole("link", { name: en.logIn });
  },
} satisfies Meta<typeof HomePage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SignedIn: Story = {
  beforeEach: () =>
    stubFetch({
      "/api/me": { body: { user: testUser } },
      "/api/categories": categories,
    }),
  play: async ({ canvas }) => {
    await canvas.findByTestId("popular-categories");
    await canvas.findByRole("link", { name: testUser.name });
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile" } },
};
