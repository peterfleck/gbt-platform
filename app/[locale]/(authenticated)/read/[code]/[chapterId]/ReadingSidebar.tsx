"use client";

import { Icon } from "@/app/components/Icon";
import RichText from "@/app/components/RichText";
import { Tab } from "@headlessui/react";
import DOMPurify from "isomorphic-dompurify";
import { useTranslations } from "next-intl";
import { forwardRef, Fragment, memo, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { parseReferenceRange } from "@/app/verse-utils";
import { VersesPreview } from "@/app/components/VersesPreview";
import { isRichTextEmpty } from "@/app/components/RichTextInput";

export interface Word {
    id: string
    text: string
    lemma: string
    grammar: string
    resource?: {
        name: string
        entry: string
    }
    footnote?: string
}

export interface ReadingSidebarProps {
    className?: string
    word: Word
    language: { font: string, textDirection: string, code: string }
    onClose?(): void
};
export interface ReadingSidebarRef {
    openNotes(): void
};


const ReadingSidebar = forwardRef<ReadingSidebarRef, ReadingSidebarProps>(({ className = '', language, word, phrase, onClose }, ref) => {
    const t = useTranslations("ReadingSidebar")

    const [tabIndex, setTabIndex] = useState(0)

    const hasNotes = !isRichTextEmpty(word.footnote ?? '')

    const lexiconEntryRef = useRef<HTMLDivElement>(null);
    const [previewElement, setPreviewElement] = useState<HTMLDivElement | null>(
        null
    );
    const [previewVerseIds, setPreviewVerseIds] = useState<string[]>([]);
    const openPreview = (anchorElement: HTMLAnchorElement) => {
        const oldPreview = document.querySelector('#ref-preview');
        oldPreview?.remove();

        const reference = anchorElement.getAttribute('data-ref') ?? '';
        setPreviewVerseIds(parseReferenceRange(reference, t.raw('book_names')));

        const previewElement = document.createElement('div');
        previewElement.id = 'ref-preview';
        anchorElement.insertAdjacentElement('afterend', previewElement);
        setPreviewElement(previewElement);
    };

    return <div
        className={`
          relative flex flex-col gap-4 flex-shrink-0 shadow rounded-2xl bg-brown-100
          dark:bg-gray-700 dark:shadow-none
          ${className}
      `}
    >
        <button
            onClick={onClose}
            type="button"
            className="absolute w-9 h-9 end-1 top-1 text-red-700 dark:text-red-600 rounded-md focus-visible:outline outline-2 outline-green-300"
        >
            <Icon icon="xmark" />
            <span className="sr-only">{t('close')}</span>
        </button>
        <div className="flex items-start p-4 pb-0">
            <div>
                <div className="flex gap-4 items-baseline">
                    <span className="font-mixed text-xl">{word.text}</span>
                    <span>{word.lemma}</span>
                </div>
                <div>{word.grammar}</div>
            </div>
        </div>

        <div className="grow flex flex-col min-h-0">
            <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
                <Tab.List className="flex flex-row">
                    <div className="border-b border-blue-800 dark:border-green-400 h-full w-2"></div>
                    {[t('tabs.lexicon'), ...(hasNotes ? [t('tabs.notes')] : [])].map((title) => (
                        <Fragment key={title}>
                            <Tab
                                className="
                                  px-4 py-1 text-blue-800 font-bold rounded-t-lg border border-blue-800 ui-selected:border-b-transparent outline-green-300 focus-visible:outline outline-2
                                  dark:text-green-400 dark:border-green-400
                                "
                            >
                                {title}
                            </Tab>
                            <div className="border-b border-blue-800 dark:border-green-400 h-full w-1"></div>
                        </Fragment>
                    ))}
                    <div className="border-b border-blue-800 dark:border-green-400 h-full grow"></div>
                </Tab.List>
                <Tab.Panels className="overflow-y-auto grow px-4 pt-4 mb-4">
                    <Tab.Panel unmount={false}>
                        <div>
                            {word.resource && (<>
                                <div className="text-lg mb-3 font-bold me-2">
                                    {word.resource.name}
                                </div>
                                <div
                                    className="leading-relaxed text-sm font-mixed"
                                    ref={lexiconEntryRef}
                                    onClick={(event) => {
                                        const target = event.target as HTMLElement;
                                        if (
                                            target.nodeName === 'A' &&
                                            target.classList.contains('ref')
                                        ) {
                                            openPreview(target as HTMLAnchorElement);
                                        }
                                    }}
                                >
                                    <LexiconText content={word.resource.entry} />
                                </div>
                                {previewElement !== null &&
                                    createPortal(
                                        <VersesPreview
                                            language={language}
                                            verseIds={previewVerseIds}
                                            onClose={() => {
                                                setPreviewVerseIds([]);
                                                setPreviewElement(null);
                                                previewElement.remove();
                                            }}
                                        />,
                                        previewElement
                                    )}
                            </>)}
                        </div>
                    </Tab.Panel>
                    <Tab.Panel unmount={false}>
                        <RichText className="pb-2" content={word.footnote ?? ''} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    </div>
})
ReadingSidebar.displayName = "ReadingSidebar"
export default ReadingSidebar

const LexiconText = memo(function LexiconText({ content }: { content: string }) {
    const prev = useRef('')
    prev.current = content
    const html = useMemo(() => DOMPurify.sanitize(content), [content])
    return <div
        dangerouslySetInnerHTML={{
            __html: html,
        }}
    />
})

