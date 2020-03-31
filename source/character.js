/*
* This document contains all character-related classes and methods. The necessary stuff to create a character sheet.
*/
class Character {
    db = {};
    skillsTable = {};
    skills = {};
    skillsRanksCount = 0;
    abilities = {};

    constructor(skillsTable, name, className, race) {
        this.skillsTable = skillsTable;
        this.name = name;
        this.className = className;
        this.race = race;
        this.setClassSkills();
        this.setDefaultAbilites();
    }
    
    /**
     * Set the character skills consulting the table and including only the elements of the given list.
     *
     * @param {Array.<string>} skillsList
     * @memberof Character
     */
    setCharacterSkillsByList(skillsList) {
        Object.keys(this.skillsTable).map(k => {
            if(skillsList.includes(k)) {
                this.skills[k] = {...this.skillsTable[k]};
                this.skills[k].isClassSkill = true;
            }  
        }) 
    }

    /**
     * Sets a character default class skills consulting the Skills Table.
     * This is called on the constructor.
     * @memberof Character
     */
    setClassSkills() {
        this.allKnowledges = ['knowledgeArcana', 'knowledgeArchitectureEngineering','knowledgeDungeoneering', "knowledgeGeography", 
        'knowledgeHistory', 'knowledgeLocal', 'knowledgeNature', 'knowledgeNobilityRoyalty','knowledgeReligion', 'knowledgeThePlanes'];

        switch (this.className) {
            case "Barbarian":             
                this.setCharacterSkillsByList(['climb', 'craft', 'handleAnimal', 'intimidate', 'jump', 'listen', 'ride', 'survival', 'swim']);
                break;
            case "Bard":
                this.setCharacterSkillsByList(['appraise', 'balance', 'bluff', 'climb', 'concentration', 'craft', 'decipherScript', 'diplomacy',
                'disguise', 'escapeArtist', 'gatherInformation', 'hide', 'jump', ...this.allKnowledges, 'listen', 'moveSilently', 'perform', 'profession',
                'senseMotive','sleightOfHand', 'speakLanguage', 'spellcraft', 'swim', 'tumble', 'useMagicDevice']);
            case "Cleric": //TODO: TEM QUE LEVAR EM CONTA DOMINIO, FAZER NO FRONT-END
                this.setCharacterSkillsByList(['concentration', 'craft', 'diplomacy', 'heal', 'knowledgeArcana', 'knowledgeHistory',
                'knowledgeReligion', 'knowledgeThePlanes', 'profession', 'spellcraft' ]);
                break;
            case "Druid":
                this.setCharacterSkillsByList(['concentration','craft','diplomacy','handleAnimal','heal','knowledgeNature','listen','profession',
                'ride','spellcraft','spot','survival','swim']);
                break;
            case "Fighter":
                this.setCharacterSkillsByList(['climb','craft','handleAnimal','intimidate','jump','ride','swim']);                
                break;
            case "Monk":
                this.setCharacterSkillsByList(['balance','climb','concentration','craft','diplomacy','escapeArtist','hide','jump','knowledgeArcana',
                'knowledgeReligion','listen','moveSilently','perform','profession','senseMotive','spot','swim','tumble']);
                break;
            case "Paladin":
                this.setCharacterSkillsByList(['concentration','craft','diplomacy','handleAnimal','heal','knowledgeNobilityRoyalty','knowledgeReligion',
                'profession','ride','senseMotive']);
                break;
            case "Ranger":
                this.setCharacterSkillsByList(['climb','concentration','craft','handleAnimal','heal','hide','jump','knowledgeDungeoneering',
                'knowledgeGeography','knowledgeNature','listen','moveSilently','profession','ride','search','spot','survival','swim','useRope']);
                break;
            case "Rogue":
                this.setCharacterSkillsByList(['appraise','balance','bluff','climb','craft','decipherScript','diplomacy','disableDevice','disguise',
                'escapeArtist','forgery','gatherInformation','hide','intimidate','jump','knowledgeLocal','listen','moveSilently','openLock',
                'perform','profession','search','senseMtive','sleightOfHand','spot','swim','tumble','useMagicDevice','useRope']);
                break;
            case "Sorcerer":
                this.setCharacterSkillsByList(['bluff','concentration','craft','knowledgeArcana','profession','spellcraft']);
                break;
            case "Wizard":
                this.setCharacterSkillsByList(['concentration','craft','decipherScript', ...this.allKnowledges,'profession','spellcraft']);
                break;
            default:
                break;
        }
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
     * Increment a skill rank by the given quantity, by default is one.
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
    setDefaultAbilites() {
        this.abilities['str'] = new Ability('Str', this.race);
        this.abilities['dex'] = new Ability('Dex', this.race);
        this.abilities['con'] = new Ability('Con', this.race);
        this.abilities['int'] = new Ability('Int', this.race);
        this.abilities['wis'] = new Ability('Wis', this.race);
        this.abilities['cha'] = new Ability('Cha', this.race);
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
        this.modifiers = modifiers;
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
    total = 0;
    modifier = 0;
    racialModifier = 0;
    temporaryModifiers = {};
    baseValue = 0;

    constructor(abilityName, characterRace) {
        this.name = abilityName;
        this.setRacialModifier(characterRace)
    }

    //TODO enum ou outra coisa para definir as raças - usar ideia de procura em lista e uma tabela para esse modificador racial
    /**
     * Sets the racial modifier according to the character race
     *
     * @param {string} characterRace
     * @memberof Ability
     */
    setRacialModifier(characterRace) {
        if(name == 'Str') {
            // if meio orc 
            //racialModifier = +2
            //if gnomo ou tiefling 
            //racialModifier = -2
        }
    }

    /**
     * @returns accumulated temporary modifiers values.
     * @memberof Skill
     */
    computeTemporaryModifiers = function() {
        let values = Object.values(this.temporaryModifiers);
        if(values.length)
            return Object.values(this.temporaryModifiers).reduce((acc, cur) => acc + cur);
        else
            return 0;
    };

    /**
     * Computes the ability modifier using the formula: modifier = trunc((baseValue + racialModifier + temporaryModifiers - 10) / 2)
     * The modifier is the number you apply to the dice roll when your character tries to do something related to that ability.
     * 
     * @memberof Ability
     */
    computeModifier = function() {
        modifier = Math.trunc((baseValue + racialModifier + computeTemporaryModifiers() - 10) / 2);
    }

    /**
     * Computes the ability total using the formula: total = racial + temporary + base
     *
     * @memberof Ability
     */
    computeTotal = function() {
        total = racialModifier + computeTemporaryModifiers() + baseValue;
    }
    // TODO:
    // 2. função que adiciona pontos e retorna o custo (usar no front-end)
    // 3. Criar métodos para comprar pontos
    // DENTRO DE CHARACTER
    // 4. Lista de abilities (semelhante aos skills)
    // 5. Criar habilidades default
    // 6. Métodos que chamam os métodos de ability
    // 7. Métodos pra distribuir pontos manualmente e aleatoriamente

}


let skillsTable = {};

createSkillsTable();

let alegod = new Character(skillsTable, "alegod", "Sorcerer", "Human");

//console.log([alegod.skills]);

//testes unitários das funções de skills.
alegod.addSkill('appraise');

alegod.incrementSkillRank('appraise', 2);

alegod.setSkillModifiers('appraise', {Int: 2});

alegod.setSkillRank('appraise', 4);

const alegodAppraise = alegod.skills['appraise'];
console.log(`Total=${alegodAppraise.total}, Name=${alegodAppraise.skillName}, Rank=${alegodAppraise.rank}, Modifiers=${alegodAppraise.modifiers}`);

/**
 * Create a table with all available skills in the game.
 */
function createSkillsTable() {
    skillsTable['appraise'] = new Skill("Appraise", "Int");
    skillsTable['balance'] = new Skill("Balance", "Dex");
    skillsTable['bluff'] = new Skill("Bluff", "Cha");
    skillsTable['climb'] = new Skill("Climb", "Str");
    skillsTable['concentration'] = new Skill("Concentration", "Con");
    skillsTable['craft'] = new Skill("Craft", "Int");
    skillsTable['decipherScript'] = new Skill("Decipher Script", "Int");
    skillsTable['diplomacy'] = new Skill("Diplomacy", "Cha");
    skillsTable['disableDevice'] = new Skill("Disable Device", "Dex");
    skillsTable['disguise'] = new Skill("Disguise", "Cha");
    skillsTable['escapeArtist'] = new Skill("Escape Artist", "Dex");
    skillsTable['forgery'] = new Skill("Forgery", "Int");
    skillsTable['gatherInformation'] = new Skill("Gather Information", "Cha");
    skillsTable['handleAnimal'] = new Skill("Handle Animal", "Cha");
    skillsTable['heal'] = new Skill("Heal", "Wis");
    skillsTable['hide'] = new Skill("Hide", "Dex");
    skillsTable['intimidate'] = new Skill("Intimidate", "Cha");
    skillsTable['jump'] = new Skill("Jump", "Str");
    skillsTable['knowledgeArcana'] = new Skill("Knowledge (Arcana)", "Int");
    skillsTable['knowledgeArchitectureEngineering'] = new Skill("Knowledge (Architecture and Engineering)", "Int");
    skillsTable['knowledgeDungeoneering'] = new Skill("Knowledge (Dungeoneering)", "Int");
    skillsTable['knowledgeGeography'] = new Skill("Knowledge (Geography)", "Int");
    skillsTable['knowledgeHistory'] = new Skill("Knowledge (History)", "Int");
    skillsTable['knowledgeLocal'] = new Skill("Knowledge (Local)", "Int");
    skillsTable['knowledgeNature'] = new Skill("Knowledge (Nature)", "Int");
    skillsTable['knowledgeNobilityRoyalty'] = new Skill("Knowledge (Nobility and Royalty)", "Int");
    skillsTable['knowledgeReligion'] = new Skill("Knowledge (Religion)", "Dex");
    skillsTable['knowledgeThePlanes'] = new Skill("Knowledge (The planes)", "Dex");
    skillsTable['listen'] = new Skill("Listen", "Wis");
    skillsTable['moveSilently'] = new Skill("Move Silently", "Dex");
    skillsTable['openLock'] = new Skill("Open Lock", "Dex");
    skillsTable['perform'] = new Skill("Perform", "Cha");
    skillsTable['profession'] = new Skill("Profession", "Wis");
    skillsTable['ride'] = new Skill("Ride", "Dex");
    skillsTable['search'] = new Skill("Search", "Int");
    skillsTable['senseMotive'] = new Skill("Sense Motive", "Wis");
    skillsTable['sleightOfHand'] = new Skill("Sleight of Hand", "Dex");
    skillsTable['speakLanguage'] = new Skill("Speak Language", "None");
    skillsTable['spellcraft'] = new Skill("Spellcraft", "Int");
    skillsTable['spot'] = new Skill("Spot", "Wis");
    skillsTable['survival'] = new Skill("Survival", "Wis");
    skillsTable['swim'] = new Skill("Swim", "Str");
    skillsTable['tumble'] = new Skill("Tumble", "Dex");
    skillsTable['useMagicDevice'] = new Skill("Use Magic Device", "Cha");
    skillsTable['useRope'] = new Skill("Use Rope", "Dex");
}
