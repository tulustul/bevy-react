//! Text: font, color, layout, line height, spacing, and shadow resolution.

use super::*;

/// Convert a wire [`FontSize`] into bevy's `FontSize` (the `TextFont` field type),
/// mapping each unit one-to-one (`Rem` resolves against bevy's `RemSize` resource).
fn font_size_to_bevy(size: FontSize) -> BevyFontSize {
    match size {
        FontSize::Px(v) => BevyFontSize::Px(v),
        FontSize::Vw(v) => BevyFontSize::Vw(v),
        FontSize::Vh(v) => BevyFontSize::Vh(v),
        FontSize::VMin(v) => BevyFontSize::VMin(v),
        FontSize::VMax(v) => BevyFontSize::VMax(v),
        FontSize::Rem(v) => BevyFontSize::Rem(v),
    }
}

/// Map a [`LineHeightSpec`] to bevy's [`LineHeight`]: a bare number is a multiple
/// of the font size, `{ px }` is an absolute pixel height, and a string carries a
/// unit (`"20px"` absolute, else a multiple).
pub(super) fn line_height(spec: &LineHeightSpec) -> LineHeight {
    match spec {
        LineHeightSpec::Relative(scale) => LineHeight::RelativeToFont(*scale),
        LineHeightSpec::Px { px } => LineHeight::Px(*px),
        LineHeightSpec::Str(s) => {
            let s = s.trim();
            if let Some(n) = s.strip_suffix("px") {
                if let Ok(v) = n.trim().parse() {
                    return LineHeight::Px(v);
                }
            } else {
                // unitless or `em`/`rem` → a multiple of the font size.
                let num = s
                    .strip_suffix("rem")
                    .or_else(|| s.strip_suffix("em"))
                    .unwrap_or(s);
                if let Ok(v) = num.trim().parse() {
                    return LineHeight::RelativeToFont(v);
                }
            }
            let msg = format!("invalid lineHeight {s:?}");
            crate::diag::report("lineHeight", s, &msg);
            LineHeight::default()
        }
    }
}

/// Map a [`LetterSpacingSpec`] to bevy's [`LetterSpacing`]: a bare number is
/// logical pixels, `{ rem }` is a multiple of the font size, and a string carries a
/// unit (`"2px"`, `"0.1rem"`, or `"normal"`).
pub(super) fn letter_spacing(spec: &LetterSpacingSpec) -> LetterSpacing {
    match spec {
        LetterSpacingSpec::Px(px) => LetterSpacing::Px(*px),
        LetterSpacingSpec::Rem { rem } => LetterSpacing::Rem(*rem),
        LetterSpacingSpec::Str(s) => {
            let s = s.trim();
            if s.eq_ignore_ascii_case("normal") {
                return LetterSpacing::default();
            }
            if let Some(n) = s.strip_suffix("px") {
                if let Ok(v) = n.trim().parse() {
                    return LetterSpacing::Px(v);
                }
            } else if let Some(n) = s.strip_suffix("rem").or_else(|| s.strip_suffix("em")) {
                if let Ok(v) = n.trim().parse() {
                    return LetterSpacing::Rem(v);
                }
            } else if let Ok(v) = s.parse() {
                return LetterSpacing::Px(v); // bare numeric string → logical pixels
            }
            let msg = format!("invalid letterSpacing {s:?}");
            crate::diag::report("letterSpacing", s, &msg);
            LetterSpacing::default()
        }
    }
}

/// Build a [`TextShadow`] from a style's `textShadow`, folding `opacity` (as
/// resolved by the caller — `None` on a promoted layer root) into the color.
/// Unset offset/color fields fall back to bevy's [`TextShadow::default`].
pub(crate) fn text_shadow(style: Option<&Style>, opacity: Option<f32>) -> Option<TextShadow> {
    let s = style?;
    let spec = s.get(&TEXT_SHADOW)?;
    let mut shadow = TextShadow::default();
    if let Some(x) = spec.offset_x {
        shadow.offset.x = x;
    }
    if let Some(y) = spec.offset_y {
        shadow.offset.y = y;
    }
    if let Some(c) = &spec.color {
        shadow.color = parse_color(c);
    }
    shadow.color = apply_opacity(shadow.color, opacity);
    Some(shadow)
}

/// Resolve a style's text appearance into the `TextColor` + `TextFont` +
/// `LineHeight` + `LetterSpacing` a text run carries. Unset properties fall
/// back to white / Bevy's defaults. Returned as concrete components so they
/// can be copied onto inheriting child spans. On a `promoted` text root the
/// `opacity` fold into the glyph color is suppressed — the value drives the
/// layer's composite-time group alpha instead (without this, a promoted
/// `<text>` would fade twice).
pub fn resolved_text_style(
    style: Option<&Style>,
    fonts: &Fonts,
    promoted: bool,
) -> (TextColor, TextFont, LineHeight, LetterSpacing) {
    let (font, line, spacing) = resolve_text_font(style, fonts);
    (resolve_text_color(style, promoted), font, line, spacing)
}

/// The color half of the resolved text style: `color` (default white) with
/// the `opacity` fold — suppressed on a promoted root.
pub(crate) fn resolve_text_color(style: Option<&Style>, promoted: bool) -> TextColor {
    let mut color = TextColor(Color::WHITE);
    if let Some(s) = style {
        if let Some(c) = s.get(&COLOR).static_ref() {
            color = TextColor(parse_color(c));
        }
        if s.get(&OPACITY).is_some() && !promoted {
            color = TextColor(apply_opacity(color.0, s.get(&OPACITY).static_val()));
        }
    }
    color
}

/// The shaping half of the resolved text style: `TextFont` (size, weight,
/// family — the configured default face when unset) + `LineHeight` +
/// `LetterSpacing`.
pub(crate) fn resolve_text_font(
    style: Option<&Style>,
    fonts: &Fonts,
) -> (TextFont, LineHeight, LetterSpacing) {
    let mut font = TextFont::default();
    let mut line = LineHeight::default();
    let mut spacing = LetterSpacing::default();
    // Default font face; a `fontFamily` below overrides it. Unset on both → leave
    // `TextFont::default()`'s empty handle (Bevy's built-in font).
    if let Some(h) = &fonts.default {
        font.font = FontSource::Handle(h.clone());
    }
    if let Some(s) = style {
        if let Some(size) = s.get(&FONT_SIZE).copied() {
            font.font_size = font_size_to_bevy(size);
        }
        if let Some(w) = s.get(&FONT_WEIGHT).copied() {
            font.weight = w;
        }
        if let Some(family) = s.get(&FONT_FAMILY) {
            match fonts.named.get(family) {
                Some(h) => font.font = FontSource::Handle(h.clone()),
                None => {
                    let msg = format!("unknown fontFamily {family:?}");
                    crate::diag::report("fontFamily", family, &msg);
                }
            }
        }
        if let Some(lh) = s.get(&LINE_HEIGHT) {
            line = line_height(lh);
        }
        if let Some(ls) = s.get(&LETTER_SPACING) {
            spacing = letter_spacing(ls);
        }
    }
    (font, line, spacing)
}

/// Land a resolved text style on a text root or an inheriting span, writing
/// only the halves asked for — and each component compare-before-write
/// ([`set_if_neq_or_insert`]), so an unchanged `TextFont` never ticks. This
/// is what keeps a `color`-only delta from re-shaping the block: bevy_text's
/// `detect_text_needs_rerender` keys on `Changed<TextFont | LineHeight |
/// LetterSpacing>`, and a re-shape rebuilds the measure func →
/// `ContentSize` → a taffy relayout of the whole tree. The spawn paths insert
/// the whole tuple directly (nothing to compare against).
pub fn apply_resolved_text_style(
    ec: &mut EntityCommands,
    resolved: &crate::bridge::ResolvedTextStyle,
    color_half: bool,
    font_half: bool,
) {
    let (color, font, line, spacing) = resolved;
    if color_half {
        ec.queue(set_if_neq_or_insert(*color));
    }
    if font_half {
        ec.queue(set_if_neq_or_insert(font.clone()));
        ec.queue(set_if_neq_or_insert(*line));
        ec.queue(set_if_neq_or_insert(*spacing));
    }
}

/// The `TextLayout` for a `<text>` root, if `textAlign` or `lineBreak` is set
/// (root only). Either property present builds the layout; the other keeps
/// its bevy default.
pub fn text_layout(style: Option<&Style>) -> Option<TextLayout> {
    let s = style?;
    if s.get(&TEXT_ALIGN).is_none() && s.get(&LINE_BREAK).is_none() {
        return None;
    }
    Some(TextLayout {
        justify: s.get(&TEXT_ALIGN).copied().unwrap_or_default(),
        linebreak: s.get(&LINE_BREAK).copied().unwrap_or_default(),
    })
}
