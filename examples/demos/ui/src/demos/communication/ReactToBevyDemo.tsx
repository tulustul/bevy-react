import { useEffect, useState } from "react";
import { bevy } from "@/bevy";
import { Button, Example } from "@/components";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";

const MAX = 8;
const TYPESCRIPT = "bevy.basicDemo.setCount(n);";

const RUST = `#[react_message(name = "basicDemo.setCount")]
struct SetCount(usize);

fn apply_set_count(
    count: On<SetCount>,
    mut desired: ResMut<DesiredCubes>,
) {
    desired.0 = count.event().0;
}

app.add_react_handler(apply_set_count);`;

export function ReactToBevyDemo() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    bevy.basicDemo.setCount(count);
  }, [count]);

  return (
    <Example
      description="React -> Bevy: a typed `emit` notifies the ECS, which spawns that many cubes."
      typescript={TYPESCRIPT}
      rust={RUST}
    >
      <text style={countStyle}>
        Cubes: <text style={{ color: Colors.primary100 }}>{count}</text>
      </text>

      <node style={{ flexDirection: "row", gap: 12 }}>
        <Button
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          style={{ ...buttonStyle, backgroundColor: Colors.primary100 }}
          hoverStyle={{ backgroundColor: Colors.primary200 }}
          pressStyle={{ backgroundColor: Colors.primary300 }}
          labelStyle={{ fontSize: FontSizes.xxxl }}
        >
          +
        </Button>
        <Button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          style={{ ...buttonStyle, backgroundColor: Colors.red100 }}
          hoverStyle={{ backgroundColor: Colors.red200 }}
          pressStyle={{ backgroundColor: Colors.red300 }}
          labelStyle={{ fontSize: FontSizes.xxxl }}
        >
          -
        </Button>
      </node>
    </Example>
  );
}

const countStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xl,
  fontWeight: "bold",
};

const buttonStyle: BevyStyle = {
  width: 60,
  height: 60,
};
