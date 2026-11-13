import type { Meta, StoryObj } from "@storybook/react-vite";
import { PopularCategories } from "./PopularCategories.tsx";

const slugs = [
  "electronics",
  "home-furniture",
  "clothing",
  "sports-outdoor",
  "kids",
  "books-hobbies",
  "vehicles",
  "free-stuff",
];

const meta = {
  component: PopularCategories,
  args: {
    categories: slugs.map((slug, index) => ({
      id: `0193a000-0000-7000-8000-00000000000${String(index)}`,
      slug,
    })),
  },
} satisfies Meta<typeof PopularCategories>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile" } },
};

export const Untranslated: Story = {
  args: {
    categories: [
      { id: "0193a000-0000-7000-8000-000000000000", slug: "electronics" },
      { id: "0193a000-0000-7000-8000-000000000001", slug: "brand-new" },
    ],
  },
};

export const Empty: Story = {
  args: { categories: [] },
};
