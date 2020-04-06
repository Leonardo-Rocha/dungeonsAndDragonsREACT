/**
 * This class represents a single character feat with the proper fields and
 * methods to modify them. It's stored in the caracter as an object of skills.
 *
 * @class Feat
 */
module.exports = class Feat {
    //TODO handle prerequisites
    /**
     * Creates an instance of Feat.
     * @param {string} featName
     * @param {string} description
     */
    constructor(featName, description) {
        this.name = featName;
        this.description = description;
    }
}
