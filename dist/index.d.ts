import EditorJS from '@editorjs/editorjs';
import { EditorConfig, OutputData } from "@editorjs/editorjs";
import { Readable, Writable } from 'svelte/store';
type EditorStore = {
    instance?: EditorJS;
    save?: () => void;
    render?: (data: OutputData) => void;
    clear?: () => void;
};
type EditorStoreAction = ((node: HTMLElement, parameters?: EditorConfig) => {
    destroy?: () => void;
}) & Readable<EditorStore>;
type EditorResponse = {
    editor: EditorStoreAction;
    isReady: Readable<boolean>;
    data: Writable<OutputData>;
};
type SvelteEditorConfig = Omit<EditorConfig, 'holder' | 'holderId'>;
declare function createEditor(configuration?: SvelteEditorConfig): EditorResponse;
export { EditorStore, EditorStoreAction, EditorResponse, SvelteEditorConfig, createEditor };
//# sourceMappingURL=index.d.ts.map