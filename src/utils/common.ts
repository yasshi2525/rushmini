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

export const sum = <T>(arr: T[], num: (e: T) => number) =>
  arr.reduce((p, n) => p + num(n), 0);

export const remove = <T>(arr: T[], subject: T | ((s: T) => boolean)) => {
  if (subject instanceof Function) {
    let elm;
    do {
      elm = find(arr, (s) => subject(s));
      if (elm) arr.splice(arr.indexOf(elm), 1);
    } while (elm);
  } else {
    return arr.splice(arr.indexOf(subject), 1);
  }
};

export const removeIf = <T>(arr: T[], subject: T) => {
  const idx = arr.indexOf(subject);
  if (idx !== -1) {
    return arr.splice(idx, 1);
  }
  return undefined;
};

/**
 * 指定された要素を一番手前に挿入します
 * @param p
 * @param parent
 */
export const insertTop = (p: g.E, parent: g.E) => {
  parent.append(p);
  [...parent.children]
    .filter((e) => e !== p)
    .forEach((e) => {
      parent.remove(e);
      parent.append(e);
    });
};
