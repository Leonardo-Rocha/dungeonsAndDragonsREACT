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
     * Increments(or decrements) the skill rank if there's available points(or it's possible).
     *
     * @param {number} rankIncrementQuantity
     * @param {number} availableSkillPoints
     * @param {number} characterLevel
     * @return {number} spentPoints
     * @memberof Skill
     */
    incrementRank = function (rankIncrementQuantity, availableSkillPoints, characterLevel) {
        let spentPoints = 0;
        const maxRank = characterLevel + 3;
        let newValue = this.rank + rankIncrementQuantity;

        if(availableSkillPoints >= rankIncrementQuantity && newValue >= 0 && newValue <= maxRank) {
            this.rank += rankIncrementQuantity;
            this.computeTotal();
            spentPoints = rankIncrementQuantity;
        }

        return spentPoints;
    }

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
    }

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
    }

    /**
     * Compute the total by adding the accumulated modifiers values to the rank total.
     *
     * @memberof Skill
     */
    computeTotal = function () {
        this.total = this.computeModifiersTotal() + this.computeRankTotal();
    }

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
    }

    /**
     * Sets the skill rank and compute the new total.
     *
     * @param {number} rank
     * @memberof Skill
     */
    setRank = function (rank) {
        this.rank = rank;
        this.computeTotal();
    }
}
