const createFont = (loadedScene: g.Scene, key: string) => {
  const fontGlyphAsset = loadedScene.assets[`${key}_glyphs`] as g.TextAsset;
  const glyphData = JSON.parse(fontGlyphAsset.data);

  const font = new g.BitmapFont({
    src: loadedScene.assets[key],
    map: glyphData.map,
    defaultGlyphWidth: glyphData.width,
    defaultGlyphHeight: glyphData.height,
    missingGlyph: glyphData.missingGlyph,
  });

  return font;
};

export default createFont;
