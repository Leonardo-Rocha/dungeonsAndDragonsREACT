/*
* This document contains all classes and methods to store on the dataase
*/
class Character {
    db = {};
    skillsTable = {};
    skills = {};

    constructor(skillsTable, name, className, race) {
        this.skillsTable = skillsTable;
        this.name = name;
        this.className = className;
        this.race = race;
        this.setisClassSkills();
    }
    
    setCharacterSkillsByList(skillsList) {
        Object.keys(this.skillsTable).map(k => {
            if(skillsList.includes(k)) {
                this.skills[k] = {...this.skillsTable[k]};
                this.skills[k].isClassSkill = true;
            }  
        }) 
    }

    setisClassSkills() {
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
    
    addSkill(skillName, skillRank, keyAbility) {
        let skill = {};

        skill.skillName = skillName;
        skill.skillRank = skillRank;
        skill.keyAbility = keyAbility;

        return skill;
    }

    getCharacterSkillsFromDB() {
        let characterSkills = {};

        let skillsRef = db.collection(name).doc('skills');

        let allSkills = skillsRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            characterSkills[doc.id] = doc.data();
            });
        })
        .catch(err => {
            console.log('Error getting skills', err);
        });

        return characterSkills;
    }
}

let skillsTable = {};

createSkillsTable();

let alegod = new Character(skillsTable, "alegod", "Barbarian", "Human");

console.log([alegod.skills]);

function createSkillsTable() {
    skillsTable['appraise'] = {skillName: "Appraise", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['balance'] = {skillName: "Balance", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['bluff'] = {skillName: "Bluff", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['climb'] = {skillName: "Climb", skillRank: 0, keyAbility: "Str", isClassSkill: false, modifiers: {}};
    skillsTable['concentration'] = {skillName: "Concentration", skillRank: 0, keyAbility: "Con", isClassSkill: false, modifiers: {}};
    skillsTable['craft'] = {skillName: "Craft", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['decipherScript'] = {skillName: "Decipher Script", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['diplomacy'] = {skillName: "Diplomacy", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['disableDevice'] = {skillName: "Disable Device", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['disguise'] = {skillName: "Disguise", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['escapeArtist'] = {skillName: "Escape Artist", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['forgery'] = {skillName: "Forgery", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['gatherInformation'] = {skillName: "Gather Information", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['handleAnimal'] = {skillName: "Handle Animal", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['heal'] = {skillName: "Heal", skillRank: 0, keyAbility: "Wis", isClassSkill: false, modifiers: {}};
    skillsTable['hide'] = {skillName: "Hide", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['intimidate'] = {skillName: "Intimidate", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['jump'] = {skillName: "Jump", skillRank: 0, keyAbility: "Str", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeArcana'] = {skillName: "Knowledge (Arcana)", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeArchitectureEngineering'] = {skillName: "Knowledge (Architecture and Engineering)", skillRank: 0, keyAbility: "Int", 
                                                        isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeDungeoneering'] = {skillName: "Knowledge (Dungeoneering)", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeGeography'] = {skillName: "Knowledge (Geography)", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeHistory'] = {skillName: "Knowledge (History)", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeLocal'] = {skillName: "Knowledge (Local)", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeNature'] = {skillName: "Knowledge (Nature)", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeNobilityRoyalty'] = {skillName: "Knowledge (Nobility and Royalty)", skillRank: 0, keyAbility: "Int", isClassSkill: false, 
                                                modifiers: {}};
    skillsTable['knowledgeReligion'] = {skillName: "Knowledge (Religion)", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['knowledgeThePlanes'] = {skillName: "Knowledge (The planes)", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['listen'] = {skillName: "Listen", skillRank: 0, keyAbility: "Wis", isClassSkill: false, modifiers: {}};
    skillsTable['moveSilently'] = {skillName: "Move Silently", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['openLock'] = {skillName: "Open Lock", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['perform'] = {skillName: "Perform", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['profession'] = {skillName: "Profession", skillRank: 0, keyAbility: "Wis", isClassSkill: false, modifiers: {}};
    skillsTable['ride'] = {skillName: "Ride", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['search'] = {skillName: "Search", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['senseMotive'] = {skillName: "Sense Motive", skillRank: 0, keyAbility: "Wis", isClassSkill: false, modifiers: {}};
    skillsTable['sleightOfHand'] = {skillName: "Sleight of Hand", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['speakLanguage'] = {skillName: "Speak Language", skillRank: 0, keyAbility: "None", isClassSkill: false, modifiers: {}};
    skillsTable['spellcraft'] = {skillName: "Spellcraft", skillRank: 0, keyAbility: "Int", isClassSkill: false, modifiers: {}};
    skillsTable['spot'] = {skillName: "Spot", skillRank: 0, keyAbility: "Wis", isClassSkill: false, modifiers: {}};
    skillsTable['survival'] = {skillName: "Survival", skillRank: 0, keyAbility: "Wis", isClassSkill: false, modifiers: {}};
    skillsTable['swim'] = {skillName: "Swim", skillRank: 0, keyAbility: "Str", isClassSkill: false, modifiers: {}};
    skillsTable['tumble'] = {skillName: "Tumble", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
    skillsTable['useMagicDevice'] = {skillName: "Use Magic Device", skillRank: 0, keyAbility: "Cha", isClassSkill: false, modifiers: {}};
    skillsTable['useRope'] = {skillName: "Use Rope", skillRank: 0, keyAbility: "Dex", isClassSkill: false, modifiers: {}};
}