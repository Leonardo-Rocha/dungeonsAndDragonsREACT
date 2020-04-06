/**
 * This class is a helper class with a bunch of useful methods. 
 * Specially random number generating, including dices.
 *
 * @class Utilities
 */
module.exports = class Utilities {
    /**
     * Rolls a given number of dices of given number of sides.
     *
     * @static
     * @param {number} rollsQuantity
     * @param {number} numberOfSides
     * @returns {total, rolls}
     * @memberof Utilities
     */
    static rollDices(rollsQuantity, numberOfSides) {
        let rolls = []
        while(rollsQuantity-- > 0) {
            rolls.push(Utilities.getRandomInteger(1, numberOfSides));
        }
        const total = rolls.reduce((acc, cur) => acc + cur);

        return {total, rolls};
    }

    /**
     * @param {number} min
     * @param {number} max
     * @returns a random number between min and max (both included):
     */
    static getRandomInteger = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @param {array} list
     * @return random key.
     */
    static getRandomKeyInList = function(list = []) {
        const max = list.length;
        const randomIndex = Utilities.getRandomInteger(0, max - 1);
        const randomKey = list[randomIndex];
        return randomKey;
    }
}
