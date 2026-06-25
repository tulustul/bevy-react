//! CSS color-string parsing, shared by the canvas rasterizer (`parse_rgba8`) and
//! `core`'s `ui_map::parse_color`. It lives in this leaf crate because `core`
//! depends on `bevy-react-canvas` (never the reverse), so this is the lowest
//! point both color paths can share.
//!
//! [`parse_css_color`] returns a straight-alpha [`Srgba`], or `None` when the
//! string matches no known form — each caller applies its own default and
//! (in core's case) a `warn!`, rather than this returning a silent fallback.

use bevy::color::palettes::{basic, css};
use bevy::color::{Color, Srgba};

/// Parse a CSS color string into a straight-alpha [`Srgba`]. Supports:
///
/// - hex: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (the leading `#` is optional);
/// - the CSS named colors (case-insensitive) plus `transparent`;
/// - functional notation `rgb()/rgba()`, `hsl()/hsla()`, `hwb()`, `oklab()`,
///   `oklch()` — accepting both the legacy comma form (`rgb(255, 0, 0)`) and the
///   modern space form with an optional `/ alpha` (`rgb(255 0 0 / 50%)`).
///
/// Returns `None` if the string matches none of these.
pub fn parse_css_color(input: &str) -> Option<Srgba> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    // Functional notation: `name( ... )`.
    if let Some(open) = s.find('(') {
        if let Some(inner) = s.strip_suffix(')') {
            let name = s[..open].trim().to_ascii_lowercase();
            return parse_color_fn(&name, &inner[open + 1..]);
        }
        return None;
    }

    let lower = s.to_ascii_lowercase();
    if lower == "transparent" {
        return Some(Srgba::NONE);
    }
    if let Some(c) = named_color(&lower) {
        return Some(c);
    }

    // Hex last, so bare words like "red" are tried as names first. `Srgba::hex`
    // strips a leading `#` itself and accepts 3/4/6/8 digits.
    Srgba::hex(s).ok()
}

/// Dispatch a parsed function name + the raw argument string (without the
/// surrounding parens) to the matching color-space constructor.
fn parse_color_fn(name: &str, inner: &str) -> Option<Srgba> {
    let (comps, slash_alpha) = split_args(inner);
    // Alpha comes from a `/ alpha` segment (modern) or a trailing 4th component
    // (legacy comma form). Absent → fully opaque.
    let alpha_tok = slash_alpha.or_else(|| comps.get(3).copied());
    let a = match alpha_tok {
        Some(t) => parse_alpha(t)?,
        None => 1.0,
    };
    let c0 = comps.first().copied()?;
    let c1 = comps.get(1).copied()?;
    let c2 = comps.get(2).copied()?;

    let color: Color = match name {
        "rgb" | "rgba" => {
            return Some(Srgba::new(
                parse_rgb_channel(c0)?,
                parse_rgb_channel(c1)?,
                parse_rgb_channel(c2)?,
                a,
            ));
        }
        "hsl" | "hsla" => {
            bevy::color::Hsla::new(parse_hue(c0)?, parse_fraction(c1)?, parse_fraction(c2)?, a)
                .into()
        }
        "hwb" => {
            bevy::color::Hwba::new(parse_hue(c0)?, parse_fraction(c1)?, parse_fraction(c2)?, a)
                .into()
        }
        "oklab" => {
            bevy::color::Oklaba::new(parse_fraction(c0)?, parse_num(c1)?, parse_num(c2)?, a).into()
        }
        "oklch" => {
            bevy::color::Oklcha::new(parse_fraction(c0)?, parse_num(c1)?, parse_hue(c2)?, a).into()
        }
        _ => return None,
    };
    Some(color.to_srgba())
}

/// Split a function's argument list into component tokens and an optional alpha
/// token (the part after a `/`). Components are separated by commas and/or
/// whitespace, so both `255, 0, 0` and `255 0 0` tokenize the same way.
fn split_args(inner: &str) -> (Vec<&str>, Option<&str>) {
    let (comp_part, slash_alpha) = match inner.split_once('/') {
        Some((c, a)) => (c, Some(a.trim())),
        None => (inner, None),
    };
    let comps = comp_part
        .split(|c: char| c == ',' || c.is_whitespace())
        .map(str::trim)
        .filter(|t| !t.is_empty())
        .collect();
    (comps, slash_alpha)
}

/// A bare float token (e.g. an `oklab` a/b axis, or a unitless `oklch` lightness).
fn parse_num(tok: &str) -> Option<f32> {
    tok.parse().ok()
}

/// A 0..=1 fraction: a `%` token divided by 100, else the bare number as-is
/// (so both `50%` and `0.5` work for saturation/lightness/whiteness).
fn parse_fraction(tok: &str) -> Option<f32> {
    match tok.strip_suffix('%') {
        Some(p) => p.trim().parse::<f32>().ok().map(|v| v / 100.0),
        None => tok.parse().ok(),
    }
}

/// An sRGB channel in 0..=1: a `%` token is /100, a bare number is /255.
fn parse_rgb_channel(tok: &str) -> Option<f32> {
    match tok.strip_suffix('%') {
        Some(p) => p.trim().parse::<f32>().ok().map(|v| v / 100.0),
        None => tok.parse::<f32>().ok().map(|v| v / 255.0),
    }
}

/// An alpha in 0..=1: a `%` token is /100, a bare number is already a fraction.
fn parse_alpha(tok: &str) -> Option<f32> {
    match tok.strip_suffix('%') {
        Some(p) => p.trim().parse::<f32>().ok().map(|v| v / 100.0),
        None => tok.parse().ok(),
    }
}

/// A hue in degrees: strips a trailing `deg` if present; bare numbers are degrees.
fn parse_hue(tok: &str) -> Option<f32> {
    tok.strip_suffix("deg").unwrap_or(tok).trim().parse().ok()
}

/// Look up a CSS named color (already lowercased). Covers the 16 basic colors and
/// the extended CSS palette, plus the `gray`/`cyan`/`fuchsia` synonyms Bevy's
/// palette spells differently.
fn named_color(name: &str) -> Option<Srgba> {
    let c = match name {
        // --- basic (16 HTML colors) ---
        "aqua" => basic::AQUA,
        "black" => basic::BLACK,
        "blue" => basic::BLUE,
        "fuchsia" => basic::FUCHSIA,
        "gray" => basic::GRAY,
        "green" => basic::GREEN,
        "lime" => basic::LIME,
        "maroon" => basic::MAROON,
        "navy" => basic::NAVY,
        "olive" => basic::OLIVE,
        "purple" => basic::PURPLE,
        "red" => basic::RED,
        "silver" => basic::SILVER,
        "teal" => basic::TEAL,
        "white" => basic::WHITE,
        "yellow" => basic::YELLOW,
        // --- extended CSS palette ---
        "aliceblue" => css::ALICE_BLUE,
        "antiquewhite" => css::ANTIQUE_WHITE,
        "aquamarine" => css::AQUAMARINE,
        "azure" => css::AZURE,
        "beige" => css::BEIGE,
        "bisque" => css::BISQUE,
        "blanchedalmond" => css::BLANCHED_ALMOND,
        "blueviolet" => css::BLUE_VIOLET,
        "brown" => css::BROWN,
        "burlywood" => css::BURLYWOOD,
        "cadetblue" => css::CADET_BLUE,
        "chartreuse" => css::CHARTREUSE,
        "chocolate" => css::CHOCOLATE,
        "coral" => css::CORAL,
        "cornflowerblue" => css::CORNFLOWER_BLUE,
        "cornsilk" => css::CORNSILK,
        "crimson" => css::CRIMSON,
        "darkblue" => css::DARK_BLUE,
        "darkcyan" => css::DARK_CYAN,
        "darkgoldenrod" => css::DARK_GOLDENROD,
        "darkgray" => css::DARK_GRAY,
        "darkgreen" => css::DARK_GREEN,
        "darkgrey" => css::DARK_GREY,
        "darkkhaki" => css::DARK_KHAKI,
        "darkmagenta" => css::DARK_MAGENTA,
        "darkolivegreen" => css::DARK_OLIVEGREEN,
        "darkorange" => css::DARK_ORANGE,
        "darkorchid" => css::DARK_ORCHID,
        "darkred" => css::DARK_RED,
        "darksalmon" => css::DARK_SALMON,
        "darkseagreen" => css::DARK_SEA_GREEN,
        "darkslateblue" => css::DARK_SLATE_BLUE,
        "darkslategray" => css::DARK_SLATE_GRAY,
        "darkslategrey" => css::DARK_SLATE_GREY,
        "darkturquoise" => css::DARK_TURQUOISE,
        "darkviolet" => css::DARK_VIOLET,
        "deeppink" => css::DEEP_PINK,
        "deepskyblue" => css::DEEP_SKY_BLUE,
        "dimgray" => css::DIM_GRAY,
        "dimgrey" => css::DIM_GREY,
        "dodgerblue" => css::DODGER_BLUE,
        "firebrick" => css::FIRE_BRICK,
        "floralwhite" => css::FLORAL_WHITE,
        "forestgreen" => css::FOREST_GREEN,
        "gainsboro" => css::GAINSBORO,
        "ghostwhite" => css::GHOST_WHITE,
        "gold" => css::GOLD,
        "goldenrod" => css::GOLDENROD,
        "greenyellow" => css::GREEN_YELLOW,
        "grey" => css::GREY,
        "honeydew" => css::HONEYDEW,
        "hotpink" => css::HOT_PINK,
        "indianred" => css::INDIAN_RED,
        "indigo" => css::INDIGO,
        "ivory" => css::IVORY,
        "khaki" => css::KHAKI,
        "lavender" => css::LAVENDER,
        "lavenderblush" => css::LAVENDER_BLUSH,
        "lawngreen" => css::LAWN_GREEN,
        "lemonchiffon" => css::LEMON_CHIFFON,
        "lightblue" => css::LIGHT_BLUE,
        "lightcoral" => css::LIGHT_CORAL,
        "lightcyan" => css::LIGHT_CYAN,
        "lightgoldenrodyellow" => css::LIGHT_GOLDENROD_YELLOW,
        "lightgray" => css::LIGHT_GRAY,
        "lightgreen" => css::LIGHT_GREEN,
        "lightgrey" => css::LIGHT_GREY,
        "lightpink" => css::LIGHT_PINK,
        "lightsalmon" => css::LIGHT_SALMON,
        "lightseagreen" => css::LIGHT_SEA_GREEN,
        "lightskyblue" => css::LIGHT_SKY_BLUE,
        "lightslategray" => css::LIGHT_SLATE_GRAY,
        "lightslategrey" => css::LIGHT_SLATE_GREY,
        "lightsteelblue" => css::LIGHT_STEEL_BLUE,
        "lightyellow" => css::LIGHT_YELLOW,
        "limegreen" => css::LIMEGREEN,
        "linen" => css::LINEN,
        "magenta" => css::MAGENTA,
        "mediumaquamarine" => css::MEDIUM_AQUAMARINE,
        "mediumblue" => css::MEDIUM_BLUE,
        "mediumorchid" => css::MEDIUM_ORCHID,
        "mediumpurple" => css::MEDIUM_PURPLE,
        "mediumseagreen" => css::MEDIUM_SEA_GREEN,
        "mediumslateblue" => css::MEDIUM_SLATE_BLUE,
        "mediumspringgreen" => css::MEDIUM_SPRING_GREEN,
        "mediumturquoise" => css::MEDIUM_TURQUOISE,
        "mediumvioletred" => css::MEDIUM_VIOLET_RED,
        "midnightblue" => css::MIDNIGHT_BLUE,
        "mintcream" => css::MINT_CREAM,
        "mistyrose" => css::MISTY_ROSE,
        "moccasin" => css::MOCCASIN,
        "navajowhite" => css::NAVAJO_WHITE,
        "oldlace" => css::OLD_LACE,
        "olivedrab" => css::OLIVE_DRAB,
        "orange" => css::ORANGE,
        "orangered" => css::ORANGE_RED,
        "orchid" => css::ORCHID,
        "palegoldenrod" => css::PALE_GOLDENROD,
        "palegreen" => css::PALE_GREEN,
        "paleturquoise" => css::PALE_TURQUOISE,
        "palevioletred" => css::PALE_VIOLETRED,
        "papayawhip" => css::PAPAYA_WHIP,
        "peachpuff" => css::PEACHPUFF,
        "peru" => css::PERU,
        "pink" => css::PINK,
        "plum" => css::PLUM,
        "powderblue" => css::POWDER_BLUE,
        "rebeccapurple" => css::REBECCA_PURPLE,
        "rosybrown" => css::ROSY_BROWN,
        "royalblue" => css::ROYAL_BLUE,
        "saddlebrown" => css::SADDLE_BROWN,
        "salmon" => css::SALMON,
        "sandybrown" => css::SANDY_BROWN,
        "seagreen" => css::SEA_GREEN,
        "seashell" => css::SEASHELL,
        "sienna" => css::SIENNA,
        "skyblue" => css::SKY_BLUE,
        "slateblue" => css::SLATE_BLUE,
        "slategray" => css::SLATE_GRAY,
        "slategrey" => css::SLATE_GREY,
        "snow" => css::SNOW,
        "springgreen" => css::SPRING_GREEN,
        "steelblue" => css::STEEL_BLUE,
        "tan" => css::TAN,
        "thistle" => css::THISTLE,
        "tomato" => css::TOMATO,
        "turquoise" => css::TURQUOISE,
        "violet" => css::VIOLET,
        "wheat" => css::WHEAT,
        "whitesmoke" => css::WHITE_SMOKE,
        "yellowgreen" => css::YELLOW_GREEN,
        // synonyms Bevy's palette spells differently
        "cyan" => basic::AQUA,
        _ => return None,
    };
    Some(c)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn rgba8(s: &str) -> [u8; 4] {
        let c = parse_css_color(s).expect("parsed");
        [
            (c.red.clamp(0.0, 1.0) * 255.0).round() as u8,
            (c.green.clamp(0.0, 1.0) * 255.0).round() as u8,
            (c.blue.clamp(0.0, 1.0) * 255.0).round() as u8,
            (c.alpha.clamp(0.0, 1.0) * 255.0).round() as u8,
        ]
    }

    #[test]
    fn hex_forms() {
        assert_eq!(rgba8("#ff0000"), [255, 0, 0, 255]);
        assert_eq!(rgba8("#f00"), [255, 0, 0, 255]);
        assert_eq!(rgba8("#00ff0080"), [0, 255, 0, 128]);
        assert_eq!(rgba8("ff0000"), [255, 0, 0, 255]); // bare hex (no #)
    }

    #[test]
    fn named_and_transparent() {
        assert_eq!(rgba8("red"), [255, 0, 0, 255]);
        assert_eq!(rgba8("RED"), [255, 0, 0, 255]); // case-insensitive
        assert_eq!(rgba8("rebeccapurple"), [102, 51, 153, 255]);
        assert_eq!(rgba8("cyan"), rgba8("aqua"));
        assert_eq!(parse_css_color("transparent"), Some(Srgba::NONE));
    }

    #[test]
    fn rgb_functions() {
        assert_eq!(rgba8("rgb(255, 0, 0)"), [255, 0, 0, 255]);
        assert_eq!(rgba8("rgb(255 0 0)"), [255, 0, 0, 255]);
        assert_eq!(rgba8("rgba(255, 0, 0, 0.5)"), [255, 0, 0, 128]);
        assert_eq!(rgba8("rgb(255 0 0 / 50%)"), [255, 0, 0, 128]);
        assert_eq!(rgba8("rgb(100%, 0%, 0%)"), [255, 0, 0, 255]);
    }

    #[test]
    fn hsl_functions() {
        assert_eq!(rgba8("hsl(0, 100%, 50%)"), [255, 0, 0, 255]);
        assert_eq!(rgba8("hsl(120 100% 50%)"), [0, 255, 0, 255]);
        assert_eq!(rgba8("hsla(0, 100%, 50%, 0.5)"), [255, 0, 0, 128]);
    }

    #[test]
    fn invalid_is_none() {
        assert_eq!(parse_css_color("notacolor"), None);
        assert_eq!(parse_css_color("rgb(1 2)"), None);
        assert_eq!(parse_css_color(""), None);
    }
}
