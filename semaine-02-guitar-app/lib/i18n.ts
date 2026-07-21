import type { Locale } from "@/lib/locale";
import { fr } from "@/messages/fr";
import { en } from "@/messages/en";

export type MessageKey = keyof typeof fr;

const dictionaries: Record<Locale, Record<MessageKey, string>> = {
  fr,
  en,
};

export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let text = dictionaries[locale][key] ?? dictionaries.fr[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
