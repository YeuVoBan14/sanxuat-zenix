const colorBgAvatar = {
  "rgb(153 27 27)": ["A", "B", "C", "D"],
  "rgb(120 53 15)": ["E", "F", "G", "H"],
  "rgb(54 83 20)": ["I", "J", "K", "L"],
  "rgb(7 89 133)": ["M", "N", "O", "P"],
  "rgb(55 48 163)": ["Q", "R", "S", "T"],
  "rgb(157 23 77)": ["U", "V", "X", "Y"],
};

export function bgAvatar(text: string | undefined) {
  for (const [color, textGroup] of Object.entries(colorBgAvatar)) {
    if (text && textGroup.includes(text.toUpperCase())) {
      return color;
    }
  }
  return "rgb(64 64 64)";
}
