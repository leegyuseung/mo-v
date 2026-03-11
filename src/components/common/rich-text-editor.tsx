"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TextAlign } from "@tiptap/extension-text-align";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { StarterKit } from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  MinusSquare,
  PaintBucket,
  Palette,
  Quote,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const FONT_FAMILY_OPTIONS = [
  { label: "기본", value: "" },
  { label: "Pretendard", value: "Pretendard, sans-serif" },
  { label: "Noto Sans KR", value: "'Noto Sans KR', sans-serif" },
  { label: "Nanum Gothic", value: "'Nanum Gothic', sans-serif" },
  { label: "Nanum Myeongjo", value: "'Nanum Myeongjo', serif" },
] as const;

const FONT_SIZE_OPTIONS = [
  { label: "기본", value: "" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
] as const;

const DEFAULT_TEXT_COLOR = "#111827";
const DEFAULT_HIGHLIGHT_COLOR = "#fef08a";
const TEXT_COLOR_OPTIONS = [
  "#ffffff",
  "#f8fafc",
  "#e5e7eb",
  "#111827",
  "#374151",
  "#6b7280",
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#ea580c",
  "#fb923c",
  "#ca8a04",
  "#facc15",
  "#16a34a",
  "#22c55e",
  "#86efac",
  "#2563eb",
  "#3b82f6",
  "#93c5fd",
  "#7c3aed",
  "#8b5cf6",
  "#c4b5fd",
  "#db2777",
  "#ec4899",
  "#f9a8d4",
  "#0f766e",
  "#14b8a6",
  "#67e8f9",
  "#4f46e5",
  "#a855f7",
  "#f43f5e",
] as const;

const HIGHLIGHT_COLOR_OPTIONS = [
  "#ffffff",
  "#fef08a",
  "#fde047",
  "#facc15",
  "#fb7185",
  "#f43f5e",
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#38bdf8",
  "#0ea5e9",
  "#60a5fa",
  "#3b82f6",
  "#818cf8",
  "#6366f1",
  "#a78bfa",
  "#8b5cf6",
  "#c084fc",
  "#a855f7",
  "#f472b6",
  "#ec4899",
  "#34d399",
  "#10b981",
  "#22c55e",
  "#4ade80",
  "#2dd4bf",
  "#14b8a6",
  "#67e8f9",
  "#06b6d4",
  "#e5e7eb",
  "#9ca3af",
] as const;

export type RichTextEditorHandle = {
  focus: () => void;
  getHTML: () => string;
  isEmpty: () => boolean;
  setHTML: (html: string) => void;
};

type RichTextEditorProps = {
  id?: string;
  initialHtml?: string;
  label?: string;
  placeholder?: string;
  onHtmlChange?: (html: string) => void;
  previewTitle?: string;
  previewDescription?: string;
  footerActions?: React.ReactNode;
};

function ToolbarButton({
  active = false,
  onClick,
  title,
  className = "",
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors ${
            active
              ? "border-blue-500 bg-blue-100 text-blue-700 ring-1 ring-blue-200"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          } ${className}`}
        >
          {children}
        </button>
      </TooltipTrigger>
      {title ? <TooltipContent sideOffset={6}>{title}</TooltipContent> : null}
    </Tooltip>
  );
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
      id = "rich-text-editor",
      initialHtml = "",
      label = "본문",
      placeholder = "본문을 입력해 주세요",
      onHtmlChange,
      previewTitle = "미리보기",
      previewDescription = "현재 작성 중인 내용을 실제 표시 형태로 확인합니다.",
      footerActions,
    },
    ref
  ) {
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [showAdvancedTools, setShowAdvancedTools] = useState(false);
    const [showTextColorPalette, setShowTextColorPalette] = useState(false);
    const [showHighlightPalette, setShowHighlightPalette] = useState(false);
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [htmlContent, setHtmlContent] = useState(initialHtml);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [, setToolbarRenderVersion] = useState(0);

    const updateHtmlState = useCallback(
      (html: string) => {
        setHtmlContent(html);
        onHtmlChange?.(html);
      },
      [onHtmlChange]
    );

    const editor = useEditor({
      immediatelyRender: false,
      content: initialHtml,
      extensions: [
        StarterKit,
        TextStyle,
        FontSize,
        Color,
        FontFamily.configure({
          types: ["textStyle"],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: "https",
        }),
        Image.configure({
          allowBase64: true,
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Placeholder.configure({
          placeholder,
        }),
      ],
      onCreate: ({ editor: currentEditor }) => {
        updateHtmlState(currentEditor.getHTML());
      },
      onUpdate: ({ editor: currentEditor }) => {
        updateHtmlState(currentEditor.getHTML());
      },
      onSelectionUpdate: () => {
        setToolbarRenderVersion((value) => value + 1);
      },
      onTransaction: () => {
        setToolbarRenderVersion((value) => value + 1);
      },
      editorProps: {
        attributes: {
          class:
            "min-h-[420px] px-4 py-3 text-sm text-gray-900 focus:outline-none [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_img]:my-4 [&_img]:max-h-[480px] [&_img]:rounded-xl [&_img]:object-contain [&_ol]:list-decimal [&_ol]:pl-5 [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-gray-400 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5",
        },
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => editor?.commands.focus(),
        getHTML: () => (isHtmlMode ? htmlContent : editor?.getHTML() || htmlContent),
        isEmpty: () => {
          if (isHtmlMode) {
            return htmlContent.replace(/<[^>]*>/g, "").trim().length === 0;
          }
          return editor?.isEmpty ?? true;
        },
        setHTML: (html: string) => {
          updateHtmlState(html);
          if (editor) {
            editor.commands.setContent(html, { emitUpdate: true });
          }
        },
      }),
      [editor, htmlContent, isHtmlMode, updateHtmlState]
    );

    const handleToggleHtmlMode = () => {
      if (!editor) return;

      if (!isHtmlMode) {
        updateHtmlState(editor.getHTML());
        setIsHtmlMode(true);
        return;
      }

      editor.commands.setContent(htmlContent, { emitUpdate: true });
      setIsHtmlMode(false);
      editor.commands.focus();
    };

    const openLinkDialog = () => {
      if (!editor) return;
      setLinkUrl(editor.getAttributes("link").href || "");
      setIsLinkDialogOpen(true);
    };

    const handleConfirmLink = () => {
      if (!editor) return;
      const trimmedUrl = linkUrl.trim();

      if (!trimmedUrl) {
        editor.chain().focus().unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: trimmedUrl }).run();
      }

      setIsLinkDialogOpen(false);
    };

    const applyFontSize = (value: string) => {
      if (!editor) return;
      if (!value) {
        editor.chain().focus().unsetFontSize().run();
        return;
      }
      editor.chain().focus().setFontSize(value).run();
    };

    const readFileAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

    const handleInsertImages = async (files: FileList | null) => {
      if (!editor || !files?.length) return;

      try {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name}은(는) 이미지 파일이 아닙니다.`);
            continue;
          }

          const src = await readFileAsDataUrl(file);
          if (!src) continue;
          editor.chain().focus().setImage({ src, alt: file.name }).run();
        }
      } catch {
        toast.error("이미지를 불러오지 못했습니다.");
      }
    };

    const currentFontFamily =
      (editor?.getAttributes("textStyle").fontFamily as string) || "";
    const currentFontSize =
      (editor?.getAttributes("textStyle").fontSize as string) || "";
    const currentTextColor =
      (editor?.getAttributes("textStyle").color as string) || DEFAULT_TEXT_COLOR;
    const currentHighlightColor =
      (editor?.getAttributes("highlight").color as string) ||
      DEFAULT_HIGHLIGHT_COLOR;
    const previewHtml = isHtmlMode ? htmlContent : editor?.getHTML() || htmlContent;

    return (
      <>
        <div className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <div className="rounded-xl border border-gray-200">
            {!isHtmlMode ? (
              <div className="space-y-2 border-b border-gray-200 px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={currentFontFamily}
                    onChange={(event) =>
                      editor?.chain().focus().setFontFamily(event.target.value || "").run()
                    }
                    title="글꼴"
                    className="h-8 cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700"
                  >
                    {FONT_FAMILY_OPTIONS.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentFontSize}
                    onChange={(event) => applyFontSize(event.target.value)}
                    title="글자 크기"
                    className="h-8 cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700"
                  >
                    {FONT_SIZE_OPTIONS.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ToolbarButton
                    active={editor?.isActive("bold")}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    title="굵게"
                    className="px-2"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={editor?.isActive("italic")}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    title="기울임"
                    className="px-2"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={editor?.isActive("underline")}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    title="밑줄"
                    className="px-2"
                  >
                    <UnderlineIcon className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={editor?.isActive("strike")}
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    title="취소선"
                    className="px-2"
                  >
                    <Strikethrough className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={editor?.isActive({ textAlign: "left" })}
                    onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                    title="왼쪽 정렬"
                    className="px-2"
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={editor?.isActive({ textAlign: "center" })}
                    onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                    title="가운데 정렬"
                    className="px-2"
                  >
                    <AlignCenter className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={editor?.isActive({ textAlign: "right" })}
                    onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                    title="오른쪽 정렬"
                    className="px-2"
                  >
                    <AlignRight className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={showTextColorPalette}
                    onClick={() => {
                      setShowTextColorPalette((prev) => !prev);
                      setShowHighlightPalette(false);
                    }}
                    title="글자색"
                    className="px-2"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={showHighlightPalette}
                    onClick={() => {
                      setShowHighlightPalette((prev) => !prev);
                      setShowTextColorPalette(false);
                    }}
                    title="배경색"
                    className="px-2"
                  >
                    <PaintBucket className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={editor?.isActive("link")}
                    onClick={openLinkDialog}
                    title="링크"
                    className="px-2"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={false}
                    onClick={() => imageInputRef.current?.click()}
                    title="이미지"
                    className="px-2"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                  </ToolbarButton>
                  <ToolbarButton
                    active={showAdvancedTools}
                    onClick={() => setShowAdvancedTools((prev) => !prev)}
                    title={showAdvancedTools ? "고급 도구 닫기" : "고급 도구 열기"}
                  >
                    <span>더보기</span>
                    {showAdvancedTools ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </ToolbarButton>
                </div>

                {showTextColorPalette ? (
                  <div className="flex flex-wrap items-center gap-1 rounded-lg bg-gray-50 p-2">
                    {TEXT_COLOR_OPTIONS.map((color) => (
                      <button
                        key={`text-color-${color}`}
                        type="button"
                        onClick={() => editor?.chain().focus().setColor(color).run()}
                        className={`h-5 w-5 cursor-pointer rounded-full border ${
                          currentTextColor === color
                            ? "border-gray-900 ring-2 ring-gray-300"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                        title="글자색"
                      />
                    ))}
                  </div>
                ) : null}

                {showHighlightPalette ? (
                  <div className="flex flex-wrap items-center gap-1 rounded-lg bg-gray-50 p-2">
                    {HIGHLIGHT_COLOR_OPTIONS.map((color) => (
                      <button
                        key={`highlight-color-${color}`}
                        type="button"
                        onClick={() => editor?.chain().focus().setHighlight({ color }).run()}
                        className={`h-5 w-5 cursor-pointer rounded-sm border ${
                          currentHighlightColor === color
                            ? "border-gray-900 ring-2 ring-gray-300"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                        title="배경색"
                      />
                    ))}
                  </div>
                ) : null}

                {showAdvancedTools ? (
                  <div className="overflow-x-auto rounded-lg bg-gray-50 p-3">
                    <div className="flex min-w-max items-center gap-2">
                      <ToolbarButton
                        active={editor?.isActive("bulletList")}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      >
                        <List className="h-3.5 w-3.5" />
                        <span>목록</span>
                      </ToolbarButton>
                      <ToolbarButton
                        active={editor?.isActive("orderedList")}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      >
                        <ListOrdered className="h-3.5 w-3.5" />
                        <span>번호목록</span>
                      </ToolbarButton>
                      <ToolbarButton
                        active={editor?.isActive("blockquote")}
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                      >
                        <Quote className="h-3.5 w-3.5" />
                        <span>인용</span>
                      </ToolbarButton>
                      <ToolbarButton
                        active={editor?.isActive("table")}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                            .run()
                        }
                      >
                        <Table2 className="h-3.5 w-3.5" />
                        <span>표</span>
                      </ToolbarButton>
                      <ToolbarButton
                        active={false}
                        onClick={() => editor?.chain().focus().deleteTable().run()}
                      >
                        <MinusSquare className="h-3.5 w-3.5" />
                        <span>표삭제</span>
                      </ToolbarButton>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (event) => {
                await handleInsertImages(event.target.files);
                event.target.value = "";
              }}
            />

            {isHtmlMode ? (
              <Textarea
                id={id}
                value={htmlContent}
                onChange={(event) => updateHtmlState(event.target.value)}
                className="min-h-[420px] resize-y rounded-none border-0 shadow-none focus-visible:ring-0"
                placeholder="HTML을 입력해 주세요"
              />
            ) : (
              <EditorContent id={id} editor={editor} />
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleToggleHtmlMode}
            >
              {isHtmlMode ? "에디터 모드" : "HTML 편집"}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            >
              미리보기
            </Button>
          </div>

          {footerActions ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {footerActions}
            </div>
          ) : null}
        </div>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewTitle}</DialogTitle>
              <DialogDescription>{previewDescription}</DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-gray-200 bg-white p-6">
              <div
                className="min-h-24 text-sm text-gray-900 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_img]:my-4 [&_img]:max-h-[480px] [&_img]:rounded-xl [&_img]:object-contain [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>링크 삽입</DialogTitle>
              <DialogDescription>
                본문에 연결할 URL을 입력해 주세요. 비워두면 현재 링크가 제거됩니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor={`${id}-link-url`}>URL</Label>
              <Input
                id={`${id}-link-url`}
                type="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                취소
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!editor) return;
                  editor.chain().focus().unsetLink().run();
                  setLinkUrl("");
                  setIsLinkDialogOpen(false);
                }}
              >
                링크 제거
              </Button>
              <Button onClick={handleConfirmLink}>적용</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

export default RichTextEditor;
