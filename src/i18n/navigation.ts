import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// ロケール対応の Link / useRouter などをここから使う
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
