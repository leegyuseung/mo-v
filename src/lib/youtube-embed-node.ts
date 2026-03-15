import { Node, mergeAttributes } from "@tiptap/core";

export type YouTubeEmbedAttrs = {
  src: string;
  videoId: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtubeEmbed: {
      setYouTubeEmbed: (attrs: YouTubeEmbedAttrs) => ReturnType;
    };
  }
}

/**
 * 공식 YouTube 확장 없이도 notice/write에서 iframe 미리보기를 다루기 위한 커스텀 블록 노드.
 * 저장 HTML과 에디터 미리보기가 같은 마크업을 사용해야 작성/수정 시 차이가 줄어든다.
 */
export const YouTubeEmbedNode = Node.create({
  name: "youtubeEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      videoId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-video-id"),
        renderHTML: (attributes) => ({
          "data-video-id": attributes.videoId,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-youtube-embed]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-youtube-embed": "true",
        class:
          "my-4 aspect-video overflow-hidden rounded-xl border border-gray-200 bg-black shadow-sm",
      }),
      [
        "iframe",
        {
          src: HTMLAttributes.src,
          class: "h-full w-full",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "true",
          referrerpolicy: "strict-origin-when-cross-origin",
          title: "YouTube video preview",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setYouTubeEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs,
          }),
    };
  },
});
