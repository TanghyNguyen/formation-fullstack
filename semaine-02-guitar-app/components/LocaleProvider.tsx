"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/locale";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useServerLocale(): Locale {
  return useContext(LocaleContext);
}
