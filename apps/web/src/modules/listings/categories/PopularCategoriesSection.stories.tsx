import type { Meta, StoryObj } from "@storybook/react-vite";
import { testCategories } from "#shared/testing/categories.ts";
import { stubFetch, withQueryClient } from "#shared/testing/stories.tsx";
import { PopularCategoriesSection } from "./PopularCategoriesSection.tsx";

const meta = {
  component: PopularCategoriesSection,
  decorators: [withQueryClient],
} satisfies Meta<typeof PopularCategoriesSection>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  beforeEach: () =>
    stubFetch({
      "/api/categories": {
        body: {
          categories: testCategories,
        },
      },
    }),
  play: async ({ canvas }) => {
    await canvas.findByTestId("popular-categories");
  },
};

export const Failed: Story = {
  beforeEach: () =>
    stubFetch({
      "/api/categories": { status: 500, body: { error: { code: "internal" } } },
    }),
  play: async ({ canvas }) => {
    await canvas.findByRole("alert");
  },
};
