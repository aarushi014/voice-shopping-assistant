export type SupportedLanguage = 'en-US' | 'hi-IN' | 'es-ES' | 'fr-FR';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export interface LanguageKeywords {
  add: string[];
  remove: string[];
  search: string[];
  update: string[];
  containersToStrip?: RegExp;
  targetsToStrip?: RegExp;
  wordNumbers?: Record<string, number>;
}

export const LANGUAGE_KEYWORD_MAP: Record<SupportedLanguage, LanguageKeywords> = {
  'en-US': {
    add: ['add', 'i need', 'i want to buy', 'buy', 'put', 'get me', 'include', 'append', "i'd like", 'need'],
    remove: ['remove', 'delete', 'take off', 'clear', 'cross out', 'drop', 'get rid of'],
    search: ['search for', 'search', 'find', 'look for', 'where is', 'show me', 'check', 'locate'],
    update: ['change', 'update', 'set', 'modify', 'make'],
    containersToStrip:
      /\b(bottles?|packs?|packages?|bags?|boxes?|cans?|cartons?|heads?|pieces?|kg|kgs|lbs?|liters?|litres?|jars?|loaves|loaf|bunches?|pairs?)\s+of\b/gi,
    targetsToStrip: /\b(from|to|on)\s+(my\s+)?(shopping\s+)?(list|cart)\b/gi,
    wordNumbers: {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      'a dozen': 12,
      'half a dozen': 6,
      pair: 2,
      couple: 2,
    },
  },
  'hi-IN': {
    add: ['जोड़ें', 'जोड़ो', 'चाहिए', 'खरीदना है', 'खरीदो', 'लाओ', 'ऐड करो', 'ऐड करें', 'डालो', 'रखो', 'add', 'need', 'buy'],
    remove: ['हटाओ', 'हटाएं', 'निकालो', 'मिटाओ', 'डिलीट करो', 'डिलीट करें', 'remove', 'delete'],
    search: ['खोजें', 'खोजो', 'ढूंढो', 'कहाँ है', 'कहां है', 'दिखाओ', 'सर्च करो', 'search', 'find'],
    update: ['बदलो', 'बदलें', 'अपडेट करो', 'अपडेट करें', 'बदलकर', 'कर दो'],
    containersToStrip: /(पैकेट|बोतल|किलो|ग्राम|डब्बा|लीटर|नग)/gi,
    targetsToStrip: /(मेरी\s+)?(शॉपिंग\s+)?(लिस्ट|सूची)\s+(से|में|पर)/gi,
    wordNumbers: {
      एक: 1,
      दो: 2,
      तीन: 3,
      चार: 4,
      पांच: 5,
      पाँच: 5,
      छह: 6,
      सात: 7,
      आठ: 8,
      नौ: 9,
      दस: 10,
      दर्जन: 12,
      'आधा दर्जन': 6,
    },
  },
  'es-ES': {
    add: ['añadir', 'anadir', 'agregar', 'necesito', 'quiero comprar', 'comprar', 'pon', 'poner', 'incluir', 'traer'],
    remove: ['eliminar', 'quitar', 'borrar', 'sacar', 'remover', 'tachar'],
    search: ['buscar', 'encontrar', 'dónde está', 'donde esta', 'mostrar', 'localizar'],
    update: ['cambiar', 'actualizar', 'modificar'],
    containersToStrip: /\b(botellas?|paquetes?|bolsas?|cajas?|latas?|kilos?|litros?)\s+de\b/gi,
    targetsToStrip: /\b(de|en|a)\s+(mi\s+)?(lista|carrito)\b/gi,
    wordNumbers: {
      uno: 1,
      una: 1,
      dos: 2,
      tres: 3,
      cuatro: 4,
      cinco: 5,
      seis: 6,
      siete: 7,
      ocho: 8,
      nueve: 9,
      diez: 10,
      docena: 12,
      'media docena': 6,
    },
  },
  'fr-FR': {
    add: ['ajouter', "j'ai besoin de", 'je veux acheter', 'acheter', 'mettre', 'inclure', 'prends'],
    remove: ['supprimer', 'enlever', 'retirer', 'effacer', 'ôter'],
    search: ['chercher', 'trouver', 'où est', 'ou est', 'montrer', 'localiser'],
    update: ['changer', 'modifier', 'mettre à jour', 'mettre a jour'],
    containersToStrip: /\b(bouteilles?|paquets?|sacs?|boîtes?|boites?|kilos?|litres?)\s+de\b/gi,
    targetsToStrip: /\b(de|à|dans)\s+(ma\s+)?(liste|panier)\b/gi,
    wordNumbers: {
      un: 1,
      une: 1,
      deux: 2,
      trois: 3,
      quatre: 4,
      cinq: 5,
      six: 6,
      sept: 7,
      huit: 8,
      neuf: 9,
      dix: 10,
      douzaine: 12,
    },
  },
};
