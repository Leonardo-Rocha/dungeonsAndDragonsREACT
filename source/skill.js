/**
 * This class represents a single character skill with the proper fields and
 * methods to modify them. It's stored in the caracter as an object of skills.
 *
 * @class Skill
 */
module.exports = class Skill {
    total = 0;

    /**
     * Creates an instance of Skill.
     * @param {string} skillName
     * @param {string} keyAbility
     * @param {number} [skillRank=0]
     * @param {boolean} [isClassSkill=false]
     * @param {Object.<value: number>} [skillModifiers={}]
     */
    constructor(skillName, keyAbility, skillRank = 0, isClassSkill = false, skillModifiers = {}) {
        this.skillName = skillName;
        this.keyAbility = keyAbility;
        this.rank = skillRank;
        this.isClassSkill = isClassSkill;
        this.modifiers = skillModifiers;
    }

    /**
     * Increment the skill rank by given quantity and compute the new total. By default increment by one.
     *
     * @param {number} rankIncrementQuantity
     * @memberof Skill
     */
    incrementRank = function (rankIncrementQuantity) {
        this.rank += rankIncrementQuantity;
        this.computeTotal();
    };
    /**
     * Compute the total adding the rank properly.
     * By the 3.5 rules, if it's not a class skill 2 ranks are required to increment the total by one.
     *
     * @memberof Skill
     */
    computeRankTotal = function () {
        if (this.isClassSkill)
            return this.rank;
        else
            return Math.trunc(this.rank / 2);
    };
    /**
     * @returns accumulated modifiers values.
     * @memberof Skill
     */
    computeModifiersTotal = function () {
        let values = Object.values(this.modifiers);
        if (values.length)
            return values.reduce((acc, cur) => acc + cur);
        else
            return 0;
    };
    /**
     * Compute the total by adding the accumulated modifiers values to the rank total.
     *
     * @memberof Skill
     */
    computeTotal = function () {
        this.total = this.computeModifiersTotal() + this.computeRankTotal();
    };
    /**
     * Sets the skills modifiers and compute the new total.
     * Increments the value if the key already exists.
     *
     * @param {Object.<{value: number}>} modifiers
     * @memberof Skill
     */
    setModifiers = function (modifiers) {
        Object.keys(modifiers).forEach(k => {
            if (this.modifiers[k] != undefined)
                this.modifiers[k] += modifiers[k];
            else
                this.modifiers[k] = modifiers[k];
        });
        this.computeTotal();
    };
    /**
     * Sets the skill rank and compute the new total.
     *
     * @param {number} rank
     * @memberof Skill
     */
    setRank = function (rank) {
        this.rank = rank;
        this.computeTotal();
    };
}
