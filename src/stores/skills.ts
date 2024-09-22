import type { Entity } from './entity'

type Skill = (skillUser: Entity, recipients: Entity[]) => void

export const skills = {
  'fire-blast': (skillUser: Entity, recipients: Entity[]) => {
    recipients.forEach((recipient) => {
      const damage = skillUser.magicSkill * skillUser.level
      recipient.health -= damage
      if (!recipient.status.includes('burned')) recipient.status.push('burned')
    })
  },
  freeze: (skillUser: Entity, recipients: Entity[]) => {
    recipients.forEach((recipient) => {
      const damage = skillUser.magicSkill * skillUser.level
      recipient.health -= damage
      if (!recipient.status.includes('frozen')) recipient.status.push('frozen')
    })
  },
  'rock-crush': (skillUser: Entity, recipients: Entity[]) => {
    recipients.forEach((recipient) => {
      const damage = skillUser.strength * skillUser.level
      recipient.health -= damage
    })
  },
  slash: (skillUser: Entity, recipients: Entity[]) => {
    recipients.forEach((recipient) => {
      const damage = skillUser.strength * skillUser.speed + skillUser.level
      recipient.health -= damage
    })
  },
  heal: (skillUser: Entity, recipients: Entity[]) => {
    recipients.forEach((recipient) => {
      const healthIncrease = skillUser.magicSkill * skillUser.level
      recipient.health += healthIncrease
    })
  },
  'super-punch': () => {}
} as const
// type Skill = (skillUser: Entity, recipients: Entity[]) => void
export type SkillsDictionary = typeof skills
export type SkillName = keyof SkillsDictionary
