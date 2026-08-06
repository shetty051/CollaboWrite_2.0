import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'

interface TiptapEditorProps {
  content: Record<string, unknown> | null | undefined
  onChange: (jsonContent: Record<string, unknown>) => void
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Write your story content here...' }],
        },
      ],
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  // Synchronize external content changes if editor initialized
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-border rounded-xl bg-bg overflow-hidden flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-surface/80 border-b border-border text-text">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-bg transition-colors cursor-pointer ${
            editor.isActive('bold') ? 'bg-accent/15 text-accent' : 'text-text-muted'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-bg transition-colors cursor-pointer ${
            editor.isActive('italic') ? 'bg-accent/15 text-accent' : 'text-text-muted'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-bg transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-accent/15 text-accent'
              : 'text-text-muted'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-bg transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-accent/15 text-accent'
              : 'text-text-muted'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-bg transition-colors cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-accent/15 text-accent' : 'text-text-muted'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-bg transition-colors cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-accent/15 text-accent' : 'text-text-muted'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-bg transition-colors cursor-pointer ${
            editor.isActive('blockquote') ? 'bg-accent/15 text-accent' : 'text-text-muted'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1.5 rounded hover:bg-bg transition-colors text-text-muted cursor-pointer"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1.5 rounded hover:bg-bg transition-colors text-text-muted cursor-pointer"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Surface */}
      <div className="p-4 min-h-[300px] prose dark:prose-invert max-w-none text-text text-sm font-sans focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
