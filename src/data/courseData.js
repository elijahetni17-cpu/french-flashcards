// Content derived from the CE141 Basic French slide decks (Group Work, Weeks 2-6)
// and the dedicated Adjectifs Qualificatifs notes, plus quiz styles informed by
// real UMaT GL/EL/GM 142 past papers (2015, 2018, 2019, 2020).
//
// Two separate content shapes per concept:
//  - slides: a linear TEACHING sequence for Lecture mode. No questions, no flip.
//    Each slide is ONE idea or ONE example. kind: 'teach' (plain explanation) or
//    'example' (a single French example + its English meaning, both visible).
//  - cards: front/back RECALL drills for Test Retention / Flashcard Memorization
//    (unchanged Leitner-box mechanic).

let uid = 1;
const cid = () => `c${uid++}`;

function concept(title, slides, cards) {
  return { id: cid(), title, slides, cards };
}
function teach(text) {
  return { id: cid(), kind: "teach", text };
}
function example(french, english, note) {
  return { id: cid(), kind: "example", french, english, note };
}
function card(front, back) {
  return { id: cid(), front, back };
}

export const COURSE = [
  // ================================================================= FR-101
  {
    id: "verb-groups",
    code: "FR-101",
    week: "Group Project",
    title: "Verb Groups — Present Tense",
    subtitle: "Le présent de l'indicatif",
    subtopics: [
      {
        id: "group1",
        title: "Group 1 Verbs (-er)",
        concepts: [
          concept(
            "What makes a Group 1 verb",
            [
              teach("Group 1 verbs are the largest, most predictable family of French verbs. You can spot one instantly: its infinitive form ends in -er."),
              teach("Almost every -er verb follows exactly the same conjugation pattern, which is why French teachers usually start here."),
              example("parler", "to speak", "A textbook Group 1 verb — ends in -er, fully regular."),
              example("manger", "to eat"),
              example("regarder", "to watch / to look at"),
              example("aimer", "to like / to love"),
              teach("One important exception: 'aller' (to go) ends in -er but does NOT follow this pattern — it's irregular, so it belongs to Group 3, not Group 1."),
            ],
            [
              card("Which group does a verb belong to if its infinitive ends in -er and it's regular?", "Group 1 — the largest and most predictable verb family."),
              card("Is 'aller' a Group 1 verb, even though it ends in -er?", "No. 'Aller' is irregular, so it's treated as a Group 3 verb."),
              card("Name three Group 1 verbs.", "Any three of: parler, manger, regarder, aimer, jouer, danser, écouter, habiter."),
            ]
          ),
          concept(
            "Conjugating Group 1 verbs in the present tense",
            [
              teach("To conjugate any Group 1 verb, first drop the -er ending from the infinitive. What's left is called the stem."),
              teach("Then add one of these endings depending on the subject: -e, -es, -e, -ons, -ez, -ent."),
              example("je parle", "I speak", "Stem 'parl' + -e"),
              example("tu parles", "you speak (informal)", "Stem 'parl' + -es"),
              example("nous parlons", "we speak", "Stem 'parl' + -ons"),
              example("ils parlent", "they speak", "Stem 'parl' + -ent"),
              teach("Verbs like 'manger' add an extra 'e' before -ons (nous mangeons) purely so the 'g' keeps its soft sound — this is a spelling quirk, not a new rule."),
              example("nous mangeons", "we eat", "Extra 'e' keeps the 'g' soft — without it, 'mangons' would sound like a hard 'g'."),
            ],
            [
              card("Conjugate 'manger' for 'nous'.", "Nous mangeons — the extra 'e' keeps the 'g' sound soft."),
              card("What ending goes with 'tu'?", "-es → tu parles, tu danses, tu joues."),
              card("Conjugate 'aimer' for 'elle'.", "Elle aime."),
              card("Conjugate 'jouer' for 'ils'.", "Ils jouent."),
            ]
          ),
        ],
      },
      {
        id: "group2",
        title: "Group 2 Verbs (-ir)",
        concepts: [
          concept(
            "What makes a Group 2 verb",
            [
              teach("Group 2 verbs also end in -ir in the infinitive, but they're a smaller, very regular family with their own distinct pattern."),
              teach("The giveaway test: if the present participle ends in -issant, it's Group 2."),
              example("finir → finissant", "to finish → finishing", "The -issant ending confirms Group 2."),
              example("choisir", "to choose"),
              example("grandir", "to grow (up)"),
              example("obéir", "to obey"),
              teach("Compare that to a Group 3 verb like 'dormir' (to sleep), whose present participle is 'dormant', not 'dormissant' — that's how you tell the two -ir families apart."),
            ],
            [
              card("What test tells you a verb is Group 2, not Group 3?", "Check its present participle: -issant = Group 2 (e.g. finissant). Anything else = Group 3."),
              card("Name three Group 2 verbs.", "Any three of: finir, choisir, grandir, obéir, remplir, réussir, bâtir."),
            ]
          ),
          concept(
            "Conjugating Group 2 verbs in the present tense",
            [
              teach("Drop -ir from the infinitive to get the stem, then add: -is, -is, -it, -issons, -issez, -issent."),
              teach("Notice the '-iss-' only appears in the plural forms (nous, vous, ils/elles) — the singular forms are shorter."),
              example("je finis", "I finish", "Stem 'fin' + -is"),
              example("il finit", "he finishes", "Stem 'fin' + -it"),
              example("vous finissez", "you finish (formal/plural)", "Stem 'fin' + -issez"),
              example("ils choisissent", "they choose", "Stem 'chois' + -issent"),
            ],
            [
              card("Conjugate 'finir' for 'vous'.", "Vous finissez."),
              card("Conjugate 'choisir' for 'il/elle'.", "Il/elle choisit."),
              card("Which forms include the '-iss-' part of the stem?", "Only the plural forms: nous, vous, ils/elles."),
            ]
          ),
        ],
      },
      {
        id: "group3",
        title: "Group 3 Verbs (irregular)",
        concepts: [
          concept(
            "What makes a Group 3 verb",
            [
              teach("Group 3 is the 'everything else' category — irregular verbs that don't follow the Group 1 or Group 2 patterns."),
              teach("They come in several infinitive shapes: -ir verbs like partir and dormir, -re verbs like vendre and attendre, and -oir verbs like pouvoir and vouloir."),
              teach("Because there's no single shared rule, each Group 3 verb largely has to be learned on its own — but a handful of them (aller, faire, être, avoir, venir, prendre) come up constantly, so they're worth memorizing first."),
              example("aller", "to go", "Ends in -er but is irregular — a Group 3 exception."),
              example("faire", "to do / to make"),
              example("venir", "to come"),
              example("prendre", "to take"),
            ],
            [
              card("Why can't you apply the Group 2 '-issons' pattern to 'dormir'?", "Because 'dormir' is Group 3 — its present participle is 'dormant', not '-issant'."),
              card("Name the three infinitive endings you'll find inside Group 3.", "-ir (partir, dormir), -re (vendre, attendre), -oir (pouvoir, vouloir)."),
              card("Which 6 Group 3 verbs are worth memorizing first because they're so common?", "aller, faire, être, avoir, venir, prendre."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "Which group does 'regarder' belong to?", options: ["Group 1", "Group 2", "Group 3"], answer: "Group 1" },
      { type: "mc", q: "Which group does 'vendre' belong to?", options: ["Group 1", "Group 2", "Group 3"], answer: "Group 3", qLang: "en" },
      { type: "mc", q: "What is the present-participle test for Group 2?", options: ["Ends in -ant", "Ends in -issant", "Ends in -u"], answer: "Ends in -issant", qLang: "en" },
      { type: "fill", q: "Nous ___ (jouer) au foot le samedi.", answer: "jouons" },
      { type: "fill", q: "Tu ___ (choisir) ton programme d'étude.", answer: "choisis" },
      { type: "fill", q: "Ils ___ (regarder) la télévision.", answer: "regardent" },
      { type: "complete", q: "Vous ___ ___ (remplir) le formulaire d'identité.", answer: "remplissez" },
      { type: "complete", q: "Je ___ ___ (aimer) le riz et les mangues.", answer: "aime" },
      { type: "complete", q: "Elle ___ ___ (grandir) vite.", answer: "grandit" },
    ],
  },

  // ================================================================= FR-102
  {
    id: "week2",
    code: "FR-102",
    week: "Week 2",
    title: "Se Présenter & Fondamentaux",
    subtitle: "Introductions, l'alphabet, la formation des mots",
    subtopics: [
      {
        id: "se-presenter",
        title: "Introducing Yourself & Others",
        concepts: [
          concept(
            "Key phrases to introduce yourself",
            [
              teach("When you meet someone in French, the very first thing you usually give is your name."),
              example("Je m'appelle Francis.", "My name is Francis.", "Literally 'I call myself Francis' — the standard way to give your name."),
              teach("From there, you can add your age, where you live, and what you study — each in its own short sentence."),
              example("J'ai 22 ans.", "I am 22 years old.", "Note: French uses 'avoir' (to have) for age, not 'être' (to be)."),
              example("J'habite à Essikado.", "I live in Essikado."),
              example("J'étudie le Génie Minier à UMaT.", "I study Mining Engineering at UMaT."),
            ],
            [
              card("How do you give your name in French?", "Je m'appelle... (My name is...)"),
              card("Why does French say 'J'ai 22 ans' instead of 'I am 22'?", "French uses avoir (to have) for age — literally 'I have 22 years'."),
              card("How would you say 'I study engineering'?", "J'étudie l'ingénierie."),
            ]
          ),
          concept(
            "Introducing someone else",
            [
              teach("To introduce a friend instead of yourself, you switch every verb from the 'je' form to the 'il' or 'elle' form."),
              example("Il s'appelle Kwame.", "His name is Kwame.", "Same pattern as 'je m'appelle', just with 'il'."),
              example("Elle a 25 ans.", "She is 25 years old."),
              example("Elle habite à Bolgatanga.", "She lives in Bolgatanga."),
              example("Il étudie l'ingénierie pétrolière.", "He studies petroleum engineering."),
            ],
            [
              card("What changes grammatically when you introduce someone else instead of yourself?", "You switch from 'je' forms to 'il/elle' forms throughout: je m'appelle → il/elle s'appelle, j'ai → il/elle a."),
              card("Fill in: '___ étudie l'ingénierie' (about a male friend).", "Il étudie l'ingénierie."),
            ]
          ),
          concept(
            "La fiche d'identité (ID form)",
            [
              teach("A 'fiche d'identité' is a short personal-details form — the kind you'd fill in on your first day of a course."),
              teach("It typically asks for these fields, in this order: Nom, Prénom(s), Âge, Nationalité, Profession, Programme d'étude, État civil."),
              example("Nom: Addo. Prénom: Juliet.", "Surname: Addo. First name: Juliet.", "Nom = surname, Prénom = first name — the reverse order from English forms."),
              example("État civil: Célibataire.", "Marital status: Single."),
              example("Programme d'étude: Génie Minier.", "Course of study: Mining Engineering."),
            ],
            [
              card("What fields appear on a fiche d'identité?", "Nom, Prénom(s), Âge, Nationalité, Profession, Programme d'étude, État civil."),
              card("What does 'Programme d'étude' ask for?", "Your course/programme of study."),
              card("Which French word means 'surname', Nom or Prénom?", "Nom — Prénom is your first name."),
            ]
          ),
        ],
      },
      {
        id: "alphabet",
        title: "Alphabet & Word Formation",
        concepts: [
          concept(
            "Consonants and vowels",
            [
              teach("French has the same 26 letters as English, but only six of them are 'les voyelles' (vowels): a, e, i, o, u, y. Every other letter is a consonant."),
              teach("A syllable is usually built by pairing a consonant with a vowel."),
              example("M + a = Ma", "Ma", "Consonant + vowel = one syllable."),
              example("V + i = Vi", "Vi"),
              example("F + a + t + i = Fati", "Fati", "Two consonant-vowel pairs chained together make a two-syllable name."),
            ],
            [
              card("Which letters are 'les voyelles' in French?", "a, e, i, o, u, y — all other letters are consonants."),
              card("Combine 'V' and 'i' — what syllable results?", "Vi."),
            ]
          ),
          concept(
            "Common vowel-sound combinations",
            [
              teach("French groups certain letters together to make a single sound — you have to learn these combinations as units, not letter by letter."),
              example("jaune", "yellow", "'au' makes a closed 'o' sound."),
              example("chauffeur", "driver", "Same 'au' → 'o' sound."),
              example("bateau", "boat", "'eau' also makes that closed 'o' sound."),
              example("enfant", "child", "'en' makes a nasal 'an' sound."),
              example("poids", "weight", "'oi' makes a 'wa' sound."),
            ],
            [
              card("What sound do 'au' and 'eau' share?", "Both make a closed 'o' sound — e.g. jaune, bateau, cadeau."),
              card("Give one word containing the nasal 'an' sound.", "e.g. enfant, pendant, chant — any one of these."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "'Je m'appelle Francis' means:", options: ["My name is Francis", "I am from Francis", "I like Francis"], answer: "My name is Francis", qLang: "en" },
      { type: "mc", q: "Which is the correct third-person form of 'j'ai 22 ans'?", options: ["il a 22 ans", "il as 22 ans", "il ai 22 ans"], answer: "il a 22 ans", qLang: "en" },
      { type: "mc", q: "Which letter is a voyelle?", options: ["b", "y", "t"], answer: "y", qLang: "en" },
      { type: "fill", q: "Mon nom de famille ___ Yankey.", answer: "est" },
      { type: "fill", q: "Elle ___ (habiter) à Bolga.", answer: "habite" },
      { type: "fill", q: "Quel est votre ___ d'étude?", answer: "programme" },
      { type: "complete", q: "Il ___ ___ 25 ans. (avoir)", answer: "a" },
      { type: "complete", q: "Je suis ___ ___. (unmarried, masculine)", answer: "célibataire", qLang: "en" },
      { type: "complete", q: "F + a + t + i = ___", answer: "Fati", qLang: "en" },
    ],
  },

  // ================================================================= FR-103
  {
    id: "week3",
    code: "FR-103",
    week: "Week 3",
    title: "Passé Composé — Fondations",
    subtitle: "Participes passés, être vs avoir, VANDERTRAMP",
    subtopics: [
      {
        id: "participles-by-group",
        title: "Past Participles by Verb Group",
        concepts: [
          concept(
            "Group 1 past participles (-é)",
            [
              teach("The passé composé needs a 'past participle' for every verb. For Group 1 (-er) verbs, this is the easiest group: drop -er and add -é."),
              example("parler → parlé", "spoken", "Drop -er, add -é."),
              example("chanter → chanté", "sung"),
              example("danser → dansé", "danced"),
              example("jouer → joué", "played"),
              example("manger → mangé", "eaten"),
            ],
            [
              card("How do Group 1 verbs form their past participle?", "Drop -er, add -é. e.g. parler → parlé."),
              card("Form the past participle of 'jouer'.", "joué."),
              card("Form the past participle of 'écouter'.", "écouté."),
            ]
          ),
          concept(
            "Group 2 past participles (-i)",
            [
              teach("Group 2 (-ir) verbs are almost as easy: drop -ir and add -i."),
              example("finir → fini", "finished", "Drop -ir, add -i."),
              example("choisir → choisi", "chosen"),
              example("obéir → obéi", "obeyed"),
              example("grandir → grandi", "grown"),
            ],
            [
              card("How do Group 2 verbs form their past participle?", "Drop -ir, add -i. e.g. finir → fini."),
              card("Form the past participle of 'bâtir'.", "bâti."),
            ]
          ),
          concept(
            "Group 3 past participles (irregular)",
            [
              teach("Group 3 verbs don't follow a fixed rule for their past participle — each one has to be learned individually. These come up so often that it's worth memorizing them as a small vocabulary list."),
              example("voir → vu", "seen"),
              example("faire → fait", "done / made"),
              example("prendre → pris", "taken"),
              example("écrire → écrit", "written"),
              example("dire → dit", "said"),
              example("lire → lu", "read"),
              example("savoir → su", "known"),
            ],
            [
              card("What is the past participle of 'prendre'?", "pris."),
              card("What is the past participle of 'écrire'?", "écrit."),
              card("What is the past participle of 'voir'?", "vu."),
              card("What is the past participle of 'savoir'?", "su."),
            ]
          ),
        ],
      },
      {
        id: "etre-vs-avoir",
        title: "Être vs Avoir",
        concepts: [
          concept(
            "Choosing the auxiliary verb",
            [
              teach("Every passé composé sentence needs a 'helper' verb (auxiliary) before the past participle — and French uses one of two: avoir or être."),
              teach("The default, used by the vast majority of verbs, is avoir."),
              example("J'ai mangé du riz.", "I ate rice.", "Manger takes avoir — the default choice."),
              example("Elle a terminé son travail.", "She finished her work.", "Terminer also takes avoir."),
              teach("Être is reserved for a small, fixed set of movement/state verbs (the VANDERTRAMP list, covered next) plus all reflexive verbs (se laver, se coucher, etc.)."),
              example("Mon père est parti.", "My father left.", "Partir is one of the small être-taking verbs."),
            ],
            [
              card("What auxiliary do most passé composé verbs use?", "Avoir — être is reserved for a small fixed list plus reflexive verbs."),
              card("Which auxiliary does 'terminer' take?", "Avoir — it's a regular verb, not on the être list."),
              card("\"J'ai mangé\" vs \"Mon père est parti\" — why the difference?", "Manger takes avoir (the default); partir is one of the special être-taking verbs."),
            ]
          ),
        ],
      },
      {
        id: "vandertramp",
        title: "The VANDERTRAMP Verbs",
        concepts: [
          concept(
            "What DR & MRS VANDERTRAMP stands for",
            [
              teach("DR & MRS VANDERTRAMP is a memory trick (a mnemonic). Each letter is the first letter of one of the ~16 French verbs that take être instead of avoir in the passé composé."),
              teach("These verbs mostly describe movement from one place to another, or a change of state — think 'coming, going, arriving, leaving, being born, dying'."),
              teach("Let's go through the full list, one letter at a time, so it's easy to hold in your head."),
              example("Devenir", "to become", "D — first letter of the mnemonic."),
              example("Revenir", "to come back"),
              example("Monter", "to go up / climb"),
              example("Retourner", "to return"),
              example("Sortir", "to go out"),
              example("Venir", "to come"),
              example("Aller", "to go"),
              example("Naître", "to be born"),
              example("Descendre", "to go down"),
              example("Entrer", "to enter"),
              example("Rentrer", "to go back home"),
              example("Tomber", "to fall"),
              example("Rester", "to stay"),
              example("Arriver", "to arrive"),
              example("Mourir", "to die"),
              example("Partir", "to leave"),
              teach("That's the full set. Notice most of them are about movement in or out of a place, or a life event (born/die/stay) — that shared theme is what makes them 'special' enough to need être."),
            ],
            [
              card("What does the mnemonic DR & MRS VANDERTRAMP help you remember?", "The ~16 French verbs that take être (not avoir) in passé composé."),
              card("Which VANDERTRAMP verb means 'to be born'?", "Naître."),
              card("Which VANDERTRAMP verb means 'to fall'?", "Tomber."),
              card("Which VANDERTRAMP verb means 'to stay'?", "Rester."),
              card("Name the VANDERTRAMP verb that means 'to go up'.", "Monter."),
            ]
          ),
          concept(
            "Using VANDERTRAMP verbs in real sentences",
            [
              teach("In a sentence, a VANDERTRAMP verb looks like: subject + être (conjugated) + past participle."),
              example("Le garçon est tombé par terre.", "The boy fell down.", "Tomber → est tombé (with il/le garçon)."),
              example("Mes parents sont arrivés hier.", "My parents arrived yesterday.", "Arriver → sont arrivés (with ils/mes parents)."),
              example("Elle est née à Accra.", "She was born in Accra.", "Naître → est née."),
              example("Nous sommes rentrés tard.", "We went back home late.", "Rentrer → sommes rentrés."),
              example("Il est resté à la maison.", "He stayed home.", "Rester → est resté."),
            ],
            [
              card("Conjugate 'tomber' for 'le garçon' (masculine singular).", "Le garçon est tombé."),
              card("Conjugate 'arriver' for 'mes parents' (masculine plural).", "Mes parents sont arrivés."),
              card("Conjugate 'naître' for 'elle'.", "Elle est née."),
            ]
          ),
          concept(
            "Verbs that are NOT VANDERTRAMP",
            [
              teach("It's just as useful to know which common verbs are NOT on this list, because they take avoir instead — it's a common exam trap to assume a movement-sounding verb is VANDERTRAMP when it isn't."),
              example("manger — J'ai mangé.", "to eat — I ate.", "Not VANDERTRAMP: takes avoir."),
              example("parler — Il a parlé.", "to speak — He spoke.", "Not VANDERTRAMP: takes avoir."),
              example("voir — Nous avons vu.", "to see — We saw.", "Not VANDERTRAMP, even though it sounds like an action verb."),
              example("acheter — Elle a acheté.", "to buy — She bought.", "Not VANDERTRAMP: takes avoir."),
              teach("Quick test: if the verb isn't one of the 16 you just learned, and it isn't reflexive (doesn't start with 'se'), it takes avoir by default."),
            ],
            [
              card("Which verb below does NOT take être: descendre, manger, ou sortir?", "Manger — it's not on the VANDERTRAMP list."),
              card("True or false: 'voir' is a VANDERTRAMP verb.", "False — voir takes avoir."),
              card("What's the quick test for whether a verb takes avoir by default?", "If it's not on the VANDERTRAMP list and isn't reflexive, it takes avoir."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "Past participle of 'lire'?", options: ["li", "lu", "lit"], answer: "lu" },
      { type: "mc", q: "Which verb does NOT take être?", options: ["sortir", "manger", "descendre"], answer: "manger", qLang: "en" },
      { type: "mc", q: "Past participle of 'écrire'?", options: ["écri", "écrit", "écru"], answer: "écrit" },
      { type: "mc", q: "Which of these is a VANDERTRAMP verb?", options: ["parler", "naître", "acheter"], answer: "naître", qLang: "en" },
      { type: "fill", q: "Past participle of 'danser': ___", answer: "dansé" },
      { type: "fill", q: "Past participle de 'vendre': ___", answer: "vendu" },
      { type: "fill", q: "Past participle de 'voir': ___", answer: "vu" },
      { type: "complete", q: "Elle est ___ ___ hier soir. (rentrer)", answer: "rentrée" },
      { type: "complete", q: "Ils sont ___ ___ à midi. (arriver)", answer: "arrivés" },
    ],
  },

  // ================================================================= FR-104
  {
    id: "week4",
    code: "FR-104",
    week: "Week 4",
    title: "Passé Composé — Être & Réfléchis",
    subtitle: "L'accord du participe passé, les verbes pronominaux",
    subtopics: [
      {
        id: "etre-agreement",
        title: "Agreement with Être Verbs",
        concepts: [
          concept(
            "Gender and number agreement",
            [
              teach("When a passé composé verb uses être, its past participle behaves a bit like an adjective: it changes to match the subject's gender and number."),
              teach("The pattern: add -e for feminine, -s for plural, -es for feminine plural. Masculine singular stays unchanged."),
              example("Le garçon est tombé.", "The boy fell.", "Masculine singular — no change."),
              example("La fille est tombée.", "The girl fell.", "Feminine singular — add -e."),
              example("Les garçons sont tombés.", "The boys fell.", "Masculine plural — add -s."),
              example("Les filles sont tombées.", "The girls fell.", "Feminine plural — add -es."),
            ],
            [
              card("How does a passé composé verb agree when conjugated with être?", "It matches the subject: add -e (feminine), -s (plural), -es (feminine plural)."),
              card("\"Mes sœurs sont venues hier\" — why the -es?", "The subject 'mes sœurs' is feminine plural, so 'venu' becomes 'venues'."),
              card("Conjugate 'tomber' for 'les filles'.", "Les filles sont tombées."),
            ]
          ),
        ],
      },
      {
        id: "reflexive",
        title: "Reflexive Verbs (les pronominaux)",
        concepts: [
          concept(
            "Reflexive verbs always take être",
            [
              teach("A reflexive verb is one where the subject does the action to themselves — you can spot them by the 'se' in front of the infinitive: se laver, se coucher, se réveiller."),
              teach("No matter what the verb means, every reflexive verb takes être in the passé composé — there's no exception here, unlike the VANDERTRAMP list."),
              example("se laver → je me suis lavé(e)", "to wash oneself → I washed myself", "Reflexive pronoun + être + participle."),
              example("se coucher → il s'est couché", "to go to bed → he went to bed"),
              example("se réveiller → elle s'est réveillée", "to wake up → she woke up"),
            ],
            [
              card("What auxiliary do reflexive verbs always take?", "Être — always, regardless of the verb's meaning."),
              card("Conjugate 'se réveiller' for 'elle'.", "Elle s'est réveillée."),
            ]
          ),
          concept(
            "Full conjugation pattern: se laver",
            [
              teach("Here's the complete pattern so you can see how the reflexive pronoun changes with each subject, while 'être' and the agreement rule stay the same."),
              example("je me suis lavé(e)", "I washed myself"),
              example("tu t'es lavé(e)", "you washed yourself"),
              example("il s'est lavé / elle s'est lavée", "he/she washed themself"),
              example("nous nous sommes lavés/lavées", "we washed ourselves"),
              example("vous vous êtes lavé(e)(s)", "you washed yourself/yourselves"),
              example("ils/elles se sont lavés/lavées", "they washed themselves"),
            ],
            [
              card("What is the full passé composé pattern for a reflexive verb?", "reflexive pronoun + être + past participle: je me suis lavé(e), tu t'es lavé(e), il/elle s'est lavé(e)..."),
              card("Conjugate the 'vous' form of 's'habiller'.", "Vous vous êtes habillé(e)(s)."),
              card("Conjugate 'se rencontrer' for 'ils'.", "Ils se sont rencontrés."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "'Les étudiants se sont ___ tard.' (se coucher)", options: ["couché", "couchés", "couchée"], answer: "couchés" },
      { type: "mc", q: "Reflexive verbs in passé composé always take:", options: ["avoir", "être", "either"], answer: "être", qLang: "en" },
      { type: "mc", q: "'Ma mère et ma tante se sont beaucoup ___.' (se promener)", options: ["promenée", "promenés", "promenées"], answer: "promenées" },
      { type: "fill", q: "Elle s'est ___ (s'habiller) avant le cours.", answer: "habillée" },
      { type: "fill", q: "Les garçons sont ___ (tomber) par terre.", answer: "tombés" },
      { type: "fill", q: "Nous nous sommes ___ (se réveiller) tôt.", answer: "réveillés" },
      { type: "complete", q: "La femme est ___ ___ au Ghana. (naître)", answer: "née" },
      { type: "complete", q: "Je suis ___ ___ dans un trou. (tomber, speaker is female)", answer: "tombée" },
      { type: "complete", q: "Ils se sont ___ ___ pour la première fois. (se rencontrer)", answer: "rencontrés" },
    ],
  },

  // ================================================================= FR-105
  {
    id: "week5",
    code: "FR-105",
    week: "Week 5",
    title: "Adjectifs Qualificatifs",
    subtitle: "L'accord des adjectifs en genre et en nombre",
    subtopics: [
      {
        id: "what-and-why",
        title: "What Adjectives Do, and Why They Change",
        concepts: [
          concept(
            "Adjectives describe, and they agree",
            [
              teach("An 'adjectif qualificatif' gives information about a noun or pronoun — describing a person, an object, or an idea."),
              teach("The single most important rule in this whole topic: a French adjective must agree with the noun it describes, in both gender (masculine/feminine) and number (singular/plural)."),
              teach("That means the SAME adjective can be spelled up to four different ways depending on who or what it's describing."),
              example("Kwame est grand.", "Kwame is tall.", "Masculine singular — base form."),
              example("Ama est grande.", "Ama is tall.", "Feminine singular — add -e."),
              example("Kwame et Kofi sont grands.", "Kwame and Kofi are tall.", "Masculine plural — add -s."),
              example("Ama et Akua sont grandes.", "Ama and Akua are tall.", "Feminine plural — add -es."),
            ],
            [
              card("What two things must a French adjective agree with?", "Gender (masculine/feminine) and number (singular/plural) of the noun it describes."),
              card("How many different spellings can one adjective have?", "Up to four: masculine singular, feminine singular, masculine plural, feminine plural."),
            ]
          ),
        ],
      },
      {
        id: "basic-feminine-rule",
        title: "The General Rule: Add -e",
        concepts: [
          concept(
            "Add -e to the masculine form",
            [
              teach("For most adjectives, the feminine is formed simply by adding -e to the masculine form. This is the default rule — try it first before reaching for an exception."),
              example("grand → grande", "tall", "Kwame est grand. / Ama est grande."),
              example("petit → petite", "small", "Le petit garçon va à l'école. / La petite fille va à l'école."),
              example("fort → forte", "strong", "Mohammed Ali est très fort. / Laila Ali est très forte."),
              example("intelligent → intelligente", "intelligent"),
              example("content → contente", "happy / pleased"),
            ],
            [
              card("What's the general rule for forming the feminine of an adjective?", "Add -e to the masculine form: grand → grande, petit → petite."),
              card("Feminine of 'content'?", "contente."),
              card("Feminine of 'fort'?", "forte."),
            ]
          ),
          concept(
            "Adjectives already ending in -e stay the same",
            [
              teach("If an adjective already ends in -e in the masculine, the feminine form is identical — you don't add a second -e."),
              example("jeune → jeune", "young", "Mon frère est jeune. / Ma sœur est jeune."),
              example("rouge → rouge", "red", "Elle porte un pantalon rouge. / Elle porte une chemise rouge."),
              example("mince → mince", "slim"),
              example("drôle → drôle", "funny", "Martin est drôle. / Miriam est drôle."),
            ],
            [
              card("What happens to adjectives that already end in -e in the masculine?", "They stay identical in the feminine — e.g. jeune → jeune."),
              card("Feminine of 'rouge'?", "rouge (no change)."),
            ]
          ),
          concept(
            "Adjectives ending in -é still add -e",
            [
              teach("Don't confuse this with the previous rule — an accented -é is not the same letter as a plain -e, so these adjectives still follow the general +e rule."),
              teach("A useful way to remember it: 'é' and 'e' look similar but are different letters in French spelling, so the -e-ending exception simply doesn't apply here."),
              example("marié → mariée", "married", "Joseph est marié. / Emelia est mariée."),
              example("enchanté → enchantée", "delighted", "James est enchanté de me voir. / Dora est enchantée de me voir."),
              example("fatigué → fatiguée", "tired", "Il est fatigué après le travail. / Elle est fatiguée après le travail."),
            ],
            [
              card("Does an adjective ending in -é (like 'marié') still add -e for the feminine?", "Yes — marié → mariée. The accent doesn't exempt it from the general rule."),
              card("Feminine of 'fatigué'?", "fatiguée."),
              card("Feminine of 'enchanté'?", "enchantée."),
            ]
          ),
        ],
      },
      {
        id: "pattern-endings",
        title: "Predictable Ending Patterns",
        concepts: [
          concept(
            "-on becomes -onne",
            [
              teach("When a masculine adjective ends in -on, the feminine doubles the 'n' and adds -e."),
              example("bon → bonne", "good", "C'est un bon devoir. / Elle a eu une bonne note."),
              example("mignon → mignonne", "cute", "Le bébé est mignon. / Joyceline est vraiment mignonne."),
              example("Le garçon est bon en français.", "The boy is good at French.", "Masculine form in a full sentence."),
              example("La fille est bonne en français.", "The girl is good at French.", "Feminine form: bonne, in a full sentence."),
            ],
            [
              card("How does -on change in the feminine?", "Double the 'n' and add -e: bon → bonne, mignon → mignonne."),
              card("Feminine of 'bon'?", "bonne."),
              card("Feminine of 'mignon'?", "mignonne."),
            ]
          ),
          concept(
            "-eux becomes -euse",
            [
              teach("Masculine adjectives ending in -eux switch to -euse in the feminine."),
              example("heureux → heureuse", "happy", "Le garçon est heureux. / La fille est heureuse."),
              example("sérieux → sérieuse", "serious", "Mensah est sérieux avec son travail. / Francine est sérieuse avec son travail."),
              example("joyeux → joyeuse", "joyful"),
              example("peureux → peureuse", "fearful"),
            ],
            [
              card("How do adjectives ending in -eux change in the feminine?", "-eux → -euse: heureux → heureuse, sérieux → sérieuse."),
              card("Feminine of 'peureux'?", "peureuse."),
            ]
          ),
          concept(
            "-er becomes -ère",
            [
              teach("Masculine adjectives ending in -er take a grave accent and become -ère in the feminine."),
              example("étranger → étrangère", "foreign / stranger"),
              example("particulier → particulière", "particular"),
              example("boulanger → boulangère", "baker", "This pattern also applies to many professions ending in -er."),
              example("Il est étranger ici.", "He is a stranger here.", "Masculine in a sentence."),
              example("Elle est étrangère ici.", "She is a stranger here.", "Feminine in a sentence: étrangère."),
            ],
            [
              card("How does -er change in the feminine?", "-er → -ère: étranger → étrangère, boulanger → boulangère."),
              card("Feminine of 'particulier'?", "particulière."),
            ]
          ),
          concept(
            "-if becomes -ive",
            [
              teach("Masculine adjectives ending in -if switch the 'f' to 'v' and add -e."),
              example("actif → active", "active"),
              example("agressif → agressive", "aggressive"),
              example("productif → productive", "productive"),
              example("Le vendeur est actif.", "The salesman is active.", "Masculine in a sentence."),
              example("La vendeuse est active.", "The saleswoman is active.", "Feminine in a sentence: active."),
            ],
            [
              card("How does -if change in the feminine?", "-if → -ive: actif → active, agressif → agressive."),
              card("Feminine of 'productif'?", "productive."),
            ]
          ),
          concept(
            "-c becomes -que",
            [
              teach("A smaller pattern, but worth knowing: masculine adjectives ending in -c change to -que."),
              example("public → publique", "public", "C'est un spectacle public. / C'est une célébration publique."),
              example("laïc → laïque", "secular", "Le Ghana est un pays laïc. / Le PTC est une organisation laïque."),
              example("Le jardin est public.", "The garden is public.", "Masculine in a sentence."),
              example("La plage est publique.", "The beach is public.", "Feminine in a sentence: publique."),
            ],
            [
              card("How does -c change in the feminine?", "-c → -que: public → publique, laïc → laïque."),
              card("Feminine of 'laïc'?", "laïque."),
              card("Feminine of 'public'?", "publique."),
            ]
          ),
        ],
      },
      {
        id: "irregular-set",
        title: "The Irregular Set to Memorize",
        concepts: [
          concept(
            "Five irregular endings",
            [
              teach("A handful of common adjectives don't fit any pattern above and just have to be memorized as a set. Here they are, one at a time."),
              example("beau → belle", "beautiful / handsome", "-eau → -elle. Elle est belle, une rose."),
              example("nouveau → nouvelle", "new", "Same -eau → -elle pattern."),
              example("vieux → vieille", "old", "-ieux → -ieille — note this looks similar to the -eux/-euse pattern but is NOT the same."),
              example("blanc → blanche", "white", "-anc → -anche."),
              example("gros → grosse", "big / fat", "-os → -osse. Je ne suis pas mince, je suis grosse."),
              example("gentil → gentille", "kind", "-il → -ille. La mécanicienne est gentille."),
            ],
            [
              card("Feminine of 'beau'?", "belle."),
              card("Feminine of 'vieux'?", "vieille — not the same pattern as heureux → heureuse, even though it looks similar."),
              card("Feminine of 'blanc'?", "blanche."),
              card("Feminine of 'gros'?", "grosse."),
              card("Feminine of 'gentil'?", "gentille."),
            ]
          ),
        ],
      },
      {
        id: "professions",
        title: "Feminine Forms of Professions",
        concepts: [
          concept(
            "The default: add -e",
            [
              teach("Most professions follow the same default rule as ordinary adjectives — just add -e."),
              example("un avocat → une avocate", "a lawyer", "Tsatsu Tsikata est un avocat. / Georgina Theodora Woode est une avocate."),
              example("un marchand → une marchande", "a merchant", "Kofi Mankata est un marchand de chaussures. / Alice Bofa est une marchande de vêtements."),
              teach("And just like ordinary adjectives, professions that already end in -e don't change at all."),
              example("un/une journaliste", "a journalist", "Same word for both genders."),
              example("un/une artiste", "an artist", "Same word for both genders."),
            ],
            [
              card("What's the default rule for the feminine of a profession?", "Add -e, same as ordinary adjectives: avocat → avocate."),
              card("Does 'journaliste' change for the feminine?", "No — it already ends in -e, so it stays the same for both genders."),
            ]
          ),
          concept(
            "Special profession endings",
            [
              teach("A few profession endings have their own dedicated pattern, separate from the ordinary adjective rules."),
              example("chanteur → chanteuse", "singer", "-eur → -euse."),
              example("directeur → directrice", "director", "-teur → -trice."),
              example("boulanger → boulangère", "baker", "-er → -ère, same as the ordinary adjective pattern."),
              example("musicien → musicienne", "musician", "-ien → -ienne."),
            ],
            [
              card("What's the feminine ending pattern for professions ending in -eur (not -teur)?", "-eur → -euse: chanteur → chanteuse."),
              card("What's the feminine ending pattern for professions ending in -teur?", "-teur → -trice: directeur → directrice."),
              card("What's the feminine ending pattern for professions ending in -ien?", "-ien → -ienne: musicien → musicienne."),
            ]
          ),
        ],
      },
      {
        id: "plural-agreement",
        title: "Agreement in the Plural",
        concepts: [
          concept(
            "Adding -s or -es for the plural",
            [
              teach("Once you have the correct gendered form, pluralizing is usually just adding -s (or keeping -es if the feminine already ends in -e plus a consonant pattern)."),
              example("L'enfant est joyeux. → Les enfants sont joyeux.", "The child is joyful. → The children are joyful.", "Masculine plural of 'joyeux' stays 'joyeux' — it already ends in -x."),
              example("La fille est joyeuse. → Les filles sont joyeuses.", "The girl is joyful. → The girls are joyful.", "Feminine plural: add -s to 'joyeuse'."),
              example("L'homme est gentil. → Les hommes sont gentils.", "The man is kind. → The men are kind."),
              example("La femme est gentille. → Les femmes sont gentilles.", "The woman is kind. → The women are kind."),
            ],
            [
              card("Plural of 'joyeux' (masculine)?", "joyeux — unchanged, since it already ends in -x."),
              card("Plural of 'gentille' (feminine)?", "gentilles — add -s."),
              card("Plural of 'gentil' (masculine)?", "gentils — add -s."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "Feminine of 'intelligent'?", options: ["intelligent", "intelligente", "intelligentte"], answer: "intelligente" },
      { type: "mc", q: "Feminine of 'heureux'?", options: ["heureuxe", "heureuse", "heureuze"], answer: "heureuse" },
      { type: "mc", q: "Which adjective does NOT change in the feminine?", options: ["grand", "jeune", "gros"], answer: "jeune", qLang: "en" },
      { type: "mc", q: "Feminine of 'directeur'?", options: ["directeure", "directrice", "directeuse"], answer: "directrice" },
      { type: "mc", q: "Feminine of 'public'?", options: ["publice", "publique", "pubbique"], answer: "publique" },
      { type: "fill", q: "L'ingénieure est ___ (grand).", answer: "grande" },
      { type: "fill", q: "La femme est ___ (beau).", answer: "belle" },
      { type: "fill", q: "Les mécaniciennes sont ___ (gentil).", answer: "gentilles" },
      { type: "complete", q: "La fille est ___ ___. (mignon)", answer: "mignonne" },
      { type: "complete", q: "La chemise est ___ ___. (noir)", answer: "noire" },
      { type: "complete", q: "Elle est ___ ___. (doux)", answer: "douce" },
      { type: "complete", q: "Rose est très ___. (beau)", answer: "belle" },
      { type: "complete", q: "Le chef cuisinier est très ___. (compétent, masculine)", answer: "compétent" },
    ],
  },

  // ================================================================= FR-106
  {
    id: "week6",
    code: "FR-106",
    week: "Week 6",
    title: "Les Moyens de Transport",
    subtitle: "Vocabulaire et l'usage de « à » et « en »",
    subtopics: [
      {
        id: "vocab",
        title: "Transport Vocabulary",
        concepts: [
          concept(
            "Common means of transport",
            [
              teach("Here's the core vocabulary for talking about how you get somewhere."),
              example("la voiture", "the car"),
              example("le taxi", "the taxi"),
              example("le vélo", "the bike"),
              example("le train", "the train"),
              example("l'avion", "the plane"),
              example("le bateau", "the boat"),
              example("la pirogue", "the canoe"),
            ],
            [
              card("What is 'un bateau'?", "A boat."),
              card("What is 'a helicopter' in French?", "un hélicoptère."),
              card("What is 'le vélo'?", "The bike."),
            ]
          ),
        ],
      },
      {
        id: "a-vs-en",
        title: "« à » vs « en »",
        concepts: [
          concept(
            "When to use à vs en",
            [
              teach("French uses two different small words before a means of transport, and the choice depends on how you're positioned on it."),
              teach("Use 'à' when you sit astride it or move with your body exposed — walking, cycling, riding."),
              example("Il va à l'école à pied.", "He goes to school on foot.", "à pied — walking, exposed."),
              example("Elle va au marché à vélo.", "She goes to the market by bike.", "à vélo — you sit astride a bike."),
              example("Il voyage à cheval.", "He travels by horse.", "à cheval — same astride logic."),
              teach("Use 'en' when you sit inside an enclosed vehicle."),
              example("Je voyage en avion.", "I travel by plane.", "en avion — you sit inside."),
              example("Nous allons en voiture.", "We're going by car.", "en voiture — enclosed."),
              example("John va à l'école en taxi.", "John goes to school by taxi.", "en taxi — enclosed."),
            ],
            [
              card("When do you use 'à' for transport?", "For transport you ride astride or move with, exposed: à pied, à vélo, à moto, à cheval."),
              card("When do you use 'en' for transport?", "For transport you sit inside: en voiture, en taxi, en train, en avion, en bateau."),
              card("Fill in: 'Je voyage ___ avion.'", "en (en avion)."),
              card("Fill in: 'Il va à l'école ___ vélo.'", "à (à vélo)."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "How do you say 'on foot'?", options: ["en pied", "à pied", "au pied"], answer: "à pied", qLang: "en" },
      { type: "mc", q: "Which uses 'en'?", options: ["vélo", "train", "moto"], answer: "train", qLang: "en" },
      { type: "mc", q: "'Un cheval' means:", options: ["a horse", "a car", "a boat"], answer: "a horse", qLang: "en" },
      { type: "fill", q: "John va à l'école ___ taxi.", answer: "en" },
      { type: "fill", q: "Henry se déplace à UMaT ___ bicyclette.", answer: "à" },
      { type: "fill", q: "Le géomètre est parti en France ___ avion.", answer: "en" },
      { type: "complete", q: "Les étudiants vont en excursion ___ ___. (autobus)", answer: "en autobus" },
      { type: "complete", q: "Nous voyageons ___ ___ chaque semaine. (train)", answer: "en train" },
      { type: "complete", q: "Je me promène dans la ville ___ ___. (pied)", answer: "à pied" },
    ],
  },
];

export const ALL_TOPIC_META = COURSE.map(({ id, code, week, title, subtitle }) => ({
  id, code, week, title, subtitle,
}));
