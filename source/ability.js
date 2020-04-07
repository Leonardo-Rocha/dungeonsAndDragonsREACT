/**
 * This class represents a single character ability with the proper fields and methods to modify them.
 * It's stored in the caracter as an object of abilities.
 *
 * @class Ability
 */
module.exports = class Ability {
    total = 8;
    baseValue = 8;
    modifier = 0;
    racialModifier = 0;
    temporaryModifiers = {};

    /**
     * Creates an instance of Ability.
     * @param {string} abilityName
     */
    constructor(abilityName) {
        this.name = abilityName;
    }
    
    /**
     * @returns accumulated temporary modifiers values.
     * @memberof Ability
     */
    computeTemporaryModifiers = function () {
        let values = Object.values(this.temporaryModifiers);
        if (values.length)
            return values.reduce((acc, cur) => acc + cur);
        else
            return 0;
    }

    /**
     * Computes the ability modifier using the formula:
     * modifier = trunc((total - 10) / 2)
     * Where total = base + racial + temporary
     *
     * @memberof Ability
     */
    computeModifier = function () {
        this.computeTotal();
        this.modifier = Math.floor((this.total - 10) / 2);
    }

    /**
     * Computes the ability total using the formula: total = racial + temporary + base
     *
     * @memberof Ability
     */
    computeTotal = function () {
        this.total = this.baseValue + this.racialModifier +
            this.computeTemporaryModifiers();
    }

    /**
     * Increments (or decrements) the base value of a skill if there's available
     * ability points (or if it's possible).
     *
     * @param {number} incrementValue
     * @param {boolean} hasCost
     * @param {number} availableAbilityPoints
     * @return {number} spentPoints
     * @memberof Ability
     */
    incrementBaseValue = function (incrementValue, hasCost, availableAbilityPoints) {
        let spentPoints = 0;
        let newValue = this.baseValue + incrementValue;

        if (hasCost)
            spentPoints = this._checkPointsBuyCost(newValue) - this._checkPointsBuyCost(this.baseValue);
        else
            spentPoints = incrementValue;

        if (newValue >= 8 && availableAbilityPoints >= spentPoints) {
            this.baseValue += incrementValue;
            this.computeModifier();
        }
        else
            spentPoints = 0;

        return spentPoints;
    }

    /**
     * Sets a new base value and updates the modifier and the total.
     *
     * @param {number} newBaseValue
     * @returns possible spent points.
     */
    setBaseValue = function (newBaseValue) {
        this.baseValue = newBaseValue;
        this.computeModifier();
        return this._checkPointsBuyCost(newBaseValue);
    }

    /**
     * Sets a new racial modifier and updates the modifier and the total.
     *
     * @param {number} newRacialModifier
     * @memberof Ability
     */
    setRacialModifier = function (newRacialModifier) {
        this.racialModifier = newRacialModifier;
        this.computeModifier();
    }

    /**
     * Sets new temporary modifiers and updates the modifier and the total.
     *
     * @param newTemporaryModifiers
     * @memberof Ability
     */
    setTemporaryModifiers = function (newTemporaryModifiers) {
        this.temporaryModifiers = newTemporaryModifiers;
        this.computeModifier();
    }
    
    /**
     * Check the points buy cost to get a ability base value.
     *
     * @param {number} newValue
     * @returns pointsBuyCost
     * @memberof Ability
     */
    _checkPointsBuyCost(newValue) {
        let pointsBuyCost = 0;
        let pointsTable = { 15: 8, 16: 10, 17: 13, 18: 16 };
        if (newValue <= 14)
            pointsBuyCost = newValue - 8;
        else if (newValue > 14 && newValue <= 18)
            pointsBuyCost = pointsTable[newValue];
        return pointsBuyCost;
    }
}
