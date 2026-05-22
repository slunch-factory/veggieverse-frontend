export const CANVAS_SIZE = 4000;
export const VIEWPORT_PADDING = 500;

const _BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const _PRODUCE_ITEMS = [
  { name: "Apple", image: "/vege_flot_img_optimized/apple.png", color: "#C62828" },
  { name: "Asparagus", image: "/vege_flot_img_optimized/asparagus.png", color: "#7CB342" },
  { name: "Avocado", image: "/vege_flot_img_optimized/avocado.png", color: "#558B2F" },
  { name: "Basil", image: "/vege_flot_img_optimized/basil.png", color: "#4CAF50" },
  { name: "Bean Sprouts", image: "/vege_flot_img_optimized/bean-sprouts.png", color: "#DCE775" },
  { name: "Beetroot", image: "/vege_flot_img_optimized/beetroot.png", color: "#AD1457" },
  { name: "Blueberry", image: "/vege_flot_img_optimized/blueberry.png", color: "#5C6BC0" },
  { name: "Broccoli", image: "/vege_flot_img_optimized/broccoli.png", color: "#2E7D32" },
  { name: "Cabbage", image: "/vege_flot_img_optimized/cabbage.png", color: "#AED581" },
  { name: "Carrot", image: "/vege_flot_img_optimized/carrot.png", color: "#EF6C00" },
  { name: "Cauliflower", image: "/vege_flot_img_optimized/cauliflower.png", color: "#F5F5DC" },
  { name: "Celery", image: "/vege_flot_img_optimized/celery.png", color: "#9CCC65" },
  { name: "Cherry Tomato", image: "/vege_flot_img_optimized/cherry-tomato.png", color: "#E53935" },
  { name: "Chili Pepper", image: "/vege_flot_img_optimized/chili-pepper.png", color: "#C62828" },
  { name: "Cilantro", image: "/vege_flot_img_optimized/cilantro.png", color: "#66BB6A" },
  { name: "Coconut", image: "/vege_flot_img_optimized/coconut.png", color: "#8D6E63" },
  { name: "Corn", image: "/vege_flot_img_optimized/corn.png", color: "#FBC02D" },
  { name: "Cucumber", image: "/vege_flot_img_optimized/cucumber.png", color: "#689F38" },
  { name: "Dill", image: "/vege_flot_img_optimized/dill.png", color: "#66BB6A" },
  { name: "Eggplant", image: "/vege_flot_img_optimized/eggplant.png", color: "#4A148C" },
  { name: "Garlic", image: "/vege_flot_img_optimized/garlic.png", color: "#F5F5DC" },
  { name: "Ginger", image: "/vege_flot_img_optimized/ginger.png", color: "#D4A574" },
  { name: "Green Bean", image: "/vege_flot_img_optimized/green-bean.png", color: "#43A047" },
  { name: "Jalapeno", image: "/vege_flot_img_optimized/jalapeno.png", color: "#43A047" },
  { name: "Kale", image: "/vege_flot_img_optimized/kale.png", color: "#2E7D32" },
  { name: "Leek", image: "/vege_flot_img_optimized/leek.png", color: "#9CCC65" },
  { name: "Lemon", image: "/vege_flot_img_optimized/lemon.png", color: "#FFEB3B" },
  { name: "Lettuce", image: "/vege_flot_img_optimized/lettuce.png", color: "#81C784" },
  { name: "Lime", image: "/vege_flot_img_optimized/lime.png", color: "#C0CA33" },
  { name: "Mushroom", image: "/vege_flot_img_optimized/mushroom.png", color: "#A1887F" },
  { name: "Napa Cabbage", image: "/vege_flot_img_optimized/napa-cabbage.png", color: "#C5E1A5" },
  { name: "Olive", image: "/vege_flot_img_optimized/olive.png", color: "#827717" },
  { name: "Onion", image: "/vege_flot_img_optimized/onion.png", color: "#FFCC80" },
  { name: "Peach", image: "/vege_flot_img_optimized/peach.png", color: "#FFAB91" },
  { name: "Peanut", image: "/vege_flot_img_optimized/peanut.png", color: "#D7CCC8" },
  { name: "Pepper", image: "/vege_flot_img_optimized/pepper.png", color: "#FF5722" },
  { name: "Pistachio", image: "/vege_flot_img_optimized/pistachio.png", color: "#AED581" },
  { name: "Potato", image: "/vege_flot_img_optimized/potato.png", color: "#BCAAA4" },
  { name: "Pumpkin", image: "/vege_flot_img_optimized/pumpkin.png", color: "#EF6C00" },
  { name: "Spinach", image: "/vege_flot_img_optimized/spinach.png", color: "#388E3C" },
  { name: "Sweet Potato", image: "/vege_flot_img_optimized/sweet-potato.png", color: "#E65100" },
  { name: "Walnut", image: "/vege_flot_img_optimized/walnut.png", color: "#8D6E63" },
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
