'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Group,
    Panel,
    Separator,
} from 'react-resizable-panels';
import { HtmlPanel } from '@/components/widget-editor/HtmlPanel';
import { JsPanel } from '@/components/widget-editor/JsPanel';
import { SettingsPanel } from '@/components/widget-editor/SettingsPanel';
import { PreviewPanel } from '@/components/widget-editor/PreviewPanel';
import { WidgetEditorProvider, useWidgetEditor } from '@/context/WidgetEditorContext';

import { WidgetHeaderPanel } from '@/components/widget-editor/WidgetHeaderPanel';

function WidgetEditorContent() {
    const params = useParams();
    const { loadWidgetType, loading, error } = useWidgetEditor();
    const id = params?.id as string;

    useEffect(() => {
        if (id) {
            loadWidgetType(id);
        }
    }, [id, loadWidgetType]);

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400">{error}</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-gray-100 dark:bg-slate-950">
            <WidgetHeaderPanel />
            <div className="flex-1 overflow-hidden">
                <Group orientation="horizontal">
                    <Panel defaultSize={50} minSize={20}>
                        <Group orientation="vertical">
                            <Panel defaultSize={50} minSize={20}>
                                <HtmlPanel />
                            </Panel>
                            <Separator className="h-2 bg-gray-200 dark:bg-gray-800 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700" />
                            <Panel defaultSize={50} minSize={20}>
                                <JsPanel />
                            </Panel>
                        </Group>
                    </Panel>

                    <Separator className="w-2 bg-gray-200 dark:bg-gray-800 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700" />

                    <Panel defaultSize={50} minSize={20}>
                        <Group orientation="vertical">
                            <Panel defaultSize={50} minSize={20}>
                                <SettingsPanel />
                            </Panel>
                            <Separator className="h-2 bg-gray-200 dark:bg-gray-800 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700" />
                            <Panel defaultSize={50} minSize={20}>
                                <PreviewPanel />
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>
        </div>
    );
}

export default function WidgetEditorPage() {
    return (
        <WidgetEditorProvider>
            <WidgetEditorContent />
        </WidgetEditorProvider>
    );
}
