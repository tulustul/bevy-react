import { Colors } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";

type Props = {
  style?: BevyStyle;
};

export function TestBanner({ style }: Props) {
  return (
    <node
      style={{
        width: 180,
        // The caller's style wins over the defaults above it (the size
        // animation overrides `width`/`height`).
        ...style,
        backgroundColor: Colors.surface300,
        border: 2,
        borderColor: "white",
        padding: 15,
        borderRadius: 12,
        flexDirection: "column",
        justifyContent: "spaceAround",
        alignItems: "center",
        gap: 10,
      }}
    >
      <image src="bevy-react-logo.png" style={{ width: 60 }} />
      <text style={{ fontSize: 12 }}>Test Banner</text>
      <node style={{ gap: 10 }}>
        <node style={{ ...dotStyle, backgroundColor: Colors.red100 }} />
        <node style={{ ...dotStyle, backgroundColor: Colors.green100 }} />
        <node style={{ ...dotStyle, backgroundColor: Colors.purple100 }} />
      </node>
    </node>
  );
}

const dotStyle: BevyStyle = {
  width: 20,
  height: 20,
  borderRadius: 15,
};
