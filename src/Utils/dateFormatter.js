/**
 * @param {string|Date} dateInput
 * @param {boolean} includeTime
 * @returns {string}
 */
export const formatBentoDate = (dateInput, includeTime = false) => {
  if (!dateInput) return "—";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const basicDate = `${year}-${month}-${day}`;

  if (!includeTime) return basicDate;

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${basicDate} ${time}`;
};
