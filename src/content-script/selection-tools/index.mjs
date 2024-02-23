import {
  CardHeading,
  CardList,
  EmojiSmile,
  Palette,
  QuestionCircle,
  Translate,
  Braces,
  Globe,
  ChatText,
  CardChecklist,
  EmojiLaughingFill,
  Pencil,
  ArrowsCollapse,
  ArrowsExpand,
} from 'react-bootstrap-icons'
import { getPreferredLanguage } from '../../config/language.mjs'

const createGenPrompt =
  ({
    message = '',
    isTranslation = false,
    targetLanguage = '',
    enableBidirectional = false,
    includeLanguagePrefix = false,
  }) =>
  async (selection) => {
    let preferredLanguage = targetLanguage

    if (!preferredLanguage) {
      preferredLanguage = await getPreferredLanguage()
    }

    let fullMessage = isTranslation
      ? `Translate the following into ${preferredLanguage} and only show me the translated content`
      : message
    if (enableBidirectional) {
      fullMessage += `. If it is already in ${preferredLanguage}, translate it into English and only show me the translated content`
    }
    const prefix = includeLanguagePrefix ? `Reply in ${preferredLanguage}.` : ''
    return `${prefix}${fullMessage}:\n'''\n${selection}\n'''`
  }

export const config = {
  explain: {
    icon: <ChatText />,
    label: 'Explain',
    genPrompt: createGenPrompt({
      message: 'Explain the following',
      includeLanguagePrefix: true,
    }),
  },
  translate: {
    icon: <Translate />,
    label: 'Translate',
    genPrompt: createGenPrompt({
      isTranslation: true,
    }),
  },
  translateToEn: {
    icon: <Globe />,
    label: 'Translate (To English)',
    genPrompt: createGenPrompt({
      isTranslation: true,
      targetLanguage: 'English',
    }),
  },
  translateToZh: {
    icon: <Globe />,
    label: 'Translate (To Chinese)',
    genPrompt: createGenPrompt({
      isTranslation: true,
      targetLanguage: 'Chinese',
    }),
  },
  translateBidi: {
    icon: <Globe />,
    label: 'Translate (Bidirectional)',
    genPrompt: createGenPrompt({
      isTranslation: true,
      enableBidirectional: true,
    }),
  },
  summary: {
    icon: <CardHeading />,
    label: 'Summary',
    genPrompt: createGenPrompt({
      message: 'Summarize the following as concisely as possible',
      includeLanguagePrefix: true,
    }),
  },
  polish: {
    icon: <Palette />,
    label: 'Polish',
    genPrompt: createGenPrompt({
      message:
        'Check the following content for possible diction and grammar problems, and polish it carefully',
    }),
  },
  sentiment: {
    icon: <EmojiSmile />,
    label: 'Sentiment Analysis',
    genPrompt: createGenPrompt({
      message:
        'Analyze the sentiments expressed in the following content and make a brief summary of the sentiments',
      includeLanguagePrefix: true,
    }),
  },
  divide: {
    icon: <CardList />,
    label: 'Divide Paragraphs',
    genPrompt: createGenPrompt({
      message: 'Divide the following into paragraphs that are easy to read and understand',
    }),
  },
  code: {
    icon: <Braces />,
    label: 'Code Explain',
    genPrompt: createGenPrompt({
      message: 'Explain the following code',
      includeLanguagePrefix: true,
    }),
  },
  ask: {
    icon: <QuestionCircle />,
    label: 'Ask',
    genPrompt: createGenPrompt({
      message: 'Analyze the following content and express your opinion, or give your answer',
      includeLanguagePrefix: true,
    }),
  },
  list: {
    icon: <CardChecklist />,
    label: 'List',
    genPrompt: createGenPrompt({
      message: 'Create a list of the following',
      includeLanguagePrefix: true,
    }),
  },
  friendly: {
    icon: <EmojiLaughingFill />,
    label: 'Friendly',
    genPrompt: createGenPrompt({
      message: 'Rewrite the following in a friendlier tone',
      includeLanguagePrefix: true,
    }),
  },
  shorten: {
    icon: <ArrowsCollapse />,
    label: 'Shorten',
    genPrompt: createGenPrompt({
      message: 'Rewrite the following more concisely, return around a sentence or two',
      includeLanguagePrefix: true,
    }),
  },
  lengthen: {
    icon: <ArrowsExpand />,
    label: 'Lenghten',
    genPrompt: createGenPrompt({
      message:
        'Lengthen the following sentence, filling it with more professional words and with more relavant details',
      includeLanguagePrefix: true,
    }),
  },
}
