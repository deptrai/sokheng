import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useCallback } from "react";

const useChangeLanguage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as I18N;

  const handleChange = useCallback((newLocale: I18N) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  }, [locale, pathname, router]);

  const languageTitle = (() => {
    switch (locale) {
      case "en":
        return "English";
      case "vi":
        return "Tiếng Việt";
      case "km":
        return "ភាសាខ្មែរ"; // Khmer
      default:
        return "English";
    }
  })();

  return { handleChange, languageTitle };
};

export default useChangeLanguage;
