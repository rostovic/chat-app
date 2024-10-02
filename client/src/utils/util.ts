const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRgbColor = (min: number, max: number) => {
  return `rgb(${getRandomInt(min, max)}, ${getRandomInt(
    min,
    max
  )}, ${getRandomInt(min, max)})`;
};
