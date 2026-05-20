export const CANVAS_SIZE = 4000;
export const VIEWPORT_PADDING = 500;

const _BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const _PRODUCE_ITEMS = [
  { name: "Asparagus", image: "/vege_flot_img_optimized/asparagus.png", color: "#7CB342" },
  { name: "Avocado", image: "/vege_flot_img_optimized/avocado.png", color: "#558B2F" },
  { name: "Blueberry", image: "/vege_flot_img_optimized/blueberry.png", color: "#5C6BC0" },
  { name: "Broccoli", image: "/vege_flot_img_optimized/broccoli.png", color: "#2E7D32" },
  { name: "Carrot", image: "/vege_flot_img_optimized/carrot.png", color: "#EF6C00" },
  { name: "Chili Pepper", image: "/vege_flot_img_optimized/chili-pepper.png", color: "#C62828" },
  { name: "Coconut", image: "/vege_flot_img_optimized/coconut.png", color: "#8D6E63" },
  { name: "Corn", image: "/vege_flot_img_optimized/corn.png", color: "#FBC02D" },
  { name: "Dill", image: "/vege_flot_img_optimized/dill.png", color: "#66BB6A" },
  { name: "Edamame", image: "/vege_flot_img_optimized/edamame.png", color: "#7CB342" },
  { name: "Fig", image: "/vege_flot_img_optimized/fig.png", color: "#6A1B9A" },
  { name: "Garlic", image: "/vege_flot_img_optimized/garlic.png", color: "#F5F5DC" },
  { name: "Ginger", image: "/vege_flot_img_optimized/ginger.png", color: "#D4A574" },
  { name: "Grape", image: "/vege_flot_img_optimized/grape.png", color: "#7B1FA2" },
  { name: "Green Bean", image: "/vege_flot_img_optimized/green-bean.png", color: "#43A047" },
  { name: "Kiwi", image: "/vege_flot_img_optimized/kiwi.png", color: "#8BC34A" },
  { name: "Leek", image: "/vege_flot_img_optimized/leek.png", color: "#9CCC65" },
  { name: "Lemon", image: "/vege_flot_img_optimized/lemon.png", color: "#FFEB3B" },
  { name: "Lettuce", image: "/vege_flot_img_optimized/lettuce.png", color: "#81C784" },
  { name: "Lychee", image: "/vege_flot_img_optimized/lychee.png", color: "#F48FB1" },
  { name: "Mango", image: "/vege_flot_img_optimized/mango.png", color: "#FFB300" },
  { name: "Mangosteen", image: "/vege_flot_img_optimized/mangosteen.png", color: "#6A1B9A" },
  { name: "Mushroom", image: "/vege_flot_img_optimized/mushroom.png", color: "#A1887F" },
  { name: "Napa Cabbage", image: "/vege_flot_img_optimized/napa-cabbage.png", color: "#C5E1A5" },
  { name: "Olive", image: "/vege_flot_img_optimized/olive.png", color: "#827717" },
  { name: "Orange", image: "/vege_flot_img_optimized/orange.png", color: "#FF9800" },
  { name: "Peach", image: "/vege_flot_img_optimized/peach.png", color: "#FFAB91" },
  { name: "Peanut", image: "/vege_flot_img_optimized/peanut.png", color: "#D7CCC8" },
  { name: "Pear", image: "/vege_flot_img_optimized/pear.png", color: "#C0CA33" },
  { name: "Pepper", image: "/vege_flot_img_optimized/pepper.png", color: "#FF5722" },
  { name: "Pineapple", image: "/vege_flot_img_optimized/pineapple.png", color: "#FDD835" },
  { name: "Pistachio", image: "/vege_flot_img_optimized/pistachio.png", color: "#AED581" },
  { name: "Potato", image: "/vege_flot_img_optimized/potato.png", color: "#BCAAA4" },
  { name: "Raspberry", image: "/vege_flot_img_optimized/raspberry.png", color: "#E91E63" },
  { name: "Sweet Potato", image: "/vege_flot_img_optimized/sweet-potato.png", color: "#E65100" },
  { name: "Tomato", image: "/vege_flot_img_optimized/tomato.png", color: "#E53935" },
  { name: "Watermelon", image: "/vege_flot_img_optimized/watermelon.png", color: "#EF5350" },
];

export const PRODUCE_ITEMS = _PRODUCE_ITEMS.map((item) => ({
  ...item,
  image: `${_BASE}${item.image}`,
}));

export const VEGETABLE_NAMES = PRODUCE_ITEMS.map((item) => item.name);

export const COLOR_OVERLAYS = [
  "bg-black",
  "bg-[#333333]",
  "bg-[#666666]",
  "bg-[#999999]",
  "bg-[#CCCCCC]",
  "bg-[#E0E0E0]",
];

export const ORGANIC_SHAPES = [
  "rounded-full",
  "rounded-[60%_40%_30%_70%/60%_30%_70%_40%]",
  "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]",
  "rounded-[50%_50%_20%_80%/25%_80%_20%_75%]",
  "rounded-[74%_26%_39%_61%/53%_74%_26%_47%]",
];
