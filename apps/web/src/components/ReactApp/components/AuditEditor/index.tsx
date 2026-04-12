import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    List, ListOrdered, Heading1, Heading2, Heading3,
    Link as LinkIcon, Highlighter, Undo, Redo,
    Quote, Minus, Code
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface AuditEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
}

export default function AuditEditor({
    content,
    onChange,
    placeholder = "Commencez à rédiger l'audit...",
    editable = true
}: AuditEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                link: false,
                underline: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary-600 underline hover:text-primary-800',
                },
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Underline,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update content when prop changes (for initial load)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL du lien:', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-lg transition-colors ${isActive
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-dark'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );

    const ToolbarDivider = () => (
        <div className="w-px h-6 bg-neutral-200 mx-1" />
    );

    return (
        <div className="border border-neutral-200 rounded-xl bg-white relative">
            {/* Toolbar */}
            {editable && (
                <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-20">
                    {/* Text formatting */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Gras (Ctrl+B)"
                    >
                        <Bold size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italique (Ctrl+I)"
                    >
                        <Italic size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Souligné (Ctrl+U)"
                    >
                        <UnderlineIcon size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Barré"
                    >
                        <Strikethrough size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        isActive={editor.isActive('highlight')}
                        title="Surligner"
                    >
                        <Highlighter size={18} />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Headings */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Titre 1"
                    >
                        <Heading1 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Titre 2"
                    >
                        <Heading2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Titre 3"
                    >
                        <Heading3 size={18} />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Lists */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Liste à puces"
                    >
                        <List size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Liste numérotée"
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Block elements */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Citation"
                    >
                        <Quote size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        title="Bloc de code"
                    >
                        <Code size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Ligne horizontale"
                    >
                        <Minus size={18} />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Link */}
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        title="Ajouter un lien"
                    >
                        <LinkIcon size={18} />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Undo/Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Annuler (Ctrl+Z)"
                    >
                        <Undo size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Rétablir (Ctrl+Y)"
                    >
                        <Redo size={18} />
                    </ToolbarButton>
                </div>
            )}

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="prose prose-sm sm:prose-base max-w-none p-4 min-h-[300px] focus:outline-none
                    prose-headings:text-dark prose-headings:font-bold
                    prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
                    prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
                    prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                    prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:mb-3
                    prose-ul:my-3 prose-ol:my-3
                    prose-li:text-neutral-700 prose-li:my-1
                    prose-blockquote:border-l-4 prose-blockquote:border-primary-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-600
                    prose-code:bg-neutral-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-neutral-800 prose-pre:text-neutral-100 prose-pre:rounded-lg
                    prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                    prose-hr:my-6 prose-hr:border-neutral-200
                    [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[250px]
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-neutral-400
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
                "
            />
        </div>
    );
}





