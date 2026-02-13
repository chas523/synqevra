
'use client';

import React, { useState } from 'react';
import { useWidgetEditor } from '@/context/WidgetEditorContext';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { ModulesDialog } from './ModulesDialog';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

export function JsPanel() {
    const { widgetType, updateDescriptor } = useWidgetEditor();
    const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);
    const { resolvedTheme } = useTheme();

    const onJsChange = (value: string | undefined) => {
        if (widgetType && widgetType.descriptor) {
            updateDescriptor({
                ...widgetType.descriptor,
                controllerScript: value || ''
            });
        }
    };

    // Helper to extract modules from descriptor.resources
    // We assume modules are stored in descriptor.resources with a specific structure or separated?
    // User said "modules" are selected in the dialog.
    // In `HtmlPanel` we used `descriptor.resources` for extensions/modules URL list.
    // Here we need to map the table (Alias -> URL) to the descriptor.
    // If `descriptor.resources` is a simple array of objects, how do we distinguish?
    // Let's assume `descriptor.resources` holds BOTH.
    // Is it possible `descriptor.resources` is ONLY for extensions, and there is another field?
    // Looking at the "Air quality index card" JSON again...
    // "resources": []
    // It doesn't show modules explicitly in the example JSON provided by user.
    // However, usually in ThingsBoard widgets, external modules are resources.
    // The screenshot shows "Alias" and "JS module resource".
    // This implies a mapping.
    // If I look at `HtmlPanel` logic again, I treated `descriptor.resources` as `{ url: string, isModule: boolean }`.
    // Maybe I should stick to that, but the Dialog shows "Alias".
    // Let's store modules in a separate property if possible or add `alias` to the resource object in `descriptor.resources`.
    // I will check if I can modify `descriptor.resources` to objects: `{ url: string, isModule?: boolean, alias?: string }`.

    const modules = (widgetType?.descriptor?.resources || [])
        .filter((r: any) => r.isModule)
        .map((r: any) => ({ alias: r.alias || '', url: r.url }));

    const handleModulesChange = (newModules: { alias: string; url: string }[]) => {
        if (!widgetType?.descriptor) return;

        const currentResources = widgetType.descriptor.resources || [];
        const nonModules = currentResources.filter((r: any) => !r.isModule);

        const updatedModules = newModules.map(m => ({
            url: m.url,
            isModule: true,
            alias: m.alias
        }));

        updateDescriptor({
            ...widgetType.descriptor,
            resources: [...nonModules, ...updatedModules]
        });
    };

    const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="w-full h-full bg-white dark:bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Javascript</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-gray-200 dark:hover:bg-slate-800"
                    onClick={() => setIsModulesDialogOpen(true)}
                    title="Manage Modules"
                >
                    <Settings2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
            </div>

            <div className="flex-1 relative overflow-hidden">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    value={widgetType?.descriptor?.controllerScript || ''}
                    onChange={onJsChange}
                    theme={editorTheme}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>

            <ModulesDialog
                open={isModulesDialogOpen}
                onOpenChange={setIsModulesDialogOpen}
                modules={modules}
                onChange={handleModulesChange}
            />
        </div>
    );
}
