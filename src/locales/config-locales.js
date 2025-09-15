export const fallbackLng = 'en';
export const languages = ['en', 'jp', 'cn'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages = {
  en: {
    success: 'Language has been changed!',
    error: 'Error changing language!',
    loading: 'Loading...',
  },
  jp: {
    success: '言語が変更されました！',
    error: '言語の変更中にエラーが発生しました！',
    loading: '読み込み中...',
  },
  vi: {
    success: 'Ngôn ngữ đã được thay đổi!',
    error: 'Lỗi khi thay đổi ngôn ngữ!',
    loading: 'Đang tải...',
  },
  fr: {
    success: 'La langue a été changée!',
    error: 'Erreur lors du changement de langue!',
    loading: 'Chargement...',
  },
  cn: {
    success: '语言已更改！',
    error: '更改语言时出错！',
    loading: '加载中...',
  },
  ar: {
    success: 'تم تغيير اللغة!',
    error: 'خطأ في تغيير اللغة!',
    loading: 'جارٍ التحميل...',
  },
};
