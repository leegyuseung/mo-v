import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function TermsModal({
  isOpen,
  onClose,
  title,
  content,
}: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-6 py-4">
          <div className="text-gray-600 break-keep">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-base font-bold text-gray-900 mb-4 mt-6 first:mt-0"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-sm font-bold text-gray-900 mb-3 mt-5"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="text-xs leading-loose mb-4 last:mb-0"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc pl-4 mb-4 space-y-1.5 text-xs leading-loose"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="list-decimal pl-4 mb-4 space-y-1.5 text-xs leading-loose"
                    {...props}
                  />
                ),
                li: ({ ...props }) => <li {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
