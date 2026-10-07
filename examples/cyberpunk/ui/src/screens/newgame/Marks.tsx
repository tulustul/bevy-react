import { C } from "../../theme";

/** The face's center line in the portrait's 200 × 250 drawing. */
export const CX = 100;
export type Pt = number[];
/** Flat points with x measured from the center line (`s = -1` mirrors). */
export const at = (a: number[], s = 1) =>
  a.map((v, i) => (i % 2 ? v : CX + s * v));

const SCAR = "#f0a39a";
const METAL = "#d8dee4";

/** What a look adds to the portrait's face: makeup, ink, scars, chrome
 *  and metal (each option's variants, in the portrait's 200 × 250 units). */
export function Marks({
  v,
  head,
  ink,
  noseY,
  ear,
  mouth: [mouthW, smile],
}: {
  v: (id: string) => number;
  head: Pt[];
  ink: string;
  noseY: number;
  ear: number;
  mouth: number[];
}) {
  const line = (color: string, w = 1.2) =>
    ({ fill: "none", stroke: color, strokeWidth: w }) as const;
  const makeup = v("makeup");
  const tattoo = v("tattoos");
  const scars = v("scars");
  const cyber = v("cyberware");
  const metal = v("piercings");
  const lips =
    makeup === 1 ? "#3a0d18" : makeup === 2 || makeup === 5 ? "#ff3d8b" : null;
  const chrome = (n: number) => cyber === n || cyber === 7;
  const pierced = (n: number) => metal === n || metal === 5;
  return (
    <>
      {lips && (
        <polygon
          points={at([
            -mouthW,
            134 - smile,
            0,
            131.5,
            mouthW,
            134 - smile,
            mouthW * 0.6,
            138.5,
            -mouthW * 0.6,
            138.5,
          ])}
          fill={lips}
        />
      )}
      {(makeup === 3 || makeup === 5) &&
        [1, -1].map((s) => (
          <polyline
            key={s}
            points={at([26, 96, 32, 92], s)}
            {...line("#120608", 1.4)}
          />
        ))}
      {makeup === 4 &&
        [1, -1].map((s) => (
          <polyline
            key={s}
            points={at([14, 106, 28, 106], s)}
            {...line(C.cyan, 1.6)}
          />
        ))}
      {tattoo === 1 && (
        <polygon
          points={at([-14, 166, -11, 174, -18, 169, -10, 169, -17, 174])}
          fill={ink}
        />
      )}
      {tattoo === 2 && (
        <polyline
          points={at([24, 104, 32, 110, 26, 116, 34, 122, 28, 128])}
          {...line(ink, 1.4)}
        />
      )}
      {tattoo === 3 && (
        <polygon points={at([0, 62, 5, 71, -5, 71])} {...line(ink)} />
      )}
      {tattoo === 4 &&
        [0, 1, 2].map((i) => (
          <circle key={i} cx={CX - 13 - i * 4} cy={104} r={1} fill={ink} />
        ))}
      {tattoo === 5 &&
        [0, 1, 2, 3, 4].map((i) => (
          <polyline
            key={i}
            points={at([6 + i * 2.2, 164, 6 + i * 2.2, 178])}
            {...line(ink, i % 2 ? 0.7 : 1.3)}
          />
        ))}
      {tattoo === 6 &&
        [-3, 3].map((x) => (
          <polyline key={x} points={at([x, 143, x, 153])} {...line(ink)} />
        ))}
      {tattoo === 7 &&
        [1, -1].map((s) => (
          <polyline
            key={s}
            points={at([36, 66, 42, 74, 38, 84], s)}
            {...line(ink, 1.3)}
          />
        ))}
      {(scars === 1 || scars === 5) && (
        <polyline points={at([9, 80, 25, 99])} {...line(SCAR)} />
      )}
      {scars === 2 && (
        <polyline points={at([-36, 106, -28, 114, -22, 124])} {...line(SCAR)} />
      )}
      {scars === 3 && (
        <polyline points={at([4, 127, 8, 141])} {...line(SCAR)} />
      )}
      {scars === 4 && (
        <>
          <polyline points={at([-16, 64, -6, 74])} {...line(SCAR)} />
          <polyline points={at([-6, 64, -16, 74])} {...line(SCAR)} />
        </>
      )}
      {chrome(1) && (
        <>
          <polyline
            points={at([30, 64, 36, 78, 30, 92, 30, 100])}
            {...line(C.cyan)}
          />
          <circle cx={CX + 30} cy={102} r={1.8} fill={C.cyan} />
        </>
      )}
      {chrome(2) && (
        <polyline
          points={head
            .filter(([, y]) => y > 106)
            .flatMap(([x, y]) => [CX - x * 0.86, y - 3])}
          {...line(C.cyan, 1.1)}
        />
      )}
      {chrome(3) && <circle cx={CX + 17.5} cy={96} r={9} {...line(C.cyan)} />}
      {cyber === 4 &&
        [-12, -2, 8].map((x) => (
          <rect key={x} x={CX + x} y={63} width={5} height={3} fill={C.cyan} />
        ))}
      {cyber === 5 &&
        [0, 5, 10].map((d) => (
          <polyline
            key={d}
            points={at([-38 + d, 104, -30 + d, 118])}
            {...line(C.cyan, 1)}
          />
        ))}
      {chrome(6) && (
        <>
          <circle cx={CX - 9} cy={172} r={2.6} {...line(C.cyan, 1)} />
          <circle cx={CX + 9} cy={172} r={2.6} {...line(C.cyan, 1)} />
          <polyline points={at([-6, 172, 6, 172])} {...line(C.cyan, 1)} />
        </>
      )}
      {pierced(1) &&
        [1, -1].map((s) => (
          <circle
            key={s}
            cx={CX + s * (46 + 6 * ear)}
            cy={106}
            r={1.6}
            fill={METAL}
          />
        ))}
      {pierced(2) && (
        <circle cx={CX + 25} cy={86} r={2.4} {...line(METAL, 0.9)} />
      )}
      {pierced(3) && (
        <circle cx={CX + 4} cy={noseY + 3} r={2.4} {...line(METAL, 0.9)} />
      )}
      {pierced(4) && (
        <circle cx={CX + 6} cy={140} r={2.4} {...line(METAL, 0.9)} />
      )}
    </>
  );
}
