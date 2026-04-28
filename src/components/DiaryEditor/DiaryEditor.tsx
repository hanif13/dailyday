/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import styles from './DiaryEditor.module.css';

interface DiaryEditorProps {
  content: string;
  onChange: (html: string) => void;
  paperStyle: 'plain' | 'lined' | 'grid' | 'vintage';
  placeholder?: string;
}



export default function DiaryEditor({
  content,
  onChange,
  paperStyle,
  placeholder = 'เริ่มเขียนความรู้สึกของวันนี้...',
}: DiaryEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync content if it changes from outside
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false } as Record<string, unknown>);
    }
  }, [content, editor]);

  if (!editor) return null;

  const isActive = (type: string | object, attrs?: object) =>
    editor.isActive(type as any, attrs);

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            id="editor-bold"
            type="button"
            className={`${styles.toolBtn} ${isActive('bold') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            id="editor-italic"
            type="button"
            className={`${styles.toolBtn} ${isActive('italic') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            id="editor-underline"
            type="button"
            className={`${styles.toolBtn} ${isActive('underline') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <span style={{ textDecoration: 'underline' }}>U</span>
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.toolbarGroup}>
          {([1, 2, 3] as const).map(level => (
            <button
              key={level}
              id={`editor-h${level}`}
              type="button"
              className={`${styles.toolBtn} ${isActive('heading', { level }) ? styles.toolBtnActive : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.toolbarGroup}>
          <button
            id="editor-bullet-list"
            type="button"
            className={`${styles.toolBtn} ${isActive('bulletList') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            ≡
          </button>
          <button
            id="editor-ordered-list"
            type="button"
            className={`${styles.toolBtn} ${isActive('orderedList') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
          >
            1≡
          </button>
          <button
            id="editor-blockquote"
            type="button"
            className={`${styles.toolBtn} ${isActive('blockquote') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            ❝
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.toolbarGroup}>
          <button
            id="editor-align-left"
            type="button"
            className={`${styles.toolBtn} ${isActive({ textAlign: 'left' }) ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          >⬛︎</button>
          <button
            id="editor-align-center"
            type="button"
            className={`${styles.toolBtn} ${isActive({ textAlign: 'center' }) ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >≡</button>
          <button
            id="editor-align-right"
            type="button"
            className={`${styles.toolBtn} ${isActive({ textAlign: 'right' }) ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >▰</button>
        </div>

        <div className={styles.divider} />

        <div className={styles.toolbarGroup}>
          <button
            id="editor-highlight"
            type="button"
            className={`${styles.toolBtn} ${isActive('highlight') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
          >✦</button>
          <button
            id="editor-horizontal-rule"
            type="button"
            className={styles.toolBtn}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider"
          >—</button>
        </div>
      </div>

      {/* Editor area */}
      <div className={`${styles.editorWrap} paper-${paperStyle}`}>
        <EditorContent editor={editor} className={styles.editor} />
      </div>
    </div>
  );
}
