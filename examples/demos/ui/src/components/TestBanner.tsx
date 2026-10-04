import { Colors } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";

type Props = {
  style?: BevyStyle;
};

export function TestBanner({ style }: Props) {
  return (
    <node
      style={{
        ...style,
        width: 180,
        backgroundColor: Colors.raised,
        border: 1,
        borderColor: Colors.lineStrong,
        padding: 15,
        borderRadius: 14,
        flexDirection: "column",
        justifyContent: "spaceAround",
        alignItems: "center",
        gap: 10,
      }}
    >
      <image src="bevy-react-logo.png" style={{ width: 60 }} />
      <text style={{ fontSize: 12, color: Colors.textBody }}>Test Banner</text>
      <node style={{ gap: 10 }}>
        <node style={{ ...dotStyle, backgroundColor: Colors.rose }} />
        <node style={{ ...dotStyle, backgroundColor: Colors.mint }} />
        <node style={{ ...dotStyle, backgroundColor: Colors.violet }} />
      </node>
    </node>
  );
}

const dotStyle: BevyStyle = {
  width: 20,
  height: 20,
  borderRadius: 15,
};
