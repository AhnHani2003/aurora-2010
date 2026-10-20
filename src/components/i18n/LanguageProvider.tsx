"use client";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  LANGUAGE_KEY,
  translate,
  translateText,
  type Language,
  type TranslationKey,
} from "@/lib/i18n/translate";
let selected: Language = "en";
let loaded = false;
const listeners = new Set<() => void>();
function snapshot(): Language {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      selected = localStorage.getItem(LANGUAGE_KEY) === "vi" ? "vi" : "en";
    } catch {}
  }
  return selected;
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const setLanguage = (language: Language) => {
  selected = language;
  loaded = true;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {}
  listeners.forEach((listener) => listener());
};
const LanguageContext = createContext<Language>("en");
export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "en" as const,
  );
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <LanguageContext.Provider value={language}>
      <title>
        {translate("A little love, a lot of luck · For Aurora", language)}
      </title>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const language = useContext(LanguageContext);
  return {
    language,
    setLanguage,
    t: (key: TranslationKey) => translate(key, language),
    text: (value: string) => translateText(value, language),
  };
}
const attributes = [
  "aria-label",
  "aria-description",
  "aria-valuetext",
  "title",
  "alt",
  "placeholder",
] as const;
/** Translate render output, not the DOM. Keys, component types, event handlers, input values and game data are untouched. */
export function localizeTree(node: ReactNode, language: Language): ReactNode {
  if (typeof node === "string") return translateText(node, language);
  if (Array.isArray(node))
    return Children.map(node, (child) => localizeTree(child, language));
  if (
    !isValidElement<Record<string, unknown>>(node) ||
    node.props["data-l10n-ignore"]
  )
    return node;
  const props: Record<string, unknown> = {};
  if (node.props.children !== undefined)
    props.children = localizeTree(node.props.children as ReactNode, language);
  for (const attribute of attributes)
    if (typeof node.props[attribute] === "string")
      props[attribute] = translateText(node.props[attribute], language);
  return cloneElement(node, props);
}
export function useLocalizedTree() {
  const { language } = useLanguage();
  return useCallback(
    // Normalize children in both languages: switching must never change their key paths.
    <T extends ReactNode>(node: T): T => localizeTree(node, language) as T,
    [language],
  );
}
export function LanguageToggle() {
  const { language, t } = useLanguage();
  return (
    <div className="language-toggle" role="group" aria-label={t("Language")}>
      <button
        type="button"
        lang="en"
        aria-pressed={language === "en"}
        aria-label={t("Switch to English")}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        lang="vi"
        aria-pressed={language === "vi"}
        aria-label={t("Switch to Vietnamese")}
        onClick={() => setLanguage("vi")}
      >
        VI
      </button>
    </div>
  );
}
