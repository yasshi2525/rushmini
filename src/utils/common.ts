/**
 * 配列の中から、条件をみたす要素を取り出す。es6 の Array#find がAkashicで非推奨のため実装
 * @param arr
 * @param cond
 */
export const find = <T>(arr: T[], cond: (v: T) => boolean) => {
  for (let i = 0; i < arr.length; i++) {
    if (cond(arr[i])) return arr[i];
  }
  return undefined;
};

export const remove = <T>(arr: T[], subject: T) =>
  arr.splice(arr.indexOf(subject), 1);

export const removeIf = <T>(arr: T[], subject: T) => {
  const idx = arr.indexOf(subject);
  if (idx !== -1) {
    return arr.splice(idx, 1);
  }
  return undefined;
};
