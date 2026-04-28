export const handleAxiosError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const backendMessage = error.response.data?.message;
    if (status === 403) {
      if (backendMessage === "frozen") {
        return "تم تجميد حسابك مؤقتاً، يرجى التواصل مع الإدارة.";
      }
      if (backendMessage === "banned") {
        return "لقد تم حظر هذا الحساب.";
      }
      return backendMessage || "غير مصرح لك بالوصول إلى هذا القسم.";
    }

    if (status === 401) {
      if (backendMessage === "Invalid refresh token") {
        return "انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى.";
      }
      if (backendMessage) return backendMessage;
    }
    if (status === 500)
      return "عذراً، حدث خطأ في النظام. يرجى المحاولة لاحقاً.";

    return backendMessage || "حدث خطأ غير متوقع، يرجى تحديث الصفحة والمحاولة.";
  }

  if (error.request) {
    return "تعذر الاتصال، يرجى التأكد من جودة الإنترنت لديك.";
  }

  return "حدث خطأ غير متوقع، يرجى تحديث الصفحة والمحاولة.";
};
