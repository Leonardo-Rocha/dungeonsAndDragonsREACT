// Import other used classes
const Utilities = require("./utilities");
const CharacterDetails = require("./character_details");
const Feat = require("./feat");
const RacialTraits = require("./racial_traits");
const Ability = require("./ability");
const Skill = require('./skill');

/*
* This class contains all character-related fields and methods. The necessary
* stuff to create a character sheet.
*/
class Character {
    skills = {};
    availableSkillPoints = 0;
    feats = {};
    characterDetails = {};
    abilities = {};
    availableAbilityPoints = 32;

    /**
     * We append items in this list when the player increments a skill with the
     * points given on and after lvl 4. This list is used to roll back if the 
     * player loses level after death and rebirth.
     *
     * @memberof Character
     */
    levelUpRollBackList = {};
    totalLevel = 1;

    constructor(name, className, race, skillsTable, classSkillsTable, racialTraitsTable) {
        this.name              = name;
        this.className         = className;
        this.race              = race;
        this.skillsTable       = skillsTable;
        this.classSkillsTable  = classSkillsTable;
        this.racialTraitsTable = racialTraitsTable;
        this.characterDetails  = new CharacterDetails();
        this._setClassSkills();
        this._setDefaultAbilites();
        this._setRacialTraits();
    }
    
    /**
     * Set the character skills consulting the table and including only the elements of the given list.
     *
     * @param {Array.<string>} skillsList
     * @memberof Character
     */
    setCharacterSkillsByList(skillsList) {
        Object.keys(this.skillsTable).forEach(k => {
            if(skillsList.includes(k)) {
                this.skills[k] = {...this.skillsTable[k]};
                this.skills[k].isClassSkill = true;
            }  
        });
    }

    /**
     * Sets a character default class skills and skill points per level.
     * This is called on the constructor.
     * @memberof Character
     */
    _setClassSkills() {
        const classSkills = this.classSkillsTable[this.className];
        const defaultSkills = classSkills.defaultSkills;
        const skillPointsPerLevel = classSkills.skillPointsPerLevel;
        this.setCharacterSkillsByList(defaultSkills);
        // this must be in character details because there's a race(Human) special case
        this.characterDetails['skillPointsPerLevel'] = skillPointsPerLevel;
    }

    /**
     * Updates the avaiable skill points according to the skill points per level
     * and the current level. This must be called after the ability points distribution,
     * because depends on the int modifier, and at each levelUp for the same reason.
     *  
     * For the first level the formula is levelSkillPoints * 4 and levelSkillPoints 
     * for the higher levels. Where levelSkillPoints = skillPointsPerLevel + intModifier
     * 
     * @memberof Character
     */
    updateAvailableSkillPoints() {
        const intModifier = this.abilities['int'].modifier;
        const skillPointsPerLevel = this.characterDetails['skillPointsPerLevel'];
        const levelSkillPoints = skillPointsPerLevel + intModifier;

        if(this.totalLevel == 1)
            this.availableSkillPoints = (levelSkillPoints) * 4; 
        else 
            this.availableSkillPoints += levelSkillPoints;
    }
    
    /**
     * Adds a new skill consulting the skills table.
     * 
     * @param {string} skillId
     * @returns true if the skill was sucessfully added, otherwise false.
     * @memberof Character
     */
    addSkill(skillId) {
        if(skillId in skillsTable) {
            this.skills[skillId] = {...this.skillsTable[skillId]};
            return true;
        }
        else {
            console.warn(`WARNING: In character '${this.name}' not able to ` +
            `addSkill '${skillId}' => invalid skillId`); 
            return false;
        } 
    }

    /**
     * Increments or decrements a skill rank by the given quantity, by default is one.
     *
     * @param {string} skillId
     * @param {number} [rankIncrementQuantity=1]
     * @memberof Character
     */
    incrementSkillRank(skillId, rankIncrementQuantity = 1) {
        let skill = this.skills[skillId];
        if(skill == undefined) {
            const hasAdded = this.addSkill(skillId);
            if(!hasAdded) {
                console.warn(`WARNING: In character '${this.name}' not able to ` +
                `incrementSkillRank' ${skillId}' => invalid skillId`);
                return;
            }
        }
        skill = this.skills[skillId];
        const spentPoints = skill.incrementRank(rankIncrementQuantity, this.availableSkillPoints,
            this.totalLevel);
        this.availableSkillPoints -= spentPoints;
        if(spentPoints != 0)
            this.updateRollBackList('skills', skillId, rankIncrementQuantity);
    }

    /**
     * Sets the rank of a given skill
     *
     * @param {string} skillId
     * @param {number} newRank
     * @memberof Character
     */
    setSkillRank(skillId, newRank) {
        if(skillId in this.skills)
            this.skills[skillId].setRank(Math.abs(newRank));
        else 
            console.warn(`WARNING: In character '${this.name}' not able to ` +
            `setSkillRank '${skillId}' => ` +
            `invalid skillId or not included in character skills`); 
    }

    /**
     * Sets the modifiers of a given skill
     *
     * @param {string} skillId
     * @param {Object.<{value: number}>}
     * @memberof Character
     */
    setSkillModifiers(skillId, skillModifiers) {
        if(skillId in this.skills)
            this.skills[skillId].setModifiers(skillModifiers);
        else
            console.warn(`WARNING: In character '${this.name}' not able to ` +
            `setSkillModifiers '${skillId}' => ` +
            `invalid skillId or not included in character skills`);  
    }

    //TODO: change this to async function
    /**
     * @returns a list of the character skills.
     * @memberof Character
     */
    getCharacterSkillsFromDB() {
        let characterSkills = {};

        let skillsRef = db.collection('characters').doc(name).collection('skills');

        let allSkills = skillsRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            characterSkills[doc.id] = doc.data();
            return characterSkills;
            });
        })
        .catch(err => {
            console.log('Error getting skills', err);
        });
    }

    /**
     * Sets every character default abilities according to D&D 3.5
     * STRENGTH (STR), DEXTERITY (DEX), CONSTITUTION (CON), INTELLIGENCE (INT) 
     * WISDOM (WIS) and CHARISMA (CHA) 
     *
     * @memberof Character
     */
    _setDefaultAbilites() {
        this.abilities['str'] = new Ability('Str', this.race);
        this.abilities['dex'] = new Ability('Dex', this.race);
        this.abilities['con'] = new Ability('Con', this.race);
        this.abilities['int'] = new Ability('Int', this.race);
        this.abilities['wis'] = new Ability('Wis', this.race);
        this.abilities['cha'] = new Ability('Cha', this.race);
    }

    /**
     * Increments or decrements the baseValue of a given ability, by default is 1.
     *
     * @param {string} abilityId
     * @param {boolean} [hasCost=1] if true point cost has a weight.
     * @param {number} [incrementValue=1]
     * @memberof Character
     */
    incrementAbilityBaseValue(abilityId, hasCost = true, incrementValue = 1) {
        if(abilityId in this.abilities) {
            const ability = this.abilities[abilityId]; 
            const spentPoints = ability.incrementBaseValue(incrementValue, hasCost, 
                this.availableAbilityPoints);
            this.availableAbilityPoints -= spentPoints;
            if(!hasCost && spentPoints != 0) {
                // updates the list used on the rollback if a player dies
                this.updateRollBackList('abilities', abilityId, incrementValue);
            }   
        }
        else 
            console.warn(`WARNING: In character '${this.name}' not able to ` +
            `incrementAbilityBaseValue '${skillId}' => invalid skillId`); 
    }

    /**
     * Updates the roll back list for the given field with a new object {id: value}.
     *
     * @param {string} listName this must be 'abilities'/'feats'/'skills'
     * @param {string} id
     * @param {any} value
     * @memberof Character
     */
    updateRollBackList(listName, id, value) {
        let list = this.levelUpRollBackList[listName];
        if (list == undefined) {
            this.levelUpRollBackList[listName] = {};
            list = this.levelUpRollBackList[listName];
        }
        if (list[id] == undefined)
            list[id] = value;
        else
            list[id] += value;
    }

    /**
     * Distribute the available ability points randomly using the available skill points.
     * 
     * @memberof Character
     */
    buyRandomAbilityPointsUsingAvailable() {
        let i = 6;
        let abilitiesArray = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        let incrementValue = 0;
        let max = 10;
        let key = '';

        // loop through abilities array
        while(i-- > 0) {
            key = Utilities.getRandomKeyInList(abilitiesArray);
            incrementValue = Utilities.getRandomInteger(1, max);

            const abilityBaseValue = this.abilities[key].baseValue;
            incrementValue = ((abilityBaseValue + incrementValue) > 18 ? (18 - abilityBaseValue) : incrementValue);
            
            this.incrementAbilityBaseValue(key, true, incrementValue);
            
            // remove the element
            const index = abilitiesArray.indexOf(key);
            abilitiesArray.splice(index, 1);
        }
        
        // distribute what's missing
        while(this.availableAbilityPoints > 0)
            this.buyRandomAbilityPointsUsingAvailable();
    }

    /**
     * Distributes random ability points using the 4d6 rule.
     * For every ability rolls 4d6, discard the smallest.
     * The new base value is the sum of the remaining rolls.
     * 
     * @returns the spent points.
     * @memberof Character
     */
    buyRandomAbilityPoints4d6() {
        let newBaseValue = 0;
        let rolls4d6 = [];
        let ability;
        let spentPoints = 0;
        const numberOfSides = 6;
        const rollsQuantity = 4;
        
        Object.keys(this.abilities).forEach(k => {
            ability = this.abilities[k];
            
            const output = Utilities.rollDices(rollsQuantity, numberOfSides);
            newBaseValue = output.total;
            rolls4d6 = output.rolls;
            rolls4d6.sort();

            // remove the lowest dice
            newBaseValue -= rolls4d6[0];
            spentPoints += ability.setBaseValue(newBaseValue);
        });

        return spentPoints;
    }
    
    /**
     * Increments the level of the given class.
     * 
     * @param {string} className
     * @memberof Character
     */
    levelUp(className, levelIncrement = 1) {
        this.totalLevel += levelIncrement;
        this.updateAvailableSkillPoints();
        if(totalLevel % 4 == 0) // if it's a multiple of 4 
            this.availableAbilityPoints += Math.ceiling(levelIncrement / 4);

        // clears the rollBackList
        this.levelUpRollBackList = {};
    }

    /**
     * Sets the racial traits of the character.
     * It modifies the abilities, skills, feats and other.
     * 
     * @memberof Character
     */
    _setRacialTraits() {
        const racialTraits = this.racialTraitsTable[this.race];
        const racialAbilities = racialTraits['abilitiesModifiers'];
        const racialSkills = racialTraits['skillsModifiers'];
        const racialFeats = racialTraits['featsModifiers'];
        const racialDetails = racialTraits['otherModifiers'];

        this._setRacialAbilities(racialAbilities);
        this._setRacialSkills(racialSkills);
        this._setRacialFeats(racialFeats);
        this._setRacialDetails(racialDetails);
    }

    /**
     * Sets the racial modifier of the given abilities.
     *
     * @param {Object.<{value: Object}>} racialAbilities
     * @memberof Character
     */
    _setRacialAbilities(racialAbilities) {
        Object.keys(racialAbilities).forEach(k => {
            const ability = this.abilities[k];
            if(ability) {
                const newValue = racialAbilities[k];
                ability.setRacialModifier(newValue);
            }
            else 
                console.warn(`WARNING: In character '${this.name}' not able to ` +
                `setRacialModifier'${k}' => invalid abilityId`);
        });
    }

    /**
     * Sets the racial modifier of the given skills.
     *
     * @param {Object.<{value: Object}>} racialSkills
     * @memberof Character
     */
    _setRacialSkills(racialSkills) {
        Object.keys(racialSkills).forEach(k => {
            let skill = this.skills[k];
            if(skill == undefined) {
                const hasAdded = this.addSkill(k);
                if(!hasAdded) {
                    console.warn(`WARNING: In character '${this.name}' not able to ` +
                    `setRacialSkills' ${k}' => invalid skillId`);
                    return;
                }
            }
            skill = this.skills[k];
            const newValue = racialSkills[k];
            skill.setModifiers({racial: newValue});
        });
    }

     /**
     * Populates the feats instancing a new for every entry in the
     * given list.
     *
     * @param {Object.<{value: string}>} racialFeats 
     * @memberof Character
     */
    _setRacialFeats(racialFeats) {
        Object.keys(racialFeats).forEach(k => {
            this.feats[k] = new Feat(k, racialFeats[k]);
        });
    }

    /**
     * Sets the racial details in characterDetails.
     *
     * @param {Object.<{value: any}>} racialDetails
     * @memberof Character
     */
    _setRacialDetails(racialDetails) {
        Object.keys(racialDetails).forEach(k => {
            const detail = this.characterDetails[k];
            if(detail == undefined)
                this.characterDetails[k] = racialDetails[k];
            else
                this.characterDetails[k] += racialDetails[k];
        });
    }
}

classSkillsTable = {};
skillsTable = {};
racialTraitsTable = {};

//TODO: send this to database?
createSkillsTable();
createRacialTraitsTable();
createClassSkillsTable();

let alegod = new Character('Alegod', 'sorcerer', 'elf', skillsTable, classSkillsTable, racialTraitsTable);

const spentPoints = alegod.buyRandomAbilityPoints4d6();
alegod.updateAvailableSkillPoints();
console.log(`Name: ${alegod.name}, Class: ${alegod.className}, Race: ${alegod.race}`);

// printAbilitiesPretty(alegod);
// console.log(`Spent Points: ${spentPoints}`);
printSkillsPretty(alegod);
console.log(alegod.availableSkillPoints);
// printFeatsPretty(alegod);


// testes unitários para funções de abilities
function printAbilitiesTest(character) {
    console.log("Abilities: ");
    console.table([character.abilities]);
    console.log(`AvailableAbilityPoints before increment: ${character.availableAbilityPoints}`);
    character.incrementAbilityBaseValue('str', true, 10); // 8 + 10 = 18; modifier = 4; points = 16
    character.incrementAbilityBaseValue('dex', true, 10); // 8 + 10 = 18; modifier = 4; points = 0
    character.availableAbilityPoints = 2; // supposing char lvl 8
    character.incrementAbilityBaseValue('str', false, 1); // 18 + 1 = 19; modifier = 4; points = 1
    console.table(character.abilities['str']);
    console.log(`AvailableAbilityPoints after increment: ${character.availableAbilityPoints}`);
}

function printFeatsPretty(character) {
    let printTable = [];
    console.log('Feats: ');
    Object.keys(character.feats).forEach(k => {
        const feat = character.feats[k];
        printTable = [...printTable, {name: feat.name, description: feat.description}];
    });

    console.table(printTable);
}

function printAbilitiesPretty(character) {
    let printTable = [];
    console.log('Abilities: ');
    Object.keys(character.abilities).forEach(k => {
        const ability = character.abilities[k];
        printTable = [...printTable, {name: ability.name, mod: ability.modifier, 
            value: ability.baseValue, racial: ability.racialModifier, total: ability.total}];
    });

    console.table(printTable);
}

function printSkillsPretty(character) {
    let printTable = [];
    console.log('Skills: ');
    Object.keys(character.skills).forEach(k => {
        const skill = character.skills[k];
        printTable = [...printTable, {isClass: skill.isClassSkill, name: skill.skillName,
            key: skill.keyAbility, rank: skill.rank, modifiers: skill.modifiers, total: skill.total}];
    });

    console.table(printTable);
}

//testes unitários das funções de skills.
function printSkillsTest(character) {
    console.log("Skills: ");
    console.table([character.skills]);

    character.addSkill('appraise');

    character.setSkillModifiers('appraise', {Int: 2});
    character.setSkillModifiers('appraise', {Int: 4});
    character.setSkillModifiers('appraise', {appraiseRing: 2});

    character.setSkillRank('appraise', 4);

    character.incrementSkillRank('appraise', -2);

    const characterAppraise = character.skills['appraise'];
    console.log(`${characterAppraise.skillName} => total = ${characterAppraise.total}, rank = ${characterAppraise.rank}, 
    isClassSkill = ${characterAppraise.isClassSkill}, modifiers:`);
    console.table([characterAppraise.modifiers]);
}

/**
 * Creates a table with all available skills in the game.
 */
function createSkillsTable() {
    skillsTable['appraise']                         = new Skill("Appraise", "Int");
    skillsTable['balance']                          = new Skill("Balance", "Dex");
    skillsTable['bluff']                            = new Skill("Bluff", "Cha");
    skillsTable['climb']                            = new Skill("Climb", "Str");
    skillsTable['concentration']                    = new Skill("Concentration", "Con");
    skillsTable['craft']                            = new Skill("Craft", "Int");
    skillsTable['decipherScript']                   = new Skill("Decipher Script", "Int");
    skillsTable['diplomacy']                        = new Skill("Diplomacy", "Cha");
    skillsTable['disableDevice']                    = new Skill("Disable Device", "Dex");
    skillsTable['disguise']                         = new Skill("Disguise", "Cha");
    skillsTable['escapeArtist']                     = new Skill("Escape Artist", "Dex");
    skillsTable['forgery']                          = new Skill("Forgery", "Int");
    skillsTable['gatherInformation']                = new Skill("Gather Information", "Cha");
    skillsTable['handleAnimal']                     = new Skill("Handle Animal", "Cha");
    skillsTable['heal']                             = new Skill("Heal", "Wis");
    skillsTable['hide']                             = new Skill("Hide", "Dex");
    skillsTable['intimidate']                       = new Skill("Intimidate", "Cha");
    skillsTable['jump']                             = new Skill("Jump", "Str");
    skillsTable['knowledgeArcana']                  = new Skill("Knowledge (Arcana)", "Int");
    skillsTable['knowledgeArchitectureEngineering'] = new Skill("Knowledge (Architecture and Engineering)", "Int");
    skillsTable['knowledgeDungeoneering']           = new Skill("Knowledge (Dungeoneering)", "Int");
    skillsTable['knowledgeGeography']               = new Skill("Knowledge (Geography)", "Int");
    skillsTable['knowledgeHistory']                 = new Skill("Knowledge (History)", "Int");
    skillsTable['knowledgeLocal']                   = new Skill("Knowledge (Local)", "Int");
    skillsTable['knowledgeNature']                  = new Skill("Knowledge (Nature)", "Int");
    skillsTable['knowledgeNobilityRoyalty']         = new Skill("Knowledge (Nobility and Royalty)", "Int");
    skillsTable['knowledgeReligion']                = new Skill("Knowledge (Religion)", "Dex");
    skillsTable['knowledgeThePlanes']               = new Skill("Knowledge (The planes)", "Dex");
    skillsTable['listen']                           = new Skill("Listen", "Wis");
    skillsTable['moveSilently']                     = new Skill("Move Silently", "Dex");
    skillsTable['openLock']                         = new Skill("Open Lock", "Dex");
    skillsTable['perform']                          = new Skill("Perform", "Cha");
    skillsTable['profession']                       = new Skill("Profession", "Wis");
    skillsTable['ride']                             = new Skill("Ride", "Dex");
    skillsTable['search']                           = new Skill("Search", "Int");
    skillsTable['senseMotive']                      = new Skill("Sense Motive", "Wis");
    skillsTable['sleightOfHand']                    = new Skill("Sleight of Hand", "Dex");
    skillsTable['speakLanguage']                    = new Skill("Speak Language", "None");
    skillsTable['spellcraft']                       = new Skill("Spellcraft", "Int");
    skillsTable['spot']                             = new Skill("Spot", "Wis");
    skillsTable['survival']                         = new Skill("Survival", "Wis");
    skillsTable['swim']                             = new Skill("Swim", "Str");
    skillsTable['tumble']                           = new Skill("Tumble", "Dex");
    skillsTable['useMagicDevice']                   = new Skill("Use Magic Device", "Cha");
    skillsTable['useRope']                          = new Skill("Use Rope", "Dex");
}

/**
 * Creates a table with all available racial traits.
 */
function createRacialTraitsTable() {
    racialTraitsTable['dwarf'] = new RacialTraits({con:2, cha:-2}, {},
        {dwarfWarAxe: "Use dwarf war axe"}, {size: "medium", language: 'dwarf', baseLandSpeed:6, 
        racial: ["Darkvision 18 meters","+2 search check on stone constructions" ,"+4 against " + 
        "bull rush and trip while staying on the ground","+2 saving throws against all poisons",
        "+2 saving throws against all spells and spell-like effects","+1 atack bonus agains orcs and goblins",
        "+4 dodge AC against giant type monsters", "+2 appraise related to stones","+2 craft related to stone or metal"] });
    racialTraitsTable['elf'] = new RacialTraits({dex:2, con:-2}, {listen:2, search:2, spot:2}, {longSword:"Use long sword",
        rapier: "Use Rapier",  longBow:"Use Long Bow", shortBow: "Use Short Bow"}, {size: "medium", language: "elf",
        baseLandSpeed: 9, racial: ["Low-light Vision", "Imune to magic sleep", "Instead of sleep for 8 hours, meditate for 4 hours"]} );
    racialTraitsTable['gnome'] = new RacialTraits({con:2, str: -2}, {listen: 2}, {gnomeHookedHammer: "Use Gnome Hooked Hammer",},
        {size: "small", language: "gnome", baseLandSpeed: 6, racial: ["Low-light vision", "+2 saving throws against illusions",
        "+1 DC on illusions casted by gnome", "+1 atack bonus against goblins and kobolds", "+4 dodge AC against giant type monsters",
        "+2 craft (Alchemy)", "spell like ability: 1/day speak with animals (duration 1 min)",
        "if charisma is at least 10; 1/day - dancing lights, ghost sound, prestidigitation (caster 1, DC (10 + ChaMod + spell level))"]})
    racialTraitsTable['halfling'] = {

        };
    racialTraitsTable['human'] = new RacialTraits({}, {}, {}, {skillPointsPerLevel: 1});

}

/**
 * Creates a table with with the default skills of every class.
 */
function createClassSkillsTable() {
    const allKnowledges = ['knowledgeArcana', 'knowledgeArchitectureEngineering', 
        'knowledgeDungeoneering', 'knowledgeGeography', 'knowledgeHistory', 'knowledgeLocal', 
        'knowledgeNature', 'knowledgeNobilityRoyalty', 'knowledgeReligion', 'knowledgeThePlanes'];

    classSkillsTable['barbarian'] = {defaultSkills: ['climb', 'craft', 'handleAnimal', 'intimidate', 'jump', 
        'listen', 'ride', 'survival', 'swim'], skillPointsPerLevel: 4};
    classSkillsTable['bard']      = {defaultSkills: ['appraise', 'balance', 'bluff', 'climb', 'concentration',
        'craft','decipherScript', 'diplomacy', 'disguise', 'escapeArtist', 'gatherInformation', 
        'hide', 'jump', ...allKnowledges, 'listen', 'moveSilently', 'perform', 'profession', 
        'senseMotive','sleightOfHand', 'speakLanguage', 'spellcraft', 'swim', 'tumble', 
        'useMagicDevice'], skillPointsPerLevel: 6};
    classSkillsTable['cleric']    = {defaultSkills: ['concentration', 'craft', 'diplomacy', 'heal', 
        'knowledgeArcana', 'knowledgeHistory', 'knowledgeReligion', 'knowledgeThePlanes', 
        'profession', 'spellcraft'], skillPointsPerLevel: 2};
    classSkillsTable['druid']     = {defaultSkills: ['concentration', 'craft', 'diplomacy', 'handleAnimal', 
        'heal', 'knowledgeNature', 'listen', 'profession', 'ride', 'spellcraft', 'spot', 
        'survival', 'swim'], skillPointsPerLevel: 4};
    classSkillsTable['fighter']   = {defaultSkills: ['climb', 'craft', 'handleAnimal', 'intimidate', 
        'jump', 'ride', 'swim'], skillPointsPerLevel: 2};
    classSkillsTable['monk']      = {defaultSkills: ['balance', 'climb', 'concentration', 'craft', 
        'diplomacy', 'escapeArtist', 'hide', 'jump', 'knowledgeArcana', 'knowledgeReligion', 
        'listen', 'moveSilently', 'perform', 'profession', 'senseMotive', 'spot', 'swim', 'tumble'], 
        skillPointsPerLevel: 4};
    classSkillsTable['paladin']   = {defaultSkills: ['concentration', 'craft', 'diplomacy', 'handleAnimal', 
        'heal', 'knowledgeNobilityRoyalty', 'knowledgeReligion', 'profession', 'ride', 'senseMotive'], 
        skillPointsPerLevel: 2};
    classSkillsTable['ranger']    = {defaultSkills: ['climb', 'concentration', 'craft', 'handleAnimal', 'heal', 
        'hide', 'jump', 'knowledgeDungeoneering', 'knowledgeGeography', 'knowledgeNature', 'listen', 
        'moveSilently', 'profession', 'ride', 'search', 'spot', 'survival', 'swim', 'useRope'], 
        skillPointsPerLevel: 6};
    classSkillsTable['rogue']     = {defaultSkills: ['appraise', 'balance', 'bluff', 'climb', 'craft', 'decipherScript',
        'diplomacy', 'disableDevice', 'disguise', 'escapeArtist', 'forgery', 'gatherInformation', 'hide',
        'intimidate', 'jump', 'knowledgeLocal', 'listen', 'moveSilently', 'openLock', 'perform','profession',
        'search', 'senseMotive', 'sleightOfHand', 'spot', 'swim', 'tumble', 'useMagicDevice', 'useRope'], 
        skillPointsPerLevel: 8};
    classSkillsTable['sorcerer']  = {defaultSkills: ['bluff', 'concentration', 'craft', 'knowledgeArcana', 'profession',
        'spellcraft'], skillPointsPerLevel: 2};
    classSkillsTable['wizard']    = {defaultSkills: ['concentration', 'craft', 'decipherScript', ...allKnowledges,
        'profession', 'spellcraft'], skillPointsPerLevel: 2};
}
