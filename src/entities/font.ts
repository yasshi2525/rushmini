const createFont = (key: string) => {
  const fontGlyphAsset = g.game.assets[`${key}_glyphs`] as g.TextAsset;
  const glyphData = JSON.parse(fontGlyphAsset.data);

  const font = new g.BitmapFont({
    src: g.game.assets[key],
    map: glyphData.map,
    defaultGlyphWidth: glyphData.width,
    defaultGlyphHeight: glyphData.height,
    missingGlyph: glyphData.missingGlyph,
  });

  return font;
};

export default createFont;
