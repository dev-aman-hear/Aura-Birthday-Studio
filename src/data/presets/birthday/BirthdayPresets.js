/**
 * Birthday Studio - Universal Birthday Presets
 * Reusable Birthday Celebration Blueprints with dynamic placeholders
 */

import { Preset } from '../../../models/Preset.js';

export const BIRTHDAY_PRESETS = [
  new Preset({
    id: 'little_sister_short_film',
    occasion: 'birthday',
    category: 'Birthday / Cinematic & Interactive',
    title: 'Birthday Reverie',
    description: 'A cinematic birthday experience blending memories, humor, heartfelt moments, surprises, gifts, and a magical finale.',
    icon: '🎬',
    tags: ['Cinematic', 'Birthday Reverie', 'Memories', 'Heartfelt', '3D Interactive', 'Humor', 'Letter', 'Gift Unboxing'],
    availableVariants: ['11-scene', 'story'],
    defaultVariant: '11-scene',
    theme: 'purple_gold',
    supportedPersonalizationFields: [
      'recipientName', 'senderName', 'occasion', 'birthdayDate', 'date', 'relationship', 'signature', 'message', 'letterBody', 'photo1', 'photo2', 'photo3', 'music'
    ],
    fallbackContent: {
      recipientName: 'Recipient Name',
      fullName: 'Recipient Name',
      senderName: 'Your Name',
      creatorName: 'Your Name',
      relationship: 'Friend',
      occasion: 'Birthday',
      birthdayDate: '15 August 2026',
      date: '15 • 08 • 2026',
      signature: '— With love, {{senderName}}',
      message: 'Watching you grow into the thoughtful, strong, and brilliant person you are today has been one of the greatest joys of my life.',
      customMessage: 'Watching you grow into the thoughtful, strong, and brilliant person you are today has been one of the greatest joys of my life.',
      letterBody: 'There are some things I don\'t say often enough.\n\nLife moves fast, and we spend so much time dealing with everyday chaos that I forget to remind you how much you truly mean to me.\n\nWatching you grow into the thoughtful, strong, and brilliant person you are today has been one of the greatest joys of my life.\n\nNo matter how many miles away life takes us, or how old we get, you will always have someone in your corner, cheering for you through everything.\n\nThank you for being such an incredible part of my life, a true friend, and a constant spark of brightness.',
      photo1: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
      photo2: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      photo3: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80'
    },
    sceneBlueprints: {
      '11-scene': [
        // Scene 01 — THE OPENING (Cinematic Intro)
        {
          name: '1. Cinematic Intro',
          template: 'special_cinematic_intro',
          duration: 9,
          transition: 'fade',
          titleText: '15 August',
          subtitleText: 'YOUR STORY STARTS HERE.',
          settings: {
            dateHeader: '15 AUGUST',
            line1: 'A DAY LIKE ANY OTHER...',
            line2: 'EXCEPT IT WASN\'T.',
            line3: 'SOMEONE SPECIAL CAME INTO THIS WORLD.',
            ctaSubtext: 'YOUR STORY STARTS HERE.',
            buttonText: 'BEGIN'
          }
        },
        // Scene 02 — THE BEGINNING (Childhood Memories)
        {
          name: '2. Childhood Memories',
          template: 'special_childhood_memories',
          duration: 10,
          transition: 'fade',
          titleText: 'Where It All Began',
          subtitleText: 'Before I knew it... You became part of my world.',
          slots: { hero_photo: 'photo1' },
          settings: {
            introLine1: 'Before I knew it...',
            introLine2: 'You became part of my world.',
            outroLine1: 'Years passed.',
            outroLine2: 'And you grew up.',
            buttonText: 'CONTINUE →',
            memories: [
              { title: 'THE EARLY DAYS', year: '2010', caption: 'You came into my life and everything changed.', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' },
              { title: 'LITTLE STEPS', year: '2014', caption: 'Watching you grow up faster than I realized.', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
              { title: 'PARTNERS IN CRIME', year: '2018', caption: 'Always by my side through every milestone.', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' },
              { title: 'MEMORIES THAT STAYED', year: '2022', caption: 'Growing into an incredible person every single day.', photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' }
            ]
          }
        },
        // Scene 03 — UNFORGETTABLE MEMORIES (Memory Sequence)
        {
          name: '3. Memory Sequence',
          template: 'special_memory_sequence',
          duration: 10,
          transition: 'fade',
          titleText: 'SOME MOMENTS BECOME MEMORIES',
          subtitleText: 'And some memories stay forever.',
          slots: { photo: 'photo2' },
          settings: {
            introLine1: 'Some moments become memories.',
            introLine2: 'And some memories stay forever.',
            outroLine1: 'Some memories become part of who we are.',
            outroLine2: 'And there are some things I\'ve never said.',
            buttonText: 'NEXT →',
            memories: [
              { title: 'WHERE IT ALL BEGAN', year: '2010', caption: 'You came into my life and made it infinitely brighter.', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' },
              { title: 'THE EARLY YEARS', year: '2016', caption: 'Always curious, always energetic, full of smiles.', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
              { title: 'GROWING TOGETHER', year: '2019', caption: 'Through all the small moments and big laughs.', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' },
              { title: 'A NEW CHAPTER', year: '2023', caption: 'Becoming your own incredible person.', photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' },
              { title: 'TODAY & ALWAYS', year: '2026', caption: 'Look how far you\'ve come. Always cheering for you.', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' }
            ]
          }
        },
        // Scene 04 — COLLAGES GALLERY (Uncropped Lightbox View)
        {
          name: '4. Collages Gallery',
          template: 'special_collage_gallery',
          duration: 9,
          transition: 'fade',
          titleText: 'UNFORGETTABLE MOMENTS',
          subtitleText: 'Some people become memories. Some people become home.',
          slots: { collage_photo: 'photo3' },
          settings: {
            titleText: 'UNFORGETTABLE MOMENTS',
            subtitleText: 'Some people become memories. Some people become home.',
            buttonText: 'NEXT →',
            collages: [
              { title: 'TOGETHER ALWAYS', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80', caption: 'Special moments that make life rich and warm.' },
              { title: 'ADVENTURES & TRAVEL', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80', caption: 'Exploring new paths together side by side.' },
              { title: 'PURE JOY', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80', caption: 'Smiles that light up any room.' },
              { title: 'TIMELESS BONDS', photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80', caption: 'A bond that only gets stronger with time.' }
            ]
          }
        },
        // Scene 05 — CHAOS & HUMOR
        {
          name: '5. Chaos & Humor',
          template: 'special_chaos_montage',
          duration: 9,
          transition: 'fade',
          titleText: 'The Real You 😜',
          subtitleText: 'Because let’s be honest... you can be a little chaotic!',
          settings: {
            introLine1: 'Let\'s talk about the real you.',
            introLine2: 'Because let\'s be honest...',
            introLine3: 'You can be a little chaotic. 😜',
            outroLine1: 'Okay. Maybe I exaggerate a little.',
            outroLine2: 'Or maybe not. 😜',
            bridgeLine1: 'Okay... I\'ll stop embarrassing you. Probably.',
            bridgeLine2: 'But there is something I actually wanted to give you.',
            buttonText: 'CONTINUE →',
            cards: [
              { title: '24/7 TROUBLE GENERATOR', subtitle: 'Causes drama, then blames the nearest person.' },
              { title: 'PROFESSIONAL DRAMA QUEEN', subtitle: 'Deserves an Oscar for every minor inconvenience.' },
              { title: 'CHIEF SNACK STEALER', subtitle: 'My food is their food. Their food is strictly off limits.' },
              { title: 'SELECTIVE HEARING MASTER', subtitle: 'Hears a whisper about snacks from 3 rooms away, but ignores my call.' },
              { title: 'EXPERT ARGUMENT WINNER', subtitle: 'Logic doesn\'t matter. They are right. Always.' },
              { title: 'ALARM CLOCK IGNORER', subtitle: 'Needs 15 alarms, 2 buckets of water, and a fire drill to wake up.' },
              { title: 'ALWAYS BY YOUR SIDE', subtitle: 'Through all the crazy adventures and memories.' }
            ]
          }
        },
        // Scene 06 — PERSONAL BIRTHDAY LETTER (3D Tactile Envelope & Handwriting)
        {
          name: '6. Personal Birthday Letter',
          template: 'special_letter_reveal',
          duration: 12,
          transition: 'fade',
          titleText: 'A Note From The Heart 💌',
          subtitleText: 'For You • Something I wanted to say.',
          settings: {
            envelopeTag: 'For You',
            envelopeSubtag: 'Something I wanted to say.',
            salutation: 'Dear {{recipientName}},',
            paragraphs: [
              'There are some things I don\'t say often enough.',
              'Life moves fast, and we spend so much time dealing with everyday chaos that I forget to remind you how much you truly mean to me.',
              'Watching you grow into the thoughtful, strong, and brilliant person you are today has been one of the greatest joys of my life.',
              'No matter how many miles away life takes us, or how old we get, you will always have someone in your corner, cheering for you through everything.',
              'Thank you for being such an incredible part of my life, a true friend, and a constant spark of brightness.'
            ],
            closing: 'With all my love,',
            finalSentence: 'Always in my thoughts and heart.',
            signature: '{{signature}}',
            buttonText: 'CONTINUE →'
          }
        },
        // Scene 07 — THE FAKE ENDING TWIST
        {
          name: '7. The Fake Ending Twist',
          template: 'special_fake_ending',
          duration: 8,
          transition: 'fade',
          titleText: 'Happy Birthday. ❤️',
          subtitleText: 'THE END... or is it?',
          settings: {
            line1: 'Happy Birthday, {{recipientName}}. ❤️',
            endText: 'THE END',
            twistLine1: 'Wait.',
            twistLine2: 'I forgot something.',
            twistLine3: '...',
            twistLine4: 'One last thing.'
          }
        },
        // Scene 08 — THE SECRET GIFT (3D Box Unboxing)
        {
          name: '8. Secret Gift Box',
          template: 'special_3d_gift_reveal',
          duration: 10,
          transition: 'fade',
          titleText: 'One Last Surprise 🎁',
          subtitleText: 'Tap to unbox your special surprise!',
          settings: {
            introLine1: 'One last thing...',
            introLine2: 'I almost forgot.',
            introLine3: 'This is for you.',
            promptText: 'Something is waiting for you.',
            buttonText: 'TAP TO OPEN',
            coldCoffeeTitle: 'A Special Cold Coffee Memory ☕',
            coldCoffeeCaption: 'Because some simple memories with you taste like home.'
          }
        },
        // Scene 09 — THE BIRTHDAY REVEAL (Climax with Fireworks & Confetti)
        {
          name: '9. The Birthday Reveal',
          template: 'special_birthday_reveal',
          duration: 10,
          transition: 'fade',
          titleText: 'HAPPY BIRTHDAY {{recipientName}}! 🎉',
          subtitleText: '{{date}} • Your day.',
          slots: { celebration_photo: 'photo1' },
          settings: {
            happyText: 'HAPPY',
            birthdayText: 'BIRTHDAY',
            nameText: '{{recipientName}}',
            heartText: '❤️',
            dateText: '{{date}}',
            tagline: 'Your day.',
            buttonText: 'CONTINUE →'
          }
        },
        // Scene 10 — BONUS MEMORIES
        {
          name: '10. Bonus Memories',
          template: 'special_bonus_memories',
          duration: 8,
          transition: 'fade',
          titleText: 'BONUS MEMORIES',
          subtitleText: 'Wait... there\'s more.',
          settings: {
            introLine1: 'Wait...',
            introLine2: 'There\'s more.',
            title: 'BONUS MEMORIES',
            buttonText: 'CONTINUE →',
            items: [
              { title: 'ADVENTURE & TRAVEL I', caption: 'Unforgettable journeys and late-night road talks.', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' },
              { title: 'THE UNFILTERED LAUGHS', caption: 'The moments when we laughed until our stomachs hurt.', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
              { title: 'SIBLING SHENANIGANS', caption: 'Every milestone and funny memory.', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' }
            ]
          }
        },
        // Scene 11 — HEARTFELT FINALE & CREDITS
        {
          name: '11. Final Message & Credits',
          template: 'special_emotional_finale',
          duration: 12,
          transition: 'fade',
          titleText: 'Always In My Corner',
          subtitleText: 'Always in my thoughts and heart.',
          slots: { final_photo: 'photo2' },
          settings: {
            openingLines: [
              'No matter how much time passes...',
              'No matter where life takes us...',
              'Some things never change.'
            ],
            finalLines: [
              'No matter where life takes us...',
              'You will always hold a special place in our hearts.',
              'And I will always be there.',
              'Happy Birthday.'
            ],
            personalMessage: 'Wishing you endless happiness, health, and success.',
            signature: '{{signature}}',
            endCredits: ['Made with ❤️', 'For {{recipientName}}'],
            replayButtonText: 'WATCH AGAIN ↺'
          }
        }
      ]
    }
  }),

  new Preset({
    id: 'super_preset',
    occasion: 'birthday',
    category: 'Birthday / Special Person',
    title: 'Super Preset',
    description: 'A cinematic birthday experience made for someone truly special.',
    icon: '✨',
    tags: ['Cinematic', 'Special Person', 'Emotional', 'Interactive', 'Story'],
    availableVariants: ['12-scene', 'story'],
    defaultVariant: '12-scene',
    theme: 'purple_gold',
    supportedPersonalizationFields: [
      'recipientName', 'senderName', 'occasion', 'birthdayDate', 'date', 'message', 'introMessage', 'photo1', 'photo2', 'photo3', 'music'
    ],
    fallbackContent: {
      recipientName: 'Someone Special',
      senderName: 'A Dear Friend',
      creatorName: 'A Dear Friend',
      occasion: 'Birthday',
      date: 'Today',
      birthdayDate: 'Today',
      introMessage: "Today isn't just another day...",
      message: 'Wishing you endless joy, laughter, and magical moments on your special day.',
      customMessage: 'Wishing you endless joy, laughter, and magical moments on your special day.',
      photo1: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
      photo2: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      photo3: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80'
    },
    sceneBlueprints: {
      '12-scene': [
        // Scene 01 — THE OPENING (Cinematic Intro)
        {
          name: 'The Opening',
          template: 'special_cinematic_intro',
          duration: 8,
          transition: 'fade',
          titleText: 'Happy Birthday, {{recipientName}}! ✨',
          subtitleText: 'Your story begins here.',
          settings: {
            titleText: 'Happy Birthday, {{recipientName}}! ✨',
            dateHeader: '{{date}}',
            line1: 'A day like any other...',
            line2: 'Except someone truly special came into this world.',
            line3: 'Happy Birthday, {{recipientName}}!',
            buttonText: 'YOUR STORY STARTS HERE ✨'
          }
        },
        // Scene 02 — THE SPECIAL DAY
        {
          name: 'The Special Day',
          template: 'reveal',
          duration: 7,
          transition: 'fade',
          titleText: 'Something Special is Waiting 🎉',
          subtitleText: 'Marking this unforgettable celebration for {{recipientName}}.',
          settings: {
            titleText: 'Something Special is Waiting 🎉',
            subtitleText: 'Marking this unforgettable celebration for {{recipientName}}.'
          }
        },
        // Scene 03 — WHY YOU ARE SPECIAL
        {
          name: 'Why You Are Special',
          template: 'special_cinematic_intro',
          duration: 8,
          transition: 'fade',
          titleText: 'SOME PEOPLE ENTER OUR LIVES...',
          subtitleText: '...and quietly make everything brighter. This celebration is for you, {{recipientName}}.',
          settings: {
            titleText: 'SOME PEOPLE ENTER OUR LIVES...',
            subtitleText: '...and quietly make everything brighter. This celebration is for you, {{recipientName}}.'
          }
        },
        // Scene 04 — THE BEGINNING
        {
          name: 'First Memory',
          template: 'special_childhood_memories',
          duration: 8,
          transition: 'fade',
          titleText: 'Where Our Story Began',
          subtitleText: 'Before I knew it... you became part of my world.',
          slots: { hero_photo: 'photo1' },
          settings: {
            yearText: 'THE BEGINNING',
            captionText: 'Before I knew it... you became part of my world.',
            titleText: 'Where Our Story Began',
            subtitleText: 'Before I knew it... you became part of my world.'
          }
        },
        // Scene 05 — CHERISHED MOMENTS
        {
          name: 'Cherished Moments',
          template: 'special_memory_sequence',
          duration: 8,
          transition: 'fade',
          titleText: 'Moments Become Memories',
          subtitleText: 'Looking back at all the laughter and adventures.',
          slots: { photo: 'photo2' },
          settings: {
            titleText: 'Moments Become Memories',
            subtitleText: 'Looking back at all the laughter and adventures.'
          }
        },
        // Scene 06 — CHAOS & LAUGHTER
        {
          name: 'Chaos & Laughter',
          template: 'special_chaos_montage',
          duration: 7,
          transition: 'fade',
          titleText: 'The Real You 😜',
          subtitleText: 'Because let’s be honest... you can be a little chaotic!',
          slots: { funny_photo: 'photo1' },
          settings: {
            titleText: 'The Real You 😜',
            subtitleText: 'Because let’s be honest... you can be a little chaotic!'
          }
        },
        // Scene 07 — A PERSONAL LETTER
        {
          name: 'A Personal Letter',
          template: 'special_letter_reveal',
          duration: 10,
          transition: 'fade',
          titleText: 'A Note From The Heart 💌',
          subtitleText: '{{message}}',
          settings: {
            letterBody: 'I don’t say this often enough, but having you in my life is one of the greatest gifts. On your birthday, I want you to know how proud I am of everything you are and everything you’re becoming.',
            signature: '— With all my love, {{senderName}}',
            titleText: 'A Note From The Heart 💌'
          }
        },
        // Scene 08 — THE FAKE ENDING
        {
          name: 'The Fake Ending',
          template: 'special_fake_ending',
          duration: 7,
          transition: 'fade',
          titleText: 'Happy Birthday. ❤️',
          subtitleText: 'THE END... or is it?',
          settings: {
            line1: 'Happy Birthday, {{recipientName}}. ❤️'
          }
        },
        // Scene 09 — SECRET GIFT BOX
        {
          name: 'Secret Gift Box',
          template: 'special_3d_gift_reveal',
          duration: 9,
          transition: 'fade',
          titleText: 'One Last Surprise 🎁',
          subtitleText: 'Tap to unbox your special surprise!',
          settings: {
            promptText: 'I almost forgot... This is for you. Tap to open!',
            titleText: 'One Last Surprise 🎁'
          }
        },
        // Scene 10 — THE BIG REVEAL
        {
          name: 'The Big Reveal',
          template: 'special_birthday_reveal',
          duration: 7,
          transition: 'fade',
          titleText: 'MAGIC MOMENT',
          subtitleText: 'Celebrating the incredible person you are!',
          settings: {
            titleText: 'MAGIC MOMENT',
            badgeText: '✨ {{recipientName}} ✨'
          }
        },
        // Scene 11 — GRAND CELEBRATION
        {
          name: 'Grand Fireworks Celebration',
          template: 'special_birthday_reveal',
          duration: 8,
          transition: 'fade',
          titleText: 'CHEERS TO YOU!',
          subtitleText: '{{recipientName}}',
          settings: {
            titleText: 'CHEERS TO YOU!',
            subtitleText: '{{recipientName}}'
          }
        },
        // Scene 12 — HEARTFELT FINALE
        {
          name: 'Heartfelt Finale',
          template: 'special_emotional_finale',
          duration: 10,
          transition: 'fade',
          titleText: 'Always in Our Hearts',
          subtitleText: 'May your next chapter be even more beautiful.',
          slots: { final_photo: 'photo2' },
          settings: {
            quoteText: 'No matter how much we grow...',
            messageText: 'You will always have someone cheering for you. Have the happiest birthday!',
            signature: '— Always with you, {{senderName}}',
            titleText: 'Always in Our Hearts',
            subtitleText: 'May your next chapter be even more beautiful.'
          }
        }
      ]
    }
  }),

  new Preset({
    id: 'birthday_party_welcome',
    occasion: 'birthday',
    category: 'Celebration',
    title: 'Welcome to the Party',
    description: 'A bright celebration designed to welcome everyone into the birthday experience.',
    icon: '🎉',
    tags: ['Bright', 'Festive', 'Celebration'],
    availableVariants: ['1-scene', '2-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'purple_gold',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Birthday Party',
      message: 'Welcome to the party! Let us celebrate a wonderful person today.'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Party Welcome', template: 'hero', duration: 8, titleText: 'Welcome to {{recipientName}}\'s Birthday Party! 🎉', subtitleText: 'From {{senderName}} • {{message}}' }
      ],
      '2-scene': [
        { name: 'Party Welcome', template: 'hero', duration: 6, titleText: 'Welcome to the Party! 🎉', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Birthday Wish', template: 'final_wish', duration: 8, titleText: 'Happy Birthday {{recipientName}}! 🎂', subtitleText: '{{message}}' }
      ],
      '3-scene': [
        { name: 'Party Welcome', template: 'hero', duration: 6, titleText: 'Welcome to {{recipientName}}\'s Celebration! 🎉', subtitleText: 'Let the party begin!' },
        { name: 'Birthday Memories', template: 'memory_timeline', duration: 8, titleText: 'Special Moments', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Grand Wish', template: 'final_wish', duration: 8, titleText: 'Happy Birthday {{recipientName}}! 🎂', subtitleText: 'With love from {{senderName}}' }
      ],
      '5-scene': [
        { name: 'Party Welcome', template: 'hero', duration: 6, titleText: 'Welcome to the Party! 🎉', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Birthday Reveal', template: 'reveal', duration: 6, titleText: 'Surprise! 🎂', subtitleText: 'Happy Birthday {{recipientName}}!' },
        { name: 'Memories', template: 'memory_timeline', duration: 8, titleText: 'Moments to Cherish', subtitleText: 'Memories of {{recipientName}}' },
        { name: 'Personal Note', template: 'message', duration: 7, titleText: 'A Birthday Message', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'Happy Birthday! 🎈', subtitleText: 'From {{senderName}}' }
      ]
    }
  }),

  new Preset({
    id: 'birthday_wisher',
    occasion: 'birthday',
    category: 'Personal',
    title: 'Birthday Wisher',
    description: 'A warm personal birthday greeting experience that scales from 1 scene to Story Mode.',
    icon: '🎂',
    tags: ['Warm', 'Personal', 'Heartfelt'],
    availableVariants: ['1-scene', '2-scene', '3-scene', '5-scene', 'story'],
    defaultVariant: '3-scene',
    theme: 'pink_rose',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Birthday',
      message: 'Wishing you a day filled with happiness and a year filled with joy!'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Birthday Greeting', template: 'hero', duration: 8, titleText: 'Happy Birthday {{recipientName}}! 🎂', subtitleText: '{{message}}' }
      ],
      '2-scene': [
        { name: 'Hero Greeting', template: 'hero', duration: 6, titleText: 'Happy Birthday {{recipientName}}! 🎁', subtitleText: 'Today is all about celebrating you.' },
        { name: 'Birthday Wish', template: 'final_wish', duration: 8, titleText: 'Best Wishes! 🌟', subtitleText: 'From {{senderName}} • {{message}}' }
      ],
      '3-scene': [
        { name: 'Hero Greeting', template: 'hero', duration: 6, titleText: 'Happy Birthday {{recipientName}}! 🎂', subtitleText: 'A special day for someone special.' },
        { name: 'Message', template: 'message', duration: 7, titleText: 'A Personal Note', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'Wishing You Joy Always! 💫', subtitleText: 'With love from {{senderName}}' }
      ],
      '5-scene': [
        { name: 'Opening', template: 'hero', duration: 6, titleText: 'Happy Birthday {{recipientName}}! 🎈', subtitleText: 'A celebration crafted with love' },
        { name: 'Birthday Reveal', template: 'reveal', duration: 6, titleText: 'Happy Birthday!', subtitleText: 'Wishing you magic today!' },
        { name: 'Memories', template: 'photo_gallery', duration: 8, titleText: 'Treasured Moments', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Personal Note', template: 'message', duration: 7, titleText: 'From the Heart', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'Have a Wonderful Year! 💖', subtitleText: 'From {{senderName}}' }
      ],
      'story': [
        { name: 'Opening Story', template: 'hero', duration: 6, titleText: 'The Story of {{recipientName}} 📖', subtitleText: 'Happy Birthday!' },
        { name: 'Grand Reveal', template: 'reveal', duration: 6, titleText: 'Happy Birthday! 🎉', subtitleText: 'Celebrating your milestone' },
        { name: 'Memories Timeline', template: 'memory_timeline', duration: 8, titleText: 'Through the Years', subtitleText: 'Unforgettable moments' },
        { name: 'Personal Message', template: 'message', duration: 7, titleText: 'A Special Message', subtitleText: '{{message}}' },
        { name: 'Wish Wall Scene', template: 'wish-wall', duration: 8, titleText: 'Messages of Love', subtitleText: 'Wishes sent for {{recipientName}}' },
        { name: 'Final Wish & Replay', template: 'final_wish', duration: 8, titleText: 'Happy Birthday {{recipientName}}! 🎂', subtitleText: 'Created with love by {{senderName}}' }
      ]
    }
  }),

  new Preset({
    id: 'birthday_note',
    occasion: 'birthday',
    category: 'Minimal',
    title: 'Birthday Note',
    description: 'A beautiful typography-focused minimal birthday note.',
    icon: '📝',
    tags: ['Minimal', 'Typography', 'Clean'],
    availableVariants: ['1-scene', '2-scene', '3-scene'],
    defaultVariant: '2-scene',
    theme: 'dark_gold',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Birthday',
      message: 'Wishing you peace, happiness, and success in everything you do.'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Minimal Note', template: 'message', duration: 8, titleText: 'Happy Birthday {{recipientName}}', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '2-scene': [
        { name: 'Opening Note', template: 'hero', duration: 6, titleText: 'Happy Birthday {{recipientName}}', subtitleText: 'A simple note for your special day' },
        { name: 'Personal Note', template: 'message', duration: 8, titleText: 'Wishing You The Best', subtitleText: '{{message}}\n\nWith love, {{senderName}}' }
      ],
      '3-scene': [
        { name: 'Opening Note', template: 'hero', duration: 6, titleText: 'Happy Birthday {{recipientName}}', subtitleText: 'Celebrating you today' },
        { name: 'Personal Message', template: 'message', duration: 7, titleText: 'A Special Note', subtitleText: '{{message}}' },
        { name: 'Closing Note', template: 'final_wish', duration: 7, titleText: 'Have a Great Year ahead', subtitleText: '— {{senderName}}' }
      ]
    }
  }),

  new Preset({
    id: 'birthday_memories',
    occasion: 'birthday',
    category: 'Memories',
    title: 'Birthday Memories',
    description: 'A photo-driven memory experience highlighting favorite photos and moments.',
    icon: '📸',
    tags: ['Photos', 'Memories', 'Visual'],
    availableVariants: ['3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'purple_gold',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Birthday Memories',
      message: 'Every photo tells a story of happiness shared with you.'
    },
    sceneBlueprints: {
      '3-scene': [
        { name: 'Memory Hero', template: 'hero', duration: 6, titleText: 'Happy Birthday {{recipientName}}! 📸', subtitleText: 'A collection of favorite moments' },
        { name: 'Photo Gallery', template: 'photo_gallery', duration: 8, titleText: 'Unforgettable Memories', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Memory Final Wish', template: 'final_wish', duration: 8, titleText: 'Here is to Many More Memories! 🥂', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '5-scene': [
        { name: 'Memory Hero', template: 'hero', duration: 6, titleText: 'Happy Birthday {{recipientName}}! 📸', subtitleText: 'Moments to remember' },
        { name: 'Collage', template: 'collage', duration: 7, titleText: 'Favorite Snapshots', subtitleText: 'Smiles & laughter' },
        { name: 'Timeline', template: 'memory_timeline', duration: 8, titleText: 'Through the Years', subtitleText: 'Celebrating your journey' },
        { name: 'Personal Note', template: 'message', duration: 7, titleText: 'A Special Message', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'Happy Birthday {{recipientName}}! 🎂', subtitleText: 'From {{senderName}}' }
      ]
    }
  })
];
