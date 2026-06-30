import { BevyStyle } from "bevy-react/jsx";
import { Checkbox } from "@/components";
import { Colors, FontSizes } from "@/theme";

type Props = {
  crt: boolean;
  setCrt: (v: boolean) => void;
};

export function Home({ crt, setCrt }: Props) {
  return (
    <node style={home}>
      <text style={brand}>bevy-react OS</text>
      <text style={brandSub}>
        bevy_ui rendered with React, live on a 3D screen
      </text>

      <node style={controls}>
        <Checkbox label="CRT effect" enabled={crt} onChange={setCrt} />
      </node>
    </node>
  );
}

const home: BevyStyle = {
  flexGrow: 1,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
};

const brand: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xxxl,
  fontWeight: "bold",
};

const brandSub: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.lg,
};

const controls: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
  margin: { top: 10 },
};
