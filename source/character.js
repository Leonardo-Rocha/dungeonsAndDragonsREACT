/*
* This document contains all character-related classes and methods. The necessary
* stuff to create a character sheet.
*/
class Character {
    skills = {};
    skillsRanksCount = 0;
    abilities = {};
    availableAbilityPoints = 32;
    /**
     * We append items in this list when the player increments a skill with the
     * points given on and after lvl 4. This list is used to roll back if the 
     * player loses level after death and rebirth.
     *
     * @memberof Character
     */
    levelUpSkills = [];
    totalLevel = 1;

    constructor(name, className, race, skillsTable, classSkillsTable, racialTraitsTable) {
        this.name              = name;
        this.className         = className;
        this.race              = race;
        this.skillsTable       = skillsTable;
        this.classSkillsTable  = classSkillsTable;
        this.racialTraitsTable = racialTraitsTable;
        this._setClassSkills();
        this._setDefaultAbilites();
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
     * Sets a character default class skills consulting the Skills Table.
     * This is called on the constructor.
     * @memberof Character
     */
    _setClassSkills() {
        const classSkillsList = this.classSkillsTable[this.className];
        this.setCharacterSkillsByList(classSkillsList);
    }
    
    /**
     * Adds a new skill consulting the skills table.
     *
     * @param {string} skillId
     * @memberof Character
     */
    addSkill(skillId) {
        if(skillId in skillsTable)
            this.skills[skillId] = {...this.skillsTable[skillId]};
        else 
            console.warn(`WARNING: In character '${this.name}' not able to addSkill '${skillId}' => invalid skillId`); 
    }

    /**
     * Increments or decrements a skill rank by the given quantity, by default is one.
     *
     * @param {string} skillId
     * @param {number} [rankIncrementQuantity=1]
     * @memberof Character
     */
    incrementSkillRank(skillId, rankIncrementQuantity = 1) {
        if(skillId in this.skills) {
            const skill = this.skills[skillId]; 
            skill.incrementRank(rankIncrementQuantity);
            this.skillsCount += rankIncrementQuantity;
        }
        else 
            console.warn(`WARNING: In character '${this.name}' not able to incrementSkillRank '${skillId}' => 
            invalid skillId or not included in character skills`); 
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
            console.warn(`WARNING: In character '${this.name}' not able to setSkillModifiers '${skillId}' => 
            invalid skillId or not included in character skills`);  
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
            console.warn(`WARNING: In character '${this.name}' not able to setSkillRank '${skillId}' => 
            invalid skillId or not included in character skills`); 
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
            const spentPoints = ability.incrementBaseValue(incrementValue, hasCost, this.availableAbilityPoints);
            this.availableAbilityPoints -= spentPoints;
            if(!hasCost) // increments the list used on the rollback if a player dies
                this.levelUpSkills.push({abilityId: incrementValue});
        }
        else 
            console.warn(`WARNING: In character '${this.name}' not able to incrementAbilityBaseValue '${skillId}' => 
            invalid skillId`); 
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
            key = getRandomKeyInList(abilitiesArray);
            incrementValue = getRandomInteger(1, max);

            const abilityBaseValue = this.abilities[key].baseValue;
            incrementValue = ((abilityBaseValue + incrementValue) > 18 ? (18 - abilityBaseValue) : incrementValue);
            
            this.incrementAbilityBaseValue(key, true, incrementValue);
            
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
     * The new base value is the sum of the rolls.
     * 
     * @returns the spent points.
     * @memberof Character
     */
    buyRandomAbilityPoints4d6() {
        let newBaseValue = 0;
        let rolls4d6 = [];
        let ability;
        let menor = 0;
        let atual = 0;
        let spentPoints = 0;
        let i = 4;

        Object.keys(this.abilities).forEach(k => {
            ability = this.abilities[k];
            menor = 7; // just a number higher than 6
            i = 4;
            while(i-- > 0) {
                atual = getRandomInteger(1, 6);
                if(atual < menor)
                    menor = atual;
                rolls4d6.push(atual);
            }
            // console.log()
            newBaseValue = rolls4d6.reduce((acc, cur) => acc + cur) - menor;
            rolls4d6 = [];
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
        if(totalLevel % 4 == 0) // if it's a multiple of 4 
            this.availableAbilityPoints += Math.ceiling(levelIncrement / 4);
    }
}

/**
 * This class represents a single character skill with the proper fields and methods to modify them.
 * It's stored in the caracter as an object of skills.
 *
 * @class Skill
 */
class Skill {
    total = 0;
    //TODO: add ability modifier by default
    constructor(skillName, keyAbility, skillRank = 0, isClassSkill = false, skillModifiers = {}) {
        this.skillName    = skillName;        
        this.keyAbility   = keyAbility;
        this.rank         = skillRank;
        this.isClassSkill = isClassSkill;
        this.modifiers    = skillModifiers;
    }

    /**
     * Increment the skill rank by given quantity and compute the new total. By default increment by one.
     * 
     * @param {number} rankIncrementQuantity
     * @memberof Skill
     */
    incrementRank = function(rankIncrementQuantity) {
        this.rank += rankIncrementQuantity;
        this.computeTotal();
    };

    /**
     * Compute the total adding the rank properly.
     * By the 3.5 rules, if it's not a class skill 2 ranks are required to increment the total by one.
     *
     * @memberof Skill
     */
    computeRankTotal = function() {
        if (this.isClassSkill) 
            return this.rank;
        else
            return Math.trunc(this.rank/2);
    };

    /**
     * @returns accumulated modifiers values.
     * @memberof Skill
     */
    computeModifiersTotal = function() {
        let values = Object.values(this.modifiers);
        if(values.length)
            return Object.values(this.modifiers).reduce((acc, cur) => acc + cur);
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
     * 
     * @param {Object.<{value: number}>} modifiers
     * @memberof Skill
     */
    setModifiers = function(modifiers) {
        Object.keys(modifiers).forEach(k => {
            if(this.modifiers[k] != undefined) 
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
    setRank = function(rank) {
        this.rank = rank;
        this.computeTotal();
    }
}

/**
 * This class represents a single character ability with the proper fields and methods to modify them.
 * It's stored in the caracter as an object of abilities.
 * 
 * @class Ability
 */
class Ability {
    total = 8;
    baseValue = 8;
    modifier = 0;
    racialModifier = 0;
    temporaryModifiers = {};

    constructor(abilityName) {
        this.name = abilityName;
    }

    /**
     * @returns accumulated temporary modifiers values.
     * @memberof Ability
     */
    computeTemporaryModifiers = function() {
        let values = Object.values(this.temporaryModifiers);
        if(values.length)
            return Object.values(this.temporaryModifiers).reduce((acc, cur) => acc + cur);
        else
            return 0;
    };

    /**
     * Computes the ability modifier using the formula: 
     * modifier = trunc((baseValue + racialModifier + temporaryModifiers - 10) / 2)
     * 
     * @memberof Ability
     */
    computeModifier = function() {
        this.modifier = Math.floor((this.baseValue + this.racialModifier + 
            this.computeTemporaryModifiers() - 10) / 2);
    }

    /**
     * Computes the ability total using the formula: total = racial + temporary + base
     *
     * @memberof Ability
     */
    computeTotal = function() {
        this.total = this.racialModifier + this.computeTemporaryModifiers() + 
        this.baseValue;
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
    incrementBaseValue = function(incrementValue, hasCost, availableAbilityPoints) {
        let spentPoints = 0;
        let newValue = this.baseValue + incrementValue;
        // incrementValue = 9
        // availableAbilityPoints = 3
        if(hasCost)
            spentPoints = this._checkPointsBuyCost(newValue) - this._checkPointsBuyCost(this.baseValue);
        else 
            spentPoints = incrementValue;

        if(newValue >= 8 && availableAbilityPoints >= spentPoints) {
            this.baseValue += incrementValue;
            this.computeModifier();
            this.computeTotal();            
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
    setBaseValue = function(newBaseValue) {
        this.baseValue = newBaseValue;
        this.computeModifier();
        this.computeTotal();  
        return this._checkPointsBuyCost(newBaseValue);
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
        else if(newValue > 14 && newValue <= 18)
            pointsBuyCost = pointsTable[newValue];

        return pointsBuyCost;
    }
}

/**
 * This class is used as a container to the specific traits and modifiers of a race.
 *
 * @class RacialTraits
 */
class RacialTraits {
    constructor(abilitiesModifiers = {}, skillsModifiers = {}, featsModifiers = {}, otherModifiers = {}) {
        this.abilitiesModifiers = abilitiesModifiers;
        this.skillsModifiers    = skillsModifiers;
        this.featsModifiers     = featsModifiers;
        this.otherModifiers     = otherModifiers;
    }
}

classSkillsTable = {};
skillsTable = {};
racialTraitsTable = {};

//TODO: send this to database?
createSkillsTable();
createRacialTraitsTable();
createClassSkillsTable();

let alegod = new Character("alegod", "sorcerer", "human", skillsTable, classSkillsTable, racialTraitsTable);

const spentPoints = alegod.buyRandomAbilityPoints4d6();
printAbilitiesPretty(alegod);

console.log(`Spent Points: ${spentPoints}`);

//printSkillsTest(alegod);
//printAbilitiesTest(alegod);

//console.log(racialTraitsTable['dwarf'].featsModifiers['dwarfWarAxe']);

/**
 * @param {number} min
 * @param {number} max
 * @returns a random number between min and max (both included):
 */
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

/**
 * @param {array} list
 * @return random key.
 */
function getRandomKeyInList(list = []) {
    const max = list.length;
    const randomIndex = getRandomInteger(0, max-1);
    const randomKey = list[randomIndex];

    return randomKey;
}

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

function printAbilitiesPretty(character) {
    let printTable = [];
    Object.keys(character.abilities).forEach(k => {
        const ability = character.abilities[k];
        printTable = [...printTable, {name: ability.name, value: ability.baseValue, mod: ability.modifier}];
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
    racialTraitsTable['dwarf'] = new RacialTraits({con:2, car:-2}, {},
        {dwarfWarAxe: "Use dwarf war axe"}, {size: "medium", language: 'dwarf', baseLandSpeed:6, 
        racial: ["Darkvision 18 meters","+2 search check on stone constructions" ,"+4 against " + 
        "bull rush and trip while staying on the ground","+2 saving throws against all poisons",
        "+2 saving throws against all spells and spell-like effects","+1 atack bonus agains orcs and goblins",
        "+4 dodge AC against giant type monsters", "+2 appraise related to stones","+2 craft related to stone or metal"] });
    racialTraitsTable['elves'] = new RacialTraits({dex:2, con:-2}, {listen:2, search:2, spot:2}, {longSword:"Use long sword",
        rapier: "Use Rapier",  longBow:"Use Long Bow", shortBow: "Use Short Bow"}, {size: "medium", language: "elf",
        baseLandSpeed: 9, racial: ["Low-light Vision", "Imune to magic sleep", "Instead of sleep for 8 hours, meditate for 4 hours"]} );
    racialTraitsTable['gnome'] = new RacialTraits({con:2, str: -2}, {listen: 2}, {gnomeHookedHammer: "Use Gnome Hooked Hammer",},
        {size: "small", language: "gnome", baseLandSpeed: 6, racial: ["Low-light vision", "+2 saving throws against illusions",
        "+1 DC on illusions casted by gnome", "+1 atack bonus against goblins and kobolds", "+4 dodge AC against giant type monsters",
        "+2 craft (Alchemy)", "spell like ability: 1/day speak with animals (duration 1 min)",
        "if charisma is at least 10; 1/day - dancing lights, ghost sound, prestidigitation (caster 1, DC (10 + ChaMod + spell level))"]})
    racialTraitsTable['halfling']
}

/**
 * Creates a table with with the default skills of every class.
 */
function createClassSkillsTable() {
    const allKnowledges = ['knowledgeArcana', 'knowledgeArchitectureEngineering', 
    'knowledgeDungeoneering', 'knowledgeGeography', 'knowledgeHistory', 'knowledgeLocal', 
    'knowledgeNature', 'knowledgeNobilityRoyalty', 'knowledgeReligion', 'knowledgeThePlanes'];

    classSkillsTable['barbarian'] = ['climb', 'craft', 'handleAnimal', 'intimidate', 'jump', 
    'listen', 'ride', 'survival', 'swim'];
    classSkillsTable['bard']      = ['appraise', 'balance', 'bluff', 'climb', 'concentration',
    'craft','decipherScript', 'diplomacy', 'disguise', 'escapeArtist', 'gatherInformation', 
    'hide', 'jump', ...allKnowledges, 'listen', 'moveSilently', 'perform', 'profession', 
    'senseMotive','sleightOfHand', 'speakLanguage', 'spellcraft', 'swim', 'tumble', 
    'useMagicDevice'];
    classSkillsTable['cleric']    = ['concentration', 'craft', 'diplomacy', 'heal', 
    'knowledgeArcana', 'knowledgeHistory', 'knowledgeReligion', 'knowledgeThePlanes', 
    'profession', 'spellcraft'];
    classSkillsTable['druid']     = ['concentration', 'craft', 'diplomacy', 'handleAnimal', 
    'heal', 'knowledgeNature', 'listen', 'profession', 'ride', 'spellcraft', 'spot', 
    'survival', 'swim'];
    classSkillsTable['fighter']   = ['climb', 'craft', 'handleAnimal', 'intimidate', 
    'jump', 'ride', 'swim'];
    classSkillsTable['monk']      = ['balance', 'climb', 'concentration', 'craft', 
    'diplomacy', 'escapeArtist', 'hide', 'jump', 'knowledgeArcana', 'knowledgeReligion', 
    'listen', 'moveSilently', 'perform', 'profession', 'senseMotive', 'spot', 'swim', 'tumble'];
    classSkillsTable['paladin']   = ['concentration', 'craft', 'diplomacy', 'handleAnimal', 
    'heal', 'knowledgeNobilityRoyalty', 'knowledgeReligion', 'profession', 'ride', 'senseMotive'];
    classSkillsTable['ranger']    = ['climb', 'concentration', 'craft', 'handleAnimal', 'heal', 
    'hide', 'jump', 'knowledgeDungeoneering', 'knowledgeGeography', 'knowledgeNature', 'listen', 
    'moveSilently', 'profession', 'ride', 'search', 'spot', 'survival', 'swim', 'useRope'];
    classSkillsTable['rogue']     = ['appraise', 'balance', 'bluff', 'climb', 'craft', 'decipherScript',
    'diplomacy', 'disableDevice', 'disguise', 'escapeArtist', 'forgery', 'gatherInformation', 'hide',
    'intimidate', 'jump', 'knowledgeLocal', 'listen', 'moveSilently', 'openLock', 'perform','profession',
    'search', 'senseMotive', 'sleightOfHand', 'spot', 'swim', 'tumble', 'useMagicDevice', 'useRope'];
    classSkillsTable['sorcerer']  = ['bluff', 'concentration', 'craft', 'knowledgeArcana', 'profession',
    'spellcraft'];
    classSkillsTable['wizard']    = ['concentration', 'craft', 'decipherScript', ...allKnowledges,
    'profession', 'spellcraft'];
}
