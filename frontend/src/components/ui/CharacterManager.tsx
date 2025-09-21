import React, { useState, useEffect, useCallback } from 'react'
import { AnimatedCharacter } from './AnimatedCharacter'

interface CharacterEvent {
  id: string
  type: 'owl' | 'cat' | 'rabbit' | 'bear' | 'fox'
  message: string
  emotion: 'happy' | 'excited' | 'thinking' | 'sleepy' | 'celebrating'
  position: { x: number; y: number }
  delay?: number
  autoClose?: boolean
}

interface CharacterManagerProps {
  onCharacterClose?: (characterId: string) => void
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  onCharacterClose
}) => {
  const [characters, setCharacters] = useState<CharacterEvent[]>([])
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now())

  // Character personalities and messages
  const characterMessages = {
    owl: {
      happy: ["Hoot hoot! Great job!", "You're doing amazing!", "Keep up the excellent work!"],
      excited: ["WOW! That was incredible!", "You're on fire!", "Hoot hoot! Fantastic!"],
      thinking: ["Let me think about this...", "Hmm, interesting choice!", "What should we do next?"],
      sleepy: ["*yawn* Time for a break?", "Getting a bit tired...", "Maybe some rest would help..."],
      celebrating: ["🎉 CELEBRATION TIME! 🎉", "You did it! Amazing!", "This calls for a party!"]
    },
    cat: {
      happy: ["Purr purr! Nice work!", "You're making me proud!", "Meow meow! Good job!"],
      excited: ["MEOW! That was purr-fect!", "You're the cat's pajamas!", "Feline fantastic!"],
      thinking: ["*purrs thoughtfully*", "Let me contemplate this...", "Interesting approach..."],
      sleepy: ["*stretches* Maybe a cat nap?", "Getting sleepy...", "Time for some rest?"],
      celebrating: ["🎊 MEOW-GNIFICENT! 🎊", "Purr-fect performance!", "You're the cat's meow!"]
    },
    rabbit: {
      happy: ["Hop hop! Great progress!", "You're hopping along nicely!", "Bunny approved!"],
      excited: ["HOP HOP HOP! Amazing!", "You're hopping fantastic!", "Bounce with joy!"],
      thinking: ["*twitches nose thoughtfully*", "Let me hop on this idea...", "Interesting choice..."],
      sleepy: ["*yawns* Time to hop to bed?", "Getting a bit tired...", "Maybe some rest?"],
      celebrating: ["🎈 HOP-TASTIC! 🎈", "You're hopping amazing!", "Bounce with pride!"]
    },
    bear: {
      happy: ["Grrreat job!", "You're beary good!", "Bear hugs for you!"],
      excited: ["ROAR! That was amazing!", "You're beary talented!", "Grrr-eat work!"],
      thinking: ["*scratches head*", "Let me bear this in mind...", "Interesting approach..."],
      sleepy: ["*yawns* Time to hibernate?", "Getting sleepy...", "Maybe some rest?"],
      celebrating: ["🐻 BEAR-Y AWESOME! 🐻", "You're beary amazing!", "Hugs and high fives!"]
    },
    fox: {
      happy: ["Sly move! Well done!", "You're foxy clever!", "What a smart choice!"],
      excited: ["YIP YIP! Fantastic!", "You're sly and smart!", "Foxy good work!"],
      thinking: ["*tilts head thoughtfully*", "Let me be sly about this...", "Clever approach..."],
      sleepy: ["*yawns* Time to rest?", "Getting a bit tired...", "Maybe some sleep?"],
      celebrating: ["🦊 FOX-TASTIC! 🦊", "You're sly and amazing!", "Clever work!"]
    }
  }

  const getRandomMessage = (type: string, emotion: string) => {
    const messages = characterMessages[type as keyof typeof characterMessages]?.[emotion as keyof typeof characterMessages[keyof typeof characterMessages]]
    return messages ? messages[Math.floor(Math.random() * messages.length)] : "Great job!"
  }

  const getRandomPosition = () => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Avoid edges and center
    const x = Math.random() * (viewportWidth - 200) + 100
    const y = Math.random() * (viewportHeight - 300) + 150
    
    return { x, y }
  }

  const spawnCharacter = useCallback((type: 'owl' | 'cat' | 'rabbit' | 'bear' | 'fox', emotion: 'happy' | 'excited' | 'thinking' | 'sleepy' | 'celebrating', customMessage?: string) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const message = customMessage || getRandomMessage(type, emotion)
    const position = getRandomPosition()

    const newCharacter: CharacterEvent = {
      id,
      type,
      message,
      emotion,
      position,
      autoClose: true,
      delay: emotion === 'celebrating' ? 4000 : emotion === 'sleepy' ? 5000 : 3000
    }

    setCharacters(prev => [...prev, newCharacter])
    setLastActionTime(Date.now())
  }, [])

  const removeCharacter = useCallback((characterId: string) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId))
    onCharacterClose?.(characterId)
  }, [onCharacterClose])

  // Auto-spawn characters based on user activity - DISABLED
  // Characters now only spawn when explicitly requested by user
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const timeSinceLastAction = Date.now() - lastActionTime
  //     
  //     // Spawn a sleepy character if user is inactive
  //     if (timeSinceLastAction > 30000 && Math.random() < 0.3) {
  //       const types = ['owl', 'cat', 'rabbit', 'bear', 'fox'] as const
  //       const randomType = types[Math.floor(Math.random() * types.length)]
  //       spawnCharacter(randomType, 'sleepy')
  //     }
  //   }, 10000)

  //   return () => clearInterval(interval)
  // }, [lastActionTime, spawnCharacter])

  // Spawn celebratory characters for milestones
  const celebrateMilestone = useCallback((milestone: string) => {
    const types = ['owl', 'cat', 'rabbit', 'bear', 'fox'] as const
    const randomType = types[Math.floor(Math.random() * types.length)]
    spawnCharacter(randomType, 'celebrating', milestone)
  }, [spawnCharacter])

  // Spawn encouraging characters for progress
  const encourageProgress = useCallback(() => {
    const types = ['owl', 'cat', 'rabbit', 'bear', 'fox'] as const
    const emotions = ['happy', 'excited'] as const
    const randomType = types[Math.floor(Math.random() * types.length)]
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
    spawnCharacter(randomType, randomEmotion)
  }, [spawnCharacter])

  // Spawn thinking characters for planning
  const showThinking = useCallback(() => {
    const types = ['owl', 'cat', 'rabbit', 'bear', 'fox'] as const
    const randomType = types[Math.floor(Math.random() * types.length)]
    spawnCharacter(randomType, 'thinking')
  }, [spawnCharacter])

  // Expose methods globally for other components to use
  useEffect(() => {
    (window as any).characterManager = {
      celebrateMilestone,
      encourageProgress,
      showThinking,
      spawnCharacter
    }
  }, [celebrateMilestone, encourageProgress, showThinking, spawnCharacter])

  return (
    <>
      {characters.map((character) => (
        <AnimatedCharacter
          key={character.id}
          type={character.type}
          message={character.message}
          emotion={character.emotion}
          position={character.position}
          onClose={() => removeCharacter(character.id)}
          autoClose={character.autoClose}
          delay={character.delay}
        />
      ))}
    </>
  )
}

export default CharacterManager
