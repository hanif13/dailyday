/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import styles from './DiaryEditor.module.css';

interface DiaryEditorProps {
  content: string;
  onChange: (html: string) => void;
  paperStyle: 'plain' | 'lined' | 'grid' | 'vintage';
  fontFamily?: string;
  placeholder?: string;
}

const TabIndent = Extension.create({
  name: 'tabIndent',
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        return this.editor.commands.insertContent('\u00A0\u00A0\u00A0\u00A0');
      },
    };
  },
});
export default function DiaryEditor({
  content,
  onChange,
  paperStyle,
  fontFamily,
  placeholder = 'วันนี้คุณไปเจออะไรมา ...',
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
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: styles.editorImage,
        },
      }),
      TextStyle,
      Color,
      TabIndent,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== content) {
        onChange(html);
      }
    },
    immediatelyRender: false,
  });

  // Sync content if it changes from outside
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (content !== currentHTML && (content || currentHTML !== '<p></p>')) {
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
          <button
            id="editor-strike"
            type="button"
            className={`${styles.toolBtn} ${isActive('strike') ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <s>S</s>
          </button>

          {/* Color Picker */}
          <input
            type="color"
            id="editor-color"
            className={styles.colorPickerBtn}
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            title="Text Color"
          />
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
          >
            <AlignLeft size={16} />
          </button>
          <button
            id="editor-align-center"
            type="button"
            className={`${styles.toolBtn} ${isActive({ textAlign: 'center' }) ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            id="editor-align-right"
            type="button"
            className={`${styles.toolBtn} ${isActive({ textAlign: 'right' }) ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
          <button
            id="editor-align-justify"
            type="button"
            className={`${styles.toolBtn} ${isActive({ textAlign: 'justify' }) ? styles.toolBtnActive : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Align Justify"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.toolbarGroup}>
          <button
            id="editor-image"
            type="button"
            className={styles.toolBtn}
            onClick={() => {
              const url = window.prompt('ใส่ URL รูปภาพ');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            title="Add Image"
          >
            🖼️
          </button>
          <input
            type="file"
            id="editor-image-upload"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const result = e.target?.result as string;
                  editor.chain().focus().setImage({ src: result }).run();
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => document.getElementById('editor-image-upload')?.click()}
            title="Upload Image"
          >
            📤
          </button>
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
          <button
            id="editor-indent"
            type="button"
            className={styles.toolBtn}
            onClick={() => {
              // Toggle blockquote as a visual indent
              editor.chain().focus().toggleBlockquote().run();
            }}
            title="Indent (ย่อหน้า)"
          >
            →|
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className={`${styles.editorWrap} paper-${paperStyle}`} style={fontFamily ? { fontFamily } : undefined}>
        <EditorContent editor={editor} className={styles.editor} />
      </div>
    </div>
  );
}
