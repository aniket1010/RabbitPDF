// Available user avatars
const AVAILABLE_AVATARS = [
  "/avatars/Horse.png",
  "/avatars/Meercat.png", 
  "/avatars/Panda.png",
  "/avatars/Penguin.png",
  "/avatars/Rabbit.png",
  "/avatars/Sloth.png"
];

/**
 * Get a random avatar from the available avatars
 * @returns {string} Random avatar path
 */
function getRandomAvatar() {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_AVATARS.length);
  return AVAILABLE_AVATARS[randomIndex];
}

module.exports = {
  AVAILABLE_AVATARS,
  getRandomAvatar
};
