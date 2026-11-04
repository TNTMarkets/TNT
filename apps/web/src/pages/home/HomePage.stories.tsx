import type { Meta, StoryObj } from "@storybook/react-vite";
import { stubFetch, withQueryClient } from "#shared/testing/stories.tsx";
import { HomePage } from "./HomePage.tsx";

const meta = {
  component: HomePage,
  decorators: [withQueryClient],
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
} satisfies Meta<typeof HomePage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile" } },
};
