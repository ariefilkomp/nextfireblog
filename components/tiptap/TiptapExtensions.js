import Document from '@tiptap/extension-document'
import Blockquote from '@tiptap/extension-blockquote'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import Heading from '@tiptap/extension-heading'
import HardBreak from '@tiptap/extension-hard-break'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image from '@tiptap/extension-image'

import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'

import Youtube from '@tiptap/extension-youtube'
import Link from '@tiptap/extension-link'

import Gapcursor from '@tiptap/extension-gapcursor'
import Dropcursor from '@tiptap/extension-dropcursor'
import History from '@tiptap/extension-history'

import Code from '@tiptap/extension-code'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import dart from 'highlight.js/lib/languages/dart'
// load all highlight.js languages
import { lowlight } from 'lowlight'

import CodeBlockComponent from './CodeBlockComponent'
import { ReactNodeViewRenderer } from '@tiptap/react'

lowlight.registerLanguage('dart', dart)
const TiptapExtensions = [
    Document,
    Blockquote,
    Paragraph,
    Text,
    Heading.configure({
      levels: [1, 2, 3],
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    HardBreak,
    HorizontalRule,
    ListItem,
    BulletList,
    OrderedList,
    Highlight,
    TaskList,
    TaskItem,
    Image.configure({
      HTMLAttributes: {
        class: 'w-full',
      },
    }),
    Bold,
    Italic,
    Strike,
    Youtube,
    Gapcursor,
    Dropcursor,
    History,
    Link,
    Code,
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent)
      },
    })
    .configure({ lowlight }),
  ];
export default TiptapExtensions;