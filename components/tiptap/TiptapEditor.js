
import { EditorContent } from '@tiptap/react'
import MenuBar from '../../components/tiptap/MenuBar'
import React from 'react'

export function TiptapEditor({editor}) {

  return (
    <main className=''>
        <div className="editor">
          {editor && <MenuBar editor={editor} />}
          <EditorContent className="editor__content" editor={editor} />
        </div>
    </main>
  )
}