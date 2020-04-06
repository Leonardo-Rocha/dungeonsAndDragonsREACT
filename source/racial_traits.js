/**
 * This class is used as a container to the specific traits and modifiers of a race.
 *
 * @class RacialTraits
 */
module.exports = class RacialTraits {
    /**
     * Creates an instance of RacialTraits.
     * @param {Object.<value: Ability>} [abilitiesModifiers={}]
     * @param {Object.<value: Skill>} [skillsModifiers={}]
     * @param {Object.<value: Feat>} [featsModifiers={}]
     * @param {Object.<value: string>} [otherModifiers={}]
     */
    constructor(abilitiesModifiers = {}, skillsModifiers = {}, featsModifiers = {}, otherModifiers = {}) {
        this.abilitiesModifiers = abilitiesModifiers;
        this.skillsModifiers = skillsModifiers;
        this.featsModifiers = featsModifiers;
        this.otherModifiers = otherModifiers;
    }
}
