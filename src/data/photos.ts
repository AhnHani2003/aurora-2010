export const photos = [
  ["01-my-favorite-smile.jpg", "My Favorite Smile"],
  ["02-prettiest-girl.jpg", "The Prettiest Girl"],
  ["03-little-sunshine.jpg", "My Little Sunshine"],
  ["04-cute-and-chaotic.jpg", "Cute but Chaotic"],
  ["05-my-princess.jpg", "My Princess"],
  ["06-heart-stealer.jpg", "The Heart Stealer"],
  ["07-our-little-moments.jpg", "Our Little Moments"],
  ["08-forever-my-favorite.jpg", "Forever My Favorite"],
].map(([file, caption], index) => ({
  src: `/assets/aurora/${file}`,
  caption,
  index,
}));
