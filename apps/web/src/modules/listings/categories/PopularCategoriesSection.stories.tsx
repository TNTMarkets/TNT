import type { Meta, StoryObj } from "@storybook/react-vite";
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
    stubFetch(200, {
      categories: [
        { id: "0193a000-0000-7000-8000-000000000001", slug: "bikes" },
        { id: "0193a000-0000-7000-8000-000000000002", slug: "books" },
      ],
    }),
  play: async ({ canvas }) => {
    await canvas.findByTestId("popular-categories");
  },
};

export const Failed: Story = {
  beforeEach: () => stubFetch(500, { error: { code: "internal" } }),
  play: async ({ canvas }) => {
    await canvas.findByRole("alert");
  },
};
