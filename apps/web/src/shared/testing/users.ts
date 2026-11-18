import type { MeResponse } from "@tnt/api-schemas/accounts";

export const testUser: NonNullable<MeResponse["user"]> = {
  id: "0193a000-0000-7000-8000-000000000001",
  name: "Aino Laine",
  image: null,
};

export const testAvatar = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f5c542"/></svg>',
)}`;
